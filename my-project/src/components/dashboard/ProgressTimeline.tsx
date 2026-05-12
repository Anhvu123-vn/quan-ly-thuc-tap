import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TimelineStep } from "@/components/shared/TimelineStep";
import { motion } from "framer-motion";
import type { TimelineStage } from "@/types";

interface ProgressTimelineProps {
  stages: TimelineStage[];
  progressPercentage: number;
}

export function ProgressTimeline({ stages, progressPercentage }: ProgressTimelineProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[--color-primary] animate-pulse" />
            Internship Progress
          </CardTitle>
          <motion.span 
            className="text-2xl font-bold bg-gradient-to-r from-[--color-primary] to-purple-600 bg-clip-text text-transparent"
            key={progressPercentage}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500 }}
          >
            {progressPercentage}%
          </motion.span>
        </div>
        {/* Gradient Progress bar */}
        <div className="mt-3 h-2.5 w-full rounded-full bg-[--color-muted] overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[--color-primary] via-purple-500 to-indigo-600 shadow-lg shadow-[--color-primary]/30"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            role="progressbar"
            aria-valuenow={progressPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Progress: ${progressPercentage}%`}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-start justify-between overflow-x-auto pb-2">
          {stages.map((stage, index) => (
            <div key={stage.id} className="flex-1 min-w-[80px]">
              <TimelineStep
                label={stage.label}
                completed={stage.completed}
                current={stage.current}
                isLast={index === stages.length - 1}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
