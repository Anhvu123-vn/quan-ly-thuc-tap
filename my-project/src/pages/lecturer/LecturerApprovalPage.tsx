import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  ClipboardCheck,
  Check,
  X,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/shared/Badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ApprovalModal } from "@/components/lecturer/ApprovalModal";
import { api } from "@/services/api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const ITEMS_PER_PAGE = 10;

interface ApprovalItem {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentAvatar?: string;
  company: string;
  position: string;
  level: "department" | "lecturer" | "registrar";
  submittedDate: string;
  status: "pending" | "in_progress" | "approved" | "rejected";
  comment?: string;
  reviewerName?: string;
  reviewedAt?: string;
}

// Transform API response to component format
function transformApprovalItem(item: any): ApprovalItem {
  return {
    id: item.id,
    studentId: item.studentId,
    studentName: item.student?.name || "Unknown Student",
    studentEmail: item.student?.email || "",
    studentAvatar: item.student?.avatar,
    company: item.company?.name || "Unknown Company",
    position: item.position?.title || "Unknown Position",
    level: item.level,
    submittedDate: item.createdAt ? new Date(item.createdAt).toLocaleDateString("vi-VN") : "",
    status: item.status,
    comment: item.comments,
    reviewerName: item.reviewer?.name,
    reviewedAt: item.reviewedAt ? new Date(item.reviewedAt).toLocaleDateString("vi-VN") : undefined,
  };
}

