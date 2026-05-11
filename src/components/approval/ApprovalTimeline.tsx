import { AlertCircle } from "lucide-react";
import { ApprovalStep } from "./ApprovalStep";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ApprovalStep as ApprovalStepType, ApprovalTimelineData } from "@/types";

interface ApprovalTimelineProps {
  data: ApprovalTimelineData;
}

// Default approval steps structure
export const DEFAULT_APPROVAL_STEPS: ApprovalStepType[] = [
  {
    id: "submitted",
    title: "Application Submitted",
    description: "Your internship application has been submitted and is awaiting review.",
    status: "pending",
  },
  {
    id: "department",
    title: "Department Approval",
    description: "Your department head is reviewing your application.",
    status: "pending",
  },
  {
    id: "lecturer",
    title: "Lecturer Approval",
    description: "Your assigned lecturer is reviewing your application.",
    status: "pending",
  },
  {
    id: "registrar",
    title: "Registrar Approval",
    description: "The registrar is giving final approval for your internship.",
    status: "pending",
  },
];

export function ApprovalTimeline({ data }: ApprovalTimelineProps) {
  const { steps, submittedAt, isRejected, rejectionReason, rejectedAt } = data;

  // Calculate progress percentage
  const approvedCount = steps.filter((s) => s.status === "approved").length;
  const progressPercentage = Math.round((approvedCount / (steps.length - 1)) * 100);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Approval Progress</CardTitle>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">{progressPercentage}%</span>
            <div className="h-2 w-32 rounded-full bg-[--color-muted]">
              <div
                className="h-2 rounded-full bg-[--color-accent] transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
                role="progressbar"
                aria-valuenow={progressPercentage}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
          </div>
        </div>
        <p className="text-sm text-[--color-muted-foreground]">
          Submitted on {submittedAt}
        </p>
      </CardHeader>

      <CardContent>
        {isRejected ? (
          <RejectedBanner reason={rejectionReason} rejectedAt={rejectedAt} />
        ) : (
          <VerticalTimeline steps={steps} />
        )}
      </CardContent>
    </Card>
  );
}

function VerticalTimeline({ steps }: { steps: ApprovalStepType[] }) {
  return (
    <div className="space-y-0">
      {steps.map((step, index) => (
        <ApprovalStep
          key={step.id}
          title={step.title}
          description={step.description}
          status={step.status}
          reviewer={step.reviewer}
          reviewedAt={step.reviewedAt}
          comment={step.comment}
          isLast={index === steps.length - 1}
        />
      ))}
    </div>
  );
}

function RejectedBanner({ reason, rejectedAt }: { reason?: string; rejectedAt?: string }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
          <AlertCircle className="h-5 w-5 text-red-600" aria-hidden="true" />
        </div>
        <div>
          <h4 className="font-semibold text-red-800">Application Rejected</h4>
          {rejectedAt && (
            <p className="mt-1 text-sm text-red-600">
              Rejected on {rejectedAt}
            </p>
          )}
          {reason && (
            <div className="mt-3">
              <p className="text-sm font-medium text-red-800">Reason:</p>
              <p className="mt-1 text-sm text-red-700">{reason}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Compact version for dashboard display
export function ApprovalTimelineCompact({ data }: { data: ApprovalTimelineData }) {
  const { steps, isRejected } = data;
  const currentStep = steps.find((s) => s.status === "in_progress" || s.status === "approved");
  const status = isRejected ? "rejected" : currentStep?.status || "pending";

  const statusLabels = {
    pending: "Awaiting Submission",
    in_progress: "Under Review",
    approved: "Approved",
    rejected: "Rejected",
  };

  return (
    <div className="flex items-center gap-3">
      <ApprovalStatusDot status={status} />
      <div>
        <p className="text-sm font-medium">{statusLabels[status]}</p>
        {currentStep && (
          <p className="text-xs text-[--color-muted-foreground]">{currentStep.title}</p>
        )}
      </div>
    </div>
  );
}

function ApprovalStatusDot({ status }: { status: "pending" | "in_progress" | "approved" | "rejected" }) {
  const colors = {
    pending: "bg-gray-300",
    in_progress: "bg-blue-500 animate-pulse",
    approved: "bg-green-500",
    rejected: "bg-red-500",
  };

  return <div className={cn("h-3 w-3 rounded-full", colors[status])} aria-hidden="true" />;
}
