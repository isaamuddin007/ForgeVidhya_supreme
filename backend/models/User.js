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

const bcrypt = require('bcryptjs');
const { query } = require('../config/db');

// bcrypt work factor (never below 12).
const SALT_ROUNDS = Math.max(12, parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12);

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

/**
 * Create an email/password user. Hashes the password with bcrypt before storing;
 * the plaintext never touches the database. Returns the public user (no hash).
 */
async function createWithPassword({ name, email, password, role = 'user' }) {
  if (!email) throw new Error('email is required');
  if (!password) throw new Error('password is required');
  const hash = await bcrypt.hash(password, SALT_ROUNDS);
  const { rows } = await query(
    `INSERT INTO users (email, name, password, role)
     VALUES ($1, $2, $3, $4)
     RETURNING ${PUBLIC_COLUMNS}`,
    [email, name, hash, role]
  );
  return toUser(rows[0]);
}

/**
 * Find a user by email INCLUDING the password hash — for credential login only.
 * Returns { ...publicUser, password } or null. `password` is null for accounts
 * created via Google (no credential set).
 */
async function findByEmailWithPassword(email) {
  const { rows } = await query(
    `SELECT ${PUBLIC_COLUMNS}, password FROM users WHERE lower(email) = lower($1) LIMIT 1`,
    [email]
  );
  if (!rows[0]) return null;
  const user = toUser(rows[0]);
  user.password = rows[0].password; // hash (or null); never expose beyond auth
  return user;
}

/** Constant-time password check against a stored bcrypt hash. */
async function verifyPassword(plain, hash) {
  if (!hash) return false; // Google-only account has no password set
  return bcrypt.compare(plain, hash);
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
  createWithPassword,
  findByEmailWithPassword,
  verifyPassword,
  updateProfile,
};
