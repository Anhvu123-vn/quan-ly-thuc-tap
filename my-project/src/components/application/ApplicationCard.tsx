import { cn } from "@/lib/utils";
import type { WorkflowStatus } from "./ApplicationStatusBadge";

interface ApplicationCardProps {
  application: {
    studentName: string;
    studentEmail: string;
    position: string;
    company: string;
    status: WorkflowStatus;
    appliedDate: string;
    avatar?: string;
  };
  onClick?: () => void;
  compact?: boolean;
}

export function ApplicationCard({ application, onClick, compact }: ApplicationCardProps) {
  const { studentName, studentEmail, position, company, status, appliedDate, avatar } = application;

  if (compact) {
    return (
      <div 
        className={cn(
          "flex items-center gap-3 p-3 rounded-lg border border-[--color-border] bg-white hover:bg-[--color-muted] transition-colors cursor-pointer",
          onClick && "cursor-pointer"
        )}
        onClick={onClick}
      >
        {/* Avatar */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[--color-muted] text-sm font-medium text-[--color-muted-foreground]">
          {avatar ? (
            <img src={avatar} alt="" className="h-full w-full rounded-full object-cover" />
          ) : (
            studentName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{studentName}</p>
          <p className="text-xs text-[--color-muted-foreground] truncate">{position}</p>
        </div>

        {/* Date */}
        <div className="text-xs text-[--color-muted-foreground] shrink-0">
          {appliedDate}
        </div>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "rounded-lg border border-[--color-border] bg-white p-4 hover:shadow-md transition-shadow",
        onClick && "cursor-pointer"
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[--color-muted] text-sm font-semibold text-[--color-muted-foreground]">
          {avatar ? (
            <img src={avatar} alt="" className="h-full w-full rounded-full object-cover" />
          ) : (
            studentName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold truncate">{studentName}</h3>
              <p className="text-sm text-[--color-muted-foreground] truncate">{studentEmail}</p>
            </div>
            <ApplicationStatusInline status={status} />
          </div>

          <div className="mt-3 space-y-1">
            <p className="text-sm">
              <span className="font-medium">Position:</span>{' '}
              <span className="text-[--color-muted-foreground]">{position}</span>
            </p>
            <p className="text-sm">
              <span className="font-medium">Company:</span>{' '}
              <span className="text-[--color-muted-foreground]">{company}</span>
            </p>
          </div>

          <p className="mt-3 text-xs text-[--color-muted-foreground]">
            Applied on {appliedDate}
          </p>
        </div>
      </div>
    </div>
  );
}

function ApplicationStatusInline({ status }: { status: WorkflowStatus }) {
  const statusLabels: Record<WorkflowStatus, string> = {
    draft: 'Draft',
    submitted: 'Submitted',
    department_review: 'Dept Review',
    lecturer_review: 'Lecturer Review',
    registrar_review: 'Registrar Review',
    approved: 'Approved',
    rejected: 'Rejected',
  };

  const statusColors: Record<WorkflowStatus, string> = {
    draft: 'bg-gray-100 text-gray-600',
    submitted: 'bg-blue-50 text-blue-700',
    department_review: 'bg-amber-50 text-amber-700',
    lecturer_review: 'bg-purple-50 text-purple-700',
    registrar_review: 'bg-indigo-50 text-indigo-700',
    approved: 'bg-green-50 text-green-700',
    rejected: 'bg-red-50 text-red-700',
  };

  return (
    <span className={cn("inline-flex px-2 py-0.5 rounded text-xs font-medium", statusColors[status])}>
      {statusLabels[status]}
    </span>
  );
}
