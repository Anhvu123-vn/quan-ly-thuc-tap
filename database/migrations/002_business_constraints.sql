-- ================================================
-- MIGRATION: Business Constraints for Internship System
-- 1. CompanyBatch - phê duyệt công ty tham gia đợt
-- 2. LecturerAssignment - phân công GVHD cho SV
-- 3. Student constraints fields (minCredits, studyStatus, approvedMajors)
-- 4. Unique constraint: student + batch (only 1 valid app per batch)
-- 5. Approval deadline fields
-- 6. Application approvedAt field
-- ================================================

-- Enable uuid-ossp
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- 1. COMPANY BATCH APPROVAL TABLE
-- ================================================
CREATE TYPE company_batch_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE company_batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    batch_id UUID NOT NULL REFERENCES internship_batches(id) ON DELETE CASCADE,
    status company_batch_status DEFAULT 'pending',
    max_students INTEGER DEFAULT 5,
    assigned_student_count INTEGER DEFAULT 0,
    approved_by TEXT REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_company_batches_company_batch ON company_batches(company_id, batch_id);
CREATE INDEX idx_company_batches_batch ON company_batches(batch_id);
CREATE INDEX idx_company_batches_company ON company_batches(company_id);
CREATE INDEX idx_company_batches_status ON company_batches(status);

-- ================================================
-- 2. LECTURER ASSIGNMENT TABLE
-- ================================================
CREATE TYPE assignment_status AS ENUM ('active', 'completed', 'cancelled');

CREATE TABLE lecturer_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lecturer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    student_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    batch_id UUID REFERENCES internship_batches(id) ON DELETE SET NULL,
    status assignment_status DEFAULT 'active',
    max_students INTEGER DEFAULT 10,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_lecturer_assignments_lecturer_batch ON lecturer_assignments(lecturer_id, batch_id) WHERE batch_id IS NOT NULL;
CREATE INDEX idx_lecturer_assignments_lecturer ON lecturer_assignments(lecturer_id);
CREATE INDEX idx_lecturer_assignments_student ON lecturer_assignments(student_id);
CREATE INDEX idx_lecturer_assignments_batch ON lecturer_assignments(batch_id);

-- ================================================
-- 3. STUDENT CONSTRAINT FIELDS
-- ================================================
ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS min_credits INTEGER DEFAULT 0;
ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS current_credits INTEGER DEFAULT 0;
ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS study_status TEXT DEFAULT 'active';

COMMENT ON COLUMN student_profiles.study_status IS 'active, suspended, graduated, dropped';

-- ================================================
-- 4. UNIQUE CONSTRAINT: student + batch (1 app per batch)
-- ================================================
-- Drop the old unique constraint on position+student
ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_position_id_student_id_key;

-- Add new constraint: 1 active application per student per batch
-- Applications with status in (applied, screening, interview, department_approved)
-- are considered "valid/active" — only one is allowed per student+batch
-- We implement this as a unique index plus service-level check

CREATE UNIQUE INDEX idx_applications_student_batch_active
ON applications(student_id, batch_id)
WHERE status IN ('applied', 'screening', 'interview', 'department_approved');

-- ================================================
-- 5. APPROVAL DEADLINE FIELDS
-- ================================================
ALTER TABLE approval_items ADD COLUMN IF NOT EXISTS deadline TIMESTAMP WITH TIME ZONE;
ALTER TABLE approval_items ADD COLUMN IF NOT EXISTS auto_rejected BOOLEAN DEFAULT FALSE;

-- ================================================
-- 6. APPLICATION APPROVED-AT FIELD
-- ================================================
ALTER TABLE applications ADD COLUMN IF NOT EXISTS company_approved_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS lecturer_approved_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS lecturer_id TEXT REFERENCES users(id) ON DELETE SET NULL;

-- ================================================
-- COMMENTS
-- ================================================
COMMENT ON TABLE company_batches IS 'Quản lý công ty được phép tham gia từng đợt thực tập';
COMMENT ON COLUMN company_batches.max_students IS 'Số SV tối đa công ty nhận trong đợt';
COMMENT ON COLUMN company_batches.assigned_student_count IS 'Số SV đã được phân công thực tập';

COMMENT ON TABLE lecturer_assignments IS 'Phân công giảng viên hướng dẫn cho từng sinh viên theo đợt';
COMMENT ON COLUMN lecturer_assignments.max_students IS 'Số SV tối đa giảng viên có thể hướng dẫn trong đợt';
