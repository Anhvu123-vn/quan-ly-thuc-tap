import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Mail, Phone, FileText, ExternalLink, Calendar, MessageSquare, Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApplicationStatusBadge } from "@/components/shared/Badge";
import { Tabs } from "@/components/shared/Tabs";
import { api } from "@/services/api";
import { cn } from "@/lib/utils";

interface Application {
  id: string;
  positionId: string;
  studentId: string;
  status: string;
  coverLetter?: string;
  appliedAt: string;
  createdAt: string;
  position?: {
    id: string;
    title: string;
    companyId?: string;
  };
  student?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
}

export function CompanyCandidateReviewPage() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchApplications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.getCompanyApplications();
      // Handle both direct array and wrapped response { data: [...] }
      const appsData = response?.data || response || [];
      setApplications(Array.isArray(appsData) ? appsData : []);
    } catch (err) {
      console.error("Failed to fetch applications:", err);
      setError("Không thể tải danh sách ứng viên");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const tabs = [
    { id: "all", label: "Tất cả", badge: applications.length },
    { id: "screening", label: "Chờ xét duyệt", badge: applications.filter((a) => a.status === "screening").length },
    { id: "interview", label: "Phỏng vấn", badge: applications.filter((a) => a.status === "interview").length },
    { id: "department_approved", label: "Đã duyệt", badge: applications.filter((a) => a.status === "department_approved").length },
  ];

  const filteredApps = statusFilter === "all" 
    ? applications 
    : applications.filter((a) => a.status === statusFilter);

  const selected = applications.find((a) => a.id === selectedAppId);

  const updateStatus = async (id: string, status: string, label: string) => {
    setUpdatingStatus(id);
    setSuccessMessage(null);
    try {
      await api.updateApplicationStatus(id, status);
      setApplications((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status } : a))
      );
      setSuccessMessage(`Đã cập nhật: ${label}`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Không thể cập nhật trạng thái. Vui lòng thử lại.");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Xem ứng viên</h1>
        <p className="text-slate-500 mt-1">Xem chi tiết và quản lý ứng viên</p>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={tabs}
        activeTab={statusFilter}
        onChange={setStatusFilter}
      />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Candidate List */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={fetchApplications}>Thử lại</Button>
            </div>
          ) : filteredApps.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              Không có ứng viên nào
            </div>
          ) : (
            filteredApps.map((app, index) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedAppId(app.id)}
                className={cn(
                  "bg-white rounded-xl border p-4 cursor-pointer transition-all",
                  selectedAppId === app.id
                    ? "border-indigo-500 shadow-lg shadow-indigo-500/10"
                    : "border-slate-200 hover:border-slate-300"
                )}
              >
                <div className="flex items-start gap-4">
                  <motion.div 
                    className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold"
                    layoutId={`avatar-${app.id}`}
                  >
                    {app.student?.name?.split(" ").slice(-1)[0]?.[0] || "?"}
                  </motion.div>
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-900">{app.student?.name || "Sinh viên"}</h4>
                    <p className="text-sm text-slate-500">{app.position?.title || "Vị trí"}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <motion.div
                        key={app.status}
                        initial={{ scale: 1.1 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 25 }}
                      >
                        <ApplicationStatusBadge status={app.status as any} />
                      </motion.div>
                      <span className="text-xs text-slate-400">• {formatDate(app.appliedAt || app.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Candidate Detail */}
        <div>
          {selected ? (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl border border-slate-200 p-6 sticky top-6"
            >
              {/* Profile Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-xl">
                  {selected.student?.name?.split(" ").slice(-1)[0]?.[0] || "?"}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">{selected.student?.name || "Sinh viên"}</h3>
                  <p className="text-slate-500">{selected.position?.title || "Vị trí"}</p>
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Mail className="h-4 w-4 text-slate-400" />
                  {selected.student?.email || "Không có email"}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Phone className="h-4 w-4 text-slate-400" />
                  {selected.student?.phone || "Không có số điện thoại"}
                </div>
              </div>

              {/* Status - Real-time update when changed */}
              <div className="mb-6">
                <label className="text-sm font-medium text-slate-700 block mb-2">Trạng thái hiện tại</label>
                <motion.div
                  key={selected.status}
                  initial={{ scale: 1.1, opacity: 0.8 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  <ApplicationStatusBadge status={selected.status as any} />
                </motion.div>
              </div>

              {/* Cover Letter */}
              {selected.coverLetter && (
                <div className="p-4 bg-slate-50 rounded-xl mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="h-4 w-4 text-indigo-500" />
                    <span className="font-medium text-slate-700">Thư giới thiệu</span>
                  </div>
                  <p className="text-sm text-slate-600 whitespace-pre-line">{selected.coverLetter}</p>
                </div>
              )}

              {/* e-Portfolio Link */}
              <div className="p-4 bg-slate-50 rounded-xl mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-indigo-500" />
                    <span className="font-medium text-slate-900">e-Portfolio</span>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => navigate(`/student/${selected.studentId}/profile`)}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Xem hồ sơ
                  </Button>
                </div>
              </div>

              {/* Update Status */}
              <div className="border-t pt-5 mt-5">
                <label className="text-sm font-medium text-slate-700 block mb-3">Cập nhật trạng thái</label>
                
                {/* Current Status Display - Updates when status changes */}
                <motion.div 
                  key={selected.status}
                  initial={{ backgroundColor: "#e0e7ff" }}
                  animate={{ backgroundColor: "#f1f5f9" }}
                  transition={{ duration: 0.5 }}
                  className="mb-4 p-3 rounded-lg flex items-center justify-between"
                >
                  <span className="text-sm text-slate-600">Trạng thái hiện tại:</span>
                  <motion.div
                    key={selected.status}
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 25 }}
                  >
                    <ApplicationStatusBadge status={selected.status as any} />
                  </motion.div>
                </motion.div>

                {/* Success Message */}
                {successMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-700 flex items-center gap-2"
                  >
                    <Check className="h-4 w-4" />
                    {successMessage}
                  </motion.div>
                )}

                {/* Status Actions */}
                <div className="space-y-2">
                  {/* Accept to Screening */}
                  {selected.status === "applied" && (
                    <Button
                      onClick={() => updateStatus(selected.id, "screening", "Đang xét duyệt")}
                      disabled={updatingStatus === selected.id}
                      className="w-full justify-center bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                    >
                      {updatingStatus === selected.id ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4 mr-2" />
                      )}
                      Chuyển sang Xét duyệt
                    </Button>
                  )}

                  {/* Move to Interview */}
                  {(selected.status === "screening" || selected.status === "interview") && selected.status !== "department_approved" && selected.status !== "rejected" && (
                    <Button
                      onClick={() => updateStatus(selected.id, "interview", "Phỏng vấn")}
                      disabled={updatingStatus === selected.id}
                      className="w-full justify-center bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                    >
                      {updatingStatus === selected.id ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Calendar className="h-4 w-4 mr-2" />
                      )}
                      Mời Phỏng vấn
                    </Button>
                  )}

                  {/* Approve */}
                  {(selected.status === "screening" || selected.status === "interview") && selected.status !== "department_approved" && selected.status !== "rejected" && (
                    <Button
                      onClick={() => updateStatus(selected.id, "department_approved", "Đã duyệt")}
                      disabled={updatingStatus === selected.id}
                      className="w-full justify-center bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                    >
                      {updatingStatus === selected.id ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4 mr-2" />
                      )}
                      Duyệt ứng viên
                    </Button>
                  )}

                  {/* Reject - Only if not already rejected or approved */}
                  {selected.status !== "rejected" && selected.status !== "department_approved" && selected.status !== "withdrawn" && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (confirm("Bạn có chắc muốn từ chối ứng viên này?")) {
                          updateStatus(selected.id, "rejected", "Từ chối");
                        }
                      }}
                      disabled={updatingStatus === selected.id}
                      className="w-full justify-center text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Từ chối ứng viên
                    </Button>
                  )}

                  {/* Withdraw */}
                  {selected.status !== "rejected" && selected.status !== "withdrawn" && selected.status !== "department_approved" && (
                    <Button
                      variant="ghost"
                      onClick={() => {
                        if (confirm("Bạn có chắc muốn rút đơn ứng tuyển này?")) {
                          updateStatus(selected.id, "withdrawn", "Đã rút đơn");
                        }
                      }}
                      disabled={updatingStatus === selected.id}
                      className="w-full justify-center text-slate-500 hover:text-slate-700"
                    >
                      Rút đơn ứng tuyển
                    </Button>
                  )}

                  {/* Show if already processed */}
                  {(selected.status === "department_approved" || selected.status === "rejected" || selected.status === "withdrawn") && (
                    <div className="text-center py-4 text-slate-400 text-sm">
                      Đơn đã được xử lý
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center sticky top-6">
              <User className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">Chọn một ứng viên để xem chi tiết</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