export function LecturerApprovalPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<ApprovalItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState<"all" | "department" | "lecturer" | "registrar">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "in_progress" | "approved" | "rejected">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalItem, setModalItem] = useState<ApprovalItem | null>(null);
  const [modalType, setModalType] = useState<"approve" | "reject">("approve");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchApprovals = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const params: any = {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
      };
      
      if (statusFilter !== "all") {
        params.status = statusFilter;
      }
      if (levelFilter !== "all") {
        params.level = levelFilter;
      }

      const response = await api.getApprovals(params);
      const data = response?.data || response || [];
      const meta = response?.meta;
      
      const transformedItems = Array.isArray(data) 
        ? data.map(transformApprovalItem)
        : [];
      
      setItems(transformedItems);
      if (meta) {
        setTotalItems(meta.total || transformedItems.length);
      } else {
        setTotalItems(transformedItems.length);
      }
    } catch (err) {
      console.error("Failed to fetch approvals:", err);
      setError("Không thể tải danh sách phê duyệt. Vui lòng thử lại.");
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, statusFilter, levelFilter]);

  useEffect(() => {
    fetchApprovals();
  }, [fetchApprovals]);

  const filteredItems = items.filter((item) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      item.studentName.toLowerCase().includes(searchLower) ||
      item.company.toLowerCase().includes(searchLower) ||
      item.position.toLowerCase().includes(searchLower) ||
      item.studentEmail.toLowerCase().includes(searchLower)
    );
  });

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE) || 1;
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const pendingCount = items.filter((i) => i.status === "pending").length;

  const handleOpenApprove = (item: ApprovalItem) => {
    setModalItem(item);
    setModalType("approve");
    setModalOpen(true);
  };

  const handleOpenReject = (item: ApprovalItem) => {
    setModalItem(item);
    setModalType("reject");
    setModalOpen(true);
  };

  const handleConfirm = async (id: string, comment: string) => {
    setIsSubmitting(true);
    try {
      const newStatus = modalType === "approve" ? "approved" : "rejected";
      await api.reviewApproval(id, { status: newStatus, comment });
      
      // Update local state
      setItems((prev) =>
        prev.map((i) =>
          i.id === id
            ? {
                ...i,
                status: newStatus as ApprovalItem["status"],
                comment,
                reviewerName: user?.name,
                reviewedAt: new Date().toLocaleDateString("vi-VN"),
              }
            : i
        )
      );
      
      toast.success(
        modalType === "approve" 
          ? "Đã phê duyệt đơn thực tập!" 
          : "Đã từ chối đơn thực tập!"
      );
    } catch (err) {
      console.error("Failed to review approval:", err);
      toast.error("Không thể xử lý. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: ApprovalItem["status"]) => {
    switch (status) {
      case "approved":
        return <Badge variant="success">Đã duyệt</Badge>;
      case "rejected":
        return <Badge variant="danger">Từ chối</Badge>;
      case "in_progress":
        return <Badge variant="info">Đang xử lý</Badge>;
      case "pending":
      default:
        return <Badge variant="warning">Chờ duyệt</Badge>;
    }
  };

  const getStatusIcon = (status: ApprovalItem["status"]) => {
    switch (status) {
      case "approved":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "in_progress":
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-amber-500" />;
    }
  };

  const getLevelBadge = (level: ApprovalItem["level"]) => {
    switch (level) {
      case "department":
        return <Badge variant="default">Cấp Khoa</Badge>;
      case "lecturer":
        return <Badge variant="secondary">GV Hướng dẫn</Badge>;
      case "registrar":
        return <Badge variant="purple">Phòng Đào tạo</Badge>;
      default:
        return <Badge variant="default">{level}</Badge>;
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
            <p className="text-slate-500">Đang tải danh sách phê duyệt...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4 text-center">
            <AlertCircle className="h-12 w-12 text-red-400" />
            <p className="text-slate-600">{error}</p>
            <Button onClick={fetchApprovals}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Thử lại
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Phê duyệt đơn thực tập</h1>
          <p className="text-slate-500 mt-1">
            Xem xét và xử lý các đơn ứng tuyển của sinh viên
          </p>
        </div>
        <div className="flex items-center gap-3">
          {pendingCount > 0 && (
            <Badge variant="warning" size="md">
              {pendingCount} đơn chờ duyệt
            </Badge>
          )}
          <Button variant="outline" size="sm" onClick={fetchApprovals}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Làm mới
          </Button>
        </div>
      </div>

      {/* Data Table Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4 text-indigo-500" />
              Danh sách đơn ứng tuyển
              <span className="ml-1 text-sm font-normal text-slate-400">
                ({totalItems} đơn)
              </span>
            </CardTitle>

            {/* Filters */}
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Tìm theo tên, công ty, vị trí..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-9 w-full sm:w-64"
                />
              </div>

              {/* Level Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <select
                  value={levelFilter}
                  onChange={(e) => {
                    setLevelFilter(e.target.value as typeof levelFilter);
                    setCurrentPage(1);
                  }}
                  className="h-10 rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">Tất cả cấp</option>
                  <option value="department">Cấp Khoa</option>
                  <option value="lecturer">GV Hướng dẫn</option>
                  <option value="registrar">Phòng Đào tạo</option>
                </select>
              </div>

              {/* Status Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value as typeof statusFilter);
                    setCurrentPage(1);
                  }}
                  className="h-10 rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="pending">Chờ duyệt</option>
                  <option value="in_progress">Đang xử lý</option>
                  <option value="approved">Đã duyệt</option>
                  <option value="rejected">Từ chối</option>
                </select>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-2 sm:px-6">
          {/* Table */}
          <div className="overflow-x-auto -mx-2 sm:mx-0">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 px-4 sm:px-0">
                    Sinh viên
                  </th>
                  <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 px-4 sm:px-0">
                    Công ty · Vị trí
                  </th>
                  <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 px-4 sm:px-0">
                    Cấp duyệt
                  </th>
                  <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 px-4 sm:px-0">
                    Ngày nộp
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
                {paginatedItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-12 text-center text-sm text-slate-400"
                    >
                      Không tìm thấy đơn phù hợp
                    </td>
                  </tr>
                ) : (
                  paginatedItems.map((item, index) => (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className={cn(
                        "border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors",
                        item.status !== "pending" && "opacity-70"
                      )}
                    >
                      {/* Student */}
                      <td className="py-3.5 px-4 sm:px-0">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 shrink-0">
                            {item.studentAvatar ? (
                              <AvatarImage src={item.studentAvatar} alt={item.studentName} />
                            ) : null}
                            <AvatarFallback className="text-xs bg-indigo-100 text-indigo-700 font-semibold">
                              {item.studentName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-medium text-sm text-slate-900 truncate max-w-[160px]">
                              {item.studentName}
                            </p>
                            <p className="text-xs text-slate-400 truncate max-w-[160px]">
                              {item.studentEmail}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Company · Position */}
                      <td className="py-3.5 px-4 sm:px-0">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate max-w-[180px]">
                            {item.company}
                          </p>
                          <p className="text-xs text-slate-400 truncate max-w-[180px]">
                            {item.position}
                          </p>
                        </div>
                      </td>

                      {/* Level */}
                      <td className="py-3.5 px-4 sm:px-0">
                        {getLevelBadge(item.level)}
                      </td>

                      {/* Submitted Date */}
                      <td className="py-3.5 px-4 sm:px-0">
                        <span className="text-sm text-slate-500">
                          {formatDate(item.submittedDate)}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 sm:px-0">
                        <div className="flex items-center gap-1.5">
                          {getStatusIcon(item.status)}
                          {getStatusBadge(item.status)}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 sm:px-0 text-right">
                        {item.status === "pending" ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              onClick={() => handleOpenApprove(item)}
                              className="h-8 px-3 bg-emerald-500 hover:bg-emerald-600 text-white text-xs gap-1"
                            >
                              <Check className="h-3.5 w-3.5" />
                              Duyệt
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenReject(item)}
                              className="h-8 px-3 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 text-xs gap-1"
                            >
                              <X className="h-3.5 w-3.5" />
                              Từ chối
                            </Button>
                          </div>
                        ) : item.comment ? (
                          <div className="max-w-[200px]">
                            <p className="text-xs text-slate-500 italic text-right line-clamp-2" title={item.comment}>
                              "{item.comment}"
                            </p>
                            {item.reviewerName && (
                              <p className="text-xs text-slate-400 text-right mt-1">
                                - {item.reviewerName}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-300">—</span>
                        )}
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
              <p className="text-sm text-slate-400">
                Hiển thị {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredItems.length)}{" "}
                của {filteredItems.length} đơn
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="h-8 w-8"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-slate-600 min-w-[80px] text-center">
                  Trang {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="h-8 w-8"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approval Modal */}
      <ApprovalModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        item={modalItem}
        onConfirm={handleConfirm}
        type={modalType}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
