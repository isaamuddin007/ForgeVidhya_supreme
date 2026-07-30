/**
 * backend/models/Sketch.js
 * Sketch metadata data-access for CockroachDB (PostgreSQL). One row per uploaded
 * sketch in the sketch-to-DWG pipeline.
 *
 * Table shape lives in backend/db/schema.sql:
 *   id UUID pk | owner UUID -> users(id) | stored_name | original_name |
 *   mime_type | size | status | dwg_path | created_at | updated_at
 *
 * Security note: stores only the randomized on-disk name and an owner id,
 * enabling per-user access control (IDOR protection) without exposing paths.
 * All queries are parameterized.
 */

const { query } = require('../config/db');

function toSketch(row) {
  if (!row) return null;
  return {
    id: row.id,
    owner: row.owner,
    storedName: row.stored_name,
    originalName: row.original_name,
    mimeType: row.mime_type,
    size: Number(row.size),
    status: row.status,
    dwgPath: row.dwg_path,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const COLUMNS =
  'id, owner, stored_name, original_name, mime_type, size, status, dwg_path, created_at, updated_at';

/** Insert a sketch metadata record and return it. */
async function create({ owner, storedName, originalName, mimeType, size, status = 'uploaded' }) {
  const { rows } = await query(
    `INSERT INTO sketches (owner, stored_name, original_name, mime_type, size, status)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING ${COLUMNS}`,
    [owner, storedName, originalName, mimeType, size, status]
  );
  return toSketch(rows[0]);
}

/** Look up a sketch by id. Returns null if not found. */
async function findById(id) {
  const { rows } = await query(
    `SELECT ${COLUMNS} FROM sketches WHERE id = $1 LIMIT 1`,
    [id]
  );
  return toSketch(rows[0]);
}

module.exports = { create, findById };
