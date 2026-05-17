import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Edit,
  Trash2,
  Users,
  Search,
  Briefcase,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { JobPostingModal } from "@/components/company/JobPostingModal";
import { api } from "@/services/api";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const ITEMS_PER_PAGE = 5;

interface Position {
  id: string;
  title: string;
  field: string;
  location: string;
  duration: string;
  workType: string;
  salaryMin?: number;
  salaryMax?: number;
  description: string;
  requirements: string[];
  status: string;
  slots?: number;
  postedDate?: string;
  createdAt?: string;
  _count?: { applications: number };
}

const durationLabels: Record<string, string> = {
  one_month: "1 tháng",
  two_three_months: "2-3 tháng",
  four_six_months: "4-6 tháng",
  six_plus_months: "6+ tháng",
};

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  active: { bg: "bg-emerald-50", text: "text-emerald-700", label: "Đang tuyển" },
  draft: { bg: "bg-amber-50", text: "text-amber-700", label: "Chờ duyệt" },
  paused: { bg: "bg-slate-100", text: "text-slate-500", label: "Tạm dừng" },
  closed: { bg: "bg-slate-100", text: "text-slate-500", label: "Đã đóng" },
};

const getStatusColor = (status: string) => {
  const s = (status || "").toLowerCase();
  return statusColors[s] || statusColors.closed;
};

