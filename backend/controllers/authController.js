/**
 * backend/controllers/authController.js
 * Auth handlers: register, login, refresh, logout, me.
 *
 * Security note: Enforces bcrypt-verified credentials, per-account lockout,
 * rotating refresh tokens (stored only as a hash), and uniform error messages
 * that don't reveal whether an email exists.
 *
 * Env variables: (consumed indirectly) JWT_ACCESS_SECRET, JWT_REFRESH_SECRET,
 *   ACCESS_TOKEN_TTL, REFRESH_TOKEN_TTL, COOKIE_DOMAIN, NODE_ENV.
 */

const crypto = require('crypto');
const User = require('../models/User');
const logger = require('../utils/logger');
const {
  clearAuthCookies,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  accessCookieOptions,
  refreshCookieOptions,
} = require('../middleware/authMiddleware');

// Deterministic hash of the refresh token so a DB leak can't reuse tokens.
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

// Uniform "bad credentials" response — never disclose which part was wrong.
const INVALID_CREDS = { success: false, message: 'Invalid email or password' };

/**
 * Issue access + refresh cookies and persist the refresh-token hash.
 * Rotates the stored hash on every issuance (login + refresh).
 */
const issueSession = async (res, user) => {
  const refreshToken = signRefreshToken(user);
  // Persist only the hash; the raw token lives solely in the httpOnly cookie.
  await user.updateOne({ $set: { refreshTokenHash: hashToken(refreshToken) } });

  res.cookie('accessToken', signAccessToken(user), accessCookieOptions);
  res.cookie('refreshToken', refreshToken, refreshCookieOptions);
};

/**
 * POST /api/auth/register
 * Validation (registerRules) runs in the route before this handler.
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      // Don't leak existence via a distinct status; 409 is acceptable at signup.
      logger.security('REGISTER_DUPLICATE', { ip: req.ip, email });
      return res.status(409).json({ success: false, message: 'Email is already registered' });
    }

    // Password is hashed by the User pre-save hook.
    const user = await User.create({ name, email, password });

    await issueSession(res, user);
    logger.info('User registered', { userId: user._id.toString() });

    return res.status(201).json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/login
 * Route applies loginLimiter (5/15min per IP) BEFORE this handler.
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Need +password and +lock fields, which are select:false by default.
    const user = await User.findOne({ email }).select(
      '+password +loginAttempts +lockUntil'
    );

    // Uniform response whether or not the user exists.
    if (!user) {
      logger.security('LOGIN_FAILED_NO_USER', { ip: req.ip, email });
      return res.status(401).json(INVALID_CREDS);
    }

    // Blocked by lockout window?
    if (user.isLocked) {
      const retryMs = user.lockUntil - Date.now();
      logger.security('LOGIN_BLOCKED_LOCKED', { ip: req.ip, userId: user._id.toString() });
      return res.status(423).json({
        success: false,
        message: 'Account temporarily locked due to failed attempts. Try again later.',
        retryAfterSeconds: Math.ceil(retryMs / 1000),
      });
    }

    const match = await user.comparePassword(password);
    if (!match) {
      await user.registerFailedLogin();
      const remaining = User.MAX_LOGIN_ATTEMPTS - (user.loginAttempts + 1);
      logger.security('LOGIN_FAILED_BAD_PASSWORD', {
        ip: req.ip,
        userId: user._id.toString(),
        attempts: user.loginAttempts + 1,
      });
      return res.status(401).json(INVALID_CREDS);
    }

    // Success: clear counters, rotate session.
    await user.resetLoginAttempts();
    await issueSession(res, user);
    logger.info('User logged in', { userId: user._id.toString() });

    return res.json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/refresh
 * Verifies the refresh cookie, checks it against the stored hash, rotates both
 * tokens. No access token required (it may be expired).
 */
const refresh = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res.status(401).json({ success: false, message: 'No refresh token', code: 'NO_REFRESH' });
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(token);
    } catch (err) {
      logger.security('REFRESH_INVALID', { ip: req.ip, reason: err.name });
      clearAuthCookies(res);
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }

    const user = await User.findById(decoded.sub).select('+refreshTokenHash');
    // Reuse/rotation check: the presented token must match the stored hash.
    if (!user || user.refreshTokenHash !== hashToken(token)) {
      logger.security('REFRESH_REUSE_DETECTED', { ip: req.ip, userId: decoded.sub });
      // Invalidate any existing session on suspected reuse/theft.
      if (user) await user.updateOne({ $unset: { refreshTokenHash: 1 } });
      clearAuthCookies(res);
      return res.status(401).json({ success: false, message: 'Session expired, please log in again' });
    }

    // Rotate: new access + new refresh (and new stored hash).
    await issueSession(res, user);
    logger.info('Session refreshed', { userId: user._id.toString() });

    return res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/logout
 * Clears cookies and invalidates the stored refresh hash.
 */
const logout = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (token) {
      try {
        const decoded = verifyRefreshToken(token);
        await User.findByIdAndUpdate(decoded.sub, { $unset: { refreshTokenHash: 1 } });
      } catch {
        /* token already invalid — clearing cookies is enough */
      }
    }
    clearAuthCookies(res);
    return res.json({ success: true, message: 'Logged out' });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/auth/me
 * Requires a valid access token (protect middleware sets req.user).
 */
const me = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    return res.json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, refresh, logout, me };
