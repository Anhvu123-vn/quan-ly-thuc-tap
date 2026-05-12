import { PositionCard } from "./PositionCard";
import { EmptyState } from "./EmptyState";
import { PositionCardSkeleton } from "./Skeleton";
import type { Position } from "@/types";

interface PositionListProps {
  positions: Position[];
  isLoading?: boolean;
  isAuthenticated?: boolean;
  onApply?: (id: string) => void;
  onClearFilters?: () => void;
}

export function PositionList({
  positions,
  isLoading,
  isAuthenticated,
  onApply,
  onClearFilters,
}: PositionListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <PositionCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (positions.length === 0) {
    return <EmptyState onClearFilters={onClearFilters} />;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {positions.map((position) => (
        <PositionCard
          key={position.id}
          position={position}
          isAuthenticated={isAuthenticated}
          onApply={onApply}
        />
      ))}
    </div>
  );
}
