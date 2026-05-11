import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/positions/SearchBar";
import { FilterPanel } from "@/components/positions/FilterPanel";
import { ActiveFilters } from "@/components/positions/ActiveFilters";
import { PositionList } from "@/components/positions/PositionList";
import { Pagination } from "@/components/positions/Pagination";
import { useAuth } from "@/contexts/AuthContext";
import { mockPositions } from "@/data/positions";
import type { FilterState, Position } from "@/types";

const ITEMS_PER_PAGE = 9;

// Simulated API fetch with delay
const fetchPositions = async (): Promise<Position[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  return mockPositions;
};

export function PositionsPage() {
  const { isAuthenticated } = useAuth();
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    location: [],
    duration: [],
    field: [],
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);

  // TanStack Query for data fetching
  const { data: positions = [], isLoading, isFetching } = useQuery({
    queryKey: ['positions'],
    queryFn: fetchPositions,
    staleTime: 1000 * 60 * 5, // 5 minutes - data stays fresh
    gcTime: 1000 * 60 * 10, // 10 minutes - cached data
  });

  // Filter positions based on current filters
  const filteredPositions = useMemo(() => {
    return positions.filter((position) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          position.title.toLowerCase().includes(searchLower) ||
          position.company.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Location filter
      if (filters.location.length > 0 && !filters.location.includes(position.location)) {
        return false;
      }

      // Duration filter
      if (filters.duration.length > 0 && !filters.duration.includes(position.duration)) {
        return false;
      }

      // Field filter
      if (filters.field.length > 0 && !filters.field.includes(position.field)) {
        return false;
      }

      return true;
    });
  }, [positions, filters]);

  // Paginate positions
  const paginatedPositions = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPositions.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredPositions, currentPage]);

  const totalPages = Math.ceil(filteredPositions.length / ITEMS_PER_PAGE);

  // Reset page when filters change
  const handleFilterChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1);
  }, []);

  const handleSearchChange = useCallback((search: string) => {
    handleFilterChange({ ...filters, search });
  }, [filters, handleFilterChange]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleApply = useCallback((id: string) => {
    if (!isAuthenticated) {
      window.location.href = "/login";
      return;
    }
    console.log("Applying to position:", id);
  }, [isAuthenticated]);

  const removeFilter = useCallback(
    (category: keyof Pick<FilterState, "location" | "duration" | "field">, value: string) => {
      const newFilters = {
        ...filters,
        [category]: filters[category].filter((v) => v !== value),
      };
      handleFilterChange(newFilters);
    },
    [filters, handleFilterChange]
  );

  const clearAllFilters = useCallback(() => {
    handleFilterChange({ search: filters.search, location: [], duration: [], field: [] });
  }, [filters.search, handleFilterChange]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Internship Positions</h1>
              <p className="text-sm text-slate-500">
                Find your next opportunity
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-full sm:w-80">
                <SearchBar
                  value={filters.search}
                  onChange={handleSearchChange}
                  placeholder="Search by title or company..."
                />
              </div>
              <Button
                variant="outline"
                className="lg:hidden border-slate-200 hover:bg-slate-50 rounded-xl"
                onClick={() => setFilterPanelOpen(!filterPanelOpen)}
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filter panel - sidebar on desktop */}
          <aside className="w-full lg:w-64 shrink-0">
            <FilterPanel
              filters={filters}
              onFilterChange={handleFilterChange}
              isCollapsed={!filterPanelOpen}
              onToggleCollapse={() => setFilterPanelOpen(!filterPanelOpen)}
            />
          </aside>

          {/* Results */}
          <div className="flex-1">
            {/* Active filters */}
            <div className="mb-4">
              <ActiveFilters
                filters={filters}
                onRemove={removeFilter}
                onClearAll={clearAllFilters}
              />
            </div>

            {/* Position list with Skeleton Loading */}
            <PositionList
              positions={paginatedPositions}
              isLoading={isLoading || isFetching}
              isAuthenticated={isAuthenticated}
              onApply={handleApply}
              onClearFilters={clearAllFilters}
            />

            {/* Pagination */}
            {filteredPositions.length > 0 && (
              <div className="mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  totalItems={filteredPositions.length}
                  itemsPerPage={ITEMS_PER_PAGE}
                />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
