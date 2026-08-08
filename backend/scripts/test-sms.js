#!/usr/bin/env node
/**
 * backend/scripts/test-sms.js
 * Send one real test SMS through Twilio and print exactly what happened.
 *
 * Usage:
 *   node scripts/test-sms.js +918008757916
 *   npm run sms:test -- +918008757916
 *
 * Use this to prove your Twilio credentials work BEFORE debugging the app. It
 * touches nothing else — no database, no server, no OTP state.
 */

require('dotenv').config();

const { normalizePhone } = require('../utils/phone');

const to = normalizePhone(process.argv[2]);
const { TWILIO_ACCOUNT_SID: SID, TWILIO_AUTH_TOKEN: TOKEN, TWILIO_PHONE_NUMBER: FROM } = process.env;

const set = (v) => (v && v.trim() ? 'set' : 'EMPTY  <-- fix this');

console.log('\nTwilio configuration');
console.log('  TWILIO_ACCOUNT_SID  :', set(SID), SID && !SID.trim().startsWith('AC') ? '(should start with "AC")' : '');
console.log('  TWILIO_AUTH_TOKEN   :', set(TOKEN));
console.log('  TWILIO_PHONE_NUMBER :', set(FROM), FROM && !FROM.trim().startsWith('+') ? '(must be E.164, e.g. +15551234567)' : '');

if (!to) {
  console.error('\nUsage: node scripts/test-sms.js <mobile number>');
  console.error('Example: node scripts/test-sms.js +918008757916\n');
  process.exit(1);
}
if (!SID || !TOKEN || !FROM) {
  console.error('\nCannot send: fill the three TWILIO_* values in backend/.env first.');
  console.error('Get them from https://console.twilio.com (Account SID, Auth Token, and your Twilio number).\n');
  process.exit(1);
}

(async () => {
  try {
    const client = require('twilio')(SID.trim(), TOKEN.trim());
    console.log(`\nSending test SMS to ${to} ...`);
    const msg = await client.messages.create({
      body: 'forgeVidhya test message. If you received this, SMS delivery works.',
      from: FROM.trim(),
      to,
    });
    console.log('\nAccepted by Twilio');
    console.log('  SID    :', msg.sid);
    console.log('  Status :', msg.status);
    console.log(
      '\nNote: "queued"/"accepted" only means Twilio took the message. Final delivery is\n' +
        'asynchronous — check Monitor → Logs → Messaging in the Twilio Console to confirm it\n' +
        'reached the handset (this is where India DLT / carrier rejections show up).\n'
    );
  } catch (err) {
    console.error('\nSEND FAILED');
    console.error('  Code    :', err.code ?? '(none)');
    console.error('  Message :', err.message);
    if (err.moreInfo) console.error('  Docs    :', err.moreInfo);

    const hints = {
      20003: 'Authentication failed — the Account SID or Auth Token is wrong.',
      21211: "Invalid 'To' number — must be full E.164, e.g. +918008757916.",
      21212: "Invalid 'From' — TWILIO_PHONE_NUMBER is not a valid Twilio number.",
      21408:
        'Region not enabled. Twilio Console → Messaging → Settings → Geo permissions → enable India.',
      21606: "The 'From' number is not SMS-capable or is not owned by this account.",
      21608:
        'TRIAL ACCOUNT: you may only text VERIFIED numbers. Add this number under ' +
        'Phone Numbers → Verified Caller IDs, or upgrade the account.',
      21610: 'That number replied STOP and is unsubscribed.',
      63038: 'Trial daily message limit reached.',
    };
    if (hints[err.code]) console.error('\n  Fix     :', hints[err.code]);
    console.error('');
    process.exit(1);
  }
})();
