/**
 * backend/routes/authRoutes.js
 * Authentication endpoints (mounted at /auth in server.js).
 *
 *   GET  /auth/google           -> start Google OAuth
 *   GET  /auth/google/callback  -> Google returns here; mints JWT, redirects to SPA
 *   POST /auth/login            -> email/password (stub)
 *   POST /auth/logout           -> clear cookie + session
 *   GET  /auth/me               -> current user (JWT-protected) [convenience]
 *
 * Security note: /login is rate-limited to blunt credential stuffing once the
 * email/password path is implemented.
 */

const express = require('express');
const router = express.Router();

const { googleAuth, googleCallback, register, login, logout } = require('../controllers/authController');
const { protect, loginLimiter } = require('../middleware/authMiddleware');
const { registerRules, loginRules } = require('../middleware/validationMiddleware');

// Google OAuth
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);

// Email/password
router.post('/register', loginLimiter, registerRules, register);
router.post('/login', loginLimiter, loginRules, login);
router.post('/logout', logout);

// Convenience: echo the authenticated user (SPA can verify its token).
router.get('/me', protect, (req, res) => res.json({ success: true, user: req.user }));

module.exports = router;
