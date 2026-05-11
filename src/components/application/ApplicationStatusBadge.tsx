import { cn } from "@/lib/utils";

export type WorkflowStatus = 
  | 'draft' 
  | 'submitted' 
  | 'department_review' 
  | 'lecturer_review' 
  | 'registrar_review' 
  | 'approved' 
  | 'rejected';

interface ApplicationStatusBadgeProps {
  status: WorkflowStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const statusConfig: Record<WorkflowStatus, { 
  label: string; 
  className: string; 
  dotClass: string;
}> = {
  draft: {
    label: 'Draft',
    className: 'bg-gray-100 text-gray-700 border-gray-200',
    dotClass: 'bg-gray-400',
  },
  submitted: {
    label: 'Submitted',
    className: 'bg-blue-50 text-blue-700 border-blue-200',
    dotClass: 'bg-blue-500',
  },
  department_review: {
    label: 'Department Review',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
    dotClass: 'bg-amber-500',
  },
  lecturer_review: {
    label: 'Lecturer Review',
    className: 'bg-purple-50 text-purple-700 border-purple-200',
    dotClass: 'bg-purple-500',
  },
  registrar_review: {
    label: 'Registrar Review',
    className: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    dotClass: 'bg-indigo-500',
  },
  approved: {
    label: 'Approved',
    className: 'bg-green-50 text-green-700 border-green-200',
    dotClass: 'bg-green-500',
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-red-50 text-red-700 border-red-200',
    dotClass: 'bg-red-500',
  },
};

const sizeConfig = {
  sm: 'text-xs px-2 py-0.5 gap-1',
  md: 'text-sm px-2.5 py-1 gap-1.5',
  lg: 'text-base px-3 py-1.5 gap-2',
};

export function ApplicationStatusBadge({ 
  status, 
  size = 'md',
  showIcon = true 
}: ApplicationStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-md border",
        config.className,
        sizeConfig[size]
      )}
    >
      {showIcon && (
        <span 
          className={cn("h-2 w-2 rounded-full", config.dotClass)}
          aria-hidden="true"
        />
      )}
      {config.label}
    </span>
  );
}

// Compact dot indicator for lists
export function StatusDot({ status }: { status: WorkflowStatus }) {
  const config = statusConfig[status];
  return (
    <span 
      className={cn("h-2.5 w-2.5 rounded-full inline-block", config.dotClass)}
      aria-label={config.label}
    />
  );
}
