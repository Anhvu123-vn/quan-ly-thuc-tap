export interface Internship {
  id: string;
  company: string;
  position: string;
  location: string;
  duration: string;
  matchScore: number;
  postedDate: string;
}

export interface Application {
  id: string;
  company: string;
  position: string;
  status: ApplicationStatus;
  appliedDate: string;
}

export type ApplicationStatus =
  | 'applied'
  | 'screening'
  | 'interview'
  | 'offer'
  | 'rejected'
  | 'withdrawn'
  | 'departmentApproved';

export interface LogEntry {
  id: string;
  date: string;
  hours: number;
  description: string;
}

export interface TimelineStage {
  id: string;
  label: string;
  completed: boolean;
  current: boolean;
}

// Position types for positions listing page
export interface Position {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  duration: string;
  field: string;
  description: string;
  requirements: string[];
  postedDate: string;
  salary?: string;
  salaryMin?: number;
  salaryMax?: number;
  workType?: 'remote' | 'hybrid' | 'on-site';
}

export interface ExtendedFilterState {
  search: string;
  location: string[];
  duration: string[];
  field: string[];
  skills: string[];
  salaryMin: number | null;
  salaryMax: number | null;
  workType: ('remote' | 'hybrid' | 'on-site')[];
}

export interface FilterState {
  search: string;
  location: string[];
  duration: string[];
  field: string[];
}

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
}

export const LOCATION_OPTIONS = ['Remote', 'Ho Chi Minh City', 'Hanoi', 'Da Nang', 'Others'] as const;
export const DURATION_OPTIONS = ['1 month', '2-3 months', '4-6 months', '6+ months'] as const;
export const FIELD_OPTIONS = ['Software', 'Design', 'Marketing', 'Data Science', 'Product'] as const;
export const WORK_TYPE_OPTIONS = ['Remote', 'Hybrid', 'On-site'] as const;
export const SKILLS_OPTIONS = [
  'React', 'TypeScript', 'JavaScript', 'Node.js', 'Python', 
  'Java', 'C++', 'Go', 'Rust', 'SQL', 'MongoDB', 'PostgreSQL',
  'AWS', 'Docker', 'Kubernetes', 'Git', 'Figma', 'Adobe XD',
  'Machine Learning', 'Data Analysis', 'Excel', 'Tableau',
  'SEO', 'Content Writing', 'Social Media', 'Communication'
] as const;

// Approval Timeline types
export type ApprovalStatus = 'pending' | 'in_progress' | 'approved' | 'rejected';

export interface ApprovalStep {
  id: string;
  title: string;
  description: string;
  status: ApprovalStatus;
  reviewer?: string;
  reviewedAt?: string;
  comment?: string;
}

export interface ApprovalTimelineData {
  steps: ApprovalStep[];
  submittedAt: string;
  rejectedAt?: string;
  rejectionReason?: string;
  isRejected: boolean;
}

// Admin Dashboard types
export interface StatCard {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export type ActivityType = 'submission' | 'approval' | 'rejection' | 'user' | 'login';

export interface Activity {
  id: string;
  type: ActivityType;
  message: string;
  user: string;
  timestamp: string;
}

export interface PendingApproval {
  id: string;
  studentName: string;
  studentEmail: string;
  company: string;
  position: string;
  submittedDate: string;
}

export type UserRole = 'student' | 'admin' | 'lecturer' | 'company';
export type UserStatus = 'active' | 'inactive' | 'pending_role';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole | null; // null means user hasn't selected role yet
  status: UserStatus;
  joinedDate: string;
  avatar?: string;
  phone?: string;
  department?: string;
}
