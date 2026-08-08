/**
 * backend/services/otpService.js
 * One-time-password issuing, delivery (Twilio SMS) and verification.
 *
 * Security notes:
 *  - Codes come from crypto.randomInt (CSPRNG), never Math.random, so they
 *    can't be predicted from prior codes.
 *  - Codes are stored HASHED (sha256 keyed with JWT_SECRET), so a heap dump or
 *    stray log can't reveal a live code, and compared in constant time.
 *  - Single-use, 10-minute expiry, and a hard cap of 5 verify attempts — without
 *    an attempt cap a 6-digit code is trivially brute-forced.
 *  - Per-number send throttle (cooldown + hourly cap) on top of the per-IP
 *    limiter, so one phone can't be SMS-bombed and Twilio spend stays bounded.
 *  - The code is NEVER returned in an HTTP response. In development, when SMS
 *    isn't configured, it is printed to the server console only.
 *
 * Storage is in-memory on purpose: codes are ephemeral and must not outlive a
 * restart. (User records do persist — see models/User.js.)
 *
 * Env variables:
 *   TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_PHONE_NUMBER - SMS delivery
 *   OTP_TTL_MS      - optional, default 600000 (10 min)
 *   OTP_MAX_ATTEMPTS- optional, default 5
 *   OTP_COOLDOWN_MS - optional, default 60000 (1 min between sends per number)
 *   OTP_MAX_PER_HOUR- optional, default 5 sends per number per hour
 */

const crypto = require('crypto');
const logger = require('../utils/logger');
const { normalizePhone, maskPhone } = require('../utils/phone');

const TTL_MS = Number(process.env.OTP_TTL_MS) || 10 * 60 * 1000;
const MAX_ATTEMPTS = Number(process.env.OTP_MAX_ATTEMPTS) || 5;
const COOLDOWN_MS = Number(process.env.OTP_COOLDOWN_MS) || 60 * 1000;
const MAX_PER_HOUR = Number(process.env.OTP_MAX_PER_HOUR) || 5;
const isProd = process.env.NODE_ENV === 'production';

/** phone -> { hash, expiresAt, attempts } */
const codes = new Map();
/** phone -> { sends: number[] (timestamps) } */
const sendLog = new Map();

// ---------------------------------------------------------------------------
// Twilio client (lazy). Missing credentials is not fatal: in development the
// code is logged to the console so the flow stays testable.
// ---------------------------------------------------------------------------
let twilioClient = null;
let twilioReady = false;
try {
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER } = process.env;
  if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_PHONE_NUMBER) {
    // eslint-disable-next-line global-require
    twilioClient = require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    twilioReady = true;
  } else {
    logger.warn(
      'Twilio not configured (TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_PHONE_NUMBER). ' +
        'OTPs will be printed to this console instead of sent by SMS.'
    );
  }
} catch (err) {
  logger.error('Twilio client init failed', { message: err.message });
}

/**
 * Twilio error codes -> actionable cause. Without this the operator only sees
 * "SMS failed" and can't tell a bad key from a region restriction.
 * Reference: https://www.twilio.com/docs/api/errors
 */
const TWILIO_HINTS = {
  20003: 'Authentication failed — TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN are wrong.',
  21211: "Invalid 'To' number — it must be full E.164, e.g. +918008757916.",
  21212: "Invalid 'From' number — TWILIO_PHONE_NUMBER is not a valid Twilio number.",
  21266: "'To' and 'From' cannot be the same number.",
  21408:
    'Permission to send to this region is not enabled. In the Twilio Console open ' +
    'Messaging → Settings → Geo permissions and enable India (or the target country).',
  21606: "The 'From' number is not SMS-capable or is not owned by this account.",
  21608:
    'Trial account: you can only text numbers you have VERIFIED. Add the recipient under ' +
    'Phone Numbers → Verified Caller IDs, or upgrade the account.',
  21610: 'That number has replied STOP and is unsubscribed.',
  21614: "'To' is not a mobile number.",
  63038: 'Daily message limit for the trial account has been reached.',
};

/** Turn a Twilio SDK error into a single actionable line. */
function explainTwilioError(err) {
  const hint = TWILIO_HINTS[err?.code];
  const base = `${err?.code ? `[${err.code}] ` : ''}${err?.message || 'Unknown SMS error'}`;
  return hint ? `${base} — ${hint}` : base;
}

/** Keyed hash of a code — never store or log the plaintext. */
function hashCode(phone, code) {
  const key = process.env.JWT_SECRET || 'otp-fallback-key';
  return crypto.createHmac('sha256', key).update(`${phone}:${code}`).digest('hex');
}

