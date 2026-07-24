/**
 * backend/routes/authRoutes.js
 * Wires auth endpoints to validation, rate limiting, lockout, and cookie auth.
 *
 * Security note: Applies input validation + login rate limiting at the edge and
 * gates session-bound routes behind access-token verification.
 *
 * Mounted in server.js (below the security middleware, above notFound) via a
 * conditionalCsrf wrapper that exempts /register and /login (no session cookie
 * yet) and enforces CSRF on /refresh, /logout, and /me.
 *
 * Env variables: none directly.
 */

const express = require('express');
const router = express.Router();

const { register, login, refresh, logout, me } = require('../controllers/authController');
const { protect, loginLimiter } = require('../middleware/authMiddleware');
const { registerRules, loginRules } = require('../middleware/validationMiddleware');

// Public
router.post('/register', registerRules, register);
router.post('/login', loginLimiter, loginRules, login);
router.post('/refresh', refresh);   // uses refresh cookie, no access token
router.post('/logout', logout);     // idempotent; safe without a valid session

// Protected
router.get('/me', protect, me);

module.exports = router;
