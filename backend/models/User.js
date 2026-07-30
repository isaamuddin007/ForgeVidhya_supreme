/**
 * backend/models/User.js
 * User data-access for CockroachDB (PostgreSQL). Backs Google-OAuth auth today;
 * the nullable `password` column reserves email/password sign-in for later
 * (hash with bcrypt before storing — never plaintext).
 *
 * Table shape lives in backend/db/schema.sql:
 *   id UUID pk | google_id (unique) | email (unique, required) | name | avatar |
 *   password (nullable) | role | created_at | updated_at   (timestamps)
 *
 * Security note: every query is parameterized ($1, $2 …) — no string
 * interpolation — so user-supplied values can never alter the SQL.
 *
 * Export: module.exports = { … } (per project convention).
 */

const { query } = require('../config/db');

// Only ever expose these columns to the app (never a password hash by default).
const PUBLIC_COLUMNS = 'id, google_id, email, name, avatar, role, created_at, updated_at';

/** Map a snake_case DB row to a camelCase domain object. */
function toUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    googleId: row.google_id,
    email: row.email,
    name: row.name,
    avatar: row.avatar,
    role: row.role,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Find a user by their Google account id. Returns null if none. */
async function findByGoogleId(googleId) {
  const { rows } = await query(
    `SELECT ${PUBLIC_COLUMNS} FROM users WHERE google_id = $1 LIMIT 1`,
    [googleId]
  );
  return toUser(rows[0]);
}

/** Find a user by email (case-insensitive). Returns null if none. */
async function findByEmail(email) {
  const { rows } = await query(
    `SELECT ${PUBLIC_COLUMNS} FROM users WHERE lower(email) = lower($1) LIMIT 1`,
    [email]
  );
  return toUser(rows[0]);
}

/** Find a user by primary key. Returns null if none. */
async function findById(id) {
  const { rows } = await query(
    `SELECT ${PUBLIC_COLUMNS} FROM users WHERE id = $1 LIMIT 1`,
    [id]
  );
  return toUser(rows[0]);
}

/**
 * Create a new user. `email` is required for everyone; `googleId` is required
 * for Google-auth users. Touches updated_at automatically via the default.
 */
async function create({ googleId = null, email, name = null, avatar = null, role = 'user' }) {
  if (!email) throw new Error('email is required');
  const { rows } = await query(
    `INSERT INTO users (google_id, email, name, avatar, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING ${PUBLIC_COLUMNS}`,
    [googleId, email, name, avatar, role]
  );
  return toUser(rows[0]);
}

/** Update mutable profile fields (name/avatar) and bump updated_at. */
async function updateProfile(id, { name, avatar }) {
  const { rows } = await query(
    `UPDATE users
        SET name = COALESCE($2, name),
            avatar = COALESCE($3, avatar),
            updated_at = now()
      WHERE id = $1
      RETURNING ${PUBLIC_COLUMNS}`,
    [id, name ?? null, avatar ?? null]
  );
  return toUser(rows[0]);
}

module.exports = {
  findByGoogleId,
  findByEmail,
  findById,
  create,
  updateProfile,
};
