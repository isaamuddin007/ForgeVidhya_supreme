/**
 * backend/controllers/uploadController.js
 * Handles sketch image uploads for the sketch-to-DWG feature.
 *
 * Security note: Operates only on files that already passed multer's size/type
 * gate AND magic-byte verification, and returns an opaque stored filename (never
 * the client-supplied name or absolute path) so clients can't infer disk layout.
 *
 * Env variables: UPLOAD_DIR (consumed by uploadMiddleware).
 */

const fs = require('fs');
const path = require('path');
const Sketch = require('../models/Sketch');
const logger = require('../utils/logger');
const { UPLOAD_DIR } = require('../middleware/uploadMiddleware');

/**
 * POST /api/uploads/sketch
 * Persists a metadata record for the verified upload. The file itself is
 * already saved to UPLOAD_DIR with a randomized name by multer.
 */
const uploadSketch = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided' });
    }

    const sketch = await Sketch.create({
      owner: req.user.id,
      storedName: req.file.filename,           // randomized, safe name on disk
      originalName: req.file.originalname,      // for display only (sanitized on render)
      mimeType: req.file.mimetype,
      size: req.file.size,
      status: 'uploaded',                       // -> 'processing' -> 'converted'
    });

    logger.info('Sketch uploaded', {
      userId: req.user.id,
      sketchId: sketch.id,
      size: req.file.size,
    });

    // ------------------------------------------------------------------
    // NEXT STEP (out of scope here): enqueue the sketch-to-DWG conversion
    // job (e.g. BullMQ) keyed by sketch._id. Keep heavy work off the
    // request thread. The ClamAV scan hook lives in uploadMiddleware.
    // ------------------------------------------------------------------

    return res.status(201).json({
      success: true,
      sketch: {
        id: sketch.id,
        originalName: sketch.originalName,
        size: sketch.size,
        status: sketch.status,
        createdAt: sketch.createdAt,
      },
    });
  } catch (err) {
    // If the DB write fails after the file landed on disk, don't orphan it.
    if (req.file?.path) {
      fs.promises.unlink(req.file.path).catch(() => {});
    }
    next(err);
  }
};

/**
 * GET /api/uploads/:id
 * Streams a sketch back to its owner only. Guards against IDOR + path traversal.
 */
const getSketch = async (req, res, next) => {
  try {
    // Guard: an invalid UUID would make Postgres throw — treat as not found.
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(req.params.id)) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }
    const sketch = await Sketch.findById(req.params.id);
    // Ownership check (IDOR protection). Admins may read any.
    if (!sketch || (sketch.owner !== req.user.id && req.user.role !== 'admin')) {
      logger.security('SKETCH_ACCESS_DENIED', { ip: req.ip, userId: req.user.id, sketchId: req.params.id });
      return res.status(404).json({ success: false, message: 'Not found' });
    }

    // Resolve within UPLOAD_DIR and confirm the result stays inside it.
    const filePath = path.resolve(UPLOAD_DIR, sketch.storedName);
    if (!filePath.startsWith(path.resolve(UPLOAD_DIR) + path.sep)) {
      logger.security('SKETCH_PATH_TRAVERSAL', { ip: req.ip, sketchId: req.params.id });
      return res.status(400).json({ success: false, message: 'Invalid file reference' });
    }
    if (!fs.existsSync(filePath)) {
      return res.status(410).json({ success: false, message: 'File no longer available' });
    }

    res.type(sketch.mimeType);
    return res.sendFile(filePath);
  } catch (err) {
    next(err);
  }
};

module.exports = { uploadSketch, getSketch };
