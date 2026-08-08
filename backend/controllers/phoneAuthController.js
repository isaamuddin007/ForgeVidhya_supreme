/**
 * backend/controllers/phoneAuthController.js
 * Mobile-number (OTP) authentication.
 *
 *   sendOtp   - POST /auth/otp/send    issue + SMS a one-time code
 *   verifyOtp - POST /auth/otp/verify  check the code, upsert the user, mint a JWT
 *
 * Roles: exactly two. The number in ADMIN_PHONE signs in as 'admin' (full
 * read/write via the /api/admin routes); every other number signs in as 'user'
 * (read-only — there are simply no write endpoints available to that role).
 *
 * Security notes:
 *  - The role is recomputed from the env allow-list on EVERY sign-in and written
 *    to the row, so it can never be escalated from client input and a tampered
 *    DB row is corrected on the next login.
 *  - The OTP is never echoed in a response (see services/otpService).
 *  - Failure reasons are deliberately coarse so the endpoint isn't an oracle for
 *    which numbers are registered.
 */

const User = require('../models/User');
const { signToken } = require('../middleware/authMiddleware');
const { issueOtp, verifyOtp: verifyCode } = require('../services/otpService');
const { normalizePhone, roleForPhone, maskPhone } = require('../utils/phone');
const logger = require('../utils/logger');

const isProd = process.env.NODE_ENV === 'production';

const tokenCookie = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? 'strict' : 'lax',
  domain: process.env.COOKIE_DOMAIN || undefined,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
};

const publicUser = (u) => ({
  id: u.id,
  phone: u.phone,
  email: u.email,
  name: u.name,
  role: u.role,
  createdAt: u.createdAt,
});

/**
 * POST /auth/otp/send  { phone }
 */
const sendOtp = async (req, res, next) => {
  try {
    const phone = normalizePhone(req.body?.phone);
    if (!phone) {
      return res.status(422).json({
        success: false,
        message: 'Enter a valid mobile number including country code.',
      });
    }

    const result = await issueOtp(phone);

    if (!result.ok) {
      if (result.error === 'throttled') {
        return res.status(429).json({
          success: false,
          message: `Too many code requests. Try again in ${result.retryAfterSec}s.`,
          retryAfterSec: result.retryAfterSec,
        });
      }
      if (result.error === 'invalid_phone') {
        return res.status(422).json({ success: false, message: 'Enter a valid mobile number.' });
      }
      logger.error('OTP issue failed', { phone: maskPhone(phone), error: result.error });
      return res.status(502).json({
        success: false,
        message: 'Could not send the code right now. Please try again shortly.',
      });
    }

    return res.json({
      success: true,
      message:
        result.delivered === 'sms'
          ? 'Verification code sent.'
          : 'Code generated — but no SMS was sent (see the API server console).',
      // Dev-only diagnostics so nobody waits for an SMS that was never sent.
      // Never includes the code itself.
      ...(isProd ? {} : { delivery: result.delivered, reason: result.reason || undefined }),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /auth/otp/verify  { phone, code }
 */
const verifyOtp = async (req, res, next) => {
  try {
    const phone = normalizePhone(req.body?.phone);
    const code = typeof req.body?.code === 'string' ? req.body.code.trim() : '';

    if (!phone) {
      return res.status(422).json({ success: false, message: 'Enter a valid mobile number.' });
    }

    const check = verifyCode(phone, code);
    if (!check.ok) {
      const messages = {
        no_code: 'Request a new code to continue.',
        expired: 'That code has expired. Request a new one.',
        too_many_attempts: 'Too many incorrect attempts. Request a new code.',
        invalid_code_format: 'Enter the 6-digit code.',
        mismatch: 'That code is incorrect.',
      };
      const status = check.error === 'too_many_attempts' ? 429 : 401;
      return res.status(status).json({
        success: false,
        message: messages[check.error] || 'Verification failed.',
        ...(typeof check.attemptsLeft === 'number' ? { attemptsLeft: check.attemptsLeft } : {}),
      });
    }

    // Role comes from the env allow-list, never from the request or the row.
    const role = roleForPhone(phone);
    const user = await User.upsertByPhone(phone, role);
    const token = signToken(user);

    res.cookie('token', token, tokenCookie);
    logger.info('Phone sign-in', { userId: user.id, phone: maskPhone(phone), role });

    return res.json({ success: true, token, user: publicUser(user) });
  } catch (err) {
    next(err);
  }
};

module.exports = { sendOtp, verifyOtp };
