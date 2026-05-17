import { Check, X, Eye, UserPlus, Briefcase } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface Approval {
  id: string;
  type: string;
  user: string;
  userEmail?: string;
  target?: string;
  requestDate?: string;
  description?: string;
}

interface PendingApprovalsProps {
  approvals: Approval[];
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
          <CardTitle className="text-lg">Chờ phê duyệt</CardTitle>
          <span className="text-sm text-slate-500">
            {approvals.length} yêu cầu
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {approvals.length === 0 ? (
          <p className="text-center py-8 text-sm text-slate-500">
            Không có yêu cầu nào
          </p>
        ) : (
          <div className="space-y-4">
            {approvals.map((approval) => (
              <div
                key={approval.id}
                className="flex items-start justify-between gap-4 rounded-lg border border-slate-200 p-4"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarFallback className="text-xs bg-indigo-100 text-indigo-600">
                      {approval.type === "position" ? (
                        <Briefcase className="h-4 w-4" />
                      ) : (
                        <UserPlus className="h-4 w-4" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{approval.user}</p>
                    {approval.userEmail && (
                      <p className="text-sm text-slate-500 truncate">
                        {approval.userEmail}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-slate-500">
                      {approval.description || approval.target}
                    </p>
                    {approval.requestDate && (
                      <p className="mt-1 text-xs text-slate-400">
                        {new Date(approval.requestDate).toLocaleDateString("vi-VN")}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onViewDetails?.(approval.id)}
                    aria-label="Chi tiết"
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onApprove?.(approval.id)}
                    aria-label="Phê duyệt"
                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onReject?.(approval.id)}
                    aria-label="Từ chối"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
