/**
 * backend/controllers/authController.js
 * Email/password authentication handlers.
 *
 *   register - create an email/password account, issue a JWT
 *   login    - email/password sign-in, issue a JWT (uniform error, no oracle)
 *   logout   - clear the httpOnly cookie fallback (JWT is stateless)
 *
 * Security note: the JWT is signed by authMiddleware.signToken (7-day expiry).
 * On success we return it in the body (the SPA stores it in localStorage) and
 * also set an httpOnly cookie fallback. The token carries the user's `role`,
 * so admin-only routes can gate on it via authMiddleware.authorize('admin').
 *
 * Mobile-number auth is planned next: add a phone-based create/verify flow here
 * (OTP), reusing signToken — the JWT layer is auth-method agnostic.
 */

const User = require('../models/User');
const { signToken } = require('../middleware/authMiddleware');
const logger = require('../utils/logger');

const isProd = process.env.NODE_ENV === 'production';

// httpOnly cookie fallback for the JWT (the SPA primarily reads it from the body
// and stores it in localStorage; the cookie helps same-site/server-side callers).
const tokenCookie = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? 'strict' : 'lax',
  domain: process.env.COOKIE_DOMAIN || undefined,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days, matches the JWT
  path: '/',
};

// Shape a user for the response body (never includes the password hash).
const publicUser = (u) => ({ id: u.id, email: u.email, name: u.name, avatar: u.avatar, role: u.role });

// Uniform credentials error — never reveal whether the email exists.
const INVALID_CREDS = { success: false, message: 'Invalid email or password' };

/**
 * POST /auth/register
 * Create an email/password account. Validation (registerRules) runs first.
 * Issues a JWT immediately so the user is signed in on success.
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findByEmail(email);
    if (existing) {
      // 409 at signup is acceptable; it doesn't leak a login oracle.
      logger.security('REGISTER_DUPLICATE', { ip: req.ip });
      return res.status(409).json({ success: false, message: 'Email is already registered' });
    }

    const user = await User.createWithPassword({ name, email, password });
    const token = signToken(user);
    res.cookie('token', token, tokenCookie);
    logger.info('New user via email/password', { userId: user.id });
    return res.status(201).json({ success: true, token, user: publicUser(user) });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /auth/login
 * Email/password sign-in. Uniform error on any failure (no user-enumeration).
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findByEmailWithPassword(email);
    if (!user || !user.password) {
      logger.security('LOGIN_FAILED', { ip: req.ip, reason: 'no_credential' });
      return res.status(401).json(INVALID_CREDS);
    }

    const ok = await User.verifyPassword(password, user.password);
    if (!ok) {
      logger.security('LOGIN_FAILED', { ip: req.ip, reason: 'bad_password' });
      return res.status(401).json(INVALID_CREDS);
    }

    const token = signToken(user);
    res.cookie('token', token, tokenCookie);
    return res.json({ success: true, token, user: publicUser(user) });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /auth/logout
 * Clear the httpOnly cookie fallback. The JWT is stateless, so the SPA also
 * drops its localStorage token client-side. Idempotent.
 */
const logout = (_req, res) => {
  res.clearCookie('token');
  return res.json({ success: true, message: 'Logged out' });
};

module.exports = { register, login, logout };
