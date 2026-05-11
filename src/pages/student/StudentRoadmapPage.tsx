import { useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Target, Zap, ChevronRight } from "lucide-react";
import { mockPositions, SKILLS } from "@/data/mockData";
import { Badge } from "@/components/shared/Badge";
import { cn } from "@/lib/utils";

// Calculate skill match between student and job requirements
function calculateSkillMatch(studentSkills: string[], requiredSkills: string[]): number {
  if (requiredSkills.length === 0) return 0;
  const matched = requiredSkills.filter((req) =>
    studentSkills.some((s) => s.toLowerCase().includes(req.toLowerCase()))
  ).length;
  return Math.round((matched / requiredSkills.length) * 100);
}

// Find skill gaps
function getSkillGaps(studentSkills: string[], requiredSkills: string[]): string[] {
  return requiredSkills.filter(
    (req) => !studentSkills.some((s) => s.toLowerCase().includes(req.toLowerCase()))
  );
}

// Mock student skills
const studentSkills = ["react", "typescript", "nodejs", "git", "sql"];

export function StudentRoadmapPage() {
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null);

  // Calculate match for each position
  const positionsWithMatch = mockPositions.map((pos) => ({
    ...pos,
    matchScore: calculateSkillMatch(studentSkills, pos.requirements),
    skillGaps: getSkillGaps(studentSkills, pos.requirements),
  }));

  // Sort by match score
  const sortedPositions = positionsWithMatch.sort((a, b) => b.matchScore - a.matchScore);

  // Group skills by category
  const skillCategories = SKILLS.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, typeof SKILLS>);

  const selected = positionsWithMatch.find((p) => p.id === selectedPosition);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Lộ trình phát triển</h1>
        <p className="text-slate-500 mt-1">Khám phá kỹ năng cần thiết từ các vị trí bạn quan tâm</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Job Positions */}
        <div className="space-y-4">
          <h2 className="font-semibold text-slate-900 flex items-center gap-2">
            <Target className="h-5 w-5 text-indigo-500" />
            Vị trí quan tâm
          </h2>
          <div className="space-y-3">
            {sortedPositions.map((position, index) => (
              <motion.div
                key={position.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedPosition(position.id)}
                className={cn(
                  "bg-white rounded-xl border p-4 cursor-pointer transition-all",
                  selectedPosition === position.id
                    ? "border-indigo-500 shadow-lg shadow-indigo-500/10"
                    : "border-slate-200 hover:border-slate-300"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h3 className="font-medium text-slate-900">{position.title}</h3>
                    <p className="text-sm text-slate-500 mt-0.5">{position.company}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <div
                      className={cn(
                        "h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm",
                        position.matchScore >= 70
                          ? "bg-emerald-100 text-emerald-600"
                          : position.matchScore >= 40
                          ? "bg-amber-100 text-amber-600"
                          : "bg-red-100 text-red-600"
                      )}
                    >
                      {position.matchScore}%
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {position.requirements.map((req) => (
                    <Badge key={req} variant="default" size="sm">
                      {req}
                    </Badge>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Skill Gap Analysis */}
        <div className="space-y-4">
          {selected ? (
            <>
              <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-500" />
                Phân tích kỹ năng
              </h2>

              {/* Current Match */}
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-slate-600">Độ khớp hiện tại</span>
                  <span
                    className={cn(
                      "text-lg font-bold",
                      selected.matchScore >= 70
                        ? "text-emerald-600"
                        : selected.matchScore >= 40
                        ? "text-amber-600"
                        : "text-red-600"
                    )}
                  >
                    {selected.matchScore}%
                  </span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${selected.matchScore}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={cn(
                      "h-full rounded-full",
                      selected.matchScore >= 70
                        ? "bg-gradient-to-r from-emerald-400 to-emerald-500"
                        : selected.matchScore >= 40
                        ? "bg-gradient-to-r from-amber-400 to-amber-500"
                        : "bg-gradient-to-r from-red-400 to-red-500"
                    )}
                  />
                </div>
              </div>

              {/* Skills Gap */}
              {selected.skillGaps.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <h3 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-red-500" />
                    Kỹ năng cần bổ sung
                  </h3>
                  <div className="space-y-2">
                    {selected.skillGaps.map((gap) => (
                      <div
                        key={gap}
                        className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100"
                      >
                        <span className="text-sm font-medium text-red-700">{gap}</span>
                        <Badge variant="danger" size="sm">
                          Cần học
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Matched Skills */}
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h3 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-emerald-500" />
                  Kỹ năng đã có
                </h3>
                <div className="flex flex-wrap gap-2">
                  {studentSkills
                    .filter((s) =>
                      selected.requirements.some((req) =>
                        req.toLowerCase().includes(s.toLowerCase())
                      )
                    )
                    .map((skillId) => {
                      const skill = SKILLS.find((s) => s.id === skillId);
                      return (
                        <Badge key={skillId} variant="success" size="sm">
                          {skill?.name || skillId}
                        </Badge>
                      );
                    })}
                </div>
              </div>

              {/* Learning Path */}
              <div className="bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl p-5 text-white">
                <h3 className="font-semibold mb-3">Lộ trình học tập đề xuất</h3>
                <div className="space-y-2">
                  {selected.skillGaps.slice(0, 3).map((gap, i) => (
                    <div key={gap} className="flex items-center gap-3">
                      <span className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center text-sm font-medium">
                        {i + 1}
                      </span>
                      <span className="text-sm">{gap}</span>
                    </div>
                  ))}
                </div>
                <button className="mt-4 w-full py-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors text-sm font-medium flex items-center justify-center gap-2">
                  Xem lộ trình chi tiết
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
              <Target className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">Chọn một vị trí để xem phân tích kỹ năng</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
