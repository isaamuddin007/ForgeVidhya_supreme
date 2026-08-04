/**
 * backend/models/SiteSetting.js
 * Key/value store for admin-editable site content (see db/schema.sql).
 *
 * Used by the admin dashboard to publish a site-wide announcement that every
 * visitor sees. Values are plain text — the request pipeline already strips HTML
 * (sanitizeBody), and the SPA renders them as text, so stored content can't
 * become script.
 */

const { query } = require('../config/db');

/** Key of the site-wide announcement shown to all visitors. */
const ANNOUNCEMENT_KEY = 'site_announcement';

/** Read a setting. Returns `fallback` when the key isn't set yet. */
async function get(key, fallback = '') {
  const { rows } = await query('SELECT value, updated_at FROM site_settings WHERE key = $1 LIMIT 1', [key]);
  if (!rows[0]) return { value: fallback, updatedAt: null };
  return { value: rows[0].value, updatedAt: rows[0].updated_at };
}

/** Create or replace a setting, recording who changed it. */
async function set(key, value, updatedBy = null) {
  const { rows } = await query(
    `INSERT INTO site_settings (key, value, updated_by, updated_at)
     VALUES ($1, $2, $3, now())
     ON CONFLICT (key) DO UPDATE SET value = $2, updated_by = $3, updated_at = now()
     RETURNING value, updated_at`,
    [key, value, updatedBy]
  );
  return { value: rows[0].value, updatedAt: rows[0].updated_at };
}

module.exports = { get, set, ANNOUNCEMENT_KEY };
