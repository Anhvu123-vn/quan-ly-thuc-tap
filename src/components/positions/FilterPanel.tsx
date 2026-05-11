import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FilterState } from "@/types";
import { LOCATION_OPTIONS, DURATION_OPTIONS, FIELD_OPTIONS } from "@/types";
import { cn } from "@/lib/utils";

interface FilterPanelProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function FilterPanel({ filters, onFilterChange, isCollapsed, onToggleCollapse }: FilterPanelProps) {
  const toggleFilter = (category: keyof Pick<FilterState, "location" | "duration" | "field">, value: string) => {
    const current = filters[category];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onFilterChange({ ...filters, [category]: updated });
  };

  const clearAll = () => {
    onFilterChange({ search: filters.search, location: [], duration: [], field: [] });
  };

  const hasActiveFilters = filters.location.length > 0 || filters.duration.length > 0 || filters.field.length > 0;

  const FilterCheckbox = ({
    label,
    checked,
    onChange,
  }: {
    label: string;
    checked: boolean;
    onChange: () => void;
  }) => (
    <label className="flex items-center gap-2 cursor-pointer py-1">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded border-[--color-border] text-[--color-accent] focus:ring-[--color-accent]"
      />
      <span className="text-sm">{label}</span>
    </label>
  );

  return (
    <div className={cn("bg-white border border-[--color-border] rounded-lg", isCollapsed && "hidden lg:block")}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[--color-border]">
        <h2 className="font-semibold">Filters</h2>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearAll}>
              Clear all
            </Button>
          )}
          {onToggleCollapse && (
            <Button variant="ghost" size="icon" onClick={onToggleCollapse} className="lg:hidden">
              <ChevronDown className={cn("h-4 w-4 transition-transform", isCollapsed && "rotate-180")} />
            </Button>
          )}
        </div>
      </div>

      {/* Filter sections */}
      <div className={cn("p-4 space-y-6", isCollapsed && "hidden lg:block")}>
        {/* Location */}
        <div>
          <h3 className="text-sm font-medium mb-3">Location</h3>
          <div className="space-y-1">
            {LOCATION_OPTIONS.map((option) => (
              <FilterCheckbox
                key={option}
                label={option}
                checked={filters.location.includes(option)}
                onChange={() => toggleFilter("location", option)}
              />
            ))}
          </div>
        </div>

        {/* Duration */}
        <div>
          <h3 className="text-sm font-medium mb-3">Duration</h3>
          <div className="space-y-1">
            {DURATION_OPTIONS.map((option) => (
              <FilterCheckbox
                key={option}
                label={option}
                checked={filters.duration.includes(option)}
                onChange={() => toggleFilter("duration", option)}
              />
            ))}
          </div>
        </div>

        {/* Field */}
        <div>
          <h3 className="text-sm font-medium mb-3">Field</h3>
          <div className="space-y-1">
            {FIELD_OPTIONS.map((option) => (
              <FilterCheckbox
                key={option}
                label={option}
                checked={filters.field.includes(option)}
                onChange={() => toggleFilter("field", option)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
