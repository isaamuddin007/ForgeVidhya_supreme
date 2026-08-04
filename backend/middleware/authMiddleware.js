/**
 * backend/middleware/authMiddleware.js
 * JWT issuance + verification (auth-method agnostic).
 *
 * Tokens are stateless 7-day JWTs (per product decision). `protect` accepts the
 * token from an Authorization: Bearer header (SPA reads it from localStorage) or
 * from an httpOnly cookie fallback, verifies it, and attaches the user to
 * req.user. Missing/invalid tokens get a 401. `authorize('admin')` gates admin
 * routes on the token's role claim.
 *
 * Security note: fails closed at boot if JWT_SECRET is unset, so the server can
 * never issue guessable/unsigned tokens.
 *
 * Env variables:
 *   JWT_SECRET   - long random secret for signing tokens (openssl rand -base64 48)
 *   JWT_EXPIRES  - optional, default '7d'
 */

const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES = process.env.JWT_EXPIRES || '7d';
const ISSUER = 'forgevidhya';

if (!JWT_SECRET) {
  // Fail closed rather than signing with a missing/empty secret.
  throw new Error('JWT_SECRET missing. Set a long random JWT_SECRET.');
}

/**
 * signToken: mint a 7-day JWT for a user. The payload carries just enough for
 * the SPA to render the account chip (it decodes the JWT client-side).
 */
const signToken = (user) =>
  jwt.sign(
    {
      sub: user.id,
      email: user.email || undefined,
      phone: user.phone || undefined,
      name: user.name || undefined,
      picture: user.avatar || undefined,
      role: user.role || 'user',
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES, issuer: ISSUER }
  );

/** Extract a token from the Bearer header first, then the cookie fallback. */
const extractToken = (req) => {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) return header.slice(7);
  return req.cookies?.token || null;
};

/**
 * protect: require a valid JWT. Attaches { id, email, name, role } to req.user.
 */
const protect = (req, res, next) => {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET, { issuer: ISSUER });
    req.user = {
      id: decoded.sub,
      email: decoded.email,
      phone: decoded.phone,
      name: decoded.name,
      role: decoded.role || 'user',
    };
    return next();
  } catch (err) {
    logger.security('JWT_INVALID', { ip: req.ip, reason: err.name });
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
 * loginLimiter: 5 attempts / 15 min / IP on the credential login endpoint.
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

/**
 * otpLimiter: per-IP cap on the OTP endpoints. This is the outer guard against
 * SMS-cost abuse and code brute-forcing; otpService adds a per-NUMBER cooldown
 * and a per-code attempt cap, so neither one IP nor one target number can be
 * hammered. Slightly looser than loginLimiter because several users can share
 * an IP behind carrier NAT.
 */
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many verification requests. Try again later.' },
  handler: (req, res, _next, options) => {
    logger.security('OTP_RATE_LIMITED', { ip: req.ip, route: req.originalUrl });
    res.status(options.statusCode).json(options.message);
  },
});

module.exports = { protect, authorize, loginLimiter, otpLimiter, signToken };
