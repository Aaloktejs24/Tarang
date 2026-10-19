CREATE TABLE IF NOT EXISTS auth_login_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    requires_totp BOOLEAN NOT NULL DEFAULT false,
    requires_otp BOOLEAN NOT NULL DEFAULT false,
    requires_setup BOOLEAN NOT NULL DEFAULT false,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Index for quick lookups and cleanup
CREATE INDEX idx_auth_login_sessions_expires_at ON auth_login_sessions(expires_at);
