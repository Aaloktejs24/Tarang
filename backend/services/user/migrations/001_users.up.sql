CREATE TABLE users (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username          CITEXT UNIQUE NOT NULL,
  email             CITEXT UNIQUE NOT NULL,
  phone             VARCHAR(20) UNIQUE,
  role              TEXT NOT NULL DEFAULT 'user',
  email_verified_at TIMESTAMPTZ,
  phone_verified_at TIMESTAMPTZ,
  totp_secret       TEXT,
  totp_enabled      BOOLEAN NOT NULL DEFAULT FALSE,
  disabled          BOOLEAN NOT NULL DEFAULT FALSE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);