CREATE TABLE IF NOT EXISTS admin_tokens (
    id SERIAL PRIMARY KEY,
    token VARCHAR(7) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Index for fast token lookups
CREATE INDEX IF NOT EXISTS idx_admin_tokens_token ON admin_tokens(token);
