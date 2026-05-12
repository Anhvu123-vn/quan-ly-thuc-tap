import type { StatCard, Activity, PendingApproval, User } from "@/types";

export const mockStats: StatCard[] = [
  {
    title: "Total Students",
    value: 1247,
    change: "+12%",
    trend: "up",
  },
  {
    title: "Active Internships",
    value: 389,
    change: "+8%",
    trend: "up",
  },
  {
    title: "Pending Approvals",
    value: 23,
    change: "-3",
    trend: "down",
  },
  {
    title: "Completed This Month",
    value: 67,
    change: "+15%",
    trend: "up",
  },
];

export const mockActivities: Activity[] = [
  {
    id: "1",
    type: "submission",
    message: "New internship application submitted",
    user: "Nguyen Van A",
    timestamp: "2 minutes ago",
  },
  {
    id: "2",
    type: "approval",
    message: "Application approved by Dr. Tran",
    user: "Dr. Tran Thi B",
    timestamp: "15 minutes ago",
  },
  {
    id: "3",
    type: "user",
    message: "New student registered",
    user: "Le Thi C",
    timestamp: "1 hour ago",
  },
  {
    id: "4",
    type: "login",
    message: "Admin logged in",
    user: "Admin",
    timestamp: "2 hours ago",
  },
  {
    id: "5",
    type: "rejection",
    message: "Application rejected - incomplete documents",
    user: "Prof. Hoang Van D",
    timestamp: "3 hours ago",
  },
  {
    id: "6",
    type: "submission",
    message: "Internship log submitted for review",
    user: "Pham Thi E",
    timestamp: "4 hours ago",
  },
];

export const mockPendingApprovals: PendingApproval[] = [
  {
    id: "1",
    studentName: "Nguyen Van A",
    studentEmail: "nvana@student.edu.vn",
    company: "TechCorp Vietnam",
    position: "Frontend Developer Intern",
    submittedDate: "May 8, 2026",
  },
  {
    id: "2",
    studentName: "Tran Thi B",
    studentEmail: "ttb@student.edu.vn",
    company: "DataFlow Inc",
    position: "Data Science Intern",
    submittedDate: "May 7, 2026",
  },
  {
    id: "3",
    studentName: "Le Van C",
    studentEmail: "lvc@student.edu.vn",
    company: "CloudScale",
    position: "Backend Developer",
    submittedDate: "May 6, 2026",
  },
  {
    id: "4",
    studentName: "Pham Thi D",
    studentEmail: "ptd@student.edu.vn",
    company: "DesignHub",
    position: "UI/UX Designer",
    submittedDate: "May 5, 2026",
  },
];

export const mockUsers: User[] = [
  {
    id: "1",
    name: "Nguyen Van A",
    email: "nvana@student.edu.vn",
    role: "student",
    status: "active",
    joinedDate: "Sep 1, 2024",
  },
  {
    id: "2",
    name: "Tran Thi B",
    email: "ttb@student.edu.vn",
    role: "student",
    status: "active",
    joinedDate: "Sep 1, 2024",
  },
  {
    id: "3",
    name: "Dr. Le Van C",
    email: "lvc@university.edu.vn",
    role: "lecturer",
    status: "active",
    joinedDate: "Mar 15, 2022",
  },
  {
    id: "4",
    name: "Admin",
    email: "admin@university.edu.vn",
    role: "admin",
    status: "active",
    joinedDate: "Jan 1, 2024",
  },
  {
    id: "5",
    name: "Pham Van D",
    email: "pvd@student.edu.vn",
    role: "student",
    status: "inactive",
    joinedDate: "Sep 1, 2024",
  },
  {
    id: "6",
    name: "Prof. Hoang Thi E",
    email: "hte@university.edu.vn",
    role: "lecturer",
    status: "active",
    joinedDate: "Aug 20, 2021",
  },
  {
    id: "7",
    name: "Dao Van F",
    email: "dvf@student.edu.vn",
    role: "student",
    status: "active",
    joinedDate: "Sep 1, 2024",
  },
  {
    id: "8",
    name: "Bui Thi G",
    email: "btg@student.edu.vn",
    role: "student",
    status: "active",
    joinedDate: "Sep 1, 2023",
  },
];
