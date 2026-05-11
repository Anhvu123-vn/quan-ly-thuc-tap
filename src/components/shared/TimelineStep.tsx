import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { motion } from "framer-motion";

interface TimelineStepProps {
  label: string;
  completed: boolean;
  current: boolean;
  isLast?: boolean;
}

export function TimelineStep({ label, completed, current, isLast }: TimelineStepProps) {
  return (
    <div className="flex items-start gap-3 relative">
      {/* Connector line */}
      <div className="flex flex-col items-center">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold transition-all duration-300",
            completed && "bg-gradient-to-br from-emerald-500 to-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-500/30",
            current && !completed && "bg-gradient-to-br from-[--color-primary] to-purple-600 border-[--color-primary] text-white shadow-lg shadow-[--color-primary]/30",
            !completed && !current && "border-[--color-border] bg-white text-[--color-muted-foreground]"
          )}
        >
          {completed ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              <Check className="h-4 w-4" aria-hidden="true" />
            </motion.div>
          ) : (
            current && (
              <motion.div
                className="h-2 w-2 rounded-full bg-white"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              />
            )
          )}
        </motion.div>
        {!isLast && (
          <motion.div
            className={cn("w-1 rounded-full", completed ? "bg-gradient-to-b from-emerald-500 to-emerald-400" : "bg-[--color-border]")}
            style={{ height: "40px" }}
            initial={{ height: 0 }}
            animate={{ height: 40 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            aria-hidden="true"
          />
        )}
      </div>

      {/* Label */}
      <div className="pb-8 pt-1">
        <p
          className={cn(
            "text-sm font-semibold transition-colors duration-200",
            completed && "text-emerald-700",
            current && !completed && "text-[--color-primary]",
            !completed && !current && "text-[--color-muted-foreground]"
          )}
        >
          {label}
        </p>
        <p className="text-xs text-[--color-muted-foreground] mt-0.5">
          {completed ? "Completed" : current ? "In Progress" : "Pending"}
        </p>
      </div>
    </div>
  );
}
