-- ================================================
-- INTERNSHIP MANAGEMENT SYSTEM - DATABASE SCHEMA
-- Database: internship_management_db
-- ================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- ENUMS
-- ================================================

CREATE TYPE user_role AS ENUM ('student', 'lecturer', 'company', 'admin');
CREATE TYPE application_status AS ENUM ('applied', 'screening', 'interview', 'offer', 'department_approved', 'rejected', 'withdrawn');
CREATE TYPE approval_status AS ENUM ('pending', 'in_progress', 'approved', 'rejected');
CREATE TYPE approval_level AS ENUM ('department', 'lecturer', 'registrar');
CREATE TYPE evaluation_type AS ENUM ('midterm', 'final', 'company');
CREATE TYPE log_status AS ENUM ('pending', 'reviewed', 'approved');
CREATE TYPE job_status AS ENUM ('draft', 'active', 'closed', 'paused', 'filled');
CREATE TYPE work_type AS ENUM ('remote', 'hybrid', 'onsite');
CREATE TYPE log_type AS ENUM ('email', 'notification', 'system');
CREATE TYPE position_duration AS ENUM ('1_month', '2_3_months', '4_6_months', '6_plus_months');
CREATE TYPE batch_status AS ENUM ('upcoming', 'active', 'closed');

-- ================================================
-- USERS TABLE
-- ================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'student',
    avatar VARCHAR(500),
    phone VARCHAR(20),
    department VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);

-- ================================================
-- STUDENT PROFILES TABLE
-- ================================================

CREATE TABLE student_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    major VARCHAR(255),
    gpa DECIMAL(3, 2) CHECK (gpa >= 0 AND gpa <= 4.0),
    skills TEXT[], -- Array of skills
    projects JSONB, -- Array of project objects
    bio TEXT,
    resume_url VARCHAR(500),
    transcript_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_student_profiles_user_id ON student_profiles(user_id);

-- ================================================
-- POSITIONS TABLE (Internship Listings)
-- ================================================

CREATE TABLE positions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    company_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    batch_id UUID REFERENCES internship_batches(id) ON DELETE SET NULL,
    location VARCHAR(255),
    field VARCHAR(100),
    description TEXT,
    requirements TEXT[],
    responsibilities TEXT[],
    salary_min DECIMAL(12, 2),
    salary_max DECIMAL(12, 2),
    duration position_duration,
    work_type work_type DEFAULT 'onsite',
    slots INTEGER DEFAULT 1,
    posted_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deadline DATE,
    status job_status DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_positions_company_id ON positions(company_id);
CREATE INDEX idx_positions_status ON positions(status);
CREATE INDEX idx_positions_field ON positions(field);
CREATE INDEX idx_positions_location ON positions(location);
CREATE INDEX idx_positions_batch_id ON positions(batch_id);

-- ================================================
-- APPLICATIONS TABLE
-- ================================================

CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    position_id UUID NOT NULL REFERENCES positions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    batch_id UUID REFERENCES internship_batches(id) ON DELETE SET NULL,
    cover_letter TEXT,
    resume_url VARCHAR(500),
    portfolio_url VARCHAR(500),
    status application_status DEFAULT 'applied',
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT unique_application UNIQUE (position_id, student_id)
);

CREATE INDEX idx_applications_position_id ON applications(position_id);
CREATE INDEX idx_applications_student_id ON applications(student_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_batch_id ON applications(batch_id);

-- ================================================
-- APPROVAL ITEMS TABLE (Multi-stage Approval)
-- ================================================

CREATE TABLE approval_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    position_id UUID NOT NULL REFERENCES positions(id) ON DELETE CASCADE,
    level approval_level NOT NULL,
    status approval_status DEFAULT 'pending',
    reviewer_id UUID REFERENCES users(id),
    comments TEXT,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_approval_items_application_id ON approval_items(application_id);
CREATE INDEX idx_approval_items_student_id ON approval_items(student_id);
CREATE INDEX idx_approval_items_level ON approval_items(level);
CREATE INDEX idx_approval_items_status ON approval_items(status);

-- ================================================
-- LOG ENTRIES TABLE (Weekly Internship Journal)
-- ================================================

CREATE TABLE log_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    week_number INTEGER NOT NULL,
    entry_date DATE NOT NULL,
    completed_work TEXT NOT NULL,
    challenges TEXT,
    lessons_learned TEXT,
    goals_for_next_week TEXT,
    lecturer_comment TEXT,
    lecturer_rating INTEGER CHECK (lecturer_rating >= 1 AND lecturer_rating <= 5),
    status log_status DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_log_entries_student_id ON log_entries(student_id);
CREATE INDEX idx_log_entries_week ON log_entries(student_id, week_number);

-- ================================================
-- EVALUATIONS TABLE
-- ================================================

CREATE TABLE evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    evaluator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    application_id UUID REFERENCES applications(id) ON DELETE SET NULL,
    evaluation_type evaluation_type NOT NULL,
    technical_score INTEGER CHECK (technical_score >= 1 AND technical_score <= 10),
    attitude_score INTEGER CHECK (attitude_score >= 1 AND attitude_score <= 10),
    communication_score INTEGER CHECK (communication_score >= 1 AND communication_score <= 10),
    teamwork_score INTEGER CHECK (teamwork_score >= 1 AND teamwork_score <= 10),
    overall_score DECIMAL(3, 2) CHECK (overall_score >= 0 AND overall_score <= 10),
    comments TEXT,
    strengths TEXT[],
    areas_for_improvement TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_evaluations_student_id ON evaluations(student_id);
CREATE INDEX idx_evaluations_evaluator_id ON evaluations(evaluator_id);
CREATE INDEX idx_evaluations_type ON evaluations(evaluation_type);

-- ================================================
-- DOCUMENTS TABLE (Uploaded Files)
-- ================================================

CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    application_id UUID REFERENCES applications(id) ON DELETE SET NULL,
    document_type VARCHAR(50) NOT NULL, -- 'resume', 'transcript', 'cover_letter', 'certificate', etc.
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_application_id ON documents(application_id);
CREATE INDEX idx_documents_type ON documents(document_type);

-- ================================================
-- SYSTEM LOGS TABLE
-- ================================================

CREATE TABLE system_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    log_type log_type NOT NULL,
    recipient_id UUID REFERENCES users(id),
    recipient_email VARCHAR(255),
    subject VARCHAR(500),
    message TEXT,
    status VARCHAR(50) DEFAULT 'sent',
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

CREATE INDEX idx_system_logs_type ON system_logs(log_type);
CREATE INDEX idx_system_logs_recipient_id ON system_logs(recipient_id);
CREATE INDEX idx_system_logs_sent_at ON system_logs(sent_at);

-- ================================================
-- NOTIFICATIONS TABLE
-- ================================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info', -- 'info', 'success', 'warning', 'error'
    is_read BOOLEAN DEFAULT FALSE,
    link VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(user_id, is_read);

-- ================================================
-- REFRESH TOKENS TABLE (For Authentication)
-- ================================================

CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    revoked_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);

