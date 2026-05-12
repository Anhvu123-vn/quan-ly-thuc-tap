import { Check, X, Clock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ApprovalStatus } from "@/types";

interface ApprovalStepProps {
  title: string;
  description: string;
  status: ApprovalStatus;
  reviewer?: string;
  reviewedAt?: string;
  comment?: string;
  isLast?: boolean;
}

const statusConfig = {
  pending: {
    icon: Clock,
    iconClass: "text-[--color-muted-foreground]",
    dotClass: "bg-[--color-border]",
    lineClass: "bg-[--color-border]",
    textClass: "text-[--color-muted-foreground]",
  },
  in_progress: {
    icon: Loader2,
    iconClass: "text-[--color-accent] animate-spin",
    dotClass: "bg-[--color-accent]",
    lineClass: "bg-[--color-border]",
    textClass: "text-[--color-foreground]",
  },
  approved: {
    icon: Check,
    iconClass: "text-white",
    dotClass: "bg-[--color-success]",
    lineClass: "bg-[--color-success]",
    textClass: "text-[--color-foreground]",
  },
  rejected: {
    icon: X,
    iconClass: "text-white",
    dotClass: "bg-[--color-destructive]",
    lineClass: "bg-[--color-destructive]",
    textClass: "text-[--color-destructive]",
  },
};

export function ApprovalStep({
  title,
  description,
  status,
  reviewer,
  reviewedAt,
  comment,
  isLast,
}: ApprovalStepProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className="flex gap-4">
      {/* Timeline indicator */}
      <div className="flex flex-col items-center">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
            status === "pending" && "border-2 border-[--color-border]",
            status === "in_progress" && "border-2 border-[--color-accent] bg-white",
            status === "approved" && "bg-[--color-success]",
            status === "rejected" && "bg-[--color-destructive]"
          )}
        >
          <Icon className={cn("h-5 w-5", config.iconClass)} aria-hidden="true" />
        </div>
        {/* Connector line */}
        {!isLast && (
          <div
            className={cn("h-full w-0.5 min-h-[80px]", config.lineClass)}
            aria-hidden="true"
          />
        )}
      </div>

      {/* Content */}
      <div className={cn("flex-1 pb-8", isLast && "pb-0")}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h4 className={cn("font-medium", config.textClass)}>{title}</h4>
            <p className="mt-1 text-sm text-[--color-muted-foreground]">
              {description}
            </p>
          </div>
          <ApprovalBadge status={status} />
        </div>

        {/* Review details */}
        {(reviewer || reviewedAt || comment) && (
          <div className="mt-4 rounded-lg border border-[--color-border] bg-[--color-muted] p-4">
            {reviewer && (
              <p className="text-sm">
                <span className="font-medium">Reviewer:</span> {reviewer}
              </p>
            )}
            {reviewedAt && (
              <p className="mt-1 text-sm text-[--color-muted-foreground]">
                Reviewed on {reviewedAt}
              </p>
            )}
            {comment && (
              <div className="mt-3">
                <p className="text-sm font-medium">Comment:</p>
                <p className="mt-1 text-sm text-[--color-muted-foreground] italic">
                  "{comment}"
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ApprovalBadge({ status }: { status: ApprovalStatus }) {
  const badgeConfig = {
    pending: { label: "Pending", className: "bg-gray-100 text-gray-600" },
    in_progress: { label: "In Progress", className: "bg-blue-50 text-blue-700" },
    approved: { label: "Approved", className: "bg-green-50 text-green-700" },
    rejected: { label: "Rejected", className: "bg-red-50 text-red-700" },
  };

  const config = badgeConfig[status];

  return (
    <span className={cn("inline-flex items-center rounded-md px-2 py-1 text-xs font-medium", config.className)}>
      {config.label}
    </span>
  );
}
