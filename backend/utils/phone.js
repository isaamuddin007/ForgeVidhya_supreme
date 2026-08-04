/**
 * backend/utils/phone.js
 * Phone-number normalization to E.164 + the admin allow-list check.
 *
 * Security note: admin rights are decided here, so normalization must be
 * canonical BEFORE comparison. Without it, "+91 80087 57916", "008918008757916"
 * and "+918008757916" would compare unequal, and a formatting variant could
 * either lock the real admin out or (worse) be treated as a different account.
 * Everything is reduced to a single canonical form first, and the admin number
 * is read from env (never from the database), so DB tampering cannot grant
 * admin. If ADMIN_PHONE is unset we fail closed — nobody is admin.
 *
 * Env variables:
 *   ADMIN_PHONE           - the single admin number in E.164, e.g. +918008757916
 *   DEFAULT_COUNTRY_CODE  - optional, default '+91'; used to expand bare local numbers
 */

const DEFAULT_CC = process.env.DEFAULT_COUNTRY_CODE || '+91';

// E.164: '+', country digit 1-9, then 7-14 more digits (max 15 total).
const E164 = /^\+[1-9]\d{7,14}$/;

/**
 * normalizePhone: reduce any reasonable user input to canonical E.164.
 * Returns the normalized string, or null when the input can't be a valid number.
 */
function normalizePhone(raw) {
  if (typeof raw !== 'string' && typeof raw !== 'number') return null;

  // Keep only digits and a single leading '+'.
  let s = String(raw).trim().replace(/[\s\-().]/g, '');
  if (!s) return null;

  if (s.startsWith('00')) s = `+${s.slice(2)}`; // international 00 prefix
  if (!s.startsWith('+')) {
    // Bare local number -> expand with the default country code.
    const digits = s.replace(/\D/g, '');
    if (!digits) return null;
    s = `${DEFAULT_CC}${digits}`;
  }

  // Strip any stray non-digits after the '+'.
  s = `+${s.slice(1).replace(/\D/g, '')}`;

  return E164.test(s) ? s : null;
}

/** True when the given number is the configured admin number. */
function isAdminPhone(raw) {
  const admin = normalizePhone(process.env.ADMIN_PHONE);
  if (!admin) return false; // fail closed: no admin configured
  const candidate = normalizePhone(raw);
  return candidate !== null && candidate === admin;
}

/** Role for a phone number: 'admin' only for the allow-listed number. */
function roleForPhone(raw) {
  return isAdminPhone(raw) ? 'admin' : 'user';
}

/** Mask a number for logs: +918008757916 -> +9180*****916 */
function maskPhone(raw) {
  const p = normalizePhone(raw);
  if (!p) return '(invalid)';
  return p.length <= 7 ? p : `${p.slice(0, 5)}*****${p.slice(-3)}`;
}

module.exports = { normalizePhone, isAdminPhone, roleForPhone, maskPhone, E164 };
