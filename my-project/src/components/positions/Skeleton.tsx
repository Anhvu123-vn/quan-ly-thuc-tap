import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function PositionCardSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("rounded-xl border border-slate-200 bg-white p-5 shadow-sm", className)}>
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-5 w-3/4 bg-gradient-to-r from-slate-100 to-slate-200 rounded-lg animate-pulse" />
          <div className="h-4 w-1/2 bg-gradient-to-r from-slate-100 to-slate-200 rounded-lg animate-pulse" />
        </div>
      </div>
      
      {/* Badges */}
      <div className="flex gap-2 mb-4">
        <div className="h-6 w-20 bg-gradient-to-r from-slate-100 to-slate-200 rounded-full animate-pulse" />
        <div className="h-6 w-24 bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-full animate-pulse" />
        <div className="h-6 w-20 bg-gradient-to-r from-slate-100 to-slate-200 rounded-full animate-pulse" />
      </div>
      
      {/* Description */}
      <div className="space-y-2 mb-4">
        <div className="h-4 w-full bg-gradient-to-r from-slate-100 to-slate-200 rounded animate-pulse" />
        <div className="h-4 w-2/3 bg-gradient-to-r from-slate-100 to-slate-200 rounded animate-pulse" />
      </div>
      
      {/* Footer */}
      <div className="flex justify-between items-center pt-4 border-t border-slate-100">
        <div className="h-4 w-24 bg-gradient-to-r from-slate-100 to-slate-200 rounded animate-pulse" />
        <div className="h-9 w-24 bg-gradient-to-r from-indigo-100 to-violet-100 rounded-xl animate-pulse" />
      </div>
    </div>
  );
}
