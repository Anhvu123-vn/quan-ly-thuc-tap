import { Link } from "react-router-dom";
import { MapPin, Clock, DollarSign, Briefcase, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MatchScore } from "@/components/shared/MatchScore";
import { motion } from "framer-motion";
import type { Position } from "@/types";

interface PositionCardProps {
  position: Position;
  onApply?: (id: string) => void;
  isAuthenticated?: boolean;
}

const durationLabels: Record<string, string> = {
  one_month: "1 tháng",
  two_three_months: "2-3 tháng",
  four_six_months: "4-6 tháng",
  six_plus_months: "6+ tháng",
};

export function PositionCard({ position, onApply, isAuthenticated }: PositionCardProps) {
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Hôm nay";
    if (diffDays === 1) return "Hôm qua";
    if (diffDays < 7) return `${diffDays} ngày trước`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
    return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
  };

  const getDurationLabel = (duration?: string) => {
    return durationLabels[duration || ""] || duration || "";
  };

  const formatSalary = () => {
    if (position.salary) return position.salary;
    if (position.salaryMin || position.salaryMax) {
      const min = position.salaryMin?.toLocaleString() || "";
      const max = position.salaryMax?.toLocaleString() || "";
      if (min && max) return `${min} - ${max}`;
      if (min) return `Từ ${min}`;
      if (max) return `Đến ${max}`;
    }
    return null;
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="group h-full flex flex-col overflow-hidden hover:shadow-xl hover:shadow-slate-900/5 transition-all duration-300 border-[--color-border] hover:border-[--color-primary]/30">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* Company logo placeholder with gradient */}
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[--color-primary]/10 to-purple-500/10 text-sm font-bold text-[--color-primary] border border-[--color-primary]/20">
                {position.company.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <Link to={`/positions/${position.id}`}>
                  <h3 className="font-semibold leading-tight text-[--color-foreground] group-hover:text-[--color-primary] transition-colors duration-200 line-clamp-1">
                    {position.title}
                  </h3>
                </Link>
                <p className="text-sm text-[--color-muted-foreground] truncate">
                  {position.company}
                </p>
              </div>
            </div>
            {isAuthenticated && <MatchScore score={Math.floor(Math.random() * 30) + 70} />}
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col">
          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            {position.location && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[--color-border] bg-[--color-muted]/50 px-3 py-1 text-xs font-medium text-[--color-muted-foreground]">
                <MapPin className="h-3 w-3" aria-hidden="true" />
                {position.location}
              </span>
            )}
            {position.duration && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[--color-primary]/10 px-3 py-1 text-xs font-medium text-[--color-primary] border border-[--color-primary]/20">
                <Clock className="h-3 w-3" aria-hidden="true" />
                {getDurationLabel(position.duration)}
              </span>
            )}
            {position.field && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[--color-border] bg-[--color-muted]/50 px-3 py-1 text-xs font-medium text-[--color-muted-foreground]">
                <Briefcase className="h-3 w-3" aria-hidden="true" />
                {position.field}
              </span>
            )}
            {formatSalary() && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 border border-emerald-200">
                <DollarSign className="h-3 w-3" aria-hidden="true" />
                {formatSalary()}
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-sm text-[--color-muted-foreground] line-clamp-2 flex-1 leading-relaxed">
            {position.description}
          </p>

          {/* Footer */}
          <div className="mt-4 flex items-center justify-between gap-3 pt-4 border-t border-[--color-border]/50">
            <span className="text-xs text-[--color-muted-foreground]">
              Đăng {formatDate(position.postedDate)}
            </span>
            <Button 
              size="sm" 
              onClick={() => onApply?.(position.id)}
              className="group/btn gap-1"
            >
              <span>Ứng tuyển</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-1" aria-hidden="true" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
