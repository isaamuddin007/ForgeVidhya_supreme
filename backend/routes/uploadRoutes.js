/**
 * backend/routes/uploadRoutes.js
 * Sketch upload/download endpoints for the sketch-to-DWG feature.
 *
 * Security note: Chains authentication, single-file multer (5MB, .jpg/.png),
 * magic-byte verification, and multer error normalization so only authenticated
 * users can submit genuinely-valid images.
 *
 * Mounted in server.js with CSRF (cookie-authed mutation):
 *   app.use('/api/uploads', csrfProtection, require('./routes/uploadRoutes'));
 *
 * Env variables: none directly.
 */

const express = require('express');
const router = express.Router();

const { uploadSketch, getSketch } = require('../controllers/uploadController');
const { protect } = require('../middleware/authMiddleware');
const {
  upload,
  verifyMagicBytes,
  handleUploadErrors,
} = require('../middleware/uploadMiddleware');

// POST /api/uploads/sketch
// Order matters: auth -> multer parses 'image' -> magic-byte check -> handler.
router.post(
  '/sketch',
  protect,                 // must be logged in
  upload.single('image'),  // field name = "image"; enforces 5MB + type allow-list
  handleUploadErrors,      // turn multer errors (e.g. LIMIT_FILE_SIZE) into JSON
  verifyMagicBytes,        // confirm real JPEG/PNG signature; ClamAV hook lives here
  uploadSketch
);

// GET /api/uploads/:id  (owner-only stream)
router.get('/:id', protect, getSketch);

module.exports = router;
