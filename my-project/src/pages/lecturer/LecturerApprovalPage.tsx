import { useState } from "react";
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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/shared/Badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ApprovalModal } from "@/components/lecturer/ApprovalModal";
import { mockApprovalItems, type ApprovalItem } from "@/data/mockData";
import { cn } from "@/lib/utils";

const ITEMS_PER_PAGE = 5;

export function LecturerApprovalPage() {
  const [items, setItems] = useState<ApprovalItem[]>(
    mockApprovalItems.map((item) => ({
      ...item,
      level: item.level === "faculty" ? "faculty" : "supervisor",
    }))
  );
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState<"all" | "faculty" | "supervisor">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "departmentApproved" | "approved" | "rejected">("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalItem, setModalItem] = useState<ApprovalItem | null>(null);
  const [modalType, setModalType] = useState<"approve" | "reject">("approve");

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.studentName.toLowerCase().includes(search.toLowerCase()) ||
      item.company.toLowerCase().includes(search.toLowerCase()) ||
      item.position.toLowerCase().includes(search.toLowerCase());
    const matchesLevel = levelFilter === "all" || item.level === levelFilter;
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesLevel && matchesStatus;
  });

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
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

  const handleConfirm = (id: string, comment: string) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === id
          ? {
              ...i,
              status: modalType === "approve" ? ("approved" as const) : ("rejected" as const),
              comment,
            }
          : i
      )
    );
  };

  const getStatusBadge = (status: ApprovalItem["status"]) => {
    switch (status) {
      case "approved":
        return <Badge variant="success">Đã duyệt</Badge>;
      case "rejected":
        return <Badge variant="danger">Từ chối</Badge>;
      case "departmentApproved":
        return <Badge variant="purple">Chờ GV duyệt</Badge>;
      default:
        return <Badge variant="warning">Chờ cấp khoa</Badge>;
    }
  };

  const getStatusIcon = (status: ApprovalItem["status"]) => {
    switch (status) {
      case "approved":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-amber-500" />;
    }
  };

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
        {pendingCount > 0 && (
          <Badge variant="warning" size="md">
            {pendingCount} đơn chờ duyệt
          </Badge>
        )}
      </div>

      {/* Data Table Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4 text-indigo-500" />
              Danh sách đơn ứng tuyển
              <span className="ml-1 text-sm font-normal text-slate-400">
                ({filteredItems.length} đơn)
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
                  <option value="faculty">Cấp Khoa</option>
                  <option value="supervisor">GV Hướng dẫn</option>
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
                  <option value="pending">Chờ cấp khoa</option>
                  <option value="departmentApproved">Chờ GV duyệt</option>
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
            <table className="w-full min-w-[700px]">
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
                          <Avatar className="h-8 w-8 shrink-0">
                            <AvatarFallback className="text-xs bg-indigo-100 text-indigo-700 font-semibold">
                              {item.studentName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
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
                        <Badge
                          variant={item.level === "faculty" ? "default" : "secondary"}
                          size="sm"
                        >
                          {item.level === "faculty" ? "Cấp Khoa" : "GV HD"}
                        </Badge>
                      </td>

                      {/* Submitted Date */}
                      <td className="py-3.5 px-4 sm:px-0">
                        <span className="text-sm text-slate-500">
                          {item.submittedDate}
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
                        {item.status === "departmentApproved" ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              onClick={() => handleOpenApprove(item)}
                              className="h-8 px-3 bg-emerald-500 hover:bg-emerald-600 text-white text-xs gap-1"
                            >
                              <Check className="h-3.5 w-3.5" />
                              Phê duyệt
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
                        ) : item.status === "pending" ? (
                          <div className="flex items-center gap-1.5 justify-end">
                            <Badge
                              variant="warning"
                              size="sm"
                              className="gap-1"
                              title="Đơn đang chờ phê duyệt cấp khoa trước khi bạn có thể xử lý"
                            >
                              <AlertCircle className="h-3 w-3" />
                              Chờ cấp khoa
                            </Badge>
                          </div>
                        ) : item.comment ? (
                          <p
                            className="text-xs text-slate-400 italic max-w-[200px] text-right truncate"
                            title={item.comment}
                          >
                            "{item.comment}"
                          </p>
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
          {totalPages > 0 && (
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
      />
    </div>
  );
}
