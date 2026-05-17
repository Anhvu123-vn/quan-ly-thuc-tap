import { TrendingUp, TrendingDown, Minus, Users, GraduationCap, BookOpen, Building2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Stat {
  title: string;
  value: number;
  change?: number;
  changeType?: "increase" | "decrease";
  icon?: string;
  color?: string;
  trend?: "up" | "down" | "neutral";
}

interface StatsCardProps {
  stat: Stat;
}

const iconMap: Record<string, { icon: React.ComponentType<any>; bg: string; text: string }> = {
  users: { icon: Users, bg: "bg-indigo-100", text: "text-indigo-600" },
  graduation: { icon: GraduationCap, bg: "bg-blue-100", text: "text-blue-600" },
  lecturer: { icon: BookOpen, bg: "bg-purple-100", text: "text-purple-600" },
  building: { icon: Building2, bg: "bg-amber-100", text: "text-amber-600" },
};

export function StatsCard({ stat }: StatsCardProps) {
  const TrendIcon = stat.trend === 'up' ? TrendingUp : stat.trend === 'down' ? TrendingDown : Minus;

  const trendColors = {
    up: "text-green-600",
    down: "text-red-600",
    neutral: "text-slate-500",
  };

  const iconConfig = iconMap[stat.icon || ''] || iconMap.users;
  const Icon = iconConfig.icon;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl shrink-0", iconConfig.bg)}>
            <Icon className={cn("h-6 w-6", iconConfig.text)} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">
              {stat.title}
            </p>
            <p className="mt-2 text-3xl font-bold">{stat.value}</p>
            {stat.change && (
              <div className={cn("mt-2 flex items-center gap-1 text-sm", trendColors[stat.trend || 'neutral'])}>
                <TrendIcon className="h-4 w-4" aria-hidden="true" />
                <span>{stat.change}%</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface StatsGridProps {
  stats: Stat[];
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <StatsCard key={`${stat.title}-${index}`} stat={stat} />
      ))}
    </div>
  );
}
