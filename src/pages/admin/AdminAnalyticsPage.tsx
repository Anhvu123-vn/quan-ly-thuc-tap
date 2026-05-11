import { useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Users, Building2, Briefcase, Download, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/shared/Badge";
import { Tabs } from "@/components/shared/Tabs";
import { mockAnalyticsData } from "@/data/mockData";
import { cn } from "@/lib/utils";

export function AdminAnalyticsPage() {
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { id: "overview", label: "Tổng quan" },
    { id: "students", label: "Sinh viên" },
    { id: "companies", label: "Doanh nghiệp" },
  ];

  const { totalStudents, studentsWithInternship, successRate, topCompanies, monthlyApplications, skillsDemand } = mockAnalyticsData;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Analytics Dashboard</h1>
          <p className="text-slate-500 mt-1">Thống kê và báo cáo hệ thống</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Xuất Excel
          </Button>
          <Button className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700">
            <Download className="h-4 w-4 mr-2" />
            Xuất PDF
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Tổng sinh viên", value: totalStudents, icon: Users, color: "from-indigo-500 to-violet-600", trend: "+12%" },
          { label: "Đã có chỗ thực tập", value: studentsWithInternship, icon: Building2, color: "from-emerald-500 to-teal-600", trend: "+8%" },
          { label: "Tỷ lệ thành công", value: `${successRate}%`, icon: TrendingUp, color: "from-amber-500 to-orange-600", trend: "+3%" },
          { label: "Doanh nghiệp", value: topCompanies.length + 10, icon: Briefcase, color: "from-blue-500 to-indigo-600", trend: "+5" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-xl border border-slate-200 p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={cn("h-10 w-10 rounded-xl bg-gradient-to-br flex items-center justify-center", stat.color)}>
                <stat.icon className="h-5 w-5 text-white" />
              </div>
              <Badge variant="success" size="sm">{stat.trend}</Badge>
            </div>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-sm text-slate-500">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Applications Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl border border-slate-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-indigo-500" />
              Số lượng ứng tuyển theo tháng
            </h3>
          </div>
          <div className="space-y-4">
            {monthlyApplications.map((month, index) => {
              const maxCount = Math.max(...monthlyApplications.map((m) => m.count));
              const percentage = (month.count / maxCount) * 100;
              return (
                <div key={month.month} className="flex items-center gap-4">
                  <span className="text-sm font-medium text-slate-600 w-8">{month.month}</span>
                  <div className="flex-1 h-8 bg-slate-100 rounded-lg overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.8, delay: index * 0.1 }}
                      className="h-full bg-gradient-to-r from-indigo-500 to-violet-600 rounded-lg flex items-center justify-end pr-3"
                    >
                      <span className="text-sm font-medium text-white">{month.count}</span>
                    </motion.div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Top Companies */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl border border-slate-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-amber-500" />
              Top doanh nghiệp được quan tâm
            </h3>
          </div>
          <div className="space-y-4">
            {topCompanies.map((company, index) => (
              <div key={company.name} className="flex items-center gap-4">
                <span className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-medium text-slate-600">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{company.name}</p>
                  <div className="h-2 bg-slate-100 rounded-full mt-1 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(company.count / topCompanies[0].count) * 100}%` }}
                      transition={{ duration: 0.8, delay: index * 0.1 }}
                      className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                    />
                  </div>
                </div>
                <span className="text-sm font-medium text-slate-600">{company.count}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Skills Demand */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl border border-slate-200 p-6 lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              Kỹ năng được yêu cầu nhiều nhất
            </h3>
          </div>
          <div className="flex flex-wrap gap-3">
            {skillsDemand.map((skill, index) => (
              <motion.div
                key={skill.skill}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl border border-slate-200"
              >
                <Badge variant="info">{skill.skill}</Badge>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-24 bg-slate-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${skill.demand}%` }}
                      transition={{ duration: 0.8, delay: index * 0.1 }}
                      className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full"
                    />
                  </div>
                  <span className="text-sm font-medium text-slate-600">{skill.demand}%</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-600 rounded-2xl p-6 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold mb-1">Báo cáo tổng kết tháng</h3>
            <p className="text-indigo-100 text-sm">Cập nhật: Tháng 5, 2026</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-3xl font-bold">{totalStudents - studentsWithInternship}</p>
              <p className="text-sm text-indigo-200">Sinh viên đang tìm việc</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">{successRate}%</p>
              <p className="text-sm text-indigo-200">Tỷ lệ thành công</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
