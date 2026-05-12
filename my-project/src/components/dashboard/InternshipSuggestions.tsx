import { MapPin, Clock, ExternalLink, Info, Ban } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MatchScore } from "@/components/shared/MatchScore";
import { motion } from "framer-motion";
import type { Internship } from "@/types";

interface InternshipSuggestionsProps {
  internships: Internship[];
  applyDisabled?: boolean;
}

// Skill badge colors
const skillColors: Record<string, { bg: string; text: string; border: string }> = {
  React: { bg: "bg-sky-100", text: "text-sky-700", border: "border-sky-200" },
  "Node.js": { bg: "bg-green-100", text: "text-green-700", border: "border-green-200" },
  TypeScript: { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200" },
  Python: { bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-200" },
  JavaScript: { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200" },
  Vue: { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200" },
  Angular: { bg: "bg-red-100", text: "text-red-700", border: "border-red-200" },
  "React Native": { bg: "bg-cyan-100", text: "text-cyan-700", border: "border-cyan-200" },
  "Next.js": { bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-200" },
};

// Mock skills for demo
const mockSkills = ["React", "TypeScript", "Node.js"];

function getSkillBadge(skill: string) {
  return skillColors[skill] || { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-200" };
}

export function InternshipSuggestions({ internships, applyDisabled = false }: InternshipSuggestionsProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[--color-primary] animate-pulse" />
            Recommended for You
          </CardTitle>
          <Button variant="ghost" size="sm" className="text-xs font-medium hover:text-[--color-primary]">
            View all
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {internships.map((internship, index) => (
            <motion.div
              key={internship.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -2 }}
              className="group relative flex flex-col gap-4 rounded-xl border border-[--color-border] bg-white p-5 shadow-sm transition-all duration-200 hover:border-[--color-primary]/30 hover:shadow-lg hover:shadow-[--color-primary]/10 sm:flex-row sm:items-center sm:justify-between"
            >
              {/* Glow effect on hover */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[--color-primary]/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
              
              <div className="flex-1 min-w-0 relative">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-semibold text-[--color-foreground] group-hover:text-[--color-primary] transition-colors">
                    {internship.position}
                  </h4>
                  <MatchScore score={internship.matchScore} showLabel={false} />
                </div>
                <p className="text-sm text-[--color-muted-foreground] font-medium">
                  {internship.company}
                </p>
                
                {/* Skills badges */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {mockSkills.map((skill) => {
                    const colors = getSkillBadge(skill);
                    return (
                      <span
                        key={skill}
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${colors.bg} ${colors.text} ${colors.border}`}
                      >
                        {skill}
                      </span>
                    );
                  })}
                </div>
                
                <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-[--color-muted-foreground]">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" aria-hidden="true" />
                    {internship.location}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" aria-hidden="true" />
                    {internship.duration}
                  </span>
                  <span className="text-xs text-[--color-muted-foreground]/70">
                    {internship.postedDate}
                  </span>
                </div>
              </div>
              
              {/* Constraint warning banner */}
              {applyDisabled && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl mb-3">
                  <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700 leading-relaxed">
                    Bạn đã có đơn đang chờ giảng viên duyệt. Vui lòng chờ kết quả trước khi nộp thêm đơn khác.
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
      </CardContent>
    </Card>
  );
}
