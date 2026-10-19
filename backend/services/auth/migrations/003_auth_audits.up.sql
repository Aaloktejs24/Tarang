CREATE TABLE auth_audits (
  id            BIGSERIAL PRIMARY KEY,
  user_id       UUID,
  event         TEXT NOT NULL,
  ip            INET,
  user_agent    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  details       JSONB
);