import { cn } from "@/lib/utils";

// Status Badge Component
export type BadgeVariant = 
  | "default" 
  | "success" 
  | "warning" 
  | "danger" 
  | "info" 
  | "purple"
  | "amber"
  | "teal";

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: "sm" | "md";
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-slate-100 text-slate-600",
  success: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  warning: "bg-amber-50 text-amber-700 border border-amber-200",
  danger: "bg-red-50 text-red-700 border border-red-200",
  info: "bg-blue-50 text-blue-700 border border-blue-200",
  purple: "bg-violet-50 text-violet-700 border border-violet-200",
  amber: "bg-orange-50 text-orange-700 border border-orange-200",
  teal: "bg-teal-50 text-teal-700 border border-teal-200",
};

const sizeStyles = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-sm",
};

export function Badge({ children, variant = "default", size = "sm", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {children}
    </span>
  );
}

// Status Dot
export interface StatusDotProps {
  status: "online" | "offline" | "pending" | "busy";
  className?: string;
}

const dotColors: Record<string, string> = {
  online: "bg-emerald-500",
  offline: "bg-slate-300",
  pending: "bg-amber-500",
  busy: "bg-red-500",
};

export function StatusDot({ status, className }: StatusDotProps) {
  return (
    <span
      className={cn(
        "inline-block h-2 w-2 rounded-full",
        dotColors[status],
        className
      )}
    />
  );
}

// Role Badge
export interface RoleBadgeProps {
  role: "student" | "lecturer" | "company" | "admin";
  className?: string;
}

const roleConfig: Record<string, { label: string; variant: BadgeVariant }> = {
  student: { label: "Sinh viên", variant: "info" },
  lecturer: { label: "Giảng viên", variant: "purple" },
  company: { label: "Doanh nghiệp", variant: "amber" },
  admin: { label: "Quản trị", variant: "danger" },
};

export function RoleBadge({ role, className }: RoleBadgeProps) {
  const config = roleConfig[role] || { label: role, variant: "default" as BadgeVariant };
  return <Badge variant={config.variant} className={className}>{config.label}</Badge>;
}

// Application Status Badge
export type ApplicationStatusType =
  | "applied"
  | "screening"
  | "interview"
  | "offer"
  | "rejected"
  | "withdrawn"
  | "departmentApproved";

export interface ApplicationStatusBadgeProps {
  status: ApplicationStatusType;
  className?: string;
}

const applicationStatusConfig: Record<string, { label: string; variant: BadgeVariant }> = {
  applied: { label: "Đã nộp", variant: "default" },
  screening: { label: "Đang xét duyệt", variant: "warning" },
  interview: { label: "Phỏng vấn", variant: "info" },
  offer: { label: "Đề nghị", variant: "success" },
  rejected: { label: "Từ chối", variant: "danger" },
  withdrawn: { label: "Đã rút đơn", variant: "default" },
  departmentApproved: { label: "Chờ GV duyệt", variant: "purple" },
};

export function ApplicationStatusBadge({ status, className }: ApplicationStatusBadgeProps) {
  const config = applicationStatusConfig[status] || { label: status, variant: "default" as BadgeVariant };
  return <Badge variant={config.variant} className={className}>{config.label}</Badge>;
}
