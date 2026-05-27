import { useState, useMemo, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { SlidersHorizontal, Loader2, CalendarDays, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/positions/SearchBar";
import { FilterPanel } from "@/components/positions/FilterPanel";
import { ActiveFilters } from "@/components/positions/ActiveFilters";
import { PositionList } from "@/components/positions/PositionList";
import { Pagination } from "@/components/positions/Pagination";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/services/api";
import type { Position } from "@/types";

const ITEMS_PER_PAGE = 9;

const fetchPositions = async (filters: {
  page?: number;
  search?: string;
  location?: string;
  workType?: string;
}): Promise<{ data: Position[]; meta: any }> => {
  const response = await api.getPositions({
    page: filters.page || 1,
    search: filters.search,
    status: 'active',
  });
  
  console.log('PositionsPage - Full API Response:', JSON.stringify(response, null, 2));
  
  // response has structure: { success: true, data: [...], meta: {...} }
  const positionsArray = response?.data || [];
  
  console.log('PositionsPage - positionsArray:', positionsArray);
  
  // Transform API response to Position format
  const positions: Position[] = positionsArray.map((pos: any) => ({
    id: pos.id,
    title: pos.title,
    company: pos.company?.name || "Công ty",
    location: pos.location || "",
    duration: pos.duration || "",
    field: pos.field || "",
    description: pos.description || "",
    requirements: pos.requirements || [],
    responsibilities: pos.responsibilities || [],
    postedDate: pos.postedDate || pos.createdAt || new Date().toISOString(),
    deadline: pos.deadline,
    salaryMin: pos.salaryMin,
    salaryMax: pos.salaryMax,
    workType: pos.workType,
    slots: pos.slots,
    status: pos.status,
    applicantCount: pos._count?.applications || 0,
  }));
  
  return { data: positions, meta: response?.meta || {} };
};

export function PositionsPage() {
  const { isAuthenticated } = useAuth();
  const [filters, setFilters] = useState({
    search: "",
    location: [] as string[],
    duration: [] as string[],
    field: [] as string[],
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [activeBatch, setActiveBatch] = useState<any>(null);
  const [batchLoading, setBatchLoading] = useState(true);

  // Fetch active batch info
  useEffect(() => {
    setBatchLoading(true);
    api.getActiveBatch().then((res: any) => {
      if (res?.success && res.data) {
        setActiveBatch(res.data);
      } else {
        setActiveBatch(null);
      }
    }).catch((err) => {
      console.error('[PositionsPage] getActiveBatch error:', err);
      setActiveBatch(null);
    }).finally(() => {
      setBatchLoading(false);
    });
  }, []);

  // TanStack Query for data fetching
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['positions', currentPage, filters.search],
    queryFn: () => fetchPositions({ page: currentPage, search: filters.search }),
    staleTime: 1000 * 60 * 5,
  });

  const positions = data?.data || [];

  // Filter positions locally (for client-side filtering of loaded data)
  const filteredPositions = useMemo(() => {
    return positions.filter((position) => {
      // Location filter
      if (filters.location.length > 0 && position.location) {
        const matchLocation = filters.location.some(loc => 
          position.location.toLowerCase().includes(loc.toLowerCase())
        );
        if (!matchLocation) return false;
      }

      // Duration filter
      if (filters.duration.length > 0 && position.duration) {
        if (!filters.duration.includes(position.duration)) return false;
      }

      // Field filter
      if (filters.field.length > 0 && position.field) {
        if (!filters.field.includes(position.field)) return false;
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
  const handleFilterChange = useCallback((newFilters: typeof filters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  }, []);

  const handleSearchChange = useCallback((search: string) => {
    setFilters(prev => ({ ...prev, search }));
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleApply = useCallback(async (id: string) => {
    if (!isAuthenticated) {
      window.location.href = "/login";
      return;
    }
    try {
      await api.createApplication({ positionId: id });
      alert("Ứng tuyển thành công!");
    } catch (err: any) {
      alert(err.message || "Không thể ứng tuyển. Vui lòng thử lại.");
    }
  }, [isAuthenticated]);

  const removeFilter = useCallback(
    (category: 'location' | 'duration' | 'field', value: string) => {
      setFilters(prev => ({
        ...prev,
        [category]: prev[category].filter((v) => v !== value),
      }));
      setCurrentPage(1);
    },
    []
  );

  const clearAllFilters = useCallback(() => {
    setFilters({ search: filters.search, location: [], duration: [], field: [] });
    setCurrentPage(1);
  }, [filters.search]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Vị trí thực tập</h1>
              <p className="text-sm text-slate-500">
                Tìm kiếm cơ hội thực tập phù hợp với bạn
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-full sm:w-80">
                <SearchBar
                  value={filters.search}
                  onChange={handleSearchChange}
                  placeholder="Tìm kiếm theo tên vị trí..."
                />
              </div>
              <Button
                variant="outline"
                className="lg:hidden border-slate-200 hover:bg-slate-50 rounded-xl"
                onClick={() => setFilterPanelOpen(!filterPanelOpen)}
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Bộ lọc
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Active batch banner */}
        {activeBatch && (
          <div className="mb-6 bg-gradient-to-r from-indigo-500 to-violet-600 rounded-xl p-4 flex items-center gap-3">
            <CalendarDays className="h-5 w-5 text-white/80 shrink-0" />
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">
                Đợt thực tập: {activeBatch.name}
              </p>
              {activeBatch.allowStudentApplication && (
                <p className="text-white/70 text-xs mt-0.5">
                  Đang nhận đơn ứng tuyển — Hạn nộp:{" "}
                  {activeBatch.applicationDeadline
                    ? new Date(activeBatch.applicationDeadline).toLocaleDateString("vi-VN")
                    : "Không giới hạn"}
                </p>
              )}
            </div>
            {activeBatch.allowStudentApplication && (
              <span className="shrink-0 text-xs px-2 py-1 rounded-full bg-white/20 text-white">
                Đang mở nộp đơn
              </span>
            )}
          </div>
        )}

        {/* No active batch warning */}
        {batchLoading === false && activeBatch === null && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
            <div>
              <p className="text-amber-800 font-semibold text-sm">
                Hiện chưa có đợt thực tập nào được kích hoạt
              </p>
              <p className="text-amber-600 text-xs mt-0.5">
                Vui lòng liên hệ admin để mở đợt thực tập mới.
              </p>
            </div>
          </div>
        )}

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
