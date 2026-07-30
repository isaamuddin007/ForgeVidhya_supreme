/**
 * backend/controllers/authController.js
 * Google OAuth authentication handlers.
 *
 *   googleAuth     - kicks off the Google consent screen redirect
 *   googleCallback - Google returns here; mint a 7-day JWT and redirect to the SPA
 *   login          - email/password stub (not implemented yet)
 *   logout         - clear cookie + session
 *
 * Security note: the JWT is signed by authMiddleware.signToken (7-day expiry).
 * On success we hand it to the SPA via the callback URL; the SPA stores it and
 * sends it back as a Bearer token on API calls.
 *
 * Env variables:
 *   CLIENT_URL - SPA origin to redirect back to (default http://localhost:8080)
 */

const passport = require('../config/passport');
const User = require('../models/User');
const { signToken } = require('../middleware/authMiddleware');
const logger = require('../utils/logger');

const CLIENT_URL = process.env.CLIENT_URL || process.env.CLIENT_ORIGIN || 'http://localhost:8080';
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
const publicUser = (u) => ({ id: u.id, email: u.email, name: u.name, avatar: u.avatar });

// Uniform credentials error — never reveal whether the email exists.
const INVALID_CREDS = { success: false, message: 'Invalid email or password' };

/**
 * GET /auth/google
 * Redirect the browser to Google's consent screen.
 */
const googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email'],
  session: false,
});

/**
 * GET /auth/google/callback
 * Google redirects here with a code; Passport exchanges it and yields the user.
 * We then mint a JWT and bounce back to the SPA's /auth/callback with the token.
 */
const googleCallback = (req, res, next) => {
  passport.authenticate('google', { session: false }, (err, user) => {
    if (err || !user) {
      logger.security('GOOGLE_CALLBACK_FAILED', { ip: req.ip, reason: err?.message });
      return res.redirect(`${CLIENT_URL}/auth/callback?error=google_auth_failed`);
    }
    try {
      const token = signToken(user);
      // Hand the token to the SPA. It stores it (localStorage) and routes on.
      return res.redirect(`${CLIENT_URL}/auth/callback?token=${encodeURIComponent(token)}`);
    } catch (e) {
      logger.error('Token signing failed', { message: e.message });
      return res.redirect(`${CLIENT_URL}/auth/callback?error=token_error`);
    }
  })(req, res, next);
};

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
    // Missing user OR a Google-only account (no password) -> same generic error.
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
 * Clear the cookie fallback and any Passport session. The SPA also drops its
 * localStorage token client-side. Idempotent.
 */
const logout = (req, res) => {
  res.clearCookie('token');
  if (typeof req.logout === 'function') {
    // passport >=0.6 requires a callback
    return req.logout((err) => {
      if (err) logger.error('Logout error', { message: err.message });
      if (req.session) {
        return req.session.destroy(() => res.json({ success: true, message: 'Logged out' }));
      }
      return res.json({ success: true, message: 'Logged out' });
    });
  }
  return res.json({ success: true, message: 'Logged out' });
};

module.exports = { googleAuth, googleCallback, register, login, logout };
