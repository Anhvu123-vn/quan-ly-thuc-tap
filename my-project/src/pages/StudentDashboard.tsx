import { useState } from "react";
import { InternshipSuggestions } from "@/components/dashboard/InternshipSuggestions";
import { ApplicationStatus } from "@/components/dashboard/ApplicationStatus";
import { ProgressTimeline } from "@/components/dashboard/ProgressTimeline";
import { InternshipLogPreview } from "@/components/dashboard/InternshipLogPreview";
import { motion } from "framer-motion";
import type { Application } from "@/data/mockData";
import type { Internship, LogEntry, TimelineStage } from "@/types";

// Mock internship suggestions
const mockInternships: Internship[] = [
  { id: "1", company: "TechCorp", position: "Frontend Developer Intern", location: "Ho Chi Minh City", duration: "3 months", matchScore: 92, postedDate: "2 days ago" },
  { id: "2", company: "Innovation Labs", position: "React Developer", location: "Remote", duration: "6 months", matchScore: 85, postedDate: "1 week ago" },
  { id: "3", company: "DataFlow Inc", position: "Software Engineer Trainee", location: "Hanoi", duration: "4 months", matchScore: 78, postedDate: "3 days ago" },
];

// Mock data
const mockTimelineStages: TimelineStage[] = [
  { id: "1", label: "Applied", completed: true, current: false },
  { id: "2", label: "Screening", completed: true, current: false },
  { id: "3", label: "Interview", completed: false, current: true },
  { id: "4", label: "Offer", completed: false, current: false },
  { id: "5", label: "Accepted", completed: false, current: false },
];

export function StudentDashboardPage() {
  const [applications, setApplications] = useState<Application[]>([
    { id: "app-1", positionId: "pos-1", studentId: "stu-1", studentName: "Trần Minh Đức", company: "Google", position: "Software Engineering Intern", status: "departmentApproved", appliedDate: "May 5, 2026" },
    { id: "app-2", positionId: "pos-2", studentId: "stu-1", studentName: "Trần Minh Đức", company: "Microsoft", position: "Frontend Developer", status: "screening", appliedDate: "May 3, 2026" },
    { id: "app-3", positionId: "pos-3", studentId: "stu-1", studentName: "Trần Minh Đức", company: "Atlassian", position: "Junior Developer", status: "offer", appliedDate: "Apr 28, 2026" },
    { id: "app-4", positionId: "pos-4", studentId: "stu-1", studentName: "Trần Minh Đức", company: "Shopee", position: "Software Intern", status: "rejected", appliedDate: "Apr 20, 2026" },
    { id: "app-5", positionId: "pos-5", studentId: "stu-1", studentName: "Trần Minh Đức", company: "TechCorp", position: "Backend Intern", status: "applied", appliedDate: "Apr 18, 2026" },
  ]);

  const mockLogEntries: LogEntry[] = [
    { id: "1", date: "May 10, 2026", hours: 8, description: "Completed React hooks tutorial and built a task management app" },
    { id: "2", date: "May 9, 2026", hours: 6, description: "Pair programming session on authentication flow" },
    { id: "3", date: "May 8, 2026", hours: 7, description: "Code review and fixed bug in user dashboard" },
  ];

  // Business rule: nếu sinh viên đã có đơn ở trạng thái departmentApproved → disabled nút Ứng tuyển
  const hasDepartmentApproved = applications.some((a) => a.status === "departmentApproved");

  const handleCancel = (id: string) => {
    setApplications((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status: "withdrawn" as const } : a
      )
    );
  };

  const totalHours = mockLogEntries.reduce((sum, entry) => sum + entry.hours, 0);

  return (
    <>
      {/* Progress Timeline - Full width */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <ProgressTimeline stages={mockTimelineStages} progressPercentage={40} />
      </motion.div>

      {/* Main content grid */}
      <div className="grid gap-8 lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px]">
        {/* Left column */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <InternshipSuggestions internships={mockInternships} applyDisabled={hasDepartmentApproved} />
        </motion.div>

        {/* Right column */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-6"
        >
          <ApplicationStatus
            applications={applications}
            onCancel={handleCancel}
          />
          <InternshipLogPreview entries={mockLogEntries} totalHours={totalHours} />
        </motion.div>
      </div>
    </>
  );
}
