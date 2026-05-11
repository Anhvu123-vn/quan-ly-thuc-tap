import { useState } from "react";
import { motion } from "framer-motion";
import {
  Briefcase,
  Users,
  CheckCircle2,
  Clock,
  TrendingUp,
  ArrowRight,
  Building2,
  Eye,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, ApplicationStatusBadge } from "@/components/shared/Badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { mockJobPostings, mockApplications } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

export function CompanyDashboardPage() {
  const navigate = useNavigate();

  const stats = {
    totalJobs: mockJobPostings.length,
    activeJobs: mockJobPostings.filter((j) => j.status === "active").length,
    totalApplicants: mockJobPostings.reduce((acc, j) => acc + j.applicants, 0),
    interviews: mockApplications.filter((a) => a.status === "interview").length,
  };

  const statCards = [
    {
      label: "Vị trí đang mở",
      value: stats.activeJobs,
      total: stats.totalJobs,
      icon: Briefcase,
      color: "bg-indigo-100 text-indigo-600",
    },
    {
      label: "Ứng viên chờ duyệt",
      value: mockApplications.filter((a) => a.status === "applied").length,
      icon: Clock,
      color: "bg-amber-100 text-amber-600",
    },
    {
      label: "Sinh viên đang thực tập",
      value: mockApplications.filter((a) => a.status === "offer").length,
      icon: CheckCircle2,
      color: "bg-emerald-100 text-emerald-600",
    },
    {
      label: "Tổng ứng viên",
      value: stats.totalApplicants,
      icon: Users,
      color: "bg-violet-100 text-violet-600",
    },
  ];

  // Latest applicants (most recent 5)
  const latestApplicants = [...mockApplications]
    .sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime())
    .slice(0, 5);

  // Recruitment pipeline summary
  const pipelineStats = [
    { label: "Đã nộp", count: mockApplications.filter((a) => a.status === "applied").length, color: "bg-slate-400" },
    { label: "Xét duyệt", count: mockApplications.filter((a) => a.status === "screening").length, color: "bg-amber-400" },
    { label: "Phỏng vấn", count: mockApplications.filter((a) => a.status === "interview").length, color: "bg-blue-400" },
    { label: "Đề nghị", count: mockApplications.filter((a) => a.status === "offer").length, color: "bg-emerald-400" },
  ];

  const maxPipeline = Math.max(...pipelineStats.map((p) => p.count), 1);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard Doanh nghiệp</h1>
        <p className="text-slate-500 mt-1">
          Tổng quan tình hình tuyển dụng của bạn
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="card-hover">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                    <p className="mt-1.5 text-3xl font-bold text-slate-900">{stat.value}</p>
                    {"total" in stat && (
                      <p className="mt-1 text-xs text-slate-400">
                        trên {stat.total} vị trí
                      </p>
                    )}
                  </div>
                  <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", stat.color)}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Action Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100 rounded-xl p-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
            <TrendingUp className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <p className="font-semibold text-slate-900">
              Quản lý vị trí tuyển dụng
            </p>
            <p className="text-sm text-slate-500">
              Đăng tin mới, chỉnh sửa hoặc theo dõi ứng viên
            </p>
          </div>
        </div>
        <Button
          onClick={() => navigate("/company/jobs")}
          className="shrink-0 bg-indigo-500 hover:bg-indigo-600 text-white"
        >
          Quản lý tin tuyển dụng
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Latest Applicants */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4 text-indigo-500" />
                Ứng viên mới nhất
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/company/candidates")}
                className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 text-xs h-7 px-2"
              >
                Xem tất cả
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {latestApplicants.map((app, index) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarFallback className="text-xs bg-indigo-100 text-indigo-700 font-semibold">
                    {app.studentName.split(" ").slice(-1)[0][0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{app.studentName}</p>
                  <p className="text-xs text-slate-400 truncate">
                    {app.company} · {app.position}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-slate-400 hidden sm:block">{app.appliedDate}</span>
                  <ApplicationStatusBadge status={app.status} />
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => navigate("/company/candidates")}
                  className="h-7 w-7 shrink-0 text-slate-400 hover:text-indigo-600"
                  aria-label="View candidate"
                >
                  <Eye className="h-3.5 w-3.5" />
                </Button>
              </motion.div>
            ))}
          </CardContent>
        </Card>

        {/* Recruitment Pipeline */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4 text-violet-500" />
              Trạng thái tuyển dụng
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {pipelineStats.map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-slate-600">{item.label}</span>
                  <span className="text-sm font-semibold text-slate-900">{item.count}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.count / maxPipeline) * 100}%` }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className={cn("h-full rounded-full", item.color)}
                  />
                </div>
              </div>
            ))}

            {/* Upcoming interviews */}
            <div className="pt-4 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Lịch phỏng vấn sắp tới
              </p>
              {mockApplications
                .filter((a) => a.interviewDate)
                .map((app) => (
                  <div
                    key={app.id}
                    className="flex items-center gap-2 p-2 rounded-lg bg-blue-50/50 mb-2 last:mb-0"
                  >
                    <Calendar className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-slate-900 truncate">{app.studentName}</p>
                      <p className="text-xs text-slate-400">{app.interviewDate}</p>
                    </div>
                  </div>
                ))}
              {mockApplications.filter((a) => a.interviewDate).length === 0 && (
                <p className="text-xs text-slate-400 text-center py-3">Không có lịch phỏng vấn</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