-- ================================================
-- TRIGGERS FOR UPDATED_AT
-- ================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_student_profiles_updated_at
    BEFORE UPDATE ON student_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_positions_updated_at
    BEFORE UPDATE ON positions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at
    BEFORE UPDATE ON applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_approval_items_updated_at
    BEFORE UPDATE ON approval_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_log_entries_updated_at
    BEFORE UPDATE ON log_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_evaluations_updated_at
    BEFORE UPDATE ON evaluations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_internship_batches_updated_at
    BEFORE UPDATE ON internship_batches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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

COMMENT ON TABLE internship_batches IS 'Admin-created internship batches controlling when companies can post and students can apply';
COMMENT ON COLUMN internship_batches.allow_company_posting IS 'Whether companies can post new positions during this batch';
COMMENT ON COLUMN internship_batches.allow_student_application IS 'Whether students can apply to positions during this batch';

-- ================================================
-- LECTURER ASSIGNMENTS TABLE
-- ================================================
CREATE TABLE lecturer_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lecturer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    batch_id UUID REFERENCES internship_batches(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'completed', 'cancelled'
    max_students INTEGER DEFAULT 10,
    notes TEXT,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_student_batch UNIQUE (student_id, batch_id)
);

CREATE INDEX idx_lecturer_assignments_lecturer ON lecturer_assignments(lecturer_id);
CREATE INDEX idx_lecturer_assignments_student ON lecturer_assignments(student_id);
CREATE INDEX idx_lecturer_assignments_batch ON lecturer_assignments(batch_id);
CREATE INDEX idx_lecturer_assignments_status ON lecturer_assignments(status);

-- ================================================
-- VIEWS FOR COMMON QUERIES
-- ================================================

-- View: Active positions with company info
CREATE VIEW v_active_positions AS
SELECT 
    p.*,
    u.name AS company_name,
    u.email AS company_email,
    COUNT(a.id)::INTEGER AS applicant_count
FROM positions p
JOIN users u ON p.company_id = u.id
LEFT JOIN applications a ON p.id = a.position_id
WHERE p.status = 'active'
GROUP BY p.id, u.name, u.email;

-- View: Application details with student and position info
CREATE VIEW v_application_details AS
SELECT 
    a.*,
    u_student.name AS student_name,
    u_student.email AS student_email,
    p.title AS position_title,
    u_company.name AS company_name
FROM applications a
JOIN users u_student ON a.student_id = u_student.id
JOIN positions p ON a.position_id = p.id
JOIN users u_company ON p.company_id = u_company.id;

-- View: Pending approvals count by level
CREATE VIEW v_pending_approvals AS
SELECT 
    level,
    COUNT(*)::INTEGER AS pending_count
FROM approval_items
WHERE status = 'pending'
GROUP BY level;

-- ================================================
-- SEED DATA (Optional - Uncomment to add sample data)
-- ================================================

-- INSERT INTO users (name, email, password_hash, role, department) VALUES
-- ('Admin User', 'admin@example.com', '$2a$10$...', 'admin', 'IT'),
-- ('Dr. Smith', 'lecturer@example.com', '$2a$10$...', 'lecturer', 'Computer Science'),
-- ('Tech Corp', 'company@example.com', '$2a$10$...', 'company', 'Technology'),
-- ('John Student', 'student@example.com', '$2a$10$...', 'student', 'Computer Science');

COMMENT ON TABLE users IS 'Main users table with roles: student, lecturer, company, admin';
COMMENT ON TABLE positions IS 'Internship position listings created by companies';
COMMENT ON TABLE applications IS 'Student applications for internship positions';
COMMENT ON TABLE approval_items IS 'Multi-stage approval workflow for applications';
COMMENT ON TABLE log_entries IS 'Weekly journal entries from students during internship';
COMMENT ON TABLE evaluations IS 'Evaluation records for students by lecturers/companies';
