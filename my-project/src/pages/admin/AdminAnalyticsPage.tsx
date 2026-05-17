import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Users, Building2, Briefcase, Download, Loader2, AlertCircle, GraduationCap, MapPin, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/shared/Tabs";
import { cn } from "@/lib/utils";
import { api } from "@/services/api";

interface StatsData {
  users: {
    total: number;
    students: number;
    lecturers: number;
    companies: number;
    admins: number;
  };
  positions: {
    total: number;
  };
  applications: {
    total: number;
    approved: number;
    byStatus: Array<{ status: string; count: number }>;
  };
  studentsWithInternship: number;
  successRate: number;
  topCompanies: Array<{ name: string; id: string; count: number }>;
  monthlyApplications: Array<{ month: string; count: number }>;
}

interface StudentData {
  total: number;
  withInternship: number;
  withoutInternship: number;
  byFaculty: Array<{ faculty: string; count: number }>;
  topPositions: Array<{ title: string; count: number }>;
}

interface CompanyData {
  total: number;
  active: number;
  withInterns: number;
  byIndustry: Array<{ industry: string; count: number }>;
  topPositions: Array<{ title: string; company: string; applications: number }>;
}

const defaultStats: StatsData = {
  users: { total: 0, students: 0, lecturers: 0, companies: 0, admins: 0 },
  positions: { total: 0 },
  applications: { total: 0, approved: 0, byStatus: [] },
  studentsWithInternship: 0,
  successRate: 0,
  topCompanies: [],
  monthlyApplications: [],
};

const defaultStudentData: StudentData = {
  total: 0,
  withInternship: 0,
  withoutInternship: 0,
  byFaculty: [],
  topPositions: [],
};

const defaultCompanyData: CompanyData = {
  total: 0,
  active: 0,
  withInterns: 0,
  byIndustry: [],
  topPositions: [],
};

const statusLabels: Record<string, string> = {
  applied: "Đã nộp",
  screening: "Đang xét duyệt",
  interview: "Phỏng vấn",
  offer: "Đã nhận offer",
  department_approved: "Đã duyệt",
  rejected: "Từ chối",
  withdrawn: "Đã rút",
};

const statusColors: Record<string, string> = {
  applied: "bg-blue-100 text-blue-700",
  screening: "bg-amber-100 text-amber-700",
  interview: "bg-purple-100 text-purple-700",
  offer: "bg-emerald-100 text-emerald-700",
  department_approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  withdrawn: "bg-slate-100 text-slate-700",
};

