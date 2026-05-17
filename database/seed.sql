-- ================================================
-- SEED DATA - INTERNSHIP MANAGEMENT SYSTEM
-- ================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- SEED DATA: USERS
-- ================================================

INSERT INTO users (id, name, email, password_hash, role, avatar, phone, department, status) VALUES
-- Admin
('11111111-1111-4111-8111-111111111111', 'Admin User', 'admin@university.edu', '$2a$10$rqJxNT0XWv0vZ0Z0Z0Z0Z.OK9X7Y8Z1W2V3U4T5S6R7Q8P9O0N', 'admin', 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin', '0901234567', 'Administration', 'active'),

-- Lecturers
('22222222-2222-4222-8222-222222222222', 'Dr. Nguyễn Văn Minh', 'minhnv@university.edu', '$2a$10$rqJxNT0XWv0vZ0Z0Z0Z0Z.OK9X7Y8Z1W2V3U4T5S6R7Q8P9O0N', 'lecturer', 'https://api.dicebear.com/7.x/avataaars/svg?seed=minh', '0901234568', 'Computer Science', 'active'),
('22222222-2222-4222-8222-222222222223', 'Dr. Trần Thị Lan', 'lantt@university.edu', '$2a$10$rqJxNT0XWv0vZ0Z0Z0Z0Z.OK9X7Y8Z1W2V3U4T5S6R7Q8P9O0N', 'lecturer', 'https://api.dicebear.com/7.x/avataaars/svg?seed=lan', '0901234569', 'Computer Science', 'active'),
('22222222-2222-4222-8222-222222222224', 'Dr. Lê Hoàng Nam', 'namlh@university.edu', '$2a$10$rqJxNT0XWv0vZ0Z0Z0Z0Z.OK9X7Y8Z1W2V3U4T5S6R7Q8P9O0N', 'lecturer', 'https://api.dicebear.com/7.x/avataaars/svg?seed=nam', '0901234570', 'Software Engineering', 'active'),

-- Companies
('33333333-3333-4333-8333-333333333331', 'TechViet Solutions', 'contact@techviet.vn', '$2a$10$rqJxNT0XWv0vZ0Z0Z0Z0Z.OK9X7Y8Z1W2V3U4T5S6R7Q8P9O0N', 'company', 'https://api.dicebear.com/7.x/avataaars/svg?seed=techviet', '02812345678', 'Technology', 'active'),
('33333333-3333-4333-8333-333333333332', 'FPT Software', 'hr@fpt.com.vn', '$2a$10$rqJxNT0XWv0vZ0Z0Z0Z0Z.OK9X7Y8Z1W2V3U4T5S6R7Q8P9O0N', 'company', 'https://api.dicebear.com/7.x/avataaars/svg?seed=fpt', '02823456789', 'Software', 'active'),
('33333333-3333-4333-8333-333333333333', 'Viettel Solutions', 'tuyendung@viettel.com.vn', '$2a$10$rqJxNT0XWv0vZ0Z0Z0Z0Z.OK9X7Y8Z1W2V3U4T5S6R7Q8P9O0N', 'company', 'https://api.dicebear.com/7.x/avataaars/svg?seed=viettel', '02412345678', 'Telecommunications', 'active'),
('33333333-3333-4333-8333-333333333334', 'VNG Corporation', 'careers@vng.com.vn', '$2a$10$rqJxNT0XWv0vZ0Z0Z0Z0Z.OK9X7Y8Z1W2V3U4T5S6R7Q8P9O0N', 'company', 'https://api.dicebear.com/7.x/avataaars/svg?seed=vng', '02812345679', 'Gaming & Technology', 'active'),
('33333333-3333-4333-8333-333333333335', 'CMC Corporation', 'hr@cmc.com.vn', '$2a$10$rqJxNT0XWv0vZ0Z0Z0Z0Z.OK9X7Y8Z1W2V3U4T5S6R7Q8P9O0N', 'company', 'https://api.dicebear.com/7.x/avataaars/svg?seed=cmc', '02423456789', 'Technology', 'active'),

-- Students
('44444444-4444-4444-8444-444444444441', 'Nguyễn Văn An', 'an.nv194001@sis.hust.edu.vn', '$2a$10$rqJxNT0XWv0vZ0Z0Z0Z0Z.OK9X7Y8Z1W2V3U4T5S6R7Q8P9O0N', 'student', 'https://api.dicebear.com/7.x/avataaars/svg?seed=an', '0909876543', 'Computer Science', 'active'),
('44444444-4444-4444-8444-444444444442', 'Trần Thị Bình', 'binh.tt194002@sis.hust.edu.vn', '$2a$10$rqJxNT0XWv0vZ0Z0Z0Z0Z.OK9X7Y8Z1W2V3U4T5S6R7Q8P9O0N', 'student', 'https://api.dicebear.com/7.x/avataaars/svg?seed=binh', '0909876544', 'Computer Science', 'active'),
('44444444-4444-4444-8444-444444444443', 'Lê Minh Cường', 'cuong.lm194003@sis.hust.edu.vn', '$2a$10$rqJxNT0XWv0vZ0Z0Z0Z0Z.OK9X7Y8Z1W2V3U4T5S6R7Q8P9O0N', 'student', 'https://api.dicebear.com/7.x/avataaars/svg?seed=cuong', '0909876545', 'Software Engineering', 'active'),
('44444444-4444-4444-8444-444444444444', 'Phạm Thu Dung', 'dung.pt194004@sis.hust.edu.vn', '$2a$10$rqJxNT0XWv0vZ0Z0Z0Z0Z.OK9X7Y8Z1W2V3U4T5S6R7Q8P9O0N', 'student', 'https://api.dicebear.com/7.x/avataaars/svg?seed=dung', '0909876546', 'Information Systems', 'active'),
('44444444-4444-4444-8444-444444444445', 'Hoàng Văn Đức', 'duc.hv194005@sis.hust.edu.vn', '$2a$10$rqJxNT0XWv0vZ0Z0Z0Z0Z.OK9X7Y8Z1W2V3U4T5S6R7Q8P9O0N', 'student', 'https://api.dicebear.com/7.x/avataaars/svg?seed=duc', '0909876547', 'Computer Science', 'active'),
('44444444-4444-4444-8444-444444444446', 'Ngô Thị Eva', 'eva.nt194006@sis.hust.edu.vn', '$2a$10$rqJxNT0XWv0vZ0Z0Z0Z0Z.OK9X7Y8Z1W2V3U4T5S6R7Q8P9O0N', 'student', 'https://api.dicebear.com/7.x/avataaars/svg?seed=eva', '0909876548', 'Artificial Intelligence', 'active'),
('44444444-4444-4444-8444-444444444447', 'Đặng Minh Hùng', 'hung.dm194007@sis.hust.edu.vn', '$2a$10$rqJxNT0XWv0vZ0Z0Z0Z0Z.OK9X7Y8Z1W2V3U4T5S6R7Q8P9O0N', 'student', 'https://api.dicebear.com/7.x/avataaars/svg?seed=hung', '0909876549', 'Computer Science', 'active'),
('44444444-4444-4444-8444-444444444448', 'Bùi Thị Linh', 'linh.bt194008@sis.hust.edu.vn', '$2a$10$rqJxNT0XWv0vZ0Z0Z0Z0Z.OK9X7Y8Z1W2V3U4T5S6R7Q8P9O0N', 'student', 'https://api.dicebear.com/7.x/avataaars/svg?seed=linh', '0909876550', 'Software Engineering', 'active');

-- ================================================
-- SEED DATA: STUDENT PROFILES
-- ================================================

INSERT INTO student_profiles (id, user_id, major, gpa, skills, projects, bio, resume_url, transcript_url) VALUES
('55555555-5555-4555-8555-555555555551', '44444444-4444-4444-8444-444444444441', 'Computer Science', 3.65, 
 ARRAY['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Docker'],
 '[{"name":"E-Commerce Platform","description":"Full-stack e-commerce with payment integration","url":"https://github.com/an/e-commerce","technologies":["React","Node.js","PostgreSQL"]}]',
 'Sinh viên năm 4 chuyên ngành Khoa học Máy tính với niềm đam mê về phát triển web.',
 'https://storage.example.com/resumes/an-nv194001.pdf',
 'https://storage.example.com/transcripts/an-nv194001.pdf'),

('55555555-5555-4555-8555-555555555552', '44444444-4444-4444-8444-444444444442', 'Computer Science', 3.80, 
 ARRAY['Python', 'Machine Learning', 'TensorFlow', 'SQL', 'Git'],
 '[{"name":"AI Chatbot","description":"Intelligent chatbot using NLP","url":"https://github.com/binh/chatbot","technologies":["Python","TensorFlow"]}]',
 'Sinh viên xuất sắc với GPA 3.8, quan tâm đến AI và Machine Learning.',
 'https://storage.example.com/resumes/binh-tt194002.pdf',
 'https://storage.example.com/transcripts/binh-tt194002.pdf'),

('55555555-5555-4555-8555-555555555553', '44444444-4444-4444-8444-444444444443', 'Software Engineering', 3.45, 
 ARRAY['Java', 'Spring Boot', 'Microservices', 'Kubernetes', 'AWS'],
 '[{"name":"E-Learning Platform","description":"Online learning system with video streaming","url":"https://github.com/cuong/elearning","technologies":["Java","Spring Boot","React"]}]',
 'Chuyên gia về backend development với kinh nghiệm với microservices.',
 'https://storage.example.com/resumes/cuong-lm194003.pdf',
 'https://storage.example.com/transcripts/cuong-lm194003.pdf'),

('55555555-5555-4555-8555-555555555554', '44444444-4444-4444-8444-444444444444', 'Information Systems', 3.50, 
 ARRAY['Vue.js', 'Laravel', 'MySQL', 'REST API', 'Figma'],
 '[{"name":"Hospital Management System","description":"Comprehensive hospital administration software","url":"https://github.com/dung/hospital","technologies":["Vue.js","Laravel","MySQL"]}]',
 'Hướng đến sự nghiệp trong lĩnh vực phát triển phần mềm doanh nghiệp.',
 'https://storage.example.com/resumes/dung-pt194004.pdf',
 'https://storage.example.com/transcripts/dung-pt194004.pdf'),

('55555555-5555-4555-8555-555555555555', '44444444-4444-4444-8444-444444444445', 'Computer Science', 3.70, 
 ARRAY['Flutter', 'Dart', 'Firebase', 'Mobile Development', 'UI/UX'],
 '[{"name":"Health Tracking App","description":"Mobile app for personal health monitoring","url":"https://github.com/duc/healthapp","technologies":["Flutter","Firebase"]}]',
 'Yêu thích phát triển ứng dụng di động và UI/UX design.',
 'https://storage.example.com/resumes/duc-hv194005.pdf',
 'https://storage.example.com/transcripts/duc-hv194005.pdf'),

('55555555-5555-4555-8555-555555555556', '44444444-4444-4444-8444-444444444446', 'Artificial Intelligence', 3.90, 
 ARRAY['Python', 'Deep Learning', 'Computer Vision', 'OpenCV', 'PyTorch'],
 '[{"name":"Face Recognition System","description":"Real-time face detection and recognition","url":"https://github.com/eva/facerecognition","technologies":["Python","OpenCV","PyTorch"]}]',
 'Thủ khoa với GPA 3.9, chuyên về AI và Computer Vision.',
 'https://storage.example.com/resumes/eva-nt194006.pdf',
 'https://storage.example.com/transcripts/eva-nt194006.pdf'),

('55555555-5555-4555-8555-555555555557', '44444444-4444-4444-8444-444444444447', 'Computer Science', 3.55, 
 ARRAY['React Native', 'TypeScript', 'GraphQL', 'MongoDB', 'Redux'],
 '[{"name":"Social Media App","description":"Cross-platform social networking application","url":"https://github.com/hung/socialapp","technologies":["React Native","GraphQL"]}]',
 'Đam mê công nghệ cross-platform và mạng xã hội.',
 'https://storage.example.com/resumes/hung-dm194007.pdf',
 'https://storage.example.com/transcripts/hung-dm194007.pdf'),

('55555555-5555-4555-8555-555555555558', '44444444-4444-4444-8444-444444444448', 'Software Engineering', 3.60, 
 ARRAY['Go', 'Rust', 'gRPC', 'Redis', 'PostgreSQL'],
 '[{"name":"High Performance API","description":"Low-latency REST API with Go","url":"https://github.com/linh/gateway","technologies":["Go","Redis","PostgreSQL"]}]',
 'Quantâm đến performance và system programming.',
 'https://storage.example.com/resumes/linh-bt194008.pdf',
 'https://storage.example.com/transcripts/linh-bt194008.pdf');

-- ================================================
-- SEED DATA: POSITIONS
-- ================================================

INSERT INTO positions (id, title, company_id, location, field, description, requirements, responsibilities, salary_min, salary_max, duration, work_type, slots, posted_date, deadline, status) VALUES

-- TechViet Solutions Positions
('66666666-6666-4666-8666-666666666661', 'Frontend Developer Intern', '33333333-3333-4333-8333-333333333331',
 'Ho Chi Minh City', 'Software Development',
 'Tham gia phát triển các sản phẩm web của công ty với React và TypeScript. Bạn sẽ được làm việc với đội ngũ senior để học hỏi và phát triển kỹ năng.',
 ARRAY['React', 'TypeScript', 'HTML/CSS', 'Git'],
 ARRAY['Phát triển UI components', 'Fix bugs', 'Viết unit tests', 'Tham gia code review'],
 5000000, 8000000, '3_months', 'onsite', 3,
 '2026-04-01'::timestamp, '2026-06-30', 'active'),

('66666666-6666-4666-8666-666666666662', 'Backend Developer Intern', '33333333-3333-4333-8333-333333333331',
 'Ho Chi Minh City', 'Software Development',
 'Phát triển RESTful APIs và microservices với Node.js. Học hỏi về architecture và best practices.',
 ARRAY['Node.js', 'Express', 'PostgreSQL', 'Docker', 'REST API'],
 ARRAY['Phát triển API endpoints', 'Thiết kế database', 'Viết documentation', 'Testing'],
 6000000, 9000000, '4_6_months', 'hybrid', 2,
 '2026-04-01'::timestamp, '2026-07-15', 'active'),

('66666666-6666-4666-8666-666666666663', 'DevOps Intern', '33333333-3333-4333-8333-333333333331',
 'Ho Chi Minh City', 'DevOps',
 'Hỗ trợ team DevOps trong việc triển khai và vận hành hệ thống CI/CD.',
 ARRAY['Linux', 'Docker', 'Jenkins', 'Git', 'Shell Scripting'],
 ARRAY['Hỗ trợ setup CI/CD', 'Monitor hệ thống', 'Viết automation scripts', 'Document processes'],
 5500000, 8500000, '3_months', 'onsite', 2,
 '2026-04-15'::timestamp, '2026-07-31', 'active'),

-- FPT Software Positions
('66666666-6666-4666-8666-666666666664', 'Java Developer Intern', '33333333-3333-4333-8333-333333333332',
 'Hanoi', 'Software Development',
 'Thực tập tại FPT Software - công ty outsourcing hàng đầu Việt Nam. Làm việc với các dự án cho khách hàng Nhật Bản.',
 ARRAY['Java', 'Spring Boot', 'SQL', 'Git', 'English'],
 ARRAY['Phát triển tính năng mới', 'Debug và fix issues', 'Viết technical documents', 'Tham gia meetings'],
 6000000, 10000000, '6_plus_months', 'onsite', 5,
 '2026-03-15'::timestamp, '2026-08-31', 'active'),

('66666666-6666-4666-8666-666666666665', 'QA Engineer Intern', '33333333-3333-4333-8333-333333333332',
 'Hanoi', 'Quality Assurance',
 'Kiểm thử phần mềm và đảm bảo chất lượng sản phẩm cho các dự án outsourcing.',
 ARRAY['Testing concepts', 'Selenium', 'JIRA', 'SQL', 'Test case design'],
 ARRAY['Viết test cases', 'Thực hiện testing', 'Report bugs', 'Verify fixes'],
 4000000, 7000000, '3_months', 'onsite', 3,
 '2026-04-01'::timestamp, '2026-06-30', 'active'),

('66666666-6666-4666-8666-666666666666', 'Mobile Developer Intern', '33333333-3333-4333-8333-333333333332',
 'Ho Chi Minh City', 'Mobile Development',
 'Phát triển ứng dụng di động cho khách hàng quốc tế.',
 ARRAY['Flutter', 'Dart', 'iOS', 'Android', 'REST API'],
 ARRAY['Phát triển features mới', 'Fix bugs', 'UI optimization', 'Performance testing'],
 7000000, 12000000, '4_6_months', 'hybrid', 2,
 '2026-04-10'::timestamp, '2026-07-20', 'active'),

-- Viettel Solutions Positions
('66666666-6666-4666-8666-666666666667', 'Cybersecurity Intern', '33333333-3333-4333-8333-333333333333',
 'Hanoi', 'Cybersecurity',
 'Tham gia các dự án bảo mật của Tập đoàn Viettel - một trong những doanh nghiệp quốc phòng lớn nhất Việt Nam.',
 ARRAY['Network Security', 'Linux', 'Python', 'Penetration Testing'],
 ARRAY['Security audits', 'Penetration testing', 'Vulnerability assessment', 'Security documentation'],
 8000000, 15000000, '6_plus_months', 'onsite', 2,
 '2026-03-20'::timestamp, '2026-09-30', 'active'),

('66666666-6666-4666-8666-666666666668', 'Data Engineer Intern', '33333333-3333-4333-8333-333333333333',
 'Hanoi', 'Data Engineering',
 'Xây dựng và duy trì các data pipelines cho hệ thống Big Data của Viettel.',
 ARRAY['Python', 'SQL', 'Spark', 'Airflow', 'BigQuery'],
 ARRAY['Xây dựng data pipelines', 'ETL processes', 'Data quality monitoring', 'Documentation'],
 9000000, 14000000, '4_6_months', 'hybrid', 3,
 '2026-04-05'::timestamp, '2026-08-15', 'active'),

-- VNG Corporation Positions
('66666666-6666-4666-8666-666666666669', 'Game Developer Intern', '33333333-3333-4333-8333-333333333334',
 'Ho Chi Minh City', 'Game Development',
 'Tham gia phát triển các tựa game mobile và PC của VNG - công ty game lớn nhất Việt Nam.',
 ARRAY['Unity', 'C#', 'Game Design', 'Mobile Development'],
 ARRAY['Phát triển gameplay', 'UI implementation', 'Performance optimization', 'Bug fixing'],
 7000000, 12000000, '4_6_months', 'onsite', 4,
 '2026-04-01'::timestamp, '2026-07-31', 'active'),

('66666666-6666-4666-8666-666666666670', 'Backend Game Server Intern', '33333333-3333-4333-8333-333333333334',
 'Ho Chi Minh City', 'Backend Development',
 'Phát triển game servers cho các sản phẩm game của VNG.',
 ARRAY['Go', 'Redis', 'MySQL', 'gRPC', 'Linux'],
 ARRAY['Phát triển game servers', 'Real-time communication', 'Database optimization', 'Load testing'],
 8000000, 13000000, '4_6_months', 'onsite', 2,
 '2026-04-10'::timestamp, '2026-08-20', 'active'),

-- CMC Corporation Positions
('66666666-6666-4666-8666-666666666671', 'Cloud Engineer Intern', '33333333-3333-4333-8333-333333333335',
 'Hanoi', 'Cloud Computing',
 'Thực tập tại CMC - chuyên về giải pháp đám mây và hạ tầng số.',
 ARRAY['AWS', 'Azure', 'Docker', 'Kubernetes', 'Terraform'],
 ARRAY['Cloud infrastructure setup', 'Automation scripts', 'Monitoring setup', 'Documentation'],
 6000000, 10000000, '3_months', 'hybrid', 3,
 '2026-04-15'::timestamp, '2026-07-31', 'active'),

('66666666-6666-4666-8666-666666666672', 'AI/ML Engineer Intern', '33333333-3333-4333-8333-333333333335',
 'Hanoi', 'Artificial Intelligence',
 'Nghiên cứu và phát triển các giải pháp AI cho doanh nghiệp.',
 ARRAY['Python', 'TensorFlow', 'PyTorch', 'Computer Vision', 'NLP'],
 ARRAY['Research AI solutions', 'Model development', 'Performance optimization', 'Documentation'],
 10000000, 18000000, '6_plus_months', 'hybrid', 2,
 '2026-03-25'::timestamp, '2026-09-15', 'active'),

-- Draft/Paused positions
('66666666-6666-4666-8666-666666666673', 'UI/UX Designer Intern', '33333333-3333-4333-8333-333333333331',
 'Ho Chi Minh City', 'Design',
 'Thiết kế giao diện người dùng cho các sản phẩm của công ty.',
 ARRAY['Figma', 'Adobe XD', 'UI Design', 'Prototyping', 'User Research'],
 ARRAY['Design UI components', 'Create prototypes', 'User research', 'Design documentation'],
 5000000, 8000000, '3_months', 'remote', 2,
 '2026-05-01'::timestamp, '2026-08-31', 'draft'),

('66666666-6666-4666-8666-666666666674', 'Blockchain Developer Intern', '33333333-3333-4333-8333-333333333334',
 'Ho Chi Minh City', 'Blockchain',
 'Phát triển smart contracts và ứng dụng blockchain.',
 ARRAY['Solidity', 'Ethereum', 'Web3.js', 'Smart Contracts', 'Blockchain'],
 ARRAY['Smart contract development', 'DApp development', 'Testing', 'Documentation'],
 12000000, 20000000, '6_plus_months', 'hybrid', 1,
 '2026-04-20'::timestamp, '2026-09-30', 'paused'),

('66666666-6666-4666-8666-666666666675', 'Frontend Developer (Closed)', '33333333-3333-4333-8333-333333333331',
 'Ho Chi Minh City', 'Software Development',
 'This position has been filled.',
 ARRAY['React', 'TypeScript'],
 ARRAY['Development'],
 5000000, 8000000, '3_months', 'onsite', 1,
 '2026-02-01'::timestamp, '2026-03-31', 'filled');

-- ================================================
-- SEED DATA: APPLICATIONS
-- ================================================

INSERT INTO applications (id, position_id, student_id, cover_letter, resume_url, portfolio_url, status, applied_at) VALUES

-- Nguyễn Văn An applications
('77777777-7777-4777-8777-777777777771', '66666666-6666-4666-8666-666666666661', '44444444-4444-4444-8444-444444444441',
 'Em rất quan tâm đến vị trí Frontend Developer tại TechViet Solutions. Với kinh nghiệm làm dự án E-Commerce platform và niềm đam mê với React, em tin mình có thể đóng góp tích cực cho đội ngũ.',
 'https://storage.example.com/resumes/an-nv194001.pdf',
 'https://anportfolio.dev',
 'department_approved', '2026-04-15'::timestamp),

('77777777-7777-4777-8777-777777777772', '66666666-6666-4666-8666-666666666662', '44444444-4444-4444-8444-444444444441',
 'Em muốn phát triển kỹ năng backend với Node.js và mong muốn được học hỏi từ đội ngũ chuyên nghiệp tại TechViet.',
 'https://storage.example.com/resumes/an-nv194001.pdf',
 NULL,
 'interview', '2026-04-20'::timestamp),

-- Trần Thị Bình applications
('77777777-7777-4777-8777-777777777773', '66666666-6666-4666-8666-666666666664', '44444444-4444-4444-8444-444444444442',
 'Em rất hào hứng với cơ hội thực tập tại FPT Software - công ty outsourcing hàng đầu. Em có kiến thức về Java và muốn phát triển sự nghiệp trong lĩnh vực này.',
 'https://storage.example.com/resumes/binh-tt194002.pdf',
 'https://binhportfolio.dev',
 'applied', '2026-05-01'::timestamp),

('77777777-7777-4777-8777-777777777774', '66666666-6666-4666-8666-666666666666', '44444444-4444-4444-8444-444444444442',
 'Với niềm đam mê về mobile development và kinh nghiệm với Flutter, em muốn được phát triển tại FPT Software.',
 'https://storage.example.com/resumes/binh-tt194002.pdf',
 NULL,
 'screening', '2026-05-05'::timestamp),

-- Lê Minh Cường applications
('77777777-7777-4777-8777-777777777775', '66666666-6666-4666-8666-666666666662', '44444444-4444-4444-8444-444444444443',
 'Em có 2 năm kinh nghiệm với Java Spring Boot và đã hoàn thành dự án E-Learning platform. Em mong muốn được thực tập tại TechViet để học hỏi thêm.',
 'https://storage.example.com/resumes/cuong-lm194003.pdf',
 'https://cuongportfolio.dev',
 'applied', '2026-04-18'::timestamp),

('77777777-7777-4777-8777-777777777776', '66666666-6666-4666-8666-666666666664', '44444444-4444-4444-8444-444444444443',
 'FPT Software là môi trường lý tưởng để em phát triển kỹ năng Java và làm việc với các dự án quốc tế.',
 'https://storage.example.com/resumes/cuong-lm194003.pdf',
 NULL,
 'applied', '2026-04-25'::timestamp),

-- Phạm Thu Dung applications
('77777777-7777-4777-8777-777777777777', '66666666-6666-4666-8666-666666666663', '44444444-4444-4444-8444-444444444444',
 'Em quan tâm đến DevOps và đã có kinh nghiệm sử dụng Docker và Git. Em muốn được học hỏi thêm về CI/CD tại TechViet.',
 'https://storage.example.com/resumes/dung-pt194004.pdf',
 NULL,
 'rejected', '2026-04-20'::timestamp),

-- Hoàng Văn Đức applications
('77777777-7777-4777-8777-777777777778', '66666666-6666-4666-8666-666666666666', '44444444-4444-4444-8444-444444444445',
 'Với kinh nghiệm phát triển ứng dụng Flutter và niềm đam mê với mobile, em rất muốn được thực tập tại FPT Software.',
 'https://storage.example.com/resumes/duc-hv194005.pdf',
 'https://ducportfolio.dev',
 'offer', '2026-04-10'::timestamp),

-- Ngô Thị Eva applications
('77777777-7777-4777-8777-777777777779', '66666666-6666-4666-8666-666666666672', '44444444-4444-4444-8444-444444444446',
 'Em là thủ khoa với GPA 3.9 và chuyên về AI/ML. Em rất hào hứng với cơ hội nghiên cứu tại CMC Corporation.',
 'https://storage.example.com/resumes/eva-nt194006.pdf',
 'https://evaportfolio.dev',
 'approved', '2026-04-05'::timestamp),

('77777777-7777-4777-8777-777777777780', '66666666-6666-4666-8666-666666666668', '44444444-4444-4444-8444-444444444446',
 'Với nền tảng AI vững chắc, em muốn áp dụng kiến thức vào lĩnh vực Data Engineering tại Viettel.',
 'https://storage.example.com/resumes/eva-nt194006.pdf',
 NULL,
 'department_approved', '2026-04-08'::timestamp),

-- Đặng Minh Hùng applications
('77777777-7777-4777-8777-777777777781', '66666666-6666-4666-8666-666666666669', '44444444-4444-4444-8444-444444444447',
 'Em đam mê game development và muốn phát triển sự nghiệp tại VNG - công ty game hàng đầu Việt Nam.',
 'https://storage.example.com/resumes/hung-dm194007.pdf',
 'https://hungportfolio.dev',
 'applied', '2026-05-02'::timestamp),

-- Bùi Thị Linh applications
('77777777-7777-4777-8777-777777777782', '66666666-6666-4666-8666-666666666670', '44444444-4444-4444-8444-444444444448',
 'Với kinh nghiệm về Go và Redis, em muốn phát triển game servers tại VNG Corporation.',
 'https://storage.example.com/resumes/linh-bt194008.pdf',
 NULL,
 'applied', '2026-05-03'::timestamp),

('77777777-7777-4777-8777-777777777783', '66666666-6666-4666-8666-666666666661', '44444444-4444-4444-8444-444444444448',
 'Em cũng quan tâm đến frontend development và muốn tìm hiểu thêm về React ecosystem.',
 'https://storage.example.com/resumes/linh-bt194008.pdf',
 NULL,
 'withdrawn', '2026-04-22'::timestamp);

-- ================================================
-- SEED DATA: APPROVAL ITEMS
-- ================================================

INSERT INTO approval_items (id, application_id, student_id, company_id, position_id, level, status, reviewer_id, comments, reviewed_at) VALUES

-- An's department_approved application
('88888888-8888-4888-8888-888888888881', '77777777-7777-4777-8777-777777777771', '44444444-4444-4444-8444-444444444441',
 '33333333-3333-4333-8333-333333333331', '66666666-6666-4666-8666-666666666661',
 'department', 'approved', '22222222-2222-4222-8222-222222222222',
 'GPA 3.65, có kinh nghiệm làm project thực tế. Phù hợp với vị trí.',
 '2026-04-20'::timestamp),

('88888888-8888-4888-8888-888888888882', '77777777-7777-4777-8777-777777777771', '44444444-4444-4444-8444-444444444441',
 '33333333-3333-4333-8333-333333333331', '66666666-6666-4666-8666-666666666661',
 'lecturer', 'approved', '22222222-2222-4222-8222-222222222222',
 'Sinh viên có năng lực, đề xuất chấp nhận.',
 '2026-04-22'::timestamp),

-- Eva's approved application
('88888888-8888-4888-8888-888888888883', '77777777-7777-4777-8777-777777777779', '44444444-4444-4444-8444-444444444446',
 '33333333-3333-4333-8333-333333333335', '66666666-6666-4666-8666-666666666672',
 'department', 'approved', '22222222-2222-4222-8222-222222222223',
 'Thủ khoa GPA 3.9, chuyên ngành AI. Tuyệt vời cho vị trí này.',
 '2026-04-12'::timestamp),

('88888888-8888-4888-8888-888888888884', '77777777-7777-4777-8777-777777777779', '44444444-4444-4444-8444-444444444446',
 '33333333-3333-4333-8333-333333333335', '66666666-6666-4666-8666-666666666672',
 'lecturer', 'pending', NULL, NULL, NULL),

-- Eva's second application
('88888888-8888-4888-8888-888888888885', '77777777-7777-4777-8777-777777777780', '44444444-4444-4444-8444-444444444446',
 '33333333-3333-4333-8333-333333333333', '66666666-6666-4666-8666-666666666668',
 'department', 'approved', '22222222-2222-4222-8222-222222222224',
 'Chuyên gia AI, phù hợp với Data Engineering.',
 '2026-04-15'::timestamp),

('88888888-8888-4888-8888-888888888886', '77777777-7777-4777-8777-777777777780', '44444444-4444-4444-8444-444444444446',
 '33333333-3333-4333-8333-333333333333', '66666666-6666-4666-8666-666666666668',
 'lecturer', 'in_progress', NULL, NULL, NULL),

-- Đức's offer application (fully approved)
('88888888-8888-4888-8888-888888888887', '77777777-7777-4777-8777-777777777778', '44444444-4444-4444-8444-444444444445',
 '33333333-3333-4333-8333-333333333332', '66666666-6666-4666-8666-666666666666',
 'department', 'approved', '22222222-2222-4222-8222-222222222222',
 'Sinh viên có kinh nghiệm Flutter, phù hợp với vị trí.',
 '2026-04-18'::timestamp),

('88888888-8888-4888-8888-888888888888', '77777777-7777-4777-8777-777777777778', '44444444-4444-4444-8444-444444444445',
 '33333333-3333-4333-8333-333333333332', '66666666-6666-4666-8666-666666666666',
 'lecturer', 'approved', '22222222-2222-4222-8222-222222222222',
 'Đồng ý cho thực tập tại FPT.',
 '2026-04-20'::timestamp),

-- Pending approvals
('88888888-8888-4888-8888-888888888889', '77777777-7777-4777-8777-777777777773', '44444444-4444-4444-8444-444444444442',
 '33333333-3333-4333-8333-333333333332', '66666666-6666-4666-8666-666666666664',
 'department', 'pending', NULL, NULL, NULL),

('88888888-8888-4888-8888-888888888890', '77777777-7777-4777-8777-777777777775', '44444444-4444-4444-8444-444444444443',
 '33333333-3333-4333-8333-333333333331', '66666666-6666-4666-8666-666666666662',
 'department', 'pending', NULL, NULL, NULL),

('88888888-8888-4888-8888-888888888891', '77777777-7777-4777-8777-777777777781', '44444444-4444-4444-8444-444444444447',
 '33333333-3333-4333-8333-333333333334', '66666666-6666-4666-8666-666666666669',
 'department', 'in_progress', NULL, 'Đang xem xét portfolio.', NULL),

('88888888-8888-4888-8888-888888888892', '77777777-7777-4777-8777-777777777782', '44444444-4444-4444-8444-444444444448',
 '33333333-3333-4333-8333-333333333334', '66666666-6666-4666-8666-666666666670',
 'department', 'pending', NULL, NULL, NULL);

-- ================================================
-- SEED DATA: LOG ENTRIES (Weekly Internship Journals)
-- ================================================

INSERT INTO log_entries (id, student_id, week_number, entry_date, completed_work, challenges, lessons_learned, goals_for_next_week, lecturer_comment, lecturer_rating, status) VALUES

-- Nguyễn Văn An's journal (internship started)
('99999991-9999-4999-8999-999999999991', '44444444-4444-4444-8444-444444444441', 1, '2026-04-21',
 'Hoàn thành onboarding, setup development environment, học về codebase của công ty. Đã deploy được một feature đơn giản.',
 'Khó khăn trong việc understand legacy code và architecture hiện tại.',
 'Cách đọc và understand code architecture, best practices trong React development.',
 'Hoàn thành module authentication, viết documentation.',
 'Good progress! Keep learning.', 4, 'reviewed'),

('99999991-9999-4999-8999-999999999992', '44444444-4444-4444-8444-444444444441', 2, '2026-04-28',
 'Phát triển và hoàn thành module authentication với JWT. Tích hợp login/logout vào main app.',
 'Debug OAuth2 flow và xử lý token refresh.',
 'Hiểu sâu về authentication flows và security best practices.',
 'Bắt đầu phát triển dashboard component.',
 'Excellent work on authentication!', 5, 'reviewed'),

('99999991-9999-4999-8999-999999999993', '44444444-4444-4444-8444-444444444441', 3, '2026-05-05',
 'Phát triển dashboard với chart components sử dụng Recharts. Tối ưu performance rendering.',
 'Performance issues với large datasets trong charts.',
 'Kỹ thuật memoization và lazy loading trong React.',
 'Hoàn thiện dashboard, thêm filter features.',
 'Great dashboard implementation!', 4, 'reviewed'),

('99999991-9999-4999-8999-999999999994', '44444444-4444-4444-8444-444444444441', 4, '2026-05-12',
 'Đang trong quá trình phát triển filter features cho dashboard. Đã implement date range picker.',
 NULL, NULL, NULL, NULL, NULL, 'pending'),

-- Trần Thị Bình's journal (new applicant, not started)
('99999992-9999-4999-8999-999999999991', '44444444-4444-4444-8444-444444444442', 1, '2026-05-08',
 'Chờ kết quả phỏng vấn từ FPT Software. Học thêm về Java Spring Boot và microservices.',
 'Lo lắng về kết quả phỏng vấn.',
 'Ôn tập lại Java core và Spring Boot patterns.',
 'Tiếp tục học, chuẩn bị tinh thần cho internship.',
 NULL, NULL, 'pending'),

-- Hoàng Văn Đức's journal (offer accepted, starting soon)
('99999993-9999-4999-8999-999999999991', '44444444-4444-4444-8444-444444444445', 1, '2026-05-10',
 'Đã nhận offer từ FPT Software! Hoàn thành thủ tục onboarding. Setup Flutter development environment.',
 'Chuẩn bị tinh thần cho ngày đầu đi làm.',
 'Tìm hiểu trước về dự án và công nghệ sử dụng.',
 'Bắt đầu internship với tinh thần háo hức.',
 NULL, NULL, 'pending'),

-- Ngô Thị Eva's journal (approved, preparing)
('99999994-9999-4999-8999-999999999991', '44444444-4444-4444-8444-444444444446', 1, '2026-04-15',
 'Hoàn thành paperwork và đang chờ approval cuối cùng từ trường. Tự học thêm về ML frameworks mà CMC sử dụng.',
 'Chờ đợi kết quả từ phòng đào tạo.',
 'Tầm quan trọng của việc chuẩn bị trước khi bắt đầu internship.',
 'Sẵn sàng bắt đầu internship tại CMC.',
 'Outstanding preparation!', 5, 'approved'),

('99999994-9999-4999-8999-999999999992', '44444444-4444-4444-8444-444444444446', 2, '2026-04-22',
 'Đã được approve! Tham gia orientation tại CMC. Setup PyTorch development environment.',
 'Đang tìm hiểu về ML infrastructure của công ty.',
 'Cách setup ML development environment trên enterprise scale.',
 'Bắt đầu nghiên cứu về project đầu tiên.',
 'Well done on orientation!', 4, 'approved');

-- ================================================
-- SEED DATA: EVALUATIONS
-- ================================================

INSERT INTO evaluations (id, student_id, evaluator_id, application_id, evaluation_type, technical_score, attitude_score, communication_score, teamwork_score, overall_score, comments, strengths, areas_for_improvement) VALUES

-- Eva's midterm evaluation (internship at CMC)
('aaaaaaa1-aaaa-4aaa-8aaa-aaaaaaaaaaa1', '44444444-4444-4444-8444-444444444446', '22222222-2222-4222-8222-222222222223',
 '77777777-7777-4777-8777-777777777779', 'midterm',
 9, 10, 9, 9, 9.25,
 'Eva thể hiện năng lực xuất sắc trong giai đoạn midterm. Kỹ năng AI/ML vượt trội, làm việc rất chủ động và có trách nhiệm.',
 ARRAY['AI/ML expertise', 'Quick learner', 'Self-motivated', 'Strong analytical skills'],
 ARRAY['Could improve time estimation', 'Project management skills'],

-- An's midterm evaluation (internship at TechViet)
('aaaaaaa1-aaaa-4aaa-8aaa-aaaaaaaaaaa2', '44444444-4444-4444-8444-444444444441', '22222222-2222-4222-8222-222222222222',
 '77777777-7777-4777-8777-777777777771', 'midterm',
 8, 9, 8, 9, 8.50,
 'An tiến bộ rất nhanh trong 4 tuần đầu. Kỹ năng React tốt, teamwork excellent.',
 ARRAY['React development', 'Quick learner', 'Team player', 'Documentation'],
 ARRAY['Backend knowledge', 'System design skills'],

-- Đức's company evaluation (FPT - before offer)
('aaaaaaa1-aaaa-4aaa-8aaa-aaaaaaaaaaa3', '44444444-4444-4444-8444-444444444445', '33333333-3333-4333-8333-333333333332',
 '77777777-7777-4777-8777-777777777778', 'company',
 8, 9, 9, 8, 8.50,
 'Đức thể hiện năng lực tốt trong technical interview và practical test. Đề xuất offer.',
 ARRAY['Flutter skills', 'Problem solving', 'Communication', 'Enthusiasm'],
 ARRAY['iOS development knowledge', 'Advanced animations'],

-- Eva's final evaluation (CMC)
('aaaaaaa1-aaaa-4aaa-8aaa-aaaaaaaaaaa4', '44444444-4444-4444-8444-444444444446', '22222222-2222-4222-8222-222222222223',
 '77777777-7777-4777-8777-777777777779', 'final',
 10, 10, 9, 10, 9.75,
 'Eva hoàn thành xuất sắc internship tại CMC. Đề xuất trao giấy chứng nhận xuất sắc.',
 ARRAY['AI/ML mastery', 'Research capability', 'Team collaboration', 'Innovation', 'Professionalism'],
 ARRAY['Business communication', 'Legacy code navigation'],

-- Bình's screening evaluation (FPT initial)
('aaaaaaa1-aaaa-4aaa-8aaa-aaaaaaaaaaa5', '44444444-4444-4444-8444-444444444442', '33333333-3333-4333-8333-333333333332',
 '77777777-7777-4777-8777-777777777773', 'company',
 7, 9, 8, 8, 8.00,
 'Bình có GPA tốt (3.8), thể hiện kiến thức vững về SQL và testing. Recommend proceed to interview.',
 ARRAY['SQL proficiency', 'Testing concepts', 'Eager to learn', 'Professional attitude'],
 ARRAY['Java experience', 'Framework knowledge']);

-- ================================================
-- SEED DATA: DOCUMENTS
-- ================================================

INSERT INTO documents (id, user_id, application_id, document_type, file_name, file_url, file_size, mime_type, uploaded_at) VALUES

-- An's documents
('bbbbbbb1-bbbb-4bbb-8bbb-bbbbbbbbbb01', '44444444-4444-4444-8444-444444444441', '77777777-7777-4777-8777-777777777771',
 'resume', 'NguyenVanAn_Resume.pdf', 'https://storage.example.com/resumes/an-nv194001.pdf', 245000, 'application/pdf', '2026-04-15'::timestamp),

('bbbbbbb1-bbbb-4bbb-8bbb-bbbbbbbbbb02', '44444444-4444-4444-8444-444444444441', '77777777-7777-4777-8777-777777777771',
 'transcript', 'NguyenVanAn_Transcript.pdf', 'https://storage.example.com/transcripts/an-nv194001.pdf', 512000, 'application/pdf', '2026-04-15'::timestamp),

('bbbbbbb1-bbbb-4bbb-8bbb-bbbbbbbbbb03', '44444444-4444-4444-8444-444444444441', '77777777-7777-4777-8777-777777777771',
 'cover_letter', 'NguyenVanAn_CoverLetter.pdf', 'https://storage.example.com/covers/an-nv194001.pdf', 85000, 'application/pdf', '2026-04-15'::timestamp),

-- Bình's documents
('bbbbbbb1-bbbb-4bbb-8bbb-bbbbbbbbbb04', '44444444-4444-4444-8444-444444444442', '77777777-7777-4777-8777-777777777773',
 'resume', 'TranThiBinh_Resume.pdf', 'https://storage.example.com/resumes/binh-tt194002.pdf', 268000, 'application/pdf', '2026-05-01'::timestamp),

('bbbbbbb1-bbbb-4bbb-8bbb-bbbbbbbbbb05', '44444444-4444-4444-8444-444444444442', '77777777-7777-4777-8777-777777777773',
 'transcript', 'TranThiBinh_Transcript.pdf', 'https://storage.example.com/transcripts/binh-tt194002.pdf', 498000, 'application/pdf', '2026-05-01'::timestamp),

-- Eva's documents
('bbbbbbb1-bbbb-4bbb-8bbb-bbbbbbbbbb06', '44444444-4444-4444-8444-444444444446', '77777777-7777-4777-8777-777777777779',
 'resume', 'NgoThiEva_Resume.pdf', 'https://storage.example.com/resumes/eva-nt194006.pdf', 312000, 'application/pdf', '2026-04-05'::timestamp),

('bbbbbbb1-bbbb-4bbb-8bbb-bbbbbbbbbb07', '44444444-4444-4444-8444-444444444446', '77777777-7777-4777-8777-777777777779',
 'transcript', 'NgoThiEva_Transcript.pdf', 'https://storage.example.com/transcripts/eva-nt194006.pdf', 524000, 'application/pdf', '2026-04-05'::timestamp),

('bbbbbbb1-bbbb-4bbb-8bbb-bbbbbbbbbb08', '44444444-4444-4444-8444-444444444446', '77777777-7777-4777-8777-777777777779',
 'certificate', 'AI_Certification.pdf', 'https://storage.example.com/certs/eva-ai.pdf', 156000, 'application/pdf', '2026-04-05'::timestamp);

-- ================================================
-- SEED DATA: SYSTEM LOGS
-- ================================================

INSERT INTO system_logs (id, log_type, recipient_id, recipient_email, subject, message, status, sent_at, metadata) VALUES

('ccccccc1-cccc-4ccc-8ccc-ccccccccccc01', 'email', '44444444-4444-4444-8444-444444444441', 'an.nv194001@sis.hust.edu.vn',
 'Application Status Update', 'Your application for Frontend Developer Intern at TechViet Solutions has been updated to: Department Approved',
 'sent', '2026-04-22'::timestamp,
 '{"position": "Frontend Developer Intern", "company": "TechViet Solutions", "new_status": "department_approved"}'),

('ccccccc1-cccc-4ccc-8ccc-ccccccccccc02', 'notification', '44444444-4444-4444-8444-444444444441', NULL,
 'New Notification', 'Your application status has been updated',
 'sent', '2026-04-22'::timestamp,
 '{"type": "status_update", "application_id": "77777777-7777-4777-8777-777777777771"}'),

('ccccccc1-cccc-4ccc-8ccc-ccccccccccc03', 'email', '44444444-4444-4444-8444-444444444446', 'eva.nt194006@sis.hust.edu.vn',
 'Congratulations! Application Approved', 'Your application for AI/ML Engineer Intern at CMC Corporation has been fully approved!',
 'sent', '2026-04-15'::timestamp,
 '{"position": "AI/ML Engineer Intern", "company": "CMC Corporation", "approval_level": "final"}'),

('ccccccc1-cccc-4ccc-8ccc-ccccccccccc04', 'email', '44444444-4444-4444-8444-444444444445', 'duc.hv194005@sis.hust.edu.vn',
 'Job Offer! Mobile Developer Intern at FPT Software', 'Congratulations! We are pleased to offer you the position of Mobile Developer Intern.',
 'sent', '2026-04-18'::timestamp,
 '{"position": "Mobile Developer Intern", "company": "FPT Software", "offer_status": "extended"}'),

('ccccccc1-cccc-4ccc-8ccc-ccccccccccc05', 'system', NULL, NULL,
 'System Maintenance', 'Scheduled database backup completed successfully.',
 'sent', '2026-05-12'::timestamp,
 '{"backup_type": "full", "duration_seconds": 120, "size_mb": 1024}'),

('ccccccc1-cccc-4ccc-8ccc-ccccccccccc06', 'email', '44444444-4444-4444-8444-444444444442', 'binh.tt194002@sis.hust.edu.vn',
 'Application Received', 'We have received your application for Java Developer Intern at FPT Software.',
 'sent', '2026-05-01'::timestamp,
 '{"position": "Java Developer Intern", "company": "FPT Software", "application_id": "77777777-7777-4777-8777-777777777773"}'),

('ccccccc1-cccc-4ccc-8ccc-ccccccccccc07', 'notification', '22222222-2222-4222-8222-222222222222', NULL,
 'New Pending Approval', 'You have new internship applications awaiting your review.',
 'sent', '2026-05-10'::timestamp,
 '{"pending_count": 3, "approval_type": "department"}'),

('ccccccc1-cccc-4ccc-8ccc-ccccccccccc08', 'email', '33333333-3333-4333-8333-333333333331', 'contact@techviet.vn',
 'New Application for Frontend Developer Intern', 'You have received a new application from Nguyễn Văn An.',
 'sent', '2026-04-15'::timestamp,
 '{"student_name": "Nguyễn Văn An", "position": "Frontend Developer Intern"}');

-- ================================================
-- SEED DATA: NOTIFICATIONS
-- ================================================

INSERT INTO notifications (id, user_id, title, message, type, is_read, link, created_at) VALUES

-- An's notifications
('ddddddd1-dddd-4ddd-8ddd-ddddddddddd01', '44444444-4444-4444-8444-444444444441',
 'Chào mừng đến với hệ thống!', 'Chúc mừng bạn đã đăng ký thành công. Bắt đầu khám phá các vị trí thực tập ngay!', 'success', true,
 '/student', '2026-04-01'::timestamp),

('ddddddd1-dddd-4ddd-8ddd-ddddddddddd02', '44444444-4444-4444-8444-444444444441',
 'Đơn ứng tuyển đã được nhận', 'Đơn ứng tuyển Frontend Developer Intern tại TechViet Solutions đã được gửi thành công.', 'info', true,
 '/applications/77777777-7777-4777-8777-777777777771', '2026-04-15'::timestamp),

('ddddddd1-dddd-4ddd-8ddd-ddddddddddd03', '44444444-4444-4444-8444-444444444441',
 'Đơn ứng tuyển được duyệt bởi khoa', 'Đơn ứng tuyển Frontend Developer Intern của bạn đã được phòng đào tạo duyệt!', 'success', true,
 '/applications/77777777-7777-4777-8777-777777777771', '2026-04-22'::timestamp),

('ddddddd1-dddd-4ddd-8ddd-ddddddddddd04', '44444444-4444-4444-8444-444444444441',
 'Cập nhật log tuần 3', 'Bạn có một nhận xét mới từ giảng viên hướng dẫn về log tuần 3.', 'info', false,
 '/student/journal', '2026-05-06'::timestamp),

-- Bình's notifications
('ddddddd1-dddd-4ddd-8ddd-ddddddddddd05', '44444444-4444-4444-8444-444444444442',
 'Đơn ứng tuyển đã được nhận', 'Chúng tôi đã nhận được đơn ứng tuyển Java Developer Intern của bạn tại FPT Software.', 'info', true,
 '/applications/77777777-7777-4777-8777-777777777773', '2026-05-01'::timestamp),

('ddddddd1-dddd-4ddd-8ddd-ddddddddddd06', '44444444-4444-4444-8444-444444444442',
 'Đơn đang được xem xét', 'Đơn ứng tuyển của bạn đang được công ty xem xét.', 'warning', false,
 '/applications/77777777-7777-4777-8777-777777777773', '2026-05-03'::timestamp),

-- Eva's notifications
('ddddddd1-dddd-4ddd-8ddd-ddddddddddd07', '44444444-4444-4444-8444-444444444446',
 'Chúc mừng! Đơn đã được duyệt!', 'Đơn ứng tuyển AI/ML Engineer Intern tại CMC Corporation đã được phê duyệt hoàn toàn!', 'success', true,
 '/applications/77777777-7777-4777-8777-777777777779', '2026-04-15'::timestamp),

('ddddddd1-dddd-4ddd-8ddd-ddddddddddd08', '44444444-4444-4444-8444-444444444446',
 'Nhận xét midterm xuất sắc!', 'Bạn đã nhận được nhận xét midterm với điểm 9.25/10 từ CMC Corporation.', 'success', true,
 '/student', '2026-05-15'::timestamp),

('ddddddd1-dddd-4ddd-8ddd-ddddddddddd09', '44444444-4444-4444-8444-444444444446',
 'Nhận xét cuối kỳ', 'Bạn đã nhận được nhận xét cuối kỳ. Xem chi tiết ngay!', 'success', false,
 '/student', '2026-05-20'::timestamp),

-- Đức's notifications
('ddddddd1-dddd-4ddd-8ddd-ddddddddddd10', '44444444-4444-4444-8444-444444444445',
 'CHÍNH THỨC NHẬN OFFER!', 'Chúc mừng! Bạn đã nhận được offer thực tập Mobile Developer tại FPT Software!', 'success', true,
 '/applications/77777777-7777-4777-8777-777777777778', '2026-04-18'::timestamp),

-- Lecturers' notifications
('ddddddd1-dddd-4ddd-8ddd-ddddddddddd11', '22222222-2222-4222-8222-222222222222',
 'Có đơn mới cần duyệt', 'Bạn có 3 đơn thực tập mới cần phê duyệt từ phòng đào tạo.', 'info', false,
 '/lecturer/approval', '2026-05-10'::timestamp),

-- Company's notifications
('ddddddd1-dddd-4ddd-8ddd-ddddddddddd12', '33333333-3333-4333-8333-333333333331',
 'Ứng viên mới ứng tuyển', 'Nguyễn Văn An đã ứng tuyển vị trí Frontend Developer Intern.', 'info', true,
 '/company/candidates', '2026-04-15'::timestamp),

('ddddddd1-dddd-4ddd-8ddd-ddddddddddd13', '33333333-3333-4333-8333-333333333332',
 'Ứng viên nhận offer', 'Hoàng Văn Đức đã chấp nhận offer Mobile Developer Intern!', 'success', true,
 '/company/candidates', '2026-04-19'::timestamp);

-- ================================================
-- SEED DATA: REFRESH TOKENS
-- ================================================

-- Sample refresh tokens (hashed in production, plain here for seeding)
INSERT INTO refresh_tokens (id, user_id, token, expires_at, created_at) VALUES
('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeee01', '44444444-4444-4444-8444-444444444441',
 'sample_refresh_token_for_testing_123456',
 (CURRENT_TIMESTAMP + INTERVAL '7 days'), '2026-05-10'::timestamp),

('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeee02', '22222222-2222-4222-8222-222222222222',
 'sample_refresh_token_for_lecturer_789012',
 (CURRENT_TIMESTAMP + INTERVAL '7 days'), '2026-05-10'::timestamp),

('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeee03', '33333333-3333-4333-8333-333333333331',
 'sample_refresh_token_for_company_345678',
 (CURRENT_TIMESTAMP + INTERVAL '7 days'), '2026-05-10'::timestamp);

-- ================================================
-- VERIFICATION QUERIES
-- ================================================

-- Check seed data counts
SELECT 'Users' as table_name, COUNT(*) as count FROM users
UNION ALL SELECT 'Student Profiles', COUNT(*) FROM student_profiles
UNION ALL SELECT 'Positions', COUNT(*) FROM positions
UNION ALL SELECT 'Applications', COUNT(*) FROM applications
UNION ALL SELECT 'Approval Items', COUNT(*) FROM approval_items
UNION ALL SELECT 'Log Entries', COUNT(*) FROM log_entries
UNION ALL SELECT 'Evaluations', COUNT(*) FROM evaluations
UNION ALL SELECT 'Documents', COUNT(*) FROM documents
UNION ALL SELECT 'System Logs', COUNT(*) FROM system_logs
UNION ALL SELECT 'Notifications', COUNT(*) FROM notifications
UNION ALL SELECT 'Refresh Tokens', COUNT(*) FROM refresh_tokens;
