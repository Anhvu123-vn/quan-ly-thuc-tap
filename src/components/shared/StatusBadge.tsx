import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { ApplicationStatus } from "@/types";

const statusVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
  {
    variants: {
      variant: {
        applied: "bg-blue-100/80 text-blue-700 border border-blue-200",
        screening: "bg-amber-100/80 text-amber-700 border border-amber-200",
        interview: "bg-purple-100/80 text-purple-700 border border-purple-200",
        offer: "bg-emerald-100/80 text-emerald-700 border border-emerald-200",
        rejected: "bg-red-100/80 text-red-700 border border-red-200",
      },
    },
    defaultVariants: {
      variant: "applied",
    },
  }
);

interface StatusBadgeProps extends VariantProps<typeof statusVariants> {
  status: ApplicationStatus;
  label?: string;
}

const statusLabels: Record<ApplicationStatus, string> = {
  applied: "Applied",
  screening: "Screening",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
};

export function StatusBadge({ status, label }: StatusBadgeProps) {
  return (
    <span className={cn(statusVariants({ variant: status }))}>
      {label || statusLabels[status]}
    </span>
  );
}
