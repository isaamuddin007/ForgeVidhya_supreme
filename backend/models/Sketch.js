/**
 * backend/models/Sketch.js
 * Metadata record for an uploaded sketch (sketch-to-DWG pipeline).
 *
 * Security note: Stores only the randomized on-disk name and an owner reference,
 * enabling per-user access control (IDOR protection) without exposing paths.
 *
 * Env variables: none.
 */

const mongoose = require('mongoose');

const sketchSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true, // fast per-user lookups + ownership checks
    },
    storedName: { type: String, required: true },   // randomized name on disk
    originalName: { type: String, maxlength: 255 },  // display only (sanitize on render)
    mimeType: {
      type: String,
      required: true,
      enum: ['image/jpeg', 'image/png'],
    },
    size: { type: Number, required: true, max: 5 * 1024 * 1024 }, // 5MB cap
    status: {
      type: String,
      enum: ['uploaded', 'processing', 'converted', 'failed'],
      default: 'uploaded',
    },
    dwgPath: { type: String }, // populated by the conversion worker later
  },
  { timestamps: true }
);

// Common access pattern: a user's sketches, newest first.
sketchSchema.index({ owner: 1, createdAt: -1 });

module.exports = mongoose.model('Sketch', sketchSchema);
