/**
 * backend/routes/adminRoutes.js
 * Admin-only API (mounted at /api/admin in server.js).
 *
 *   GET    /api/admin/summary       -> dashboard stats
 *   GET    /api/admin/users         -> list all users
 *   DELETE /api/admin/users/:id     -> remove a user (never an admin)
 *   PUT    /api/admin/content       -> publish the site announcement
 *
 * Security notes:
 *  - EVERY route here is behind protect + authorize('admin'), applied with
 *    router.use so a newly added route can't accidentally ship unguarded.
 *  - `authorize` reads the role from the signed JWT, and the role is re-derived
 *    from the ADMIN_PHONE allow-list at each sign-in, so "user" accounts have no
 *    path to these endpoints — that is what makes non-admins read-only.
 *  - Admin accounts cannot be deleted (including self), so the single approved
 *    number can never be locked out of its own dashboard.
 */

const express = require('express');
const router = express.Router();

const User = require('../models/User');
const SiteSetting = require('../models/SiteSetting');
const { protect, authorize } = require('../middleware/authMiddleware');
const logger = require('../utils/logger');

/**
 * requireBearer: admin calls must present the JWT in the Authorization header,
 * not via the cookie fallback. Browsers never attach an Authorization header to
 * a cross-site request on their own, so this removes the CSRF vector for these
 * state-changing routes without needing a CSRF token round-trip.
 */
const requireBearer = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authorization header required' });
  }
  next();
};

// Gate the whole router: bearer token AND authenticated AND role === 'admin'.
router.use(requireBearer, protect, authorize('admin'));

/** GET /api/admin/summary */
router.get('/summary', async (_req, res, next) => {
  try {
    const [userCount, announcement] = await Promise.all([
      User.countAll(),
      SiteSetting.get(SiteSetting.ANNOUNCEMENT_KEY),
    ]);
    res.json({
      success: true,
      summary: {
        userCount,
        announcementUpdatedAt: announcement.updatedAt,
        adminPhone: process.env.ADMIN_PHONE || null,
      },
    });
  } catch (err) {
    next(err);
  }
});

/** GET /api/admin/users */
router.get('/users', async (_req, res, next) => {
  try {
    res.json({ success: true, users: await User.listAll() });
  } catch (err) {
    next(err);
  }
});

/** DELETE /api/admin/users/:id */
router.delete('/users/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const target = await User.findById(id);
    if (!target) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    if (target.role === 'admin') {
      logger.security('ADMIN_DELETE_BLOCKED', { by: req.user.id, target: id });
      return res.status(400).json({ success: false, message: 'Admin accounts cannot be deleted.' });
    }

    await User.deleteById(id);
    logger.info('User deleted by admin', { by: req.user.id, target: id });
    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    next(err);
  }
});

/** PUT /api/admin/content  { content } */
router.put('/content', async (req, res, next) => {
  try {
    const raw = typeof req.body?.content === 'string' ? req.body.content : '';
    // sanitizeBody already stripped HTML; cap the length as a final guard.
    const content = raw.trim().slice(0, 2000);

    const saved = await SiteSetting.set(SiteSetting.ANNOUNCEMENT_KEY, content, req.user.id);
    logger.info('Site content updated', { by: req.user.id, length: content.length });
    res.json({ success: true, content: saved.value, updatedAt: saved.updatedAt });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
