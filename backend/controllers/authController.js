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
const { signToken } = require('../middleware/authMiddleware');
const logger = require('../utils/logger');

const CLIENT_URL = process.env.CLIENT_URL || process.env.CLIENT_ORIGIN || 'http://localhost:8080';

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
 * POST /auth/login
 * Email/password sign-in — stubbed for now (Google is the live path).
 */
const login = (req, res) => {
  return res.status(501).json({
    success: false,
    message: 'Email/password login is not implemented yet. Please sign in with Google.',
  });
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

module.exports = { googleAuth, googleCallback, login, logout };
