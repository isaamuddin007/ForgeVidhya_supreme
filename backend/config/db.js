/**
 * backend/config/db.js
 * CockroachDB (PostgreSQL wire protocol) connection pool + schema bootstrap.
 *
 * Security note: Keeps the connection string out of source (env only), enforces
 * TLS to CockroachDB Cloud, and caps pool size + timeouts so a stalled or
 * hostile DB can't exhaust the event loop. All queries elsewhere use parameter
 * placeholders ($1, $2, …) — never string interpolation — to block SQL injection.
 *
 * Env variables:
 *   DATABASE_URL   - full CockroachDB connection string, e.g.
 *                    postgresql://forgevidhya_app:<pwd>@<host>:26257/forgevidhya?sslmode=verify-full
 *                    Use an app user with table-level privileges only (never root/admin).
 *   DATABASE_CA    - optional path to the cluster CA cert (verify-full). If unset,
 *                    TLS still verifies against the system trust store.
 *   PGSSL_DISABLE  - set to '1' ONLY for a local insecure cluster (dev).
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const logger = require('../utils/logger');

const connectionString = process.env.DATABASE_URL;

// Build the TLS config. CockroachDB Cloud requires TLS; a local `--insecure`
// cluster (dev only) can opt out with PGSSL_DISABLE=1.
function buildSsl() {
  if (process.env.PGSSL_DISABLE === '1') return false;
  const ca =
    process.env.DATABASE_CA && fs.existsSync(process.env.DATABASE_CA)
      ? fs.readFileSync(process.env.DATABASE_CA).toString()
      : undefined;
  return { rejectUnauthorized: true, ...(ca ? { ca } : {}) };
}

const pool = new Pool({
  connectionString,
  ssl: buildSsl(),
  max: 10, // cap concurrent sockets
  idleTimeoutMillis: 30_000, // reclaim idle clients
  connectionTimeoutMillis: 10_000, // fail fast if the cluster is unreachable
});

pool.on('error', (err) => {
  // Errors on idle clients shouldn't crash the process.
  logger.error('Postgres pool error', { message: err.message });
});

/** Thin query helper — always call with a parameterized text + values. */
const query = (text, params) => pool.query(text, params);

/**
 * Verify connectivity and apply the schema (idempotent). Called once at boot.
 */
const connectDB = async () => {
  if (!connectionString) {
    logger.error('DATABASE_URL is not set. Refusing to start.');
    process.exit(1);
  }
  // Reject an obviously over-privileged root/admin URI.
  if (/:\/\/(root|admin)[:@]/i.test(connectionString)) {
    logger.error('DATABASE_URL appears to use a root/admin account. Use a least-privilege app user.');
    process.exit(1);
  }

  try {
    await pool.query('SELECT 1'); // prove connectivity
    const schema = fs.readFileSync(path.join(__dirname, '..', 'db', 'schema.sql'), 'utf8');
    await pool.query(schema); // apply schema (safe to re-run)
    logger.info('CockroachDB connected and schema ensured');
  } catch (err) {
    logger.error('Database connection/bootstrap failed', { message: err.message });
    process.exit(1);
  }

  // Graceful shutdown: drain the pool on termination.
  const gracefulExit = async (signal) => {
    logger.info(`Received ${signal}, closing database pool.`);
    await pool.end().catch(() => {});
    process.exit(0);
  };
  process.on('SIGINT', () => gracefulExit('SIGINT'));
  process.on('SIGTERM', () => gracefulExit('SIGTERM'));
};

module.exports = { pool, query, connectDB };
