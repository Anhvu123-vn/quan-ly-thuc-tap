import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Mail,
  Bell,
  Search,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  User,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { api } from "@/services/api";

interface SystemLog {
  id: string;
  logType: "email" | "notification" | "system";
  actorId: string | null;
  actorName: string | null;
  actorRole: string | null;
  recipientEmail: string | null;
  subject: string | null;
  message: string | null;
  status: string;
  sentAt: string;
  metadata: Record<string, any> | null;
}

interface LogStats {
  total: number;
  sent: number;
  failed: number;
}

const typeLabels: Record<string, string> = {
  email: "Email",
  notification: "Thông báo",
  system: "Hệ thống",
};

const statusLabels: Record<string, string> = {
  sent: "Đã gửi",
  failed: "Thất bại",
  pending: "Đang chờ",
};

const roleColors: Record<string, string> = {
  admin: "bg-red-100 text-red-700",
  student: "bg-blue-100 text-blue-700",
  lecturer: "bg-purple-100 text-purple-700",
  company: "bg-emerald-100 text-emerald-700",
};

export function AdminSystemLogsPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [stats, setStats] = useState<LogStats>({ total: 0, sent: 0, failed: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const query: any = { page, limit: 20 };
      if (activeTab !== "all") query.logType = activeTab;

      const [logsResponse, statsResponse] = await Promise.all([
        api.getSystemLogs(query),
        api.getSystemLogStats(),
      ]);

      // Handle both wrapped { success, data, meta } and raw array responses
      const rawData = logsResponse?.data ?? logsResponse;
      const logItems: SystemLog[] = Array.isArray(rawData) ? rawData : [];
      const meta = logsResponse?.meta;

      setLogs(logItems);
      // Backend /logs/system/stats returns { success, data } — the api wrapper returns data directly
      const statsData = (statsResponse as any)?.data ?? statsResponse;
      setStats(statsData ?? { total: 0, sent: 0, failed: 0 });
      if (meta) {
        setTotalPages(meta.totalPages || 1);
        setTotalCount(meta.total || 0);
      } else {
        setTotalPages(1);
        setTotalCount(logItems.length);
      }
    } catch (err) {
      console.error("Failed to fetch logs:", err);
    } finally {
      setIsLoading(false);
    }
  }, [page, activeTab]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    setPage(1);
  }, [activeTab]);

  const filteredLogs = logs.filter((log) => {
    if (!searchQuery) return true;
    const s = searchQuery.toLowerCase();
    return (
      (log.subject?.toLowerCase().includes(s) ?? false) ||
      (log.recipientEmail?.toLowerCase().includes(s) ?? false) ||
      (log.message?.toLowerCase().includes(s) ?? false) ||
      (log.actorName?.toLowerCase().includes(s) ?? false) ||
      (log.actorRole?.toLowerCase().includes(s) ?? false)
    );
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "email":
        return <Mail className="h-4 w-4" />;
      case "notification":
        return <Bell className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeColors = (type: string) => {
    switch (type) {
      case "email":
        return { bg: "bg-blue-100", icon: "text-blue-600" };
      case "notification":
        return { bg: "bg-indigo-100", icon: "text-indigo-600" };
      default:
        return { bg: "bg-slate-100", icon: "text-slate-600" };
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "sent":
        return { icon: CheckCircle, bg: "bg-emerald-50", text: "text-emerald-600" };
      case "failed":
        return { icon: XCircle, bg: "bg-red-50", text: "text-red-600" };
      default:
        return { icon: Clock, bg: "bg-amber-50", text: "text-amber-600" };
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const tabs = [
    { id: "all", label: "Tất cả" },
    { id: "email", label: "Email" },
    { id: "notification", label: "Thông báo" },
    { id: "system", label: "Hoạt động" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">System Logs</h1>
          <p className="text-slate-500 mt-1">
            Lịch sử hoạt động của hệ thống và người dùng
          </p>
        </div>
        <Button variant="outline" onClick={fetchLogs}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Làm mới
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Tổng hoạt động", value: stats.total, color: "border-indigo-200 bg-indigo-50" },
          { label: "Đã gửi", value: stats.sent, color: "border-emerald-200 bg-emerald-50" },
          { label: "Thất bại", value: stats.failed, color: "border-red-200 bg-red-50" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={cn("rounded-xl border p-5", stat.color)}
          >
            <p className="text-3xl font-bold text-slate-900">{stat.value.toLocaleString()}</p>
            <p className="text-sm font-medium text-slate-600 mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                activeTab === tab.id
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Tìm kiếm nội dung, người dùng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-full sm:w-72"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <Filter className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Không có hoạt động nào</p>
            <p className="text-sm mt-1">Các hoạt động của hệ thống sẽ hiển thị tại đây</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80">
                  <th className="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Loại
                  </th>
                  <th className="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Người thực hiện
                  </th>
                  <th className="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Nội dung
                  </th>
                  <th className="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Thời gian
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log, index) => {
                  const colors = getTypeColors(log.logType);
                  const statusConfig = getStatusConfig(log.status);
                  const StatusIcon = statusConfig.icon;
                  const roleColorClass = log.actorRole ? (roleColors[log.actorRole] ?? "bg-gray-100 text-gray-600") : "";

                  return (
                    <motion.tr
                      key={log.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.02 }}
                      className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors group"
                    >
                      {/* Type */}
                      <td className="p-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={cn(
                              "h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
                              colors.bg
                            )}
                          >
                            {getTypeIcon(log.logType)}
                          </div>
                          <span className="text-sm font-medium text-slate-700">
                            {typeLabels[log.logType] || log.logType}
                          </span>
                        </div>
                      </td>

                      {/* Actor */}
                      <td className="p-4 min-w-[160px]">
                        {log.actorName ? (
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                              <span className="text-sm font-medium text-slate-800 truncate">
                                {log.actorName}
                              </span>
                            </div>
                            {log.actorRole && (
                              <span
                                className={cn(
                                  "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium w-fit",
                                  roleColorClass
                                )}
                              >
                                {log.actorRole}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400">Hệ thống</span>
                        )}
                      </td>

                      {/* Content */}
                      <td className="p-4 max-w-md">
                        <p className="text-sm font-semibold text-slate-800 line-clamp-1">
                          {log.subject || "Không có tiêu đề"}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                          {log.message || log.recipientEmail || "—"}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <div
                          className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                            statusConfig.bg,
                            statusConfig.text
                          )}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {statusLabels[log.status] || log.status}
                        </div>
                      </td>

                      {/* Time */}
                      <td className="p-4 text-sm text-slate-500 whitespace-nowrap">
                        {formatDate(log.sentAt)}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Hiển thị{" "}
            <span className="font-semibold text-slate-700">{filteredLogs.length}</span> /{" "}
            <span className="font-semibold text-slate-700">{totalCount.toLocaleString()}</span> kết
            quả
            {totalPages > 1 && (
              <span className="ml-1">
                — Trang <span className="font-medium">{page}</span> / {totalPages}
              </span>
            )}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= totalPages}
            >
              Sau
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
