/**
 * backend/models/User.js
 * User data-access for CockroachDB (PostgreSQL). Backs email/password auth; the
 * `role` column gates admin access, and mobile-number (phone) auth can be added
 * later with a parallel create/verify path.
 *
 * Table shape lives in backend/db/schema.sql:
 *   id UUID pk | email (unique, required) | name | avatar | password (nullable) |
 *   role | created_at | updated_at
 * (The legacy nullable google_id column is left in place but unused.)
 *
 * Security note: every query is parameterized ($1, $2 …) — no string
 * interpolation — so user-supplied values can never alter the SQL.
 */

const bcrypt = require('bcryptjs');
const { query } = require('../config/db');

// bcrypt work factor (never below 12).
const SALT_ROUNDS = Math.max(12, parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12);

// Only ever expose these columns to the app (never a password hash by default).
const PUBLIC_COLUMNS = 'id, email, phone, name, avatar, role, created_at, updated_at';

/** Map a snake_case DB row to a camelCase domain object. */
function toUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    phone: row.phone,
    name: row.name,
    avatar: row.avatar,
    role: row.role,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
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
 * Returns { ...publicUser, password } or null. `password` may be null for
 * accounts created without a credential.
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
  if (!hash) return false; // account with no password set
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

/** Find a user by E.164 phone number. Returns null if none. */
async function findByPhone(phone) {
  const { rows } = await query(
    `SELECT ${PUBLIC_COLUMNS} FROM users WHERE phone = $1 LIMIT 1`,
    [phone]
  );
  return toUser(rows[0]);
}

/**
 * upsertByPhone: create the phone user if new, otherwise return the existing row
 * with its role synced to `role`.
 *
 * Security note: `role` is derived from the ADMIN_PHONE env allow-list by the
 * caller on every sign-in — never from client input and never trusted from the
 * stored row — so a stale or tampered DB role cannot grant admin, and the real
 * admin is restored automatically if their row was altered.
 */
async function upsertByPhone(phone, role = 'user') {
  const { rows } = await query(
    `INSERT INTO users (phone, role)
     VALUES ($1, $2)
     ON CONFLICT (phone) DO UPDATE SET role = $2, updated_at = now()
     RETURNING ${PUBLIC_COLUMNS}`,
    [phone, role]
  );
  return toUser(rows[0]);
}

/** All users, newest first — admin dashboard listing. */
async function listAll(limit = 500) {
  const { rows } = await query(
    `SELECT ${PUBLIC_COLUMNS} FROM users ORDER BY created_at DESC LIMIT $1`,
    [limit]
  );
  return rows.map(toUser);
}

/** Delete a user by id. Returns the deleted row (or null if it didn't exist). */
async function deleteById(id) {
  const { rows } = await query(
    `DELETE FROM users WHERE id = $1 RETURNING ${PUBLIC_COLUMNS}`,
    [id]
  );
  return toUser(rows[0]);
}

/** Count of all users — dashboard stat. */
async function countAll() {
  const { rows } = await query('SELECT count(*)::INT AS n FROM users');
  return rows[0]?.n ?? 0;
}

module.exports = {
  findByEmail,
  findById,
  findByPhone,
  upsertByPhone,
  listAll,
  deleteById,
  countAll,
  createWithPassword,
  findByEmailWithPassword,
  verifyPassword,
  updateProfile,
};
