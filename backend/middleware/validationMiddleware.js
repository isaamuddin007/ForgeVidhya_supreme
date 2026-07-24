/**
 * backend/middleware/validationMiddleware.js
 * express-validator rule sets + a shared result handler, plus XSS sanitizers.
 *
 * Security note: Rejects malformed input at the edge and strips HTML/script
 * payloads, defending against XSS and injection before data reaches handlers.
 *
 * Env variables: none.
 */

const { body, validationResult } = require('express-validator');
const sanitizeHtml = require('sanitize-html');
const logger = require('../utils/logger');

// Strip ALL tags/attributes from free-text fields (defense-in-depth XSS).
const stripHtml = (value) =>
  typeof value === 'string'
    ? sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} }).trim()
    : value;

/**
 * handleValidation: terminate the request if any rule failed. Place LAST in a
 * validation chain.
 */
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.security('VALIDATION_FAILED', {
      ip: req.ip,
      route: req.originalUrl,
      fields: errors.array().map((e) => e.path),
    });
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// --- Reusable rule sets ---

const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required')
    .isLength({ max: 100 }).customSanitizer(stripHtml),
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password')
    .isLength({ min: 8, max: 128 }).withMessage('Password must be 8-128 chars')
    .matches(/[a-z]/).withMessage('Needs a lowercase letter')
    .matches(/[A-Z]/).withMessage('Needs an uppercase letter')
    .matches(/[0-9]/).withMessage('Needs a number')
    .matches(/[^A-Za-z0-9]/).withMessage('Needs a special character'),
  handleValidation,
];

const loginRules = [
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidation,
];

// Example content route (e.g. a course/service note) with sanitized rich text.
const contentRules = [
  body('title').trim().notEmpty().isLength({ max: 200 }).customSanitizer(stripHtml),
  body('description').optional().trim().isLength({ max: 5000 }).customSanitizer(stripHtml),
  handleValidation,
];

/**
 * Generic middleware to deep-sanitize req.body string values against XSS.
 * Attach globally for defense-in-depth on any un-validated free text.
 */
const sanitizeBody = (req, _res, next) => {
  const walk = (obj) => {
    if (!obj || typeof obj !== 'object') return;
    for (const key of Object.keys(obj)) {
      if (typeof obj[key] === 'string') obj[key] = stripHtml(obj[key]);
      else if (typeof obj[key] === 'object') walk(obj[key]);
    }
  };
  if (req.body) walk(req.body);
  next();
};

module.exports = {
  handleValidation,
  registerRules,
  loginRules,
  contentRules,
  sanitizeBody,
  stripHtml,
};
