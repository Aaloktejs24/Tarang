CREATE TABLE IF NOT EXISTS admission_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    institute_id UUID NOT NULL,
    program_id UUID NOT NULL REFERENCES admission_programs(id) ON DELETE CASCADE,
    current_stage_index INT DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, in_progress, rejected, admitted
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, program_id)
);

CREATE TABLE IF NOT EXISTS admission_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES admission_applications(id) ON DELETE CASCADE,
    actor_id UUID NOT NULL, -- user_id or institute_id
    action_type VARCHAR(100) NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
