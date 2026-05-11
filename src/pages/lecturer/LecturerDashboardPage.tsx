import { useState } from "react";
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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/shared/Badge";
import { Button } from "@/components/ui/button";
import { mockApprovalItems, mockLogEntries } from "@/data/mockData";
import type { StatCard } from "@/types";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

export function LecturerDashboardPage() {
  const navigate = useNavigate();

  // Stat cards data
  const stats: StatCard[] = [
    {
      title: "Tổng sinh viên",
      value: "124",
      change: "+8",
      trend: "up",
    },
    {
      title: "Đơn chờ duyệt",
      value: mockApprovalItems.filter((i) => i.status === "pending").length,
      change: "Cần xử lý",
      trend: "neutral",
    },
    {
      title: "Nhật ký mới tuần này",
      value: "37",
      change: "+12",
      trend: "up",
    },
    {
      title: "Đánh giá đã thực hiện",
      value: "19",
      change: "-3",
      trend: "down",
    },
  ];

  const statIcons = [Users, ClipboardCheck, BookOpen, Star];
  const statColors = [
    "bg-blue-100 text-blue-600",
    "bg-amber-100 text-amber-600",
    "bg-purple-100 text-purple-600",
    "bg-emerald-100 text-emerald-600",
  ];

  // Recent journal entries (latest 6)
  const recentLogs = [...mockLogEntries]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  // Pending approvals for quick action
  const pendingApprovals = mockApprovalItems.filter(
    (i) => i.status === "pending"
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Dashboard Giảng viên
        </h1>
        <p className="text-slate-500 mt-1">
          Chào mừng bạn quay trở lại! Có{" "}
          <span className="font-semibold text-indigo-600">
            {pendingApprovals.length} đơn
          </span>{" "}
          đang chờ bạn phê duyệt.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
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
                        {stat.trend !== "neutral" && (
                          <span className="text-slate-400">vs tháng trước</span>
                        )}
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
      {pendingApprovals.length > 0 && (
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
                {pendingApprovals.length} đơn đang chờ phê duyệt
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
                      {log.studentId.slice(-2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        Sinh viên #{log.studentId}
                      </p>
                      <div className="flex items-center gap-1 shrink-0">
                        {log.status === "approved" && (
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                        )}
                        {log.status === "pending" && (
                          <Clock className="h-3.5 w-3.5 text-amber-500" />
                        )}
                        {log.status === "commented" && (
                          <FileText className="h-3.5 w-3.5 text-blue-500" />
                        )}
                        <Badge
                          variant={
                            log.status === "approved"
                              ? "success"
                              : log.status === "pending"
                              ? "warning"
                              : "default"
                          }
                          size="sm"
                        >
                          {log.status === "approved"
                            ? "Đã duyệt"
                            : log.status === "pending"
                            ? "Chờ duyệt"
                            : "Đã phản hồi"}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                      Tuần {log.week} · {log.date}
                    </p>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {log.completedWork.split("\n")[0]}
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
              <Badge variant="warning" size="sm">
                {pendingApprovals.length}
              </Badge>
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
                    <AvatarFallback className="text-xs bg-amber-100 text-amber-700 font-semibold">
                      {item.studentName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
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
                  <div className="flex items-center gap-1 shrink-0">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100">
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                    </div>
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100">
                      <XCircle className="h-3.5 w-3.5 text-red-600" />
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
