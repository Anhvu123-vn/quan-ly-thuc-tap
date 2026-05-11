import { Check, X, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { PendingApproval } from "@/types";

interface PendingApprovalsProps {
  approvals: PendingApproval[];
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onViewDetails?: (id: string) => void;
}

export function PendingApprovals({
  approvals,
  onApprove,
  onReject,
  onViewDetails,
}: PendingApprovalsProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Pending Approvals</CardTitle>
          <span className="text-sm text-[--color-muted-foreground]">
            {approvals.length} pending
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {approvals.length === 0 ? (
          <p className="text-center py-8 text-sm text-[--color-muted-foreground]">
            No pending approvals
          </p>
        ) : (
          <div className="space-y-4">
            {approvals.map((approval) => (
              <div
                key={approval.id}
                className="flex items-start justify-between gap-4 rounded-lg border border-[--color-border] p-4"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarFallback className="text-xs">
                      {approval.studentName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{approval.studentName}</p>
                    <p className="text-sm text-[--color-muted-foreground] truncate">
                      {approval.position} at {approval.company}
                    </p>
                    <p className="mt-1 text-xs text-[--color-muted-foreground]">
                      {approval.submittedDate}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onViewDetails?.(approval.id)}
                    aria-label="View details"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                    onClick={() => onApprove?.(approval.id)}
                    aria-label="Approve"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => onReject?.(approval.id)}
                    aria-label="Reject"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
