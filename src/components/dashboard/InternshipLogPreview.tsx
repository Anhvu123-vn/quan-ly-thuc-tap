import { Plus, Clock, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import type { LogEntry } from "@/types";

interface InternshipLogPreviewProps {
  entries: LogEntry[];
  totalHours: number;
}

export function InternshipLogPreview({ entries, totalHours }: InternshipLogPreviewProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[--color-primary] animate-pulse" />
            Recent Logs
          </CardTitle>
          <Button size="sm" variant="outline" className="gap-1.5">
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            Add Entry
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary */}
        <div className="mb-5 flex items-center gap-4 rounded-xl bg-gradient-to-r from-[--color-primary]/10 via-purple-500/10 to-indigo-500/10 p-4 border border-[--color-primary]/20">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[--color-primary] shadow-lg shadow-[--color-primary]/25">
              <TrendingUp className="h-5 w-5 text-white" aria-hidden="true" />
            </div>
            <div>
              <span className="text-xs font-medium text-[--color-muted-foreground] uppercase tracking-wider">
                Total Hours
              </span>
              <p className="text-2xl font-bold text-[--color-foreground]">{totalHours}h</p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-1.5 text-sm text-emerald-700">
            <Clock className="h-4 w-4" aria-hidden="true" />
            <span className="font-medium">+2.5h this week</span>
          </div>
        </div>

        {/* Entries list */}
        <div className="space-y-3">
          {entries.length === 0 ? (
            <p className="text-sm text-[--color-muted-foreground] text-center py-8">
              No log entries yet. Start logging your internship activities.
            </p>
          ) : (
            entries.slice(0, 5).map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start gap-4 rounded-xl border border-[--color-border] bg-white p-4 transition-all duration-200 hover:border-[--color-primary]/30 hover:shadow-md"
              >
                <div className="flex-shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[--color-primary]/10 to-purple-500/10 border border-[--color-primary]/20">
                    <span className="text-sm font-bold text-[--color-primary]">{entry.hours}h</span>
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-relaxed">{entry.description}</p>
                  <p className="mt-1.5 text-xs text-[--color-muted-foreground]">
                    {entry.date}
                  </p>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* View all link */}
        {entries.length > 5 && (
          <div className="mt-4 pt-4 border-t border-[--color-border]">
            <Button variant="ghost" size="sm" className="w-full">
              View all {entries.length} entries
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
