/**
 * backend/routes/authRoutes.js
 * Authentication endpoints (mounted at /auth in server.js).
 *
 *   POST /auth/otp/send   -> mobile number: issue + SMS a one-time code
 *   POST /auth/otp/verify -> mobile number: verify the code, mint a JWT
 *   POST /auth/register   -> email/password signup (validated, rate-limited)
 *   POST /auth/login      -> email/password sign-in (rate-limited)
 *   POST /auth/logout     -> clear cookie fallback
 *   GET  /auth/me         -> current user (JWT-protected) [convenience]
 *
 * Security note: every credential path is rate-limited — loginLimiter blunts
 * credential stuffing, otpLimiter blunts SMS-cost abuse and code brute-forcing.
 */

const express = require('express');
const router = express.Router();

const { register, login, logout } = require('../controllers/authController');
const { sendOtp, verifyOtp } = require('../controllers/phoneAuthController');
const { protect, loginLimiter, otpLimiter } = require('../middleware/authMiddleware');
const { registerRules, loginRules } = require('../middleware/validationMiddleware');

// Mobile number (OTP) — the primary sign-in method
router.post('/otp/send', otpLimiter, sendOtp);
router.post('/otp/verify', otpLimiter, verifyOtp);

// Email/password
router.post('/register', loginLimiter, registerRules, register);
router.post('/login', loginLimiter, loginRules, login);
router.post('/logout', logout);

// Convenience: echo the authenticated user (SPA can verify its token).
router.get('/me', protect, (req, res) => res.json({ success: true, user: req.user }));

module.exports = router;
