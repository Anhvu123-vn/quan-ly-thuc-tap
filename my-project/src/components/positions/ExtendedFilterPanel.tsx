import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { 
  LOCATION_OPTIONS, 
  DURATION_OPTIONS, 
  FIELD_OPTIONS, 
  WORK_TYPE_OPTIONS,
  SKILLS_OPTIONS 
} from "@/types";
import type { ExtendedFilterState } from "@/types";

interface ExtendedFilterPanelProps {
  filters: ExtendedFilterState;
  onFilterChange: (filters: ExtendedFilterState) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function ExtendedFilterPanel({ 
  filters, 
  onFilterChange, 
  isCollapsed, 
  onToggleCollapse 
}: ExtendedFilterPanelProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    location: true,
    workType: true,
    duration: true,
    field: true,
    skills: false,
    salary: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleFilter = (
    category: keyof Pick<ExtendedFilterState, "location" | "duration" | "field" | "skills" | "workType">, 
    value: string
  ) => {
    const current = filters[category] as string[];
    const updated = current.includes(value)
      ? current.filter((v: string) => v !== value)
      : [...current, value];
    onFilterChange({ ...filters, [category]: updated });
  };

  const updateSalaryRange = (type: 'min' | 'max', value: string) => {
    const numValue = value ? parseInt(value, 10) : null;
    onFilterChange({
      ...filters,
      salaryMin: type === 'min' ? numValue : filters.salaryMin,
      salaryMax: type === 'max' ? numValue : filters.salaryMax,
    });
  };

  const clearAll = () => {
    onFilterChange({
      search: filters.search,
      location: [],
      duration: [],
      field: [],
      skills: [],
      salaryMin: null,
      salaryMax: null,
      workType: [],
    });
  };

  const hasActiveFilters = 
    filters.location.length > 0 || 
    filters.duration.length > 0 || 
    filters.field.length > 0 ||
    filters.skills.length > 0 ||
    filters.salaryMin !== null ||
    filters.salaryMax !== null ||
    filters.workType.length > 0;

  const FilterCheckbox = ({
    label,
    checked,
    onChange,
  }: {
    label: string;
    checked: boolean;
    onChange: () => void;
  }) => (
    <label className="flex items-center gap-2 cursor-pointer py-1 hover:bg-[--color-muted] px-2 rounded">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded border-[--color-border] text-[--color-accent] focus:ring-[--color-accent]"
      />
      <span className="text-sm">{label}</span>
    </label>
  );

  const SectionHeader = ({ 
    title, 
    section 
  }: { 
    title: string; 
    section: string;
  }) => (
    <button
      type="button"
      onClick={() => toggleSection(section)}
      className="flex items-center justify-between w-full text-left py-2 hover:text-[--color-accent]"
    >
      <span className="text-sm font-medium">{title}</span>
      {expandedSections[section] ? (
        <ChevronUp className="h-4 w-4 text-[--color-muted-foreground]" />
      ) : (
        <ChevronDown className="h-4 w-4 text-[--color-muted-foreground]" />
      )}
    </button>
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
      <div className={cn("p-4 space-y-4", isCollapsed && "hidden lg:block")}>
        {/* Location */}
        <div className="border-b border-[--color-border] pb-3">
          <SectionHeader title="Location" section="location" />
          {expandedSections.location && (
            <div className="space-y-1 mt-1">
              {LOCATION_OPTIONS.map((option) => (
                <FilterCheckbox
                  key={option}
                  label={option}
                  checked={filters.location.includes(option)}
                  onChange={() => toggleFilter("location", option)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Work Type */}
        <div className="border-b border-[--color-border] pb-3">
          <SectionHeader title="Work Type" section="workType" />
          {expandedSections.workType && (
            <div className="space-y-1 mt-1">
              {WORK_TYPE_OPTIONS.map((option) => (
                <FilterCheckbox
                  key={option}
                  label={option}
                  checked={filters.workType.includes(option.toLowerCase() as 'remote' | 'hybrid' | 'on-site')}
                  onChange={() => toggleFilter("workType", option.toLowerCase())}
                />
              ))}
            </div>
          )}
        </div>

        {/* Duration */}
        <div className="border-b border-[--color-border] pb-3">
          <SectionHeader title="Duration" section="duration" />
          {expandedSections.duration && (
            <div className="space-y-1 mt-1">
              {DURATION_OPTIONS.map((option) => (
                <FilterCheckbox
                  key={option}
                  label={option}
                  checked={filters.duration.includes(option)}
                  onChange={() => toggleFilter("duration", option)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Field */}
        <div className="border-b border-[--color-border] pb-3">
          <SectionHeader title="Field" section="field" />
          {expandedSections.field && (
            <div className="space-y-1 mt-1">
              {FIELD_OPTIONS.map((option) => (
                <FilterCheckbox
                  key={option}
                  label={option}
                  checked={filters.field.includes(option)}
                  onChange={() => toggleFilter("field", option)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Skills */}
        <div className="border-b border-[--color-border] pb-3">
          <SectionHeader title="Required Skills" section="skills" />
          {expandedSections.skills && (
            <div className="mt-1.5 space-y-1 max-h-48 overflow-y-auto">
              {SKILLS_OPTIONS.map((option: string) => (
                <FilterCheckbox
                  key={option}
                  label={option}
                  checked={filters.skills.includes(option)}
                  onChange={() => toggleFilter("skills", option)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Salary Range */}
        <div className="pb-3">
          <SectionHeader title="Salary Range ($/month)" section="salary" />
          {expandedSections.salary && (
            <div className="mt-3 space-y-3">
              <div className="flex gap-2 items-center">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.salaryMin ?? ''}
                  onChange={(e) => updateSalaryRange('min', e.target.value)}
                  className="w-full"
                />
                <span className="text-[--color-muted-foreground]">-</span>
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.salaryMax ?? ''}
                  onChange={(e) => updateSalaryRange('max', e.target.value)}
                  className="w-full"
                />
              </div>
              {/* Quick salary presets */}
              <div className="flex flex-wrap gap-2">
                {[
                  { label: '< $500', min: null, max: 500 },
                  { label: '$500-800', min: 500, max: 800 },
                  { label: '$800-1200', min: 800, max: 1200 },
                  { label: '> $1200', min: 1200, max: null },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => onFilterChange({
                      ...filters,
                      salaryMin: preset.min,
                      salaryMax: preset.max,
                    })}
                    className={cn(
                      "px-2 py-1 text-xs rounded-md border border-[--color-border] transition-colors",
                      filters.salaryMin === preset.min && filters.salaryMax === preset.max
                        ? "bg-[--color-accent] text-[--color-accent-foreground] border-[--color-accent]"
                        : "hover:bg-[--color-muted]"
                    )}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
