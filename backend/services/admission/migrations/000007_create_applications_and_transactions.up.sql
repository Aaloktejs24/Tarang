CREATE TABLE IF NOT EXISTS admission_applications (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    institute_id VARCHAR(255) NOT NULL,
    program_id VARCHAR(255) NOT NULL REFERENCES admission_programs(id) ON DELETE CASCADE,
    current_stage_index INT DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, in_progress, rejected, admitted
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, program_id)
);

CREATE TABLE IF NOT EXISTS admission_transactions (
    id VARCHAR(255) PRIMARY KEY,
    application_id VARCHAR(255) NOT NULL REFERENCES admission_applications(id) ON DELETE CASCADE,
    actor_id VARCHAR(255) NOT NULL, -- user_id or institute_id
    action_type VARCHAR(100) NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
