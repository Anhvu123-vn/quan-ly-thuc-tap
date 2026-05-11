import { Calendar, XCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ApplicationStatusBadge } from "@/components/shared/Badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Application } from "@/data/mockData";
import { useState } from "react";

interface ApplicationStatusProps {
  applications: Application[];
  onCancel?: (id: string) => void;
  onViewDetails?: (id: string) => void;
}

export function ApplicationStatus({ applications, onCancel, onViewDetails }: ApplicationStatusProps) {
  const [cancelTarget, setCancelTarget] = useState<Application | null>(null);

  const statusCounts = applications.reduce(
    (acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const handleCancel = () => {
    if (cancelTarget && onCancel) {
      onCancel(cancelTarget.id);
    }
    setCancelTarget(null);
  };

  const canBeCancelled = (status: Application["status"]) => {
    return status === "applied" || status === "screening";
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[--color-primary] animate-pulse" />
              Đơn ứng tuyển của tôi
            </CardTitle>
            <span className="text-sm font-medium text-[--color-muted-foreground]">
              {applications.length} đơn
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {applications.slice(0, 4).map((app, index) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "flex items-center justify-between rounded-xl border bg-white p-4 transition-all duration-200 hover:shadow-md",
                  canBeCancelled(app.status)
                    ? "hover:border-[--color-primary]/30"
                    : "opacity-75"
                )}
              >
                <div className="min-w-0 flex-1 pr-4">
                  <p className="font-semibold truncate text-sm">{app.position}</p>
                  <p className="text-xs text-[--color-muted-foreground] truncate mt-0.5">
                    {app.company}
                  </p>
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-[--color-muted-foreground]">
                    <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                    {app.appliedDate}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <ApplicationStatusBadge status={app.status} />

                  {/* Hủy đơn button — chỉ hiện khi status = applied hoặc screening */}
                  {canBeCancelled(app.status) && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setCancelTarget(app)}
                      className="h-7 px-2 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 border border-red-200"
                      title="Rút đơn ứng tuyển"
                    >
                      <XCircle className="h-3.5 w-3.5 mr-1" />
                      Hủy đơn
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}

            {applications.length === 0 && (
              <div className="text-center py-6">
                <p className="text-sm text-slate-400">Bạn chưa nộp đơn ứng tuyển nào</p>
              </div>
            )}
          </div>

          {/* Status summary */}
          <div className="mt-5 pt-4 border-t border-[--color-border]">
            <p className="text-xs font-semibold text-[--color-muted-foreground] mb-3 uppercase tracking-wider">
              Tổng quan trạng thái
            </p>
            <div className="flex flex-wrap gap-3">
              {Object.entries(statusCounts).map(([status, count]) => (
                <div
                  key={status}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[--color-muted]/50 border border-[--color-border]/50"
                >
                  <ApplicationStatusBadge status={status as Application["status"]} />
                  <span className="text-sm font-bold text-[--color-foreground]">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancel}
        title="Rút đơn ứng tuyển"
        description={`Bạn có chắc muốn rút đơn ứng tuyển "${cancelTarget?.position}" tại "${cancelTarget?.company}"? Hành động này không thể hoàn tác.`}
        confirmLabel="Rút đơn"
        cancelLabel="Giữ đơn"
        variant="warning"
      />
    </>
  );
}
