/**
 * backend/routes/contentRoutes.js
 * Public, read-only site content (mounted at /api/content in server.js).
 *
 *   GET /api/content -> the site announcement published by the admin
 *
 * This is the read half of the admin content feature: everyone (signed in or
 * not) can read it; only the admin can change it, via PUT /api/admin/content.
 */

const express = require('express');
const router = express.Router();

const SiteSetting = require('../models/SiteSetting');

router.get('/', async (_req, res, next) => {
  try {
    const { value, updatedAt } = await SiteSetting.get(SiteSetting.ANNOUNCEMENT_KEY, '');
    res.json({ success: true, content: value, updatedAt });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
