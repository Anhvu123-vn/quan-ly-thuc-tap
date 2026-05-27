// Mock data for the internship management system
import type { User, UserRole, Position } from "@/types";

// ============ SKILLS DATA ============
export const SKILLS = [
  { id: "react", name: "React", category: "Frontend" },
  { id: "typescript", name: "TypeScript", category: "Languages" },
  { id: "nodejs", name: "Node.js", category: "Backend" },
  { id: "python", name: "Python", category: "Languages" },
  { id: "sql", name: "SQL", category: "Database" },
  { id: "figma", name: "Figma", category: "Design" },
  { id: "git", name: "Git", category: "Tools" },
  { id: "docker", name: "Docker", category: "DevOps" },
  { id: "aws", name: "AWS", category: "Cloud" },
  { id: "ml", name: "Machine Learning", category: "AI" },
  { id: "communication", name: "Communication", category: "Soft Skills" },
  { id: "teamwork", name: "Teamwork", category: "Soft Skills" },
] as const;

// ============ STUDENT DATA ============
export interface StudentProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  major: string;
  gpa: number;
  skills: string[];
  projects: Project[];
  bio: string;
  phone: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  link?: string;
  technologies: string[];
  year: number;
}

export const mockStudentProfile: StudentProfile = {
  id: "stu-1",
  userId: "user-1",
  name: "Trần Minh Đức",
  email: "minh.duc@example.com",
  avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
  major: "Khoa học Máy tính",
  gpa: 3.42,
  skills: ["react", "typescript", "nodejs", "git", "sql"],
  projects: [
    {
      id: "proj-1",
      title: "Hệ thống quản lý thực tập",
      description: "Xây dựng web app quản lý quy trình thực tập cho sinh viên với React, Node.js và PostgreSQL",
      link: "https://github.com/minhduc/intern-management",
      technologies: ["React", "Node.js", "PostgreSQL"],
      year: 2026,
    },
    {
      id: "proj-2",
      title: "Ứng dụng học từ vựng Tiếng Anh",
      description: "App mobile sử dụng React Native với gamification và spaced repetition",
      technologies: ["React Native", "Firebase"],
      year: 2025,
    },
  ],
  bio: "Sinh viên năm 4 với đam mê phát triển web. Đang tìm kiếm vị trí thực tập Frontend Developer.",
  phone: "0901 234 567",
};

// ============ LOG ENTRIES ============
export interface LogEntry {
  id: string;
  studentId: string;
  week: number;
  date: string;
  completedWork: string;
  challenges: string;
  lessonsLearned: string;
  lecturerComment?: string;
  status: "pending" | "commented" | "approved";
}

export const mockLogEntries: LogEntry[] = [
  {
    id: "log-1",
    studentId: "stu-1",
    week: 4,
    date: "2026-05-05",
    completedWork: "- Hoàn thành module quản lý người dùng\n- Viết API cho authentication\n- Tối ưu database queries",
    challenges: "- Gặp khó khăn với JWT token refresh\n- Performance issue với large dataset",
    lessonsLearned: "- Hiểu sâu hơn về authentication flow\n- Cách sử dụng Redis cache hiệu quả",
    lecturerComment: "Bài làm tốt! Cần chú ý về security khi handle tokens.",
    status: "commented",
  },
  {
    id: "log-2",
    studentId: "stu-1",
    week: 3,
    date: "2026-04-28",
    completedWork: "- Setup CI/CD pipeline\n- Triển khai Docker containers\n- Documentation",
    challenges: "- Config GitHub Actions lần đầu\n- Understanding Docker networking",
    lessonsLearned: "- CI/CD best practices\n- Container orchestration basics",
    status: "approved",
  },
];

