-- ================================================
-- MIGRATION: Add Internship Batches
-- Description: Admin creates internship batches; companies can post jobs
-- and students can apply only when a batch is active.
-- ================================================

-- Create enum for batch status
CREATE TYPE batch_status AS ENUM ('upcoming', 'active', 'closed');

-- ================================================
-- INTERNSHIP BATCHES TABLE
-- ================================================
CREATE TABLE internship_batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    semester VARCHAR(50) NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    application_deadline DATE,
    start_date DATE,
    end_date DATE,
    max_students INTEGER DEFAULT 0,
    status batch_status DEFAULT 'upcoming',
    allow_company_posting BOOLEAN DEFAULT FALSE,
    allow_student_application BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_internship_batches_status ON internship_batches(status);
CREATE INDEX idx_internship_batches_semester ON internship_batches(semester);

-- ================================================
-- ADD batch_id to positions & applications
-- ================================================
ALTER TABLE positions ADD COLUMN batch_id UUID REFERENCES internship_batches(id) ON DELETE SET NULL;
CREATE INDEX idx_positions_batch_id ON positions(batch_id);

ALTER TABLE applications ADD COLUMN batch_id UUID REFERENCES internship_batches(id) ON DELETE SET NULL;
CREATE INDEX idx_applications_batch_id ON applications(batch_id);

COMMENT ON TABLE internship_batches IS 'Admin-created internship batches controlling when companies can post and students can apply';
COMMENT ON COLUMN internship_batches.allow_company_posting IS 'Whether companies can post new positions during this batch';
COMMENT ON COLUMN internship_batches.allow_student_application IS 'Whether students can apply to positions during this batch';
