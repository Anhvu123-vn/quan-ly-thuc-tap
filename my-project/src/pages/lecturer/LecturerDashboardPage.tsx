import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Users,
  ClipboardCheck,
  BookOpen,
  Star,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  FileText,
  TrendingUp,
  RefreshCw,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/shared/Badge";
import { Button } from "@/components/ui/button";
import { api } from "@/services/api";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface Stats {
  totalStudents: number;
  totalApplications: number;
  pendingApprovals: number;
  approvedThisMonth: number;
}

interface ApprovalItem {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentAvatar?: string;
  company: string;
  position: string;
  status: string;
  submittedDate: string;
}

interface LogEntry {
  id: string;
  studentId: string;
  studentName: string;
  week: number;
  date: string;
  completedWork: string;
  status: string;
}

export function LecturerDashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({
    totalStudents: 0,
    totalApplications: 0,
    pendingApprovals: 0,
    approvedThisMonth: 0,
  });
  const [pendingApprovals, setPendingApprovals] = useState<ApprovalItem[]>([]);
  const [recentLogs, setRecentLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch all data in parallel
      const [approvalsRes, logsRes] = await Promise.allSettled([
        api.getApprovals({ status: "pending", limit: 5 }),
        api.getStudentsLogs(),
      ]);

      // Process approvals
      if (approvalsRes.status === "fulfilled") {
        const approvalsData = approvalsRes.value?.data || approvalsRes.value || [];
        setPendingApprovals(
          approvalsData.slice(0, 5).map((item: any) => ({
            id: item.id,
            studentId: item.studentId,
            studentName: item.student?.name || "Unknown",
            studentEmail: item.student?.email || "",
            studentAvatar: item.student?.avatar,
            company: item.company?.name || "Unknown",
            position: item.position?.title || "Unknown",
            status: item.status,
            submittedDate: item.createdAt
              ? new Date(item.createdAt).toLocaleDateString("vi-VN")
              : "",
          }))
        );
        setStats((prev) => ({ ...prev, pendingApprovals: approvalsData.length }));
      }

      // Process logs
      if (logsRes.status === "fulfilled") {
        const logsData = logsRes.value?.data || logsRes.value || [];
        setRecentLogs(
          logsData.slice(0, 6).map((log: any) => ({
            id: log.id,
            studentId: log.studentId,
            studentName: log.student?.name || "Unknown",
            week: log.weekNumber || log.week || 1,
            date: log.createdAt || log.entryDate || "",
            completedWork: log.completedWork || "",
            status: log.status || "pending",
          }))
        );
      }

      // Fetch additional stats from stats endpoint
      try {
        const statsRes = await api.getStats();
        const statsData = statsRes?.data || statsRes || {};
        setStats((prev) => ({
          ...prev,
          totalStudents: statsData.totalStudents || statsData.totalUsers || 0,
          totalApplications: statsData.totalApplications || 0,
          approvedThisMonth: statsData.approvedThisMonth || 0,
        }));
      } catch {
        // Stats endpoint might not have all data, use what we have
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      setError("Không thể tải dữ liệu dashboard");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const statCards = [
    {
      title: "Sinh viên theo dõi",
      value: stats.totalStudents || "-",
      change: stats.totalApplications > 0 ? `${stats.totalApplications} đơn` : undefined,
      trend: "neutral" as const,
    },
    {
      title: "Đơn chờ duyệt",
      value: stats.pendingApprovals,
      change: stats.pendingApprovals > 0 ? "Cần xử lý" : undefined,
      trend: stats.pendingApprovals > 0 ? "neutral" : "up",
    },
    {
      title: "Nhật ký mới tuần này",
      value: recentLogs.length,
      change: recentLogs.length > 0 ? "Cần phản hồi" : undefined,
      trend: "neutral" as const,
    },
    {
      title: "Đánh giá đã thực hiện",
      value: stats.approvedThisMonth || "-",
      change: stats.approvedThisMonth > 0 ? "Tháng này" : undefined,
      trend: "up" as const,
    },
  ];

  const statIcons = [Users, ClipboardCheck, BookOpen, Star];
  const statColors = [
    "bg-blue-100 text-blue-600",
    "bg-amber-100 text-amber-600",
    "bg-purple-100 text-purple-600",
    "bg-emerald-100 text-emerald-600",
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge variant="success" size="sm">Đã duyệt</Badge>;
      case "rejected":
        return <Badge variant="danger" size="sm">Từ chối</Badge>;
      case "pending":
        return <Badge variant="warning" size="sm">Chờ duyệt</Badge>;
      case "in_progress":
        return <Badge variant="info" size="sm">Đang xử lý</Badge>;
      default:
        return <Badge variant="default" size="sm">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
          <p className="text-slate-500">Đang tải dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertCircle className="h-12 w-12 text-red-400" />
        <p className="text-slate-600">{error}</p>
        <Button onClick={fetchDashboardData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Thử lại
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Dashboard Giảng viên
          </h1>
          <p className="text-slate-500 mt-1">
            Chào mừng bạn quay trở lại!
            {stats.pendingApprovals > 0 && (
              <>
                Có{" "}
                <span className="font-semibold text-indigo-600">
                  {stats.pendingApprovals} đơn
                </span>{" "}
                đang chờ bạn phê duyệt.
              </>
            )}
            {stats.pendingApprovals === 0 && (
              " Tất cả đơn đã được xử lý."
            )}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchDashboardData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Làm mới
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => {
          const Icon = statIcons[index];
          const color = statColors[index];
          return (
            <Card key={stat.title} className="card-hover">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-500">
                      {stat.title}
                    </p>
                    <p className="mt-1.5 text-3xl font-bold text-slate-900">
                      {stat.value}
                    </p>
                    {stat.change && (
                      <div className="mt-2 flex items-center gap-1 text-xs font-medium">
                        {stat.trend === "up" && (
                          <TrendingUp className="h-3 w-3 text-green-500" />
                        )}
                        <span
                          className={cn(
                            stat.trend === "up" && "text-green-600",
                            stat.trend === "down" && "text-red-600",
                            stat.trend === "neutral" && "text-slate-400"
                          )}
                        >
                          {stat.change}
                        </span>
                      </div>
                    )}
                  </div>
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl",
                      color
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Action: Pending Approvals Banner */}
      {stats.pendingApprovals > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
              <ClipboardCheck className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">
                {stats.pendingApprovals} đơn đang chờ phê duyệt
              </p>
              <p className="text-sm text-slate-500">
                Xem danh sách và phản hồi ngay hôm nay
              </p>
            </div>
          </div>
          <Button
            onClick={() => navigate("/lecturer/approval")}
            className="bg-amber-500 hover:bg-amber-600 text-white shrink-0"
          >
            Xem ngay
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </motion.div>
      )}

      {/* Recent Journals & Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Internship Journals */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-indigo-500" />
                Nhật ký thực tập mới nhất
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/lecturer/feedback")}
                className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 text-xs h-7 px-2"
              >
                Xem tất cả
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentLogs.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-400">Chưa có nhật ký nào</p>
              </div>
            ) : (
              recentLogs.map((log, index) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <Avatar className="h-9 w-9 shrink-0 mt-0.5">
                    <AvatarFallback className="text-xs bg-indigo-100 text-indigo-700 font-semibold">
                      {log.studentName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {log.studentName}
                      </p>
                      <div className="flex items-center gap-1 shrink-0">
                        {getStatusBadge(log.status)}
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Tuần {log.week} ·{" "}
                      {log.date
                        ? new Date(log.date).toLocaleDateString("vi-VN")
                        : ""}
                    </p>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {log.completedWork?.split("\n")[0] || "Không có nội dung"}
                    </p>
                  </div>
                </motion.div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Pending Approvals List */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4 text-amber-500" />
                Đơn chờ phê duyệt
              </CardTitle>
              {stats.pendingApprovals > 0 && (
                <Badge variant="warning" size="sm">
                  {stats.pendingApprovals}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingApprovals.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 className="h-10 w-10 text-green-300 mx-auto mb-2" />
                <p className="text-sm text-slate-400">
                  Tất cả đơn đã được xử lý!
                </p>
              </div>
            ) : (
              pendingApprovals.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-amber-50/50 border border-amber-100 hover:border-amber-200 transition-colors"
                >
                  <Avatar className="h-9 w-9 shrink-0">
                    {item.studentAvatar ? (
                      <AvatarImage src={item.studentAvatar} alt={item.studentName} />
                    ) : null}
                    <AvatarFallback className="text-xs bg-amber-100 text-amber-700 font-semibold">
                      {item.studentName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {item.studentName}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {item.company} · {item.position}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {item.submittedDate}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => navigate("/lecturer/approval")}
                    className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </motion.div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