// ============ POSITIONS ============
export const mockPositions: Position[] = [
  {
    id: "pos-1",
    title: "Frontend Developer Intern",
    company: "TechCorp Vietnam",
    companyLogo: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop",
    location: "Ho Chi Minh City",
    duration: "4-6 months",
    field: "Software",
    description: "Tham gia phát triển các tính năng mới cho sản phẩm web của công ty.",
    requirements: ["React", "TypeScript", "Git"],
    postedDate: "2026-05-01",
    salaryMin: 5000000,
    salaryMax: 8000000,
    workType: "onsite",
  },
  {
    id: "pos-2",
    title: "UI/UX Designer Intern",
    company: "Creative Studio",
    companyLogo: "https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=100&h=100&fit=crop",
    location: "Remote",
    duration: "2-3 months",
    field: "Design",
    description: "Thiết kế giao diện người dùng cho các dự án mobile và web.",
    requirements: ["Figma", "UI Design", "Prototyping"],
    postedDate: "2026-05-03",
    workType: "remote",
  },
  {
    id: "pos-3",
    title: "Backend Developer Intern",
    company: "DataFlow Systems",
    companyLogo: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=100&h=100&fit=crop",
    location: "Hanoi",
    duration: "4-6 months",
    field: "Software",
    description: "Phát triển API và xử lý data pipeline.",
    requirements: ["Node.js", "Python", "SQL"],
    postedDate: "2026-05-05",
    salaryMin: 6000000,
    salaryMax: 10000000,
    workType: "hybrid",
  },
];

// ============ APPLICATIONS ============
export type ApplicationStatus =
  | "applied"
  | "screening"
  | "interview"
  | "offer"
  | "rejected"
  | "withdrawn"
  | "departmentApproved";

export interface Application {
  id: string;
  positionId: string;
  studentId: string;
  studentName: string;
  company: string;
  position: string;
  status: ApplicationStatus;
  appliedDate: string;
  interviewDate?: string;
  notes?: string;
}

export const mockApplications: Application[] = [
  {
    id: "app-1",
    positionId: "pos-1",
    studentId: "stu-1",
    studentName: "Trần Minh Đức",
    company: "TechCorp Vietnam",
    position: "Frontend Developer Intern",
    status: "screening",
    appliedDate: "2026-05-02",
    notes: "CV khả quan, có kinh nghiệm React 1 năm",
  },
  {
    id: "app-2",
    positionId: "pos-3",
    studentId: "stu-1",
    studentName: "Trần Minh Đức",
    company: "DataFlow Systems",
    position: "Backend Developer Intern",
    status: "interview",
    appliedDate: "2026-05-06",
    interviewDate: "2026-05-15",
  },
  {
    id: "app-3",
    positionId: "pos-2",
    studentId: "stu-1",
    studentName: "Trần Minh Đức",
    company: "Creative Studio",
    position: "UI/UX Designer",
    status: "departmentApproved",
    appliedDate: "2026-04-20",
    notes: "Đã được phê duyệt cấp khoa",
  },
  {
    id: "app-4",
    positionId: "pos-4",
    studentId: "stu-1",
    studentName: "Trần Minh Đức",
    company: "CloudScale",
    position: "Backend Developer",
    status: "withdrawn",
    appliedDate: "2026-04-10",
  },
];

// ============ JOB POSTINGS (Company) ============
export interface JobPosting {
  id: string;
  title: string;
  field: string;
  location: string;
  workType: "remote" | "hybrid" | "on-site";
  duration: string;
  salaryMin?: number;
  salaryMax?: number;
  applicants: number;
  status: "active" | "closed" | "paused";
  postedDate: string;
  requirements: string[];
}

export const mockJobPostings: JobPosting[] = [
  {
    id: "job-1",
    title: "Frontend Developer Intern",
    field: "Software",
    location: "Ho Chi Minh City",
    workType: "on-site",
    duration: "4-6 months",
    salaryMin: 5000000,
    salaryMax: 8000000,
    applicants: 12,
    status: "active",
    postedDate: "2026-05-01",
    requirements: ["React", "TypeScript", "Git"],
  },
  {
    id: "job-2",
    title: "Backend Developer Intern",
    field: "Software",
    location: "Ho Chi Minh City",
    workType: "hybrid",
    duration: "3-4 months",
    salaryMin: 6000000,
    salaryMax: 10000000,
    applicants: 8,
    status: "active",
    postedDate: "2026-05-03",
    requirements: ["Node.js", "Python", "SQL"],
  },
  {
    id: "job-3",
    title: "UI/UX Designer Intern",
    field: "Design",
    location: "Remote",
    workType: "remote",
    duration: "2-3 months",
    applicants: 5,
    status: "paused",
    postedDate: "2026-04-20",
    requirements: ["Figma", "Adobe XD"],
  },
];

// ============ APPROVAL ITEMS ============
export interface ApprovalItem {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  company: string;
  position: string;
  level: "faculty" | "supervisor";
  submittedDate: string;
  status: "pending" | "departmentApproved" | "approved" | "rejected";
  comment?: string;
}

