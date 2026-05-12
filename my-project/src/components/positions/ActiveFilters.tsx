import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FilterState } from "@/types";
import { cn } from "@/lib/utils";

interface ActiveFiltersProps {
  filters: FilterState;
  onRemove: (category: keyof Pick<FilterState, "location" | "duration" | "field">, value: string) => void;
  onClearAll: () => void;
}

export function ActiveFilters({ filters, onRemove, onClearAll }: ActiveFiltersProps) {
  const activeFilters: { category: keyof Pick<FilterState, "location" | "duration" | "field">; value: string }[] = [
    ...filters.location.map((v) => ({ category: "location" as const, value: v })),
    ...filters.duration.map((v) => ({ category: "duration" as const, value: v })),
    ...filters.field.map((v) => ({ category: "field" as const, value: v })),
  ];

  if (activeFilters.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-[--color-muted-foreground]">Active filters:</span>
      {activeFilters.map(({ category, value }) => (
        <button
          key={`${category}-${value}`}
          onClick={() => onRemove(category, value)}
          className={cn(
            "inline-flex items-center gap-1 rounded-md bg-[--color-muted] px-2 py-1 text-sm",
            "hover:bg-[--color-border] transition-colors"
          )}
        >
          {value}
          <X className="h-3 w-3" aria-hidden="true" />
        </button>
      ))}
      <Button variant="ghost" size="sm" onClick={onClearAll} className="text-xs">
        Clear all
      </Button>
    </div>
  );
}
