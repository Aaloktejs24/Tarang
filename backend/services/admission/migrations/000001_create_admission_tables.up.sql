CREATE TABLE IF NOT EXISTS admission_programs (
    id VARCHAR(255) PRIMARY KEY,
    institute_id VARCHAR(255) NOT NULL,
    workflow_title VARCHAR(255) NOT NULL,
    workflow_desc TEXT NOT NULL,
    image_url VARCHAR(255),
    last_date VARCHAR(255),
    seats INT,
    academic_year VARCHAR(255),
    eligibility VARCHAR(255),
    fees VARCHAR(255),
    duration VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admission_stages (
    id SERIAL PRIMARY KEY,
    program_id VARCHAR(255) NOT NULL REFERENCES admission_programs(id) ON DELETE CASCADE,
    stage_order INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'document', 'quiz', 'interview'
    requirements JSONB, -- Array of strings
    quiz_attachment_name VARCHAR(255),
    quiz_attachment_size VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
