/**
 * backend/middleware/uploadMiddleware.js
 * Hardened multer config for the sketch-to-DWG image uploads.
 *
 * Security note: Enforces size (5MB), extension AND MIME allow-listing, magic-
 * byte verification, and randomized filenames to block malicious/oversized
 * uploads, path traversal, and content-type spoofing.
 *
 * Env variables:
 *   UPLOAD_DIR - optional, default 'backend/uploads' (git-ignored)
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const logger = require('../utils/logger');

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_EXT = ['.jpg', '.jpeg', '.png'];
const ALLOWED_MIME = ['image/jpeg', 'image/png'];

// Magic-byte signatures so we don't trust the client-declared MIME type.
const MAGIC = {
  jpg: [0xff, 0xd8, 0xff],
  png: [0x89, 0x50, 0x4e, 0x47],
};

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    // Random name + safe extension; never trust the original filename.
    const ext = path.extname(file.originalname).toLowerCase();
    const safe = crypto.randomBytes(16).toString('hex');
    cb(null, `${Date.now()}-${safe}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXT.includes(ext) || !ALLOWED_MIME.includes(file.mimetype)) {
    logger.security('UPLOAD_REJECTED_TYPE', {
      ip: req.ip, ext, mime: file.mimetype, name: file.originalname,
    });
    return cb(new Error('Only .jpg, .jpeg, and .png images are allowed'), false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_SIZE, files: 1 },
});

/**
 * verifyMagicBytes: post-multer guard that reads the first bytes of the saved
 * file and deletes it if the signature doesn't match a real JPEG/PNG.
 */
const verifyMagicBytes = (req, res, next) => {
  if (!req.file) return next();
  const fd = fs.openSync(req.file.path, 'r');
  const buf = Buffer.alloc(8);
  fs.readSync(fd, buf, 0, 8, 0);
  fs.closeSync(fd);

  const isJpg = MAGIC.jpg.every((b, i) => buf[i] === b);
  const isPng = MAGIC.png.every((b, i) => buf[i] === b);

  if (!isJpg && !isPng) {
    fs.unlinkSync(req.file.path); // remove the spoofed file
    logger.security('UPLOAD_REJECTED_MAGIC', { ip: req.ip, name: req.file.originalname });
    return res.status(422).json({ success: false, message: 'File content is not a valid image' });
  }

  // ------------------------------------------------------------------
  // TODO: VIRUS SCAN INTEGRATION POINT
  // Before accepting the file, scan it with ClamAV (e.g. the `clamscan`
  // npm package pointed at a clamd daemon):
  //
  //   const NodeClam = require('clamscan');
  //   const clam = await new NodeClam().init({ clamdscan: { socket: '/var/run/clamd.scan/clamd.sock' } });
  //   const { isInfected } = await clam.isInfected(req.file.path);
  //   if (isInfected) { fs.unlinkSync(req.file.path); return res.status(422)...; }
  //
  // Run this in a queue/worker for large volumes to avoid blocking requests.
  // ------------------------------------------------------------------

  next();
};

// Normalizes multer errors (e.g. LIMIT_FILE_SIZE) into clean JSON responses.
const handleUploadErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    const message =
      err.code === 'LIMIT_FILE_SIZE' ? 'File exceeds the 5MB limit' : err.message;
    logger.security('UPLOAD_MULTER_ERROR', { ip: req.ip, code: err.code });
    return res.status(413).json({ success: false, message });
  }
  if (err) {
    return res.status(422).json({ success: false, message: err.message });
  }
  next();
};

module.exports = { upload, verifyMagicBytes, handleUploadErrors, UPLOAD_DIR };