export function CompanyJobManagerPage() {
  const navigate = useNavigate();
  const [positions, setPositions] = useState<Position[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "draft" | "paused" | "closed">("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editPosition, setEditPosition] = useState<Position | null>(null);

  const fetchPositions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.getMyPositions();
      // Handle both direct array and wrapped response { data: [...] }
      const positionsData = response?.data || response || [];
      setPositions(Array.isArray(positionsData) ? positionsData : []);
    } catch (err) {
      console.error("Failed to fetch positions:", err);
      setError("Không thể tải danh sách vị trí");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPositions();
  }, [fetchPositions]);

  const filteredPositions = positions.filter((position) => {
    const matchesSearch =
      position.title.toLowerCase().includes(search.toLowerCase()) ||
      (position.field || "").toLowerCase().includes(search.toLowerCase()) ||
      (position.location || "").toLowerCase().includes(search.toLowerCase());
    const positionStatus = (position.status || "").toLowerCase();
    const matchesStatus = statusFilter === "all" || positionStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredPositions.length / ITEMS_PER_PAGE);
  const paginatedPositions = filteredPositions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSave = async (positionData: any) => {
    try {
      if (editPosition) {
        // Update existing position
        const updated = await api.updatePosition(editPosition.id, positionData);
        setPositions((prev) =>
          prev.map((p) => (p.id === editPosition.id ? { ...p, ...updated } : p))
        );
      } else {
        // Create new position
        const created = await api.createPosition(positionData);
        // Refresh the list to get the new position with company info
        fetchPositions();
      }
      setEditPosition(null);
      setModalOpen(false);
    } catch (err) {
      console.error("Failed to save position:", err);
      alert("Không thể lưu vị trí. Vui lòng thử lại.");
    }
  };

  const handleEdit = (position: Position) => {
    setEditPosition(position);
    setModalOpen(true);
  };

  // Delete confirmation dialog state
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);

  const handleDelete = (position: { id: string; title: string; _count?: { applications: number } }) => {
    setDeleteTarget(position);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.deletePosition(deleteTarget.id);
      setPositions((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      console.error("Failed to delete position:", err);
      alert("Không thể xóa vị trí. Vui lòng thử lại.");
    }
  };

  const handleOpenNew = () => {
    setEditPosition(null);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditPosition(null);
  };

  const handleViewCandidates = (positionId: string) => {
    navigate("/company/candidates");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản lý tuyển dụng</h1>
          <p className="text-slate-500 mt-1">
            Quản lý và theo dõi các vị trí thực tập của bạn
          </p>
        </div>
        <Button
          onClick={handleOpenNew}
          className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Đăng tin mới
        </Button>
      </div>

      {/* Data Table Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-indigo-500" />
              Danh sách vị trí thực tập
              <span className="ml-1 text-sm font-normal text-slate-400">
                ({filteredPositions.length} vị trí)
              </span>
            </CardTitle>

            {/* Filters */}
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Tìm theo tiêu đề, lĩnh vực, địa điểm..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-9 w-full sm:w-64"
                />
              </div>

              {/* Status Filter */}
              <div className="flex gap-1">
                {(["all", "active", "draft", "paused", "closed"] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      setStatusFilter(status);
                      setCurrentPage(1);
                    }}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                      statusFilter === status
                        ? "bg-indigo-100 text-indigo-700"
                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                    )}
                  >
                    {status === "all"
                      ? "Tất cả"
                      : status === "active"
                      ? "Đang tuyển"
                      : status === "draft"
                      ? "Chờ duyệt"
                      : status === "paused"
                      ? "Tạm dừng"
                      : "Đã đóng"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-2 sm:px-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={fetchPositions}>Thử lại</Button>
            </div>
          ) : (
            <>
              {/* Table */}
              <div className="overflow-x-auto -mx-2 sm:mx-0">
                <table className="w-full min-w-[800px]">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 px-4 sm:px-0">
                        Tiêu đề công việc
                      </th>
                      <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 px-4 sm:px-0">
                        Lĩnh vực
                      </th>
                      <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 px-4 sm:px-0">
                        Mức hỗ trợ
                      </th>
                      <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 px-4 sm:px-0">
                        Ứng viên
                      </th>
                      <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 px-4 sm:px-0">
                        Trạng thái
                      </th>
                      <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400 px-4 sm:px-0">
                        Hành động
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedPositions.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="py-12 text-center text-sm text-slate-400"
                        >
                          Không tìm thấy vị trí nào phù hợp
                        </td>
                      </tr>
                    ) : (
                      paginatedPositions.map((position, index) => {
                        const sc = getStatusColor(position.status);
                        const applicantCount = position._count?.applications || 0;
                        return (
                          <motion.tr
                            key={position.id}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03 }}
                            className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors"
                          >
                            {/* Title */}
                            <td className="py-3.5 px-4 sm:px-0">
                              <div className="min-w-0">
                                <p className="font-medium text-sm text-slate-900 truncate max-w-[200px]">
                                  {position.title}
                                </p>
                                <p className="text-xs text-slate-400 mt-0.5">
                                  {position.location || "Không rõ"} ·{" "}
                                  {durationLabels[position.duration || ""] || position.duration || "Không rõ"}
                                </p>
                              </div>
                            </td>

                            {/* Field */}
                            <td className="py-3.5 px-4 sm:px-0">
                              <span className="text-sm text-slate-600">{position.field || "Không rõ"}</span>
                            </td>

                            {/* Salary */}
                            <td className="py-3.5 px-4 sm:px-0">
                              {position.salaryMin && position.salaryMax ? (
                                <span className="text-sm font-medium text-slate-700">
                                  {position.salaryMin.toLocaleString()} - {position.salaryMax.toLocaleString()}
                                </span>
                              ) : (
                                <span className="text-sm text-slate-400 italic">Thỏa thuận</span>
                              )}
                            </td>

                            {/* Applicants */}
                            <td className="py-3.5 px-4 sm:px-0">
                              <div className="flex items-center gap-1.5">
                                <Users className="h-3.5 w-3.5 text-slate-400" />
                                <span className="text-sm font-medium text-slate-700">
                                  {applicantCount}
                                </span>
                              </div>
                            </td>

                            {/* Status */}
                            <td className="py-3.5 px-4 sm:px-0">
                              <span
                                className={cn(
                                  "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold capitalize",
                                  sc.bg,
                                  sc.text
                                )}
                              >
                                {sc.label}
                              </span>
                            </td>

                            {/* Actions */}
                            <td className="py-3.5 px-4 sm:px-0 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleViewCandidates(position.id)}
                                  className="h-8 px-2.5 text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 gap-1"
                                  title="Xem ứng viên"
                                >
                                  <Users className="h-3.5 w-3.5" />
                                  Ứng viên
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleEdit(position)}
                                  className="h-8 w-8 p-0 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                                  title="Chỉnh sửa"
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDelete({ id: position.id, title: position.title, _count: position._count })}
                                  disabled={applicantCount > 0}
                                  className={cn(
                                    "h-8 w-8 p-0",
                                    applicantCount > 0
                                      ? "cursor-not-allowed text-slate-300"
                                      : "text-slate-400 hover:text-red-600 hover:bg-red-50"
                                  )}
                                  title={
                                    applicantCount > 0
                                      ? `Không thể xóa: đã có ${applicantCount} ứng viên nộp đơn`
                                      : "Xóa vị trí"
                                  }
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 0 && (
                <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
                  <p className="text-sm text-slate-400">
                    Hiển thị {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
                    {Math.min(currentPage * ITEMS_PER_PAGE, filteredPositions.length)} trong{" "}
                    {filteredPositions.length} vị trí
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="h-8 w-8"
                    >
                      <span className="sr-only">Trang trước</span>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </Button>
                    <span className="text-sm text-slate-600 min-w-[80px] text-center">
                      {currentPage} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="h-8 w-8"
                    >
                      <span className="sr-only">Trang sau</span>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Job Posting Modal */}
      <JobPostingModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        editPosition={editPosition}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Xóa vị trí tuyển dụng"
        description={`Bạn có chắc chắn muốn xóa vị trí "${deleteTarget?.title}"? Hành động này không thể hoàn tác.`}
        confirmLabel="Xóa"
        cancelLabel="Huỷ"
        variant="danger"
      />
    </div>
  );
}
