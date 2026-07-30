-- =============================================================================
-- backend/db/schema.sql
-- CockroachDB / PostgreSQL schema for forgeVidhya.
--
-- Applied automatically on boot by config/db.js (idempotent: IF NOT EXISTS),
-- and safe to run by hand against a CockroachDB Cloud cluster:
--   cockroach sql --url "$DATABASE_URL" -f backend/db/schema.sql
--
-- CockroachDB speaks the PostgreSQL wire protocol; gen_random_uuid() and
-- TIMESTAMPTZ are supported natively.
-- =============================================================================

-- ----------------------------------------------------------------------------
-- users — authentication (Google OAuth today; email/password reserved for later)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  google_id   STRING UNIQUE,                 -- required for Google-auth users (enforced in app)
  email       STRING NOT NULL UNIQUE,        -- required for all users
  name        STRING,
  avatar      STRING,
  password    STRING,                         -- nullable; only set for email/password users (bcrypt)
  role        STRING NOT NULL DEFAULT 'user', -- 'user' | 'admin'
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS users_email_idx ON users (email);

-- ----------------------------------------------------------------------------
-- sketches — metadata for the sketch-to-DWG upload pipeline
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sketches (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner         UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  stored_name   STRING NOT NULL,             -- randomized name on disk
  original_name STRING,                       -- display only (sanitize on render)
  mime_type     STRING NOT NULL,
  size          INT8 NOT NULL,
  status        STRING NOT NULL DEFAULT 'uploaded', -- uploaded|processing|converted|failed
  dwg_path      STRING,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS sketches_owner_idx ON sketches (owner);
