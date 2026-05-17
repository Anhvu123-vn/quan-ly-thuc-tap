import { PrismaClient, UserRole, JobStatus, WorkType, ApplicationStatus, ApprovalStatus, ApprovalLevel, EvaluationType, LogStatus, LogType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean database
  await prisma.notification.deleteMany();
  await prisma.systemLog.deleteMany();
  await prisma.document.deleteMany();
  await prisma.evaluation.deleteMany();
  await prisma.logEntry.deleteMany();
  await prisma.approvalItem.deleteMany();
  await prisma.application.deleteMany();
  await prisma.position.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Database cleaned');

  // Create password hash
  const passwordHash = await bcrypt.hash('password123', 10);

  // ================================================
  // USERS
  // ================================================
  
  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@university.edu',
      passwordHash,
      role: UserRole.ADMIN,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
      phone: '0901234567',
      department: 'Administration',
      status: 'active',
    },
  });

  const lecturers = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Dr. Nguyễn Văn Minh',
        email: 'minhnv@university.edu',
        passwordHash,
        role: UserRole.LECTURER,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=minh',
        phone: '0901234568',
        department: 'Computer Science',
        status: 'active',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Dr. Trần Thị Lan',
        email: 'lantt@university.edu',
        passwordHash,
        role: UserRole.LECTURER,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lan',
        phone: '0901234569',
        department: 'Computer Science',
        status: 'active',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Dr. Lê Hoàng Nam',
        email: 'namlh@university.edu',
        passwordHash,
        role: UserRole.LECTURER,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nam',
        phone: '0901234570',
        department: 'Software Engineering',
        status: 'active',
      },
    }),
  ]);

  const companies = await Promise.all([
    prisma.user.create({
      data: {
        name: 'TechViet Solutions',
        email: 'contact@techviet.vn',
        passwordHash,
        role: UserRole.COMPANY,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=techviet',
        phone: '02812345678',
        department: 'Technology',
        status: 'active',
      },
    }),
    prisma.user.create({
      data: {
        name: 'FPT Software',
        email: 'hr@fpt.com.vn',
        passwordHash,
        role: UserRole.COMPANY,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=fpt',
        phone: '02823456789',
        department: 'Software',
        status: 'active',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Viettel Solutions',
        email: 'tuyendung@viettel.com.vn',
        passwordHash,
        role: UserRole.COMPANY,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=viettel',
        phone: '02412345678',
        department: 'Telecommunications',
        status: 'active',
      },
    }),
    prisma.user.create({
      data: {
        name: 'VNG Corporation',
        email: 'careers@vng.com.vn',
        passwordHash,
        role: UserRole.COMPANY,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=vng',
        phone: '02812345679',
        department: 'Gaming & Technology',
        status: 'active',
      },
    }),
    prisma.user.create({
      data: {
        name: 'CMC Corporation',
        email: 'hr@cmc.com.vn',
        passwordHash,
        role: UserRole.COMPANY,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=cmc',
        phone: '02423456789',
        department: 'Technology',
        status: 'active',
      },
    }),
  ]);

  const students = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Nguyễn Văn An',
        email: 'an.nv194001@sis.hust.edu.vn',
        passwordHash,
        role: UserRole.STUDENT,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=an',
        phone: '0909876543',
        department: 'Computer Science',
        status: 'active',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Trần Thị Bình',
        email: 'binh.tt194002@sis.hust.edu.vn',
        passwordHash,
        role: UserRole.STUDENT,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=binh',
        phone: '0909876544',
        department: 'Computer Science',
        status: 'active',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Lê Minh Cường',
        email: 'cuong.lm194003@sis.hust.edu.vn',
        passwordHash,
        role: UserRole.STUDENT,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=cuong',
        phone: '0909876545',
        department: 'Software Engineering',
        status: 'active',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Phạm Thu Dung',
        email: 'dung.pt194004@sis.hust.edu.vn',
        passwordHash,
        role: UserRole.STUDENT,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dung',
        phone: '0909876546',
        department: 'Information Systems',
        status: 'active',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Hoàng Văn Đức',
        email: 'duc.hv194005@sis.hust.edu.vn',
        passwordHash,
        role: UserRole.STUDENT,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=duc',
        phone: '0909876547',
        department: 'Computer Science',
        status: 'active',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Ngô Thị Eva',
        email: 'eva.nt194006@sis.hust.edu.vn',
        passwordHash,
        role: UserRole.STUDENT,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=eva',
        phone: '0909876548',
        department: 'Artificial Intelligence',
        status: 'active',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Đặng Minh Hùng',
        email: 'hung.dm194007@sis.hust.edu.vn',
        passwordHash,
        role: UserRole.STUDENT,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=hung',
        phone: '0909876549',
        department: 'Computer Science',
        status: 'active',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Bùi Thị Linh',
        email: 'linh.bt194008@sis.hust.edu.vn',
        passwordHash,
        role: UserRole.STUDENT,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=linh',
        phone: '0909876550',
        department: 'Software Engineering',
        status: 'active',
      },
    }),
  ]);

  console.log('✅ Created users');

  // ================================================
  // STUDENT PROFILES
  // ================================================
  
  await Promise.all([
    prisma.studentProfile.create({
      data: {
        userId: students[0].id,
        major: 'Computer Science',
        gpa: 3.65,
        skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Docker'],
        bio: 'Sinh viên năm 4 chuyên ngành Khoa học Máy tính với niềm đam mê về phát triển web.',
        resumeUrl: 'https://storage.example.com/resumes/an-nv194001.pdf',
        transcriptUrl: 'https://storage.example.com/transcripts/an-nv194001.pdf',
      },
    }),
    prisma.studentProfile.create({
      data: {
        userId: students[1].id,
        major: 'Computer Science',
        gpa: 3.80,
        skills: ['Python', 'Machine Learning', 'TensorFlow', 'SQL', 'Git'],
        bio: 'Sinh viên xuất sắc với GPA 3.8, quan tâm đến AI và Machine Learning.',
        resumeUrl: 'https://storage.example.com/resumes/binh-tt194002.pdf',
        transcriptUrl: 'https://storage.example.com/transcripts/binh-tt194002.pdf',
      },
    }),
    prisma.studentProfile.create({
      data: {
        userId: students[2].id,
        major: 'Software Engineering',
        gpa: 3.45,
        skills: ['Java', 'Spring Boot', 'Microservices', 'Kubernetes', 'AWS'],
        bio: 'Chuyên gia về backend development với kinh nghiệm với microservices.',
        resumeUrl: 'https://storage.example.com/resumes/cuong-lm194003.pdf',
        transcriptUrl: 'https://storage.example.com/transcripts/cuong-lm194003.pdf',
      },
    }),
    prisma.studentProfile.create({
      data: {
        userId: students[3].id,
        major: 'Information Systems',
        gpa: 3.50,
        skills: ['Vue.js', 'Laravel', 'MySQL', 'REST API', 'Figma'],
        bio: 'Hướng đến sự nghiệp trong lĩnh vực phát triển phần mềm doanh nghiệp.',
        resumeUrl: 'https://storage.example.com/resumes/dung-pt194004.pdf',
        transcriptUrl: 'https://storage.example.com/transcripts/dung-pt194004.pdf',
      },
    }),
    prisma.studentProfile.create({
      data: {
        userId: students[4].id,
        major: 'Computer Science',
        gpa: 3.70,
        skills: ['Flutter', 'Dart', 'Firebase', 'Mobile Development', 'UI/UX'],
        bio: 'Yêu thích phát triển ứng dụng di động và UI/UX design.',
        resumeUrl: 'https://storage.example.com/resumes/duc-hv194005.pdf',
        transcriptUrl: 'https://storage.example.com/transcripts/duc-hv194005.pdf',
      },
    }),
    prisma.studentProfile.create({
      data: {
        userId: students[5].id,
        major: 'Artificial Intelligence',
        gpa: 3.90,
        skills: ['Python', 'Deep Learning', 'Computer Vision', 'OpenCV', 'PyTorch'],
        bio: 'Thủ khoa với GPA 3.9, chuyên về AI và Computer Vision.',
        resumeUrl: 'https://storage.example.com/resumes/eva-nt194006.pdf',
        transcriptUrl: 'https://storage.example.com/transcripts/eva-nt194006.pdf',
      },
    }),
    prisma.studentProfile.create({
      data: {
        userId: students[6].id,
        major: 'Computer Science',
        gpa: 3.55,
        skills: ['React Native', 'TypeScript', 'GraphQL', 'MongoDB', 'Redux'],
        bio: 'Đam mê công nghệ cross-platform và mạng xã hội.',
        resumeUrl: 'https://storage.example.com/resumes/hung-dm194007.pdf',
        transcriptUrl: 'https://storage.example.com/transcripts/hung-dm194007.pdf',
      },
    }),
    prisma.studentProfile.create({
      data: {
        userId: students[7].id,
        major: 'Software Engineering',
        gpa: 3.60,
        skills: ['Go', 'Rust', 'gRPC', 'Redis', 'PostgreSQL'],
        bio: 'Quan tâm đến performance và system programming.',
        resumeUrl: 'https://storage.example.com/resumes/linh-bt194008.pdf',
        transcriptUrl: 'https://storage.example.com/transcripts/linh-bt194008.pdf',
      },
    }),
  ]);

  console.log('✅ Created student profiles');

  // ================================================
  // POSITIONS
  // ================================================
  
  const positions = await Promise.all([
    prisma.position.create({
      data: {
        title: 'Frontend Developer Intern',
        companyId: companies[0].id,
        location: 'Ho Chi Minh City',
        field: 'Software Development',
        description: 'Tham gia phát triển các sản phẩm web của công ty với React và TypeScript.',
        requirements: ['React', 'TypeScript', 'HTML/CSS', 'Git'],
        responsibilities: ['Phát triển UI components', 'Fix bugs', 'Viết unit tests'],
        salaryMin: 5000000,
        salaryMax: 8000000,
        duration: 'three_months',
        workType: WorkType.ONSITE,
        slots: 3,
        deadline: new Date('2026-06-30'),
        status: JobStatus.ACTIVE,
      },
    }),
    prisma.position.create({
      data: {
        title: 'Backend Developer Intern',
        companyId: companies[0].id,
        location: 'Ho Chi Minh City',
        field: 'Software Development',
        description: 'Phát triển RESTful APIs và microservices với Node.js.',
        requirements: ['Node.js', 'Express', 'PostgreSQL', 'Docker', 'REST API'],
        responsibilities: ['Phát triển API endpoints', 'Thiết kế database', 'Viết documentation'],
        salaryMin: 6000000,
        salaryMax: 9000000,
        duration: 'four_six_months',
        workType: WorkType.HYBRID,
        slots: 2,
        deadline: new Date('2026-07-15'),
        status: JobStatus.ACTIVE,
      },
    }),
    prisma.position.create({
      data: {
        title: 'Java Developer Intern',
        companyId: companies[1].id,
        location: 'Hanoi',
        field: 'Software Development',
        description: 'Thực tập tại FPT Software - công ty outsourcing hàng đầu Việt Nam.',
        requirements: ['Java', 'Spring Boot', 'SQL', 'Git', 'English'],
        responsibilities: ['Phát triển tính năng mới', 'Debug và fix issues', 'Viết technical documents'],
        salaryMin: 6000000,
        salaryMax: 10000000,
        duration: 'six_plus_months',
        workType: WorkType.ONSITE,
        slots: 5,
        deadline: new Date('2026-08-31'),
        status: JobStatus.ACTIVE,
      },
    }),
    prisma.position.create({
      data: {
        title: 'Mobile Developer Intern',
        companyId: companies[1].id,
        location: 'Ho Chi Minh City',
        field: 'Mobile Development',
        description: 'Phát triển ứng dụng di động cho khách hàng quốc tế.',
        requirements: ['Flutter', 'Dart', 'iOS', 'Android', 'REST API'],
        responsibilities: ['Phát triển features mới', 'Fix bugs', 'UI optimization'],
        salaryMin: 7000000,
        salaryMax: 12000000,
        duration: 'four_six_months',
        workType: WorkType.HYBRID,
        slots: 2,
        deadline: new Date('2026-07-20'),
        status: JobStatus.ACTIVE,
      },
    }),
    prisma.position.create({
      data: {
        title: 'AI/ML Engineer Intern',
        companyId: companies[4].id,
        location: 'Hanoi',
        field: 'Artificial Intelligence',
        description: 'Nghiên cứu và phát triển các giải pháp AI cho doanh nghiệp.',
        requirements: ['Python', 'TensorFlow', 'PyTorch', 'Computer Vision', 'NLP'],
        responsibilities: ['Research AI solutions', 'Model development', 'Performance optimization'],
        salaryMin: 10000000,
        salaryMax: 18000000,
        duration: 'six_plus_months',
        workType: WorkType.HYBRID,
        slots: 2,
        deadline: new Date('2026-09-15'),
        status: JobStatus.ACTIVE,
      },
    }),
    prisma.position.create({
      data: {
        title: 'Game Developer Intern',
        companyId: companies[3].id,
        location: 'Ho Chi Minh City',
        field: 'Game Development',
        description: 'Tham gia phát triển các tựa game mobile và PC của VNG.',
        requirements: ['Unity', 'C#', 'Game Design', 'Mobile Development'],
        responsibilities: ['Phát triển gameplay', 'UI implementation', 'Performance optimization'],
        salaryMin: 7000000,
        salaryMax: 12000000,
        duration: 'four_six_months',
        workType: WorkType.ONSITE,
        slots: 4,
        deadline: new Date('2026-07-31'),
        status: JobStatus.ACTIVE,
      },
    }),
  ]);

  console.log('✅ Created positions');

  // ================================================
  // APPLICATIONS
  // ================================================
  
  const applications = await Promise.all([
    prisma.application.create({
      data: {
        positionId: positions[0].id,
        studentId: students[0].id,
        coverLetter: 'Em rất quan tâm đến vị trí Frontend Developer tại TechViet Solutions.',
        status: ApplicationStatus.DEPARTMENT_APPROVED,
      },
    }),
    prisma.application.create({
      data: {
        positionId: positions[1].id,
        studentId: students[0].id,
        coverLetter: 'Em muốn phát triển kỹ năng backend với Node.js.',
        status: ApplicationStatus.INTERVIEW,
      },
    }),
    prisma.application.create({
      data: {
        positionId: positions[2].id,
        studentId: students[1].id,
        coverLetter: 'Em rất hào hứng với cơ hội thực tập tại FPT Software.',
        status: ApplicationStatus.APPLIED,
      },
    }),
    prisma.application.create({
      data: {
        positionId: positions[3].id,
        studentId: students[1].id,
        coverLetter: 'Với niềm đam mê về mobile development, em muốn được phát triển tại FPT.',
        status: ApplicationStatus.SCREENING,
      },
    }),
    prisma.application.create({
      data: {
        positionId: positions[3].id,
        studentId: students[4].id,
        coverLetter: 'Với kinh nghiệm phát triển ứng dụng Flutter, em rất muốn được thực tập tại FPT.',
        status: ApplicationStatus.OFFER,
      },
    }),
    prisma.application.create({
      data: {
        positionId: positions[4].id,
        studentId: students[5].id,
        coverLetter: 'Em là thủ khoa với GPA 3.9 và chuyên về AI/ML. Em rất hào hứng với cơ hội nghiên cứu tại CMC.',
        status: ApplicationStatus.DEPARTMENT_APPROVED,
      },
    }),
    prisma.application.create({
      data: {
        positionId: positions[5].id,
        studentId: students[6].id,
        coverLetter: 'Em đam mê game development và muốn phát triển sự nghiệp tại VNG.',
        status: ApplicationStatus.APPLIED,
      },
    }),
  ]);

  console.log('✅ Created applications');

  // ================================================
  // APPROVAL ITEMS
  // ================================================
  
  await Promise.all([
    prisma.approvalItem.create({
      data: {
        applicationId: applications[0].id,
        studentId: students[0].id,
        companyId: companies[0].id,
        positionId: positions[0].id,
        level: ApprovalLevel.DEPARTMENT,
        status: ApprovalStatus.APPROVED,
        reviewerId: lecturers[0].id,
        comments: 'GPA 3.65, có kinh nghiệm làm project thực tế.',
        reviewedAt: new Date('2026-04-20'),
      },
    }),
    prisma.approvalItem.create({
      data: {
        applicationId: applications[5].id,
        studentId: students[5].id,
        companyId: companies[4].id,
        positionId: positions[4].id,
        level: ApprovalLevel.DEPARTMENT,
        status: ApprovalStatus.APPROVED,
        reviewerId: lecturers[1].id,
        comments: 'Thủ khoa GPA 3.9, chuyên ngành AI. Tuyệt vời cho vị trí này.',
        reviewedAt: new Date('2026-04-12'),
      },
    }),
  ]);

  console.log('✅ Created approval items');

  // ================================================
  // LOG ENTRIES
  // ================================================
  
  await Promise.all([
    prisma.logEntry.create({
      data: {
        studentId: students[0].id,
        weekNumber: 1,
        entryDate: new Date('2026-04-21'),
        completedWork: 'Hoàn thành onboarding, setup development environment.',
        challenges: 'Khó khăn trong việc understand legacy code.',
        lessonsLearned: 'Cách đọc và understand code architecture.',
        goalsForNextWeek: 'Hoàn thành module authentication.',
        status: LogStatus.REVIEWED,
        lecturerComment: 'Good progress! Keep learning.',
        lecturerRating: 4,
      },
    }),
    prisma.logEntry.create({
      data: {
        studentId: students[0].id,
        weekNumber: 2,
        entryDate: new Date('2026-04-28'),
        completedWork: 'Phát triển và hoàn thành module authentication với JWT.',
        challenges: 'Debug OAuth2 flow và xử lý token refresh.',
        lessonsLearned: 'Hiểu sâu về authentication flows và security best practices.',
        goalsForNextWeek: 'Bắt đầu phát triển dashboard component.',
        status: LogStatus.REVIEWED,
        lecturerComment: 'Excellent work on authentication!',
        lecturerRating: 5,
      },
    }),
    prisma.logEntry.create({
      data: {
        studentId: students[5].id,
        weekNumber: 1,
        entryDate: new Date('2026-04-15'),
        completedWork: 'Hoàn thành paperwork và đang chờ approval cuối cùng.',
        lessonsLearned: 'Tầm quan trọng của việc chuẩn bị trước khi bắt đầu internship.',
        goalsForNextWeek: 'Sẵn sàng bắt đầu internship tại CMC.',
        status: LogStatus.APPROVED,
        lecturerComment: 'Outstanding preparation!',
        lecturerRating: 5,
      },
    }),
  ]);

  console.log('✅ Created log entries');

  // ================================================
  // EVALUATIONS
  // ================================================
  
  await Promise.all([
    prisma.evaluation.create({
      data: {
        studentId: students[0].id,
        evaluatorId: lecturers[0].id,
        applicationId: applications[0].id,
        evaluationType: EvaluationType.MIDTERM,
        technicalScore: 8,
        attitudeScore: 9,
        communicationScore: 8,
        teamworkScore: 9,
        overallScore: 8.50,
        comments: 'An tiến bộ rất nhanh trong 4 tuần đầu. Kỹ năng React tốt, teamwork excellent.',
        strengths: ['React development', 'Quick learner', 'Team player', 'Documentation'],
        areasForImprovement: ['Backend knowledge', 'System design skills'],
      },
    }),
    prisma.evaluation.create({
      data: {
        studentId: students[5].id,
        evaluatorId: lecturers[1].id,
        applicationId: applications[5].id,
        evaluationType: EvaluationType.MIDTERM,
        technicalScore: 9,
        attitudeScore: 10,
        communicationScore: 9,
        teamworkScore: 9,
        overallScore: 9.25,
        comments: 'Eva thể hiện năng lực xuất sắc trong giai đoạn midterm.',
        strengths: ['AI/ML expertise', 'Quick learner', 'Self-motivated', 'Strong analytical skills'],
        areasForImprovement: ['Could improve time estimation'],
      },
    }),
    prisma.evaluation.create({
      data: {
        studentId: students[5].id,
        evaluatorId: lecturers[1].id,
        applicationId: applications[5].id,
        evaluationType: EvaluationType.FINAL,
        technicalScore: 10,
        attitudeScore: 10,
        communicationScore: 9,
        teamworkScore: 10,
        overallScore: 9.75,
        comments: 'Eva hoàn thành xuất sắc internship tại CMC.',
        strengths: ['AI/ML mastery', 'Research capability', 'Team collaboration', 'Innovation', 'Professionalism'],
        areasForImprovement: ['Business communication', 'Legacy code navigation'],
      },
    }),
  ]);

  console.log('✅ Created evaluations');

  // ================================================
  // NOTIFICATIONS
  // ================================================
  
  await Promise.all([
    prisma.notification.create({
      data: {
        userId: students[0].id,
        title: 'Chào mừng đến với hệ thống!',
        message: 'Chúc mừng bạn đã đăng ký thành công.',
        type: 'success',
        isRead: true,
        link: '/student',
      },
    }),
    prisma.notification.create({
      data: {
        userId: students[0].id,
        title: 'Đơn ứng tuyển được duyệt bởi khoa',
        message: 'Đơn ứng tuyển Frontend Developer Intern của bạn đã được phòng đào tạo duyệt!',
        type: 'success',
        isRead: false,
        link: '/applications',
      },
    }),
    prisma.notification.create({
      data: {
        userId: students[5].id,
        title: 'Chúc mừng! Đơn đã được duyệt!',
        message: 'Đơn ứng tuyển AI/ML Engineer Intern tại CMC Corporation đã được phê duyệt hoàn toàn!',
        type: 'success',
        isRead: true,
        link: '/applications',
      },
    }),
    prisma.notification.create({
      data: {
        userId: students[4].id,
        title: 'CHÍNH THỨC NHẬN OFFER!',
        message: 'Chúc mừng! Bạn đã nhận được offer thực tập Mobile Developer tại FPT Software!',
        type: 'success',
        isRead: true,
        link: '/applications',
      },
    }),
  ]);

  console.log('✅ Created notifications');

  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📧 Test accounts (password: password123):');
  console.log('   Admin:     admin@university.edu');
  console.log('   Lecturer:  minhnv@university.edu');
  console.log('   Company:   contact@techviet.vn');
  console.log('   Student:   an.nv194001@sis.hust.edu.vn');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
