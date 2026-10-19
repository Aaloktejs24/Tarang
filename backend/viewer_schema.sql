CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS document_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    extension VARCHAR(10) NOT NULL,
    requires_conversion BOOLEAN NOT NULL DEFAULT FALSE,
    raw_minio_key VARCHAR(255) NOT NULL,
    processed_minio_key VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_document_jobs_user_id ON document_jobs(user_id);
CREATE INDEX idx_document_jobs_status ON document_jobs(status);
