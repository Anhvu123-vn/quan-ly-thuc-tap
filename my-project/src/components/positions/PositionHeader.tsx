import { MapPin, Clock, DollarSign, Briefcase, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Position } from "@/types";

interface PositionHeaderProps {
  position: Position;
  onApply: () => void;
}

export function PositionHeader({ position, onApply }: PositionHeaderProps) {
  return (
    <div className="bg-white border-b border-[--color-border]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-4 text-sm text-[--color-muted-foreground]" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2">
            <li><a href="/" className="hover:text-[--color-foreground]">Home</a></li>
            <li>/</li>
            <li><a href="/positions" className="hover:text-[--color-foreground]">Positions</a></li>
            <li>/</li>
            <li className="text-[--color-foreground]">{position.company}</li>
          </ol>
        </nav>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          {/* Main info */}
          <div className="flex items-start gap-4">
            {/* Company logo placeholder */}
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-[--color-muted] text-lg font-bold text-[--color-muted-foreground]">
              {position.company.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-semibold lg:text-3xl">{position.title}</h1>
              <p className="mt-1 text-lg text-[--color-muted-foreground]">{position.company}</p>
              
              {/* Meta info */}
              <div className="mt-3 flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-md border border-[--color-border] px-3 py-1 text-sm">
                  <MapPin className="h-4 w-4 text-[--color-muted-foreground]" aria-hidden="true" />
                  {position.location}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-md bg-[--color-muted] px-3 py-1 text-sm">
                  <Clock className="h-4 w-4 text-[--color-muted-foreground]" aria-hidden="true" />
                  {position.duration}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-md border border-[--color-border] px-3 py-1 text-sm">
                  <Briefcase className="h-4 w-4 text-[--color-muted-foreground]" aria-hidden="true" />
                  {position.field}
                </span>
                {position.salary && (
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-green-50 px-3 py-1 text-sm font-medium text-green-700">
                    <DollarSign className="h-4 w-4" aria-hidden="true" />
                    {position.salary}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Apply button */}
          <div className="shrink-0 lg:text-right">
            <Button size="lg" onClick={onApply}>
              Apply Now
            </Button>
            <p className="mt-2 text-xs text-[--color-muted-foreground]">
              <Calendar className="inline h-3 w-3 mr-1" aria-hidden="true" />
              Posted {position.postedDate}
            </p>
          </div>
        </div>

        {/* Skills tags */}
        <div className="mt-4 flex flex-wrap gap-2">
          {position.requirements.map((skill) => (
            <span
              key={skill}
              className="rounded-md bg-[--color-accent] px-3 py-1 text-xs font-medium text-[--color-accent-foreground]"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
