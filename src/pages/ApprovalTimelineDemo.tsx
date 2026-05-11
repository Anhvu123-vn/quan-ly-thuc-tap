import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ApprovalTimeline } from "@/components/approval/ApprovalTimeline";
import type { ApprovalTimelineData } from "@/types";

// Mock data for demo
const mockInProgressData: ApprovalTimelineData = {
  submittedAt: "May 8, 2026",
  isRejected: false,
  steps: [
    {
      id: "submitted",
      title: "Application Submitted",
      description: "Your internship application has been submitted successfully.",
      status: "approved",
      reviewer: "System",
      reviewedAt: "May 8, 2026",
      comment: "Application received and logged.",
    },
    {
      id: "department",
      title: "Department Approval",
      description: "Your department head is reviewing your application.",
      status: "in_progress",
    },
    {
      id: "lecturer",
      title: "Lecturer Approval",
      description: "Your assigned lecturer will review your application.",
      status: "pending",
    },
    {
      id: "registrar",
      title: "Registrar Approval",
      description: "The registrar will give final approval.",
      status: "pending",
    },
  ],
};

const mockApprovedData: ApprovalTimelineData = {
  submittedAt: "May 1, 2026",
  isRejected: false,
  steps: [
    {
      id: "submitted",
      title: "Application Submitted",
      description: "Your internship application has been submitted successfully.",
      status: "approved",
      reviewer: "System",
      reviewedAt: "May 1, 2026",
    },
    {
      id: "department",
      title: "Department Approval",
      description: "Department head reviewed your application.",
      status: "approved",
      reviewer: "Dr. Nguyen Van A",
      reviewedAt: "May 3, 2026",
      comment: "Strong recommendation from the student.",
    },
    {
      id: "lecturer",
      title: "Lecturer Approval",
      description: "Assigned lecturer reviewed your application.",
      status: "approved",
      reviewer: "Prof. Tran Thi B",
      reviewedAt: "May 5, 2026",
      comment: "Excellent academic standing.",
    },
    {
      id: "registrar",
      title: "Registrar Approval",
      description: "Final approval from the registrar.",
      status: "approved",
      reviewer: "Office of Academic Affairs",
      reviewedAt: "May 7, 2026",
      comment: "All requirements met. Approved for internship.",
    },
  ],
};

const mockRejectedData: ApprovalTimelineData = {
  submittedAt: "April 25, 2026",
  isRejected: true,
  rejectedAt: "April 28, 2026",
  rejectionReason: "The internship position does not meet the minimum requirements for academic credit as specified in the university guidelines. Please refer to the internship handbook for eligible positions.",
  steps: [
    {
      id: "submitted",
      title: "Application Submitted",
      description: "Your internship application has been submitted.",
      status: "approved",
      reviewer: "System",
      reviewedAt: "April 25, 2026",
    },
    {
      id: "department",
      title: "Department Approval",
      description: "Department head reviewed your application.",
      status: "rejected",
      reviewer: "Dr. Le Van C",
      reviewedAt: "April 28, 2026",
      comment: "Position does not qualify for academic credit.",
    },
    {
      id: "lecturer",
      title: "Lecturer Approval",
      description: "Awaiting lecturer review.",
      status: "pending",
    },
    {
      id: "registrar",
      title: "Registrar Approval",
      description: "Awaiting registrar review.",
      status: "pending",
    },
  ],
};

const mockPendingData: ApprovalTimelineData = {
  submittedAt: "May 10, 2026",
  isRejected: false,
  steps: [
    {
      id: "submitted",
      title: "Application Submitted",
      description: "Your internship application has been submitted and is being processed.",
      status: "in_progress",
    },
    {
      id: "department",
      title: "Department Approval",
      description: "Awaiting department head review.",
      status: "pending",
    },
    {
      id: "lecturer",
      title: "Lecturer Approval",
      description: "Awaiting lecturer assignment and review.",
      status: "pending",
    },
    {
      id: "registrar",
      title: "Registrar Approval",
      description: "Awaiting final registrar approval.",
      status: "pending",
    },
  ],
};

export function ApprovalTimelineDemo() {
  return (
    <div className="min-h-screen bg-[--color-background] py-8 px-4">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Approval Timeline Component</h1>
          <p className="mt-2 text-[--color-muted-foreground]">
            Demonstration of different approval states
          </p>
        </div>

        {/* In Progress Example */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-blue-600">In Progress</CardTitle>
            <CardDescription>
              Application is currently being reviewed by the department
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ApprovalTimeline data={mockInProgressData} />
          </CardContent>
        </Card>

        {/* Pending Example */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-gray-600">Pending</CardTitle>
            <CardDescription>
              Application just submitted, awaiting initial review
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ApprovalTimeline data={mockPendingData} />
          </CardContent>
        </Card>

        {/* Approved Example */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-green-600">Approved</CardTitle>
            <CardDescription>
              All approvals completed successfully
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ApprovalTimeline data={mockApprovedData} />
          </CardContent>
        </Card>

        {/* Rejected Example */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-red-600">Rejected</CardTitle>
            <CardDescription>
              Application rejected at department level
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ApprovalTimeline data={mockRejectedData} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
