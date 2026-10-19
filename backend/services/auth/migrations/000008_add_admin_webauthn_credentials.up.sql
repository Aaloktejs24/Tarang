CREATE TABLE IF NOT EXISTS admin_webauthn_credentials (
    id SERIAL PRIMARY KEY,
    role VARCHAR(50) NOT NULL, -- 'admin' or 'super_admin'
    identifier VARCHAR(255) NOT NULL, -- The user id / email
    credential_id BYTEA NOT NULL UNIQUE,
    public_key BYTEA NOT NULL,
    attestation_type VARCHAR(255) NOT NULL,
    sign_count BIGINT NOT NULL DEFAULT 0,
    aaguid BYTEA,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_admin_webauthn_role_identifier ON admin_webauthn_credentials(role, identifier);