export function AdminAnalyticsPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState<StatsData>(defaultStats);
  const [studentData, setStudentData] = useState<StudentData>(defaultStudentData);
  const [companyData, setCompanyData] = useState<CompanyData>(defaultCompanyData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const tabs = [
    { id: "overview", label: "Tổng quan" },
    { id: "students", label: "Sinh viên" },
    { id: "companies", label: "Doanh nghiệp" },
  ];

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await api.getStats();
      const statsData = data?.data || data || {};
      
      setStats({
        users: {
          total: statsData.users?.total ?? 0,
          students: statsData.users?.students ?? 0,
          lecturers: statsData.users?.lecturers ?? 0,
          companies: statsData.users?.companies ?? 0,
          admins: statsData.users?.admins ?? 0,
        },
        positions: {
          total: statsData.positions?.total ?? 0,
        },
        applications: {
          total: statsData.applications?.total ?? 0,
          approved: statsData.applications?.approved ?? 0,
          byStatus: statsData.applications?.byStatus ?? [],
        },
        studentsWithInternship: statsData.studentsWithInternship ?? 0,
        successRate: statsData.successRate ?? 0,
        topCompanies: statsData.topCompanies ?? [],
        monthlyApplications: statsData.monthlyApplications ?? [],
      });

      // Parse student-specific data from stats
      const totalStudents = statsData.users?.students ?? 0;
      const withInternship = statsData.studentsWithInternship ?? 0;
      setStudentData({
        total: totalStudents,
        withInternship: withInternship,
        withoutInternship: Math.max(0, totalStudents - withInternship),
        byFaculty: statsData.studentsByFaculty ?? [],
        topPositions: statsData.topStudentPositions ?? [],
      });

      // Parse company-specific data from stats
      const totalCompanies = statsData.users?.companies ?? 0;
      setCompanyData({
        total: totalCompanies,
        active: statsData.activeCompanies ?? totalCompanies,
        withInterns: statsData.companiesWithInterns ?? 0,
        byIndustry: statsData.companiesByIndustry ?? [],
        topPositions: statsData.topCompanyPositions ?? [],
      });
    } catch (err) {
      console.error("Failed to fetch stats:", err);
      setError("Không thể tải dữ liệu thống kê. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
            <p className="text-slate-500">Đang tải dữ liệu thống kê...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4 text-center">
            <AlertCircle className="h-12 w-12 text-red-400" />
            <p className="text-slate-600">{error}</p>
            <Button onClick={fetchStats}>Thử lại</Button>
          </div>
        </div>
      </div>
    );
  }

  const { users, positions, applications, studentsWithInternship, successRate, topCompanies, monthlyApplications } = stats;

  // Render Overview Tab
  const renderOverviewTab = () => (
    <>
      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Tổng sinh viên", value: users.students, icon: Users, color: "from-indigo-500 to-violet-600" },
          { label: "Đã có chỗ thực tập", value: studentsWithInternship, icon: Building2, color: "from-emerald-500 to-teal-600" },
          { label: "Tỷ lệ thành công", value: `${successRate}%`, icon: TrendingUp, color: "from-amber-500 to-orange-600" },
          { label: "Doanh nghiệp", value: users.companies, icon: Briefcase, color: "from-blue-500 to-indigo-600" },
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
          {monthlyApplications && monthlyApplications.length > 0 ? (
            <div className="space-y-4">
              {monthlyApplications.map((month, index) => {
                const maxCount = Math.max(...monthlyApplications.map((m) => m.count || 0), 1);
                const percentage = ((month.count || 0) / maxCount) * 100;
                return (
                  <div key={month.month || index} className="flex items-center gap-4">
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
          ) : (
            <p className="text-slate-400 text-center py-8">Chưa có dữ liệu ứng tuyển</p>
          )}
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
          {topCompanies && topCompanies.length > 0 ? (
            <div className="space-y-4">
              {topCompanies.map((company, index) => (
                <div key={company.id || index} className="flex items-center gap-4">
                  <span className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-medium text-slate-600">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{company.name}</p>
                    <div className="h-2 bg-slate-100 rounded-full mt-1 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(company.count / (topCompanies[0]?.count || 1)) * 100}%` }}
                        transition={{ duration: 0.8, delay: index * 0.1 }}
                        className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                      />
                    </div>
                  </div>
                  <span className="text-sm font-medium text-slate-600">{company.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-center py-8">Chưa có dữ liệu doanh nghiệp</p>
          )}
        </motion.div>

        {/* Application Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white rounded-xl border border-slate-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-500" />
              Trạng thái đơn ứng tuyển
            </h3>
          </div>
          <div className="space-y-3">
            {applications?.byStatus?.map((item) => (
              <div key={item.status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={cn("px-2 py-1 rounded-md text-xs font-medium", statusColors[item.status] || "bg-slate-100 text-slate-700")}>
                    {statusLabels[item.status] || item.status}
                  </span>
                </div>
                <span className="font-medium text-slate-900">{item.count}</span>
              </div>
            ))}
            <div className="border-t pt-3 mt-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-900">Tổng cộng</span>
                <span className="font-bold text-slate-900">{applications?.total || 0}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl border border-slate-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              Thống kê nhanh
            </h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-600">Tổng người dùng</span>
              <span className="font-bold text-slate-900">{users.total}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-600">Giảng viên</span>
              <span className="font-bold text-slate-900">{users.lecturers}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-600">Vị trí tuyển dụng</span>
              <span className="font-bold text-slate-900">{positions?.total || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-600">Quản trị viên</span>
              <span className="font-bold text-slate-900">{users.admins}</span>
            </div>
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
            <h3 className="font-semibold mb-1">Báo cáo tổng kết</h3>
            <p className="text-indigo-100 text-sm">Cập nhật: {new Date().toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-3xl font-bold">{Math.max(0, users.students - studentsWithInternship)}</p>
              <p className="text-sm text-indigo-200">Sinh viên đang tìm việc</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">{successRate}%</p>
              <p className="text-sm text-indigo-200">Tỷ lệ thành công</p>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );

  // Render Students Tab
  const renderStudentsTab = () => (
    <>
      {/* Student Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Tổng sinh viên", value: studentData.total, icon: GraduationCap, color: "from-indigo-500 to-violet-600" },
          { label: "Đã có chỗ thực tập", value: studentData.withInternship, icon: CheckCircle, color: "from-emerald-500 to-teal-600" },
          { label: "Chưa có chỗ", value: studentData.withoutInternship, icon: Clock, color: "from-amber-500 to-orange-600" },
          { label: "Tỷ lệ có việc", value: studentData.total > 0 ? `${Math.round((studentData.withInternship / studentData.total) * 100)}%` : "0%", icon: TrendingUp, color: "from-blue-500 to-indigo-600" },
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
            </div>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-sm text-slate-500">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Students by Faculty */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl border border-slate-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-indigo-500" />
              Sinh viên theo khoa
            </h3>
          </div>
          {studentData.byFaculty && studentData.byFaculty.length > 0 ? (
            <div className="space-y-4">
              {studentData.byFaculty.map((faculty, index) => {
                const maxCount = Math.max(...studentData.byFaculty.map((f) => f.count || 0), 1);
                const percentage = ((faculty.count || 0) / maxCount) * 100;
                return (
                  <div key={faculty.faculty || index} className="flex items-center gap-4">
                    <span className="text-sm font-medium text-slate-600 w-32 truncate">{faculty.faculty}</span>
                    <div className="flex-1 h-6 bg-slate-100 rounded-lg overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.8, delay: index * 0.1 }}
                        className="h-full bg-gradient-to-r from-indigo-500 to-violet-600 rounded-lg flex items-center justify-end pr-3"
                      >
                        <span className="text-sm font-medium text-white">{faculty.count}</span>
                      </motion.div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-slate-400 text-center py-8">Chưa có dữ liệu theo khoa</p>
          )}
        </motion.div>

        {/* Top Positions for Students */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl border border-slate-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-amber-500" />
              Vị trí được quan tâm nhiều nhất
            </h3>
          </div>
          {studentData.topPositions && studentData.topPositions.length > 0 ? (
            <div className="space-y-4">
              {studentData.topPositions.map((position, index) => (
                <div key={position.title || index} className="flex items-center gap-4">
                  <span className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-medium text-slate-600">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{position.title}</p>
                    <div className="h-2 bg-slate-100 rounded-full mt-1 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(position.count / (studentData.topPositions[0]?.count || 1)) * 100}%` }}
                        transition={{ duration: 0.8, delay: index * 0.1 }}
                        className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                      />
                    </div>
                  </div>
                  <span className="text-sm font-medium text-slate-600">{position.count} ứng viên</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-center py-8">Chưa có dữ liệu vị trí</p>
          )}
        </motion.div>

        {/* Internship Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white rounded-xl border border-slate-200 p-6 lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              Tiến độ thực tập
            </h3>
          </div>
          <div className="flex items-center gap-8">
            <div className="flex-1">
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold text-emerald-600">{studentData.withInternship}</span>
                <span className="text-slate-500 mb-1">/ {studentData.total} sinh viên</span>
              </div>
              <div className="h-4 bg-slate-100 rounded-full mt-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${studentData.total > 0 ? (studentData.withInternship / studentData.total) * 100 : 0}%` }}
                  transition={{ duration: 1 }}
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full"
                />
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-slate-900">
                {studentData.total > 0 ? Math.round((studentData.withInternship / studentData.total) * 100) : 0}%
              </p>
              <p className="text-sm text-slate-500">hoàn thành</p>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );

  // Render Companies Tab
  const renderCompaniesTab = () => (
    <>
      {/* Company Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Tổng doanh nghiệp", value: companyData.total, icon: Building2, color: "from-indigo-500 to-violet-600" },
          { label: "Đang hoạt động", value: companyData.active, icon: CheckCircle, color: "from-emerald-500 to-teal-600" },
          { label: "Đã nhận thực tập", value: companyData.withInterns, icon: Users, color: "from-blue-500 to-indigo-600" },
          { label: "Vị trí tuyển dụng", value: positions?.total || 0, icon: Briefcase, color: "from-amber-500 to-orange-600" },
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
            </div>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-sm text-slate-500">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Companies by Industry */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl border border-slate-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-indigo-500" />
              Doanh nghiệp theo ngành
            </h3>
          </div>
          {companyData.byIndustry && companyData.byIndustry.length > 0 ? (
            <div className="space-y-4">
              {companyData.byIndustry.map((industry, index) => {
                const maxCount = Math.max(...companyData.byIndustry.map((i) => i.count || 0), 1);
                const percentage = ((industry.count || 0) / maxCount) * 100;
                return (
                  <div key={industry.industry || index} className="flex items-center gap-4">
                    <span className="text-sm font-medium text-slate-600 w-32 truncate">{industry.industry}</span>
                    <div className="flex-1 h-6 bg-slate-100 rounded-lg overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.8, delay: index * 0.1 }}
                        className="h-full bg-gradient-to-r from-indigo-500 to-violet-600 rounded-lg flex items-center justify-end pr-3"
                      >
                        <span className="text-sm font-medium text-white">{industry.count}</span>
                      </motion.div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-slate-400 text-center py-8">Chưa có dữ liệu theo ngành</p>
          )}
        </motion.div>

        {/* Top Positions by Company */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl border border-slate-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-amber-500" />
              Vị trí tuyển dụng nhiều nhất
            </h3>
          </div>
          {companyData.topPositions && companyData.topPositions.length > 0 ? (
            <div className="space-y-4">
              {companyData.topPositions.map((position, index) => (
                <div key={position.title || index} className="flex items-center gap-4">
                  <span className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-medium text-slate-600">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{position.title}</p>
                    <p className="text-xs text-slate-500">{position.company}</p>
                    <div className="h-2 bg-slate-100 rounded-full mt-1 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(position.applications / (companyData.topPositions[0]?.applications || 1)) * 100}%` }}
                        transition={{ duration: 0.8, delay: index * 0.1 }}
                        className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                      />
                    </div>
                  </div>
                  <span className="text-sm font-medium text-slate-600">{position.applications} đơn</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-center py-8">Chưa có dữ liệu vị trí</p>
          )}
        </motion.div>

        {/* Company Activity Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white rounded-xl border border-slate-200 p-6 lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              Tổng quan doanh nghiệp
            </h3>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl text-center">
              <p className="text-2xl font-bold text-indigo-600">{companyData.total}</p>
              <p className="text-sm text-slate-500">Tổng doanh nghiệp</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl text-center">
              <p className="text-2xl font-bold text-emerald-600">{companyData.active}</p>
              <p className="text-sm text-slate-500">Đang hoạt động</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl text-center">
              <p className="text-2xl font-bold text-blue-600">{companyData.withInterns}</p>
              <p className="text-sm text-slate-500">Đã nhận thực tập</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl text-center">
              <p className="text-2xl font-bold text-amber-600">{positions?.total || 0}</p>
              <p className="text-sm text-slate-500">Vị trí tuyển dụng</p>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );

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

      {/* Tab Content */}
      {activeTab === "overview" && renderOverviewTab()}
      {activeTab === "students" && renderStudentsTab()}
      {activeTab === "companies" && renderCompaniesTab()}
    </div>
  );
}
