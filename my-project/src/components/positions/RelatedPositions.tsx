import { PositionCard } from "./PositionCard";
import type { Position } from "@/types";

interface RelatedPositionsProps {
  positions: Position[];
  currentPositionId: string;
  onApply?: (id: string) => void;
}

export function RelatedPositions({ positions, currentPositionId, onApply }: RelatedPositionsProps) {
  const relatedPositions = positions
    .filter(p => p.id !== currentPositionId)
    .slice(0, 3);

  if (relatedPositions.length === 0) return null;

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-4">Similar Positions</h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {relatedPositions.map((position) => (
          <PositionCard
            key={position.id}
            position={position}
            onApply={onApply}
          />
        ))}
      </div>
    </div>
  );
}
