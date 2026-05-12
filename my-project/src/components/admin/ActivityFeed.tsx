import { FileText, CheckCircle, XCircle, UserPlus, LogIn } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Activity, ActivityType } from "@/types";

interface ActivityFeedProps {
  activities: Activity[];
  title?: string;
  maxItems?: number;
}

const activityIcons: Record<ActivityType, typeof FileText> = {
  submission: FileText,
  approval: CheckCircle,
  rejection: XCircle,
  user: UserPlus,
  login: LogIn,
};

const activityColors: Record<ActivityType, string> = {
  submission: "bg-blue-100 text-blue-600",
  approval: "bg-green-100 text-green-600",
  rejection: "bg-red-100 text-red-600",
  user: "bg-purple-100 text-purple-600",
  login: "bg-gray-100 text-gray-600",
};

export function ActivityFeed({ activities, title = "Recent Activity", maxItems }: ActivityFeedProps) {
  const displayActivities = maxItems ? activities.slice(0, maxItems) : activities;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayActivities.map((activity) => {
            const Icon = activityIcons[activity.type];
            const colorClass = activityColors[activity.type];

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
                  <p className="text-sm">{activity.message}</p>
                  <p className="text-xs text-[--color-muted-foreground]">
                    {activity.user} · {activity.timestamp}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
