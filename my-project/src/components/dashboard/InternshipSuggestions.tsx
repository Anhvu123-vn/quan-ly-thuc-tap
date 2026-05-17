import { useState, useEffect } from "react";
import { MapPin, Clock, ExternalLink, Info, Ban, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MatchScore } from "@/components/shared/MatchScore";
import { motion } from "framer-motion";
import { api } from "@/services/api";

interface Position {
  id: string;
  title: string;
  company?: {
    name: string;
  };
  location?: string;
  duration?: string;
  postedDate?: string;
  workType?: string;
}

interface InternshipSuggestionsProps {
  applyDisabled?: boolean;
}

const durationLabels: Record<string, string> = {
  one_month: "1 tháng",
  two_three_months: "2-3 tháng",
  four_six_months: "4-6 tháng",
  six_plus_months: "6+ tháng",
};

const workTypeLabels: Record<string, string> = {
  remote: "Remote",
  hybrid: "Hybrid",
  onsite: "On-site",
};

export function InternshipSuggestions({ applyDisabled = false }: InternshipSuggestionsProps) {
  const [positions, setPositions] = useState<Position[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPositions = async () => {
      try {
        const data = await api.getPositions({ limit: 5 });
        setPositions(data.data || []);
      } catch (err) {
        console.error("Failed to fetch positions:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPositions();
  }, []);

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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[--color-primary] animate-pulse" />
            Vị trí thực tập
          </CardTitle>
          <Button variant="ghost" size="sm" className="text-xs font-medium hover:text-[--color-primary]">
            Xem tất cả
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 text-indigo-500 animate-spin" />
          </div>
        ) : positions.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <p>Chưa có vị trí thực tập nào</p>
          </div>
        ) : (
          <div className="space-y-4">
            {positions.map((position, index) => (
              <motion.div
                key={position.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative flex flex-col gap-4 rounded-xl border border-[--color-border] bg-white p-5 shadow-sm transition-all duration-200 hover:border-[--color-primary]/30 hover:shadow-lg hover:shadow-[--color-primary]/10 sm:flex-row sm:items-center sm:justify-between"
              >
                {/* Glow effect on hover */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[--color-primary]/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
                
                <div className="flex-1 min-w-0 relative">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-[--color-foreground] group-hover:text-[--color-primary] transition-colors">
                      {position.title}
                    </h4>
                    <MatchScore score={75} showLabel={false} />
                  </div>
                  <p className="text-sm text-[--color-muted-foreground] font-medium">
                    {position.company?.name || "Công ty"}
                  </p>
                  
                  <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-[--color-muted-foreground]">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" aria-hidden="true" />
                      {position.location || "Không rõ"}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4" aria-hidden="true" />
                      {durationLabels[position.duration || ""] || position.duration || "Không rõ"}
                    </span>
                    {position.workType && (
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-xs">
                        {workTypeLabels[position.workType] || position.workType}
                      </span>
                    )}
                    <span className="text-xs text-[--color-muted-foreground]/70">
                      {formatDate(position.postedDate)}
                    </span>
                  </div>
                </div>
                
                {/* Constraint warning banner */}
                {applyDisabled && (
                  <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl mb-3 sm:hidden">
                    <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700 leading-relaxed">
                      Bạn đã có đơn đang chờ giảng viên duyệt.
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-3 sm:flex-shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={applyDisabled}
                    className="gap-1.5 group/btn hover:border-[--color-primary] hover:text-[--color-primary]"
                    title={
                      applyDisabled
                        ? "Bạn đã có đơn đang chờ giảng viên duyệt"
                        : "Ứng tuyển ngay"
                    }
                  >
                    <span>{applyDisabled ? "Không thể ứng tuyển" : "Ứng tuyển"}</span>
                    {applyDisabled ? (
                      <Ban className="h-3.5 w-3.5" />
                    ) : (
                      <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5" aria-hidden="true" />
                    )}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