function safeEqual(a, b) {
  const ba = Buffer.from(a, 'utf8');
  const bb = Buffer.from(b, 'utf8');
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

/** Cryptographically-random 6-digit code. */
function generateCode() {
  return String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');
}

/**
 * Throttle check for a number. Returns { ok } or { ok:false, retryAfterSec, reason }.
 */
function checkSendThrottle(phone, now = Date.now()) {
  const entry = sendLog.get(phone) || { sends: [] };
  // Drop timestamps older than an hour.
  entry.sends = entry.sends.filter((t) => now - t < 60 * 60 * 1000);

  const last = entry.sends[entry.sends.length - 1];
  if (last && now - last < COOLDOWN_MS) {
    return { ok: false, reason: 'cooldown', retryAfterSec: Math.ceil((COOLDOWN_MS - (now - last)) / 1000) };
  }
  if (entry.sends.length >= MAX_PER_HOUR) {
    const oldest = entry.sends[0];
    return { ok: false, reason: 'hourly_cap', retryAfterSec: Math.ceil((60 * 60 * 1000 - (now - oldest)) / 1000) };
  }
  sendLog.set(phone, entry);
  return { ok: true };
}

/**
 * issueOtp: generate, store and deliver a code for a phone number.
 * Returns { ok:true, delivered:'sms'|'console' } or { ok:false, ... }.
 */
async function issueOtp(rawPhone) {
  const phone = normalizePhone(rawPhone);
  if (!phone) return { ok: false, error: 'invalid_phone' };

  const throttle = checkSendThrottle(phone);
  if (!throttle.ok) {
    logger.security('OTP_SEND_THROTTLED', { phone: maskPhone(phone), reason: throttle.reason });
    return { ok: false, error: 'throttled', retryAfterSec: throttle.retryAfterSec };
  }

  const code = generateCode();
  codes.set(phone, { hash: hashCode(phone, code), expiresAt: Date.now() + TTL_MS, attempts: 0 });

  const entry = sendLog.get(phone);
  entry.sends.push(Date.now());
  sendLog.set(phone, entry);

  const body = `Your forgeVidhya verification code is ${code}. It expires in ${Math.round(
    TTL_MS / 60000
  )} minutes. Do not share it with anyone.`;

  let smsError = null;

  if (twilioReady) {
    try {
      const msg = await twilioClient.messages.create({
        body,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone,
      });
      // `queued`/`accepted` means Twilio took it; final delivery is async and
      // can still fail (carrier/DLT), which shows in the Twilio Console logs.
      logger.info('OTP handed to Twilio', {
        phone: maskPhone(phone),
        sid: msg.sid,
        status: msg.status,
      });
      return { ok: true, delivered: 'sms', sid: msg.sid, status: msg.status };
    } catch (err) {
      smsError = explainTwilioError(err);
      logger.error('Twilio send FAILED', { phone: maskPhone(phone), reason: smsError });
      if (isProd) {
        codes.delete(phone); // don't leave a code the user can never receive
        return { ok: false, error: 'sms_failed', reason: smsError };
      }
      // Development: fall through to console delivery so the flow stays usable,
      // but report WHY the SMS failed instead of pretending it was sent.
    }
  } else {
    smsError = 'Twilio is not configured (TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_PHONE_NUMBER are empty).';
  }

  if (!isProd) {
    // Dev-only convenience. The code is never sent to the client.
    // eslint-disable-next-line no-console
    console.log(
      `\n========================================\n  OTP for ${phone}: ${code}\n  NO SMS SENT — ${smsError}\n========================================\n`
    );
    return { ok: true, delivered: 'console', reason: smsError };
  }

  return { ok: false, error: 'sms_unavailable', reason: smsError };
}

/**
 * verifyOtp: check a submitted code. Consumes the code on success, and burns
 * the challenge after MAX_ATTEMPTS failures.
 * Returns { ok:true, phone } or { ok:false, error }.
 */
function verifyOtp(rawPhone, submitted) {
  const phone = normalizePhone(rawPhone);
  if (!phone) return { ok: false, error: 'invalid_phone' };
  if (typeof submitted !== 'string' || !/^\d{6}$/.test(submitted.trim())) {
    return { ok: false, error: 'invalid_code_format' };
  }

  const record = codes.get(phone);
  if (!record) return { ok: false, error: 'no_code' };

  if (Date.now() > record.expiresAt) {
    codes.delete(phone);
    return { ok: false, error: 'expired' };
  }

  record.attempts += 1;
  if (record.attempts > MAX_ATTEMPTS) {
    codes.delete(phone);
    logger.security('OTP_ATTEMPTS_EXCEEDED', { phone: maskPhone(phone) });
    return { ok: false, error: 'too_many_attempts' };
  }

  if (!safeEqual(record.hash, hashCode(phone, submitted.trim()))) {
    logger.security('OTP_MISMATCH', { phone: maskPhone(phone), attempt: record.attempts });
    return { ok: false, error: 'mismatch', attemptsLeft: Math.max(0, MAX_ATTEMPTS - record.attempts) };
  }

  codes.delete(phone); // single use
  return { ok: true, phone };
}

// Periodic sweep so abandoned challenges don't accumulate. unref() keeps this
// timer from holding the process open.
const sweeper = setInterval(() => {
  const now = Date.now();
  for (const [phone, rec] of codes) if (now > rec.expiresAt) codes.delete(phone);
  for (const [phone, rec] of sendLog) {
    rec.sends = rec.sends.filter((t) => now - t < 60 * 60 * 1000);
    if (rec.sends.length === 0) sendLog.delete(phone);
  }
}, 5 * 60 * 1000);
if (typeof sweeper.unref === 'function') sweeper.unref();

module.exports = {
  issueOtp,
  verifyOtp,
  isSmsConfigured: () => twilioReady,
  // exported for tests
  _internal: { codes, sendLog, generateCode },
};
