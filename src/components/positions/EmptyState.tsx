import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title?: string;
  description?: string;
  onClearFilters?: () => void;
}

export function EmptyState({
  title = "No positions found",
  description = "Try adjusting your filters or search terms to find more opportunities.",
  onClearFilters,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {/* Icon */}
      <div className="mb-4 rounded-full bg-[--color-muted] p-4">
        <SearchX className="h-8 w-8 text-[--color-muted-foreground]" aria-hidden="true" />
      </div>

      {/* Text */}
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="mb-6 max-w-sm text-sm text-[--color-muted-foreground]">{description}</p>

      {/* Action */}
      {onClearFilters && (
        <Button variant="outline" onClick={onClearFilters}>
          Clear all filters
        </Button>
      )}
    </div>
  );
}
