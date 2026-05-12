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

export function PositionCard({ position, onApply, isAuthenticated }: PositionCardProps) {
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
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[--color-border] bg-[--color-muted]/50 px-3 py-1 text-xs font-medium text-[--color-muted-foreground]">
              <MapPin className="h-3 w-3" aria-hidden="true" />
              {position.location}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[--color-primary]/10 px-3 py-1 text-xs font-medium text-[--color-primary] border border-[--color-primary]/20">
              <Clock className="h-3 w-3" aria-hidden="true" />
              {position.duration}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[--color-border] bg-[--color-muted]/50 px-3 py-1 text-xs font-medium text-[--color-muted-foreground]">
              <Briefcase className="h-3 w-3" aria-hidden="true" />
              {position.field}
            </span>
            {position.salary && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 border border-emerald-200">
                <DollarSign className="h-3 w-3" aria-hidden="true" />
                {position.salary}
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
              Posted {position.postedDate}
            </span>
            <Button 
              size="sm" 
              onClick={() => onApply?.(position.id)}
              className="group/btn gap-1"
            >
              <span>Apply Now</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-1" aria-hidden="true" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