export const mockApprovalItems: ApprovalItem[] = [
  {
    id: "apr-1",
    studentId: "stu-1",
    studentName: "Trần Minh Đức",
    studentEmail: "minh.duc@example.com",
    company: "TechCorp Vietnam",
    position: "Frontend Developer",
    level: "faculty",
    submittedDate: "2026-05-01",
    status: "departmentApproved",
  },
  {
    id: "apr-2",
    studentId: "stu-2",
    studentName: "Nguyễn Thị Hoa",
    studentEmail: "hoa.nguyen@example.com",
    company: "DataFlow Systems",
    position: "Backend Developer",
    level: "faculty",
    submittedDate: "2026-05-02",
    status: "pending",
  },
  {
    id: "apr-3",
    studentId: "stu-3",
    studentName: "Lê Văn Nam",
    studentEmail: "nam.le@example.com",
    company: "Creative Studio",
    position: "UI/UX Designer",
    level: "supervisor",
    submittedDate: "2026-05-03",
    status: "departmentApproved",
  },
];

// ============ EVALUATION ============
export interface Evaluation {
  id: string;
  studentId: string;
  studentName: string;
  evaluatorId: string;
  evaluatorName: string;
  type: "midterm" | "final" | "company";
  technicalScore?: number;
  attitudeScore?: number;
  communicationScore?: number;
  teamworkScore?: number;
  responsibilityScore?: number;
  learningScore?: number;
  overallScore?: number;
  comments: string;
  date: string;
}

export const mockEvaluations: Evaluation[] = [
  {
    id: "eval-1",
    studentId: "stu-1",
    studentName: "Trần Minh Đức",
    evaluatorId: "user-2",
    evaluatorName: "TS. Nguyễn Văn A",
    type: "midterm",
    technicalScore: 7.5,
    attitudeScore: 8.0,
    communicationScore: 7.0,
    overallScore: 7.5,
    comments: "Sinh viên tiếp thu nhanh, có tinh thần học hỏi tốt.",
    date: "2026-05-01",
  },
];

// ============ ANALYTICS ============
export interface AnalyticsData {
  totalStudents: number;
  studentsWithInternship: number;
  successRate: number;
  topCompanies: { name: string; count: number }[];
  monthlyApplications: { month: string; count: number }[];
  skillsDemand: { skill: string; demand: number }[];
}

export const mockAnalyticsData: AnalyticsData = {
  totalStudents: 245,
  studentsWithInternship: 189,
  successRate: 77.1,
  topCompanies: [
    { name: "FPT Software", count: 32 },
    { name: "Viettel", count: 28 },
    { name: "VNPT", count: 21 },
    { name: "TechCorp", count: 18 },
    { name: "Grab", count: 15 },
  ],
  monthlyApplications: [
    { month: "T1", count: 45 },
    { month: "T2", count: 52 },
    { month: "T3", count: 68 },
    { month: "T4", count: 85 },
    { month: "T5", count: 92 },
  ],
  skillsDemand: [
    { skill: "React", demand: 85 },
    { skill: "Node.js", demand: 78 },
    { skill: "Python", demand: 72 },
    { skill: "SQL", demand: 65 },
    { skill: "AWS", demand: 45 },
  ],
};

// ============ SYSTEM LOGS ============
export interface SystemLog {
  id: string;
  type: "email" | "notification" | "system";
  recipient: string;
  subject: string;
  status: "sent" | "failed" | "pending";
  sentAt: string;
}

export const mockSystemLogs: SystemLog[] = [
  {
    id: "log-sys-1",
    type: "email",
    recipient: "minh.duc@example.com",
    subject: "Đơn thực tập đã được duyệt",
    status: "sent",
    sentAt: "2026-05-11 14:30:00",
  },
  {
    id: "log-sys-2",
    type: "notification",
    recipient: "GV Nguyễn Văn A",
    subject: "Có 3 nhật ký mới cần phản hồi",
    status: "sent",
    sentAt: "2026-05-11 14:00:00",
  },
  {
    id: "log-sys-3",
    type: "email",
    recipient: "admin@example.com",
    subject: "Báo cáo tháng 5 - Tuần 1",
    status: "pending",
    sentAt: "2026-05-11 09:00:00",
  },
];
