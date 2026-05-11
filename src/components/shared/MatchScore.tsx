import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface MatchScoreProps {
  score: number;
  showLabel?: boolean;
}

export function MatchScore({ score, showLabel = true }: MatchScoreProps) {
  const getColors = (score: number) => {
    if (score >= 80) return {
      bg: "bg-gradient-to-br from-emerald-100 to-emerald-50",
      border: "border-emerald-200",
      text: "text-emerald-700",
      ring: "ring-emerald-200"
    };
    if (score >= 60) return {
      bg: "bg-gradient-to-br from-amber-100 to-amber-50",
      border: "border-amber-200",
      text: "text-amber-700",
      ring: "ring-amber-200"
    };
    return {
      bg: "bg-gradient-to-br from-red-100 to-red-50",
      border: "border-red-200",
      text: "text-red-700",
      ring: "ring-red-200"
    };
  };

  const colors = getColors(score);

  return (
    <div className="flex items-center gap-2">
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold border shadow-sm",
          colors.bg,
          colors.border,
          colors.text
        )}
        aria-label={`Match score: ${score}%`}
      >
        {score}
      </motion.div>
      {showLabel && (
        <div className="flex flex-col">
          <span className={cn("text-sm font-semibold", colors.text)}>{score}%</span>
          <span className="text-xs text-[--color-muted-foreground]">match</span>
        </div>
      )}
    </div>
  );
}
