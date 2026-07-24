/**
 * backend/middleware/authMiddleware.js
 * JWT verification, token issuance helpers, role guards, and login rate limits.
 *
 * Security note: Verifies short-lived access tokens from httpOnly cookies,
 * enforces role-based authorization, and throttles credential-stuffing on login.
 *
 * Env variables:
 *   JWT_ACCESS_SECRET   - long random secret for access tokens
 *   JWT_REFRESH_SECRET  - separate long random secret for refresh tokens
 *   ACCESS_TOKEN_TTL    - optional, default '15m'
 *   REFRESH_TOKEN_TTL   - optional, default '7d'
 *   COOKIE_DOMAIN       - e.g. 'forgevidhya.in' (omit in local dev)
 *   NODE_ENV            - 'production' toggles Secure cookies
 */

const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const ACCESS_TTL = process.env.ACCESS_TOKEN_TTL || '15m';
const REFRESH_TTL = process.env.REFRESH_TOKEN_TTL || '7d';

if (!ACCESS_SECRET || !REFRESH_SECRET) {
  // Fail closed at boot rather than issuing unsigned/guessable tokens.
  throw new Error('JWT secrets missing. Set JWT_ACCESS_SECRET and JWT_REFRESH_SECRET.');
}

const isProd = process.env.NODE_ENV === 'production';

// --- Cookie options (httpOnly + SameSite + Secure in prod) ---
const baseCookie = {
  httpOnly: true,                       // not readable by JS -> mitigates XSS token theft
  secure: isProd,                       // HTTPS-only in production
  sameSite: isProd ? 'strict' : 'lax',  // CSRF hardening
  domain: process.env.COOKIE_DOMAIN || undefined,
  path: '/',
};

const accessCookieOptions = { ...baseCookie, maxAge: 15 * 60 * 1000 };          // 15m
const refreshCookieOptions = { ...baseCookie, maxAge: 7 * 24 * 60 * 60 * 1000 }; // 7d

// --- Token helpers ---
const signAccessToken = (user) =>
  jwt.sign({ sub: user._id.toString(), role: user.role }, ACCESS_SECRET, {
    expiresIn: ACCESS_TTL,
    issuer: 'forgevidhya',
  });

const signRefreshToken = (user) =>
  jwt.sign({ sub: user._id.toString(), type: 'refresh' }, REFRESH_SECRET, {
    expiresIn: REFRESH_TTL,
    issuer: 'forgevidhya',
  });

const verifyRefreshToken = (token) =>
  jwt.verify(token, REFRESH_SECRET, { issuer: 'forgevidhya' });

/**
 * Set both tokens as httpOnly cookies on the response.
 */
const setAuthCookies = (res, user) => {
  res.cookie('accessToken', signAccessToken(user), accessCookieOptions);
  res.cookie('refreshToken', signRefreshToken(user), refreshCookieOptions);
};

/**
 * Clear auth cookies (logout).
 */
const clearAuthCookies = (res) => {
  res.clearCookie('accessToken', { ...baseCookie });
  res.clearCookie('refreshToken', { ...baseCookie });
};

/**
 * protect: require a valid access token. Reads the httpOnly cookie first,
 * falling back to a Bearer header for non-browser API clients.
 */
const protect = (req, res, next) => {
  let token = req.cookies?.accessToken;
  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }

  try {
    const decoded = jwt.verify(token, ACCESS_SECRET, { issuer: 'forgevidhya' });
    req.user = { id: decoded.sub, role: decoded.role };
    return next();
  } catch (err) {
    logger.security('ACCESS_TOKEN_INVALID', { ip: req.ip, reason: err.name });
    const expired = err.name === 'TokenExpiredError';
    return res.status(401).json({
      success: false,
      message: expired ? 'Token expired' : 'Invalid token',
      code: expired ? 'TOKEN_EXPIRED' : 'TOKEN_INVALID',
    });
  }
};

/**
 * authorize: restrict a route to specific roles. Use after `protect`.
 * Example: router.delete('/:id', protect, authorize('admin'), handler)
 */
const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    logger.security('AUTHZ_DENIED', { ip: req.ip, userId: req.user?.id, need: roles });
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }
  next();
};

/**
 * loginLimiter: 5 attempts per 15 minutes per IP on auth endpoints.
 * Complements the per-account lockout in the User model.
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts. Try again later.' },
  handler: (req, res, _next, options) => {
    logger.security('LOGIN_RATE_LIMITED', { ip: req.ip, route: req.originalUrl });
    res.status(options.statusCode).json(options.message);
  },
});

module.exports = {
  protect,
  authorize,
  loginLimiter,
  setAuthCookies,
  clearAuthCookies,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  accessCookieOptions,
  refreshCookieOptions,
};
