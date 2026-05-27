import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Loader2,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  UserCheck,
  Info,
  X,
  Trash2,
  Edit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Lecturer {
  id: string;
  name: string;
  email: string;
  department?: string;
}

interface Student {
  id: string;
  name: string;
  email: string;
  department?: string;
  phone?: string;
}

interface DistributionPreview {
  id: string;
  name: string;
  email: string;
  department?: string;
  studentCount: number;
  students: Student[];
}

interface DistributionResult {
  assignedCount: number;
  totalStudents: number;
  totalLecturers: number;
  distribution: {
    lecturerId: string;
    lecturerName: string;
    count: number;
  }[];
}

interface Assignment {
  id: string;
  lecturerId: string;
  studentId: string;
  batchId: string | null;
  status: string;
  assignedAt: string;
  lecturer: { id: string; name: string; email: string };
  student: { id: string; name: string; email: string; phone?: string };
  batch: { id: string; name: string; semester: string; academicYear: string } | null;
}

interface Batch {
  id: string;
  name: string;
  semester: string;
  academicYear: string;
  status: string;
}

export function AdminLecturerAssignmentPage() {
  const { isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [preview, setPreview] = useState<DistributionPreview[] | null>(null);
  const [unassignedCount, setUnassignedCount] = useState(0);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"auto" | "assignments">("auto");
  const [expandedLecturer, setExpandedLecturer] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [result, setResult] = useState<DistributionResult | null>(null);

  // Load initial data - wait for auth to be ready
  const loadData = async () => {
    setLoading(true);
    try {
      const [lecturersRes, batchesRes, assignmentsRes] = await Promise.all([
        api.getLecturersForAssignment(),
        api.getBatches({ status: "active" }),
        api.getLecturerAssignments(selectedBatch ? { batchId: selectedBatch } : {}),
      ]);

      setLecturers(lecturersRes);
      setBatches(batchesRes.data || []);
      setAssignments(assignmentsRes.data || []);

      // Get unassigned count
      const unassignedRes = await api.getUnassignedStudents(selectedBatch || undefined);
      setUnassignedCount(unassignedRes.length || 0);
      
      setInitialLoadDone(true);
    } catch (err: any) {
      toast.error(err.message || "Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return; // Wait for auth to be ready
    loadData();
  }, [authLoading, selectedBatch]);

  const handlePreview = async () => {
    setLoading(true);
    try {
      const res = await api.previewDistribution(selectedBatch || undefined);
      if (res.success) {
        setPreview(res.distribution || []);
        setUnassignedCount(res.unassignedCount || 0);
      } else {
        toast.error(res.error || "Không thể xem trước");
      }
    } catch (err: any) {
      toast.error(err.message || "Không thể xem trước");
    } finally {
      setLoading(false);
    }
  };

  const handleAutoDistribute = async () => {
    setSubmitting(true);
    try {
      const res = await api.autoDistribute(selectedBatch || undefined);
      setResult({
        assignedCount: res.assignedCount,
        totalStudents: res.totalStudents,
        totalLecturers: res.totalLecturers,
        distribution: res.distribution,
      });
      setConfirmDialog(false);
      toast.success(`Đã phân đều ${res.assignedCount} sinh viên cho ${res.totalLecturers} giảng viên`);
      
      // Reload data
      await loadData();
    } catch (err: any) {
      toast.error(err.message || "Không thể phân đều sinh viên");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa phân công này?")) return;
    
    try {
      await api.deleteLecturerAssignment(id);
      toast.success("Đã xóa phân công");
      await loadData();
    } catch (err: any) {
      toast.error(err.message || "Không thể xóa phân công");
    }
  };

  const toggleExpand = (lecturerId: string) => {
    setExpandedLecturer(expandedLecturer === lecturerId ? null : lecturerId);
  };

  // Group assignments by lecturer
  const assignmentsByLecturer = assignments.reduce((acc, assignment) => {
    const lecturerId = assignment.lecturerId;
    if (!acc[lecturerId]) {
      acc[lecturerId] = {
        lecturer: assignment.lecturer,
        assignments: [],
      };
    }
    acc[lecturerId].assignments.push(assignment);
    return acc;
  }, {} as Record<string, { lecturer: any; assignments: Assignment[] }>);

  if (authLoading || (loading && !initialLoadDone)) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Phân công giảng viên</h1>
          <p className="text-slate-500 mt-1">Quản lý phân công giảng viên hướng dẫn cho sinh viên</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-4">
          <button
            onClick={() => setActiveTab("auto")}
            className={cn(
              "pb-3 px-1 text-sm font-medium border-b-2 transition-colors",
              activeTab === "auto"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            )}
          >
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Tự động phân đều
            </div>
          </button>
          <button
            onClick={() => setActiveTab("assignments")}
            className={cn(
              "pb-3 px-1 text-sm font-medium border-b-2 transition-colors",
              activeTab === "assignments"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            )}
          >
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              Danh sách phân công ({assignments.length})
            </div>
          </button>
        </nav>
      </div>

      {/* Auto Distribute Tab */}
      {activeTab === "auto" && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-slate-200 p-6"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-100 rounded-xl">
                  <Users className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Giảng viên</p>
                  <p className="text-2xl font-bold text-slate-900">{lecturers.length}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl border border-slate-200 p-6"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-100 rounded-xl">
                  <AlertCircle className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Sinh viên chưa được gán</p>
                  <p className="text-2xl font-bold text-slate-900">{unassignedCount}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl border border-slate-200 p-6"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-xl">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Phân công hiện tại</p>
                  <p className="text-2xl font-bold text-slate-900">{assignments.length}</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Batch Filter */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Tùy chọn</h3>
            <div className="flex flex-wrap gap-4 items-end">
              <div className="w-64">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Lọc theo đợt thực tập
                </label>
                <select
                  value={selectedBatch}
                  onChange={(e) => setSelectedBatch(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Tất cả các đợt</option>
                  {batches.map((batch) => (
                    <option key={batch.id} value={batch.id}>
                      {batch.name} ({batch.semester} {batch.academicYear})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-4">
                <Button onClick={() => setConfirmDialog(true)} disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Đang phân đều...
                    </>
                  ) : unassignedCount > 0 ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Phân đều tự động ({unassignedCount} sinh viên)
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Phân đều lại
                    </>
                  )}
                </Button>
                {unassignedCount === 0 && assignments.length > 0 && (
                  <span className="text-sm text-green-600 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Tất cả sinh viên đã được phân công
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Result */}
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-50 border border-green-200 rounded-xl p-6"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-100 rounded-xl">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-green-800">
                    Phân đều thành công!
                  </h3>
                  <p className="text-green-700 mt-1">
                    Đã phân {result.assignedCount} sinh viên cho {result.totalLecturers} giảng viên.
                  </p>
                  <div className="mt-4 space-y-2">
                    {result.distribution.map((d) => (
                      <div key={d.lecturerId} className="flex items-center gap-2 text-sm text-green-700">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="font-medium">{d.lecturerName}</span>
                        <span>→ {d.count} sinh viên</span>
                      </div>
                    ))}
                  </div>
                </div>
                <button onClick={() => setResult(null)} className="text-green-600 hover:text-green-800">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Assignments Tab */}
      {activeTab === "assignments" && (
        <div className="space-y-6">
          {/* Filter */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="w-64">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Lọc theo đợt thực tập
                </label>
                <select
                  value={selectedBatch}
                  onChange={(e) => setSelectedBatch(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Tất cả các đợt</option>
                  {batches.map((batch) => (
                    <option key={batch.id} value={batch.id}>
                      {batch.name} ({batch.semester} {batch.academicYear})
                    </option>
                  ))}
                </select>
              </div>
              <Button variant="outline" onClick={loadData} disabled={loading}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Làm mới
              </Button>
            </div>
          </div>

          {/* Assignments by Lecturer */}
          {Object.keys(assignmentsByLecturer).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(assignmentsByLecturer).map(([lecturerId, data], index) => (
                <motion.div
                  key={lecturerId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-xl border border-slate-200 overflow-hidden"
                >
                  <button
                    onClick={() => toggleExpand(lecturerId)}
                    className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-indigo-600 font-semibold">
                          {data.lecturer.name.split(" ").pop()?.charAt(0) || "G"}
                        </span>
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-slate-900">{data.lecturer.name}</p>
                        <p className="text-sm text-slate-500">{data.lecturer.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium">
                        {data.assignments.length} sinh viên
                      </span>
                      {expandedLecturer === lecturerId ? (
                        <ChevronUp className="h-5 w-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-slate-400" />
                      )}
                    </div>
                  </button>

                  {expandedLecturer === lecturerId && (
                    <div className="border-t border-slate-200">
                      <table className="w-full">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                              Sinh viên
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                              Email
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                              Đợt
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                              Ngày gán
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                              Thao tác
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {data.assignments.map((assignment) => (
                            <tr key={assignment.id} className="hover:bg-slate-50">
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                                    <span className="text-slate-600 text-sm font-medium">
                                      {assignment.student.name.split(" ").pop()?.charAt(0) || "S"}
                                    </span>
                                  </div>
                                  <span className="font-medium text-slate-900">{assignment.student.name}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm text-slate-500">
                                {assignment.student.email}
                              </td>
                              <td className="px-4 py-3 text-sm text-slate-500">
                                {assignment.batch?.name || "-"}
                              </td>
                              <td className="px-4 py-3 text-sm text-slate-500">
                                {new Date(assignment.assignedAt).toLocaleDateString("vi-VN")}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <button
                                  onClick={() => handleDeleteAssignment(assignment.id)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <UserCheck className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">Chưa có phân công nào</h3>
              <p className="text-slate-500">
                Sử dụng chức năng "Tự động phân đều" để phân công giảng viên cho sinh viên.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Confirm Dialog */}
      {confirmDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-amber-100 rounded-xl">
                <AlertCircle className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">
                {unassignedCount > 0 ? "Xác nhận phân đều" : "Xác nhận phân đều lại"}
              </h3>
            </div>
            <p className="text-slate-600 mb-6">
              {unassignedCount > 0 ? (
                <>
                  Bạn có chắc muốn phân đều <strong>{unassignedCount} sinh viên</strong> cho{" "}
                  <strong>{lecturers.length} giảng viên</strong>?
                  <br />
                  <span className="text-sm text-slate-500">
                    Mỗi giảng viên sẽ nhận khoảng {Math.ceil(unassignedCount / lecturers.length)} sinh viên.
                  </span>
                </>
              ) : (
                <>
                  Bạn có chắc muốn phân đều lại <strong>tất cả sinh viên</strong> cho{" "}
                  <strong>{lecturers.length} giảng viên</strong>?
                  <br />
                  <span className="text-sm text-amber-600">
                    Cảnh báo: Hành động này sẽ phân đều lại tất cả sinh viên đã được gán trước đó.
                  </span>
                </>
              )}
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setConfirmDialog(false)} disabled={submitting}>
                Hủy
              </Button>
              <Button onClick={handleAutoDistribute} disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang phân đều...
                  </>
                ) : (
                  "Xác nhận"
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
