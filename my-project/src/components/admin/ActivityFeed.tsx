import { FileText, CheckCircle, XCircle, UserPlus, LogIn } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Activity {
  id: string;
  type: string;
  user?: string;
  action?: string;
  target?: string;
  time?: string;
  message?: string;
  timestamp?: string;
}

interface ActivityFeedProps {
  activities: Activity[];
  title?: string;
  maxItems?: number;
}

const activityIcons: Record<string, typeof FileText> = {
  submission: FileText,
  approval: CheckCircle,
  rejection: XCircle,
  user: UserPlus,
  login: LogIn,
  default: UserPlus,
};

const activityColors: Record<string, string> = {
  submission: "bg-blue-100 text-blue-600",
  approval: "bg-green-100 text-green-600",
  rejection: "bg-red-100 text-red-600",
  user: "bg-purple-100 text-purple-600",
  login: "bg-gray-100 text-gray-600",
  default: "bg-slate-100 text-slate-600",
};

export function ActivityFeed({ activities, title = "Hoạt động gần đây", maxItems }: ActivityFeedProps) {
  const displayActivities = maxItems ? activities.slice(0, maxItems) : activities;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayActivities.length === 0 ? (
            <p className="text-center py-8 text-sm text-slate-500">
              Chưa có hoạt động nào
            </p>
          ) : (
            displayActivities.map((activity) => {
              const Icon = activityIcons[activity.type] || activityIcons.default;
              const colorClass = activityColors[activity.type] || activityColors.default;
              const message = activity.message || `${activity.user || "Người dùng"} ${activity.action || "đã thực hiện"}`;
              const time = activity.timestamp || activity.time || "Gần đây";

              return (
                <div key={activity.id} className="flex items-start gap-3">
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                      colorClass
                    )}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{message}</p>
                    <p className="text-xs text-slate-500">
                      {activity.user || "Hệ thống"} · {time}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
