import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { StatCard as StatCardType } from "@/types";

interface StatsCardProps {
  stat: StatCardType;
}

export function StatsCard({ stat }: StatsCardProps) {
  const TrendIcon = stat.trend === 'up' ? TrendingUp : stat.trend === 'down' ? TrendingDown : Minus;
  
  const trendColors = {
    up: "text-green-600",
    down: "text-red-600",
    neutral: "text-[--color-muted-foreground]",
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-[--color-muted-foreground]">
              {stat.title}
            </p>
            <p className="mt-2 text-3xl font-bold">{stat.value}</p>
            {stat.change && (
              <div className={cn("mt-2 flex items-center gap-1 text-sm", trendColors[stat.trend || 'neutral'])}>
                <TrendIcon className="h-4 w-4" aria-hidden="true" />
                <span>{stat.change}</span>
                <span className="text-[--color-muted-foreground]">vs last month</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface StatsGridProps {
  stats: StatCardType[];
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <StatsCard key={stat.title} stat={stat} />
      ))}
    </div>
  );
}
