import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Users,
  Briefcase,
  FileText,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Edit,
  Lock,
  Unlock,
  Building2,
  Check,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Batch {
  id: string;
  name: string;
  description?: string;
  semester: string;
  academicYear: string;
  applicationDeadline?: string;
  startDate?: string;
  endDate?: string;
  maxStudents: number;
  status: "upcoming" | "active" | "closed";
  allowCompanyPosting: boolean;
  allowStudentApplication: boolean;
  createdAt: string;
  creator?: { id: string; name: string; email: string };
  _count?: { positions: number; applications: number };
}

interface BatchFormData {
  name: string;
  description: string;
  semester: string;
  academicYear: string;
  applicationDeadline: string;
  startDate: string;
  endDate: string;
  maxStudents: number;
  status?: "upcoming" | "active" | "closed";
  allowCompanyPosting?: boolean;
  allowStudentApplication?: boolean;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; icon: typeof Clock }> = {
    upcoming: { label: "Sắp mở", color: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock },
    active: { label: "Đang hoạt động", color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle2 },
    closed: { label: "Đã đóng", color: "bg-slate-100 text-slate-500 border-slate-200", icon: Lock },
  };
  const info = map[status] || { label: status, color: "bg-slate-100 text-slate-600", icon: Clock };
  const Icon = info.icon;
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border", info.color)}>
      <Icon className="h-3 w-3" />
      {info.label}
    </span>
  );
}

function Toggle({ enabled, onChange, label }: { enabled: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all",
        enabled
          ? "bg-green-50 border-green-200 text-green-700"
          : "bg-slate-50 border-slate-200 text-slate-500",
      )}
    >
      {enabled ? <ToggleRight className="h-4 w-4 text-green-500" /> : <ToggleLeft className="h-4 w-4" />}
      {label}
    </button>
  );
}

// Create / Edit Batch Modal
function BatchModal({
  isOpen,
  onClose,
  onSuccess,
  editBatch,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editBatch?: Batch | null;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<BatchFormData>({
    defaultValues: {
      name: "",
      description: "",
      semester: "HK1",
      academicYear: "2025-2026",
      applicationDeadline: "",
      startDate: "",
      endDate: "",
      maxStudents: 0,
      status: "upcoming",
      allowCompanyPosting: false,
      allowStudentApplication: false,
    },
  });

  const watchStatus = watch("status");

  useEffect(() => {
    if (!isOpen) return;
    if (editBatch) {
      reset({
        name: editBatch.name || "",
        description: editBatch.description || "",
        semester: editBatch.semester || "HK1",
        academicYear: editBatch.academicYear || "2025-2026",
        applicationDeadline: editBatch.applicationDeadline?.split("T")[0] || "",
        startDate: editBatch.startDate?.split("T")[0] || "",
        endDate: editBatch.endDate?.split("T")[0] || "",
        maxStudents: editBatch.maxStudents || 0,
        status: editBatch.status || "upcoming",
        allowCompanyPosting: editBatch.allowCompanyPosting,
        allowStudentApplication: editBatch.allowStudentApplication,
      });
    } else {
      reset({
        name: "",
        description: "",
        semester: "HK1",
        academicYear: "2025-2026",
        applicationDeadline: "",
        startDate: "",
        endDate: "",
        maxStudents: 0,
        status: "upcoming",
        allowCompanyPosting: false,
        allowStudentApplication: false,
      });
    }
    setError("");
  }, [isOpen, editBatch, reset]);

  const onValid = async (data: BatchFormData) => {
    setIsSubmitting(true);
    setError("");
    try {
      if (editBatch) {
        await api.updateBatch(editBatch.id, {
          name: data.name,
          description: data.description,
          semester: data.semester,
          academicYear: data.academicYear,
          applicationDeadline: data.applicationDeadline || undefined,
          startDate: data.startDate || undefined,
          endDate: data.endDate || undefined,
          maxStudents: Number(data.maxStudents) || 0,
          status: data.status,
          allowCompanyPosting: data.allowCompanyPosting,
          allowStudentApplication: data.allowStudentApplication,
        });
        toast.success("Cập nhật đợt thực tập thành công");
      } else {
        await api.createBatch({
          name: data.name,
          description: data.description,
          semester: data.semester,
          academicYear: data.academicYear,
          applicationDeadline: data.applicationDeadline || undefined,
          startDate: data.startDate || undefined,
          endDate: data.endDate || undefined,
          maxStudents: Number(data.maxStudents) || 0,
        });
        toast.success("Tạo đợt thực tập thành công");
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
      >
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden pointer-events-auto max-h-[90vh] overflow-y-auto">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white">
            <div className="flex items-center gap-3">
              <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl", editBatch ? "bg-indigo-100 text-indigo-600" : "bg-green-100 text-green-600")}>
                {editBatch ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">
                  {editBatch ? "Chỉnh sửa đợt thực tập" : "Tạo đợt thực tập mới"}
                </h3>
                <p className="text-xs text-slate-500">
                  {editBatch ? "Cập nhật thông tin đợt thực tập" : "Thiết lập thông tin cho đợt thực tập"}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onValid)} className="px-6 py-5 space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 text-sm text-red-600 border border-red-100 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tên đợt thực tập <span className="text-red-500">*</span></label>
              <Input {...register("name", { required: true })} placeholder="VD: Thực tập HK1 2025-2026" />
              {errors.name && <p className="text-xs text-red-500 mt-1">Tên bắt buộc</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Học kỳ <span className="text-red-500">*</span></label>
                <select {...register("semester")} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
                  <option value="HK1">HK1</option>
                  <option value="HK2">HK2</option>
                  <option value="HK3">HK3</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Năm học <span className="text-red-500">*</span></label>
                <Input {...register("academicYear", { required: true })} placeholder="2025-2026" />
                {errors.academicYear && <p className="text-xs text-red-500 mt-1">Bắt buộc</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mô tả</label>
              <textarea {...register("description")} rows={2} className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none" placeholder="Mô tả ngắn về đợt thực tập..." />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Hạn nộp đơn</label>
                <Input type="date" {...register("applicationDeadline")} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Số sinh viên tối đa</label>
                <Input type="number" min={0} {...register("maxStudents")} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Ngày bắt đầu</label>
                <Input type="date" {...register("startDate")} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Ngày kết thúc</label>
                <Input type="date" {...register("endDate")} />
              </div>
            </div>

            {editBatch && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Trạng thái</label>
                  <select
                    {...register("status")}
                    className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  >
                    <option value="upcoming">Sắp mở</option>
                    <option value="active">Đang hoạt động</option>
                    <option value="closed">Đã đóng</option>
                  </select>
                </div>

                <div className="flex gap-3">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register("allowCompanyPosting")}
                      className="h-4 w-4 rounded border-slate-300 text-indigo-500 focus:ring-indigo-400"
                    />
                    Cho phép đăng tin tuyển dụng
                  </label>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register("allowStudentApplication")}
                      className="h-4 w-4 rounded border-slate-300 text-indigo-500 focus:ring-indigo-400"
                    />
                    Cho phép sinh viên nộp đơn
                  </label>
                </div>

                {watchStatus === "active" && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
                    Kích hoạt đợt này sẽ tự động đóng các đợt thực tập đang hoạt động khác.
                  </div>
                )}
              </>
            )}

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">Huỷ</Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1 bg-green-500 hover:bg-green-600">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : (editBatch ? "Lưu thay đổi" : "Tạo đợt thực tập")}
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </>
  );
}

// Activate Batch Modal
function ActivateModal({ isOpen, onClose, onSuccess, batch }: { isOpen: boolean; onClose: () => void; onSuccess: () => void; batch: Batch | null }) {
  const [allowPosting, setAllowPosting] = useState(true);
  const [allowApply, setAllowApply] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (batch) {
      setAllowPosting(batch.allowCompanyPosting);
      setAllowApply(batch.allowStudentApplication);
    }
  }, [batch]);

  const handleActivate = async () => {
    if (!batch) return;
    setIsSubmitting(true);
    try {
      await api.activateBatch(batch.id, { allowCompanyPosting: allowPosting, allowStudentApplication: allowApply });
      toast.success(`Đợt "${batch.name}" đã được kích hoạt!`);
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Kích hoạt thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !batch) return null;

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm pointer-events-auto p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-green-100 flex items-center justify-center">
              <Unlock className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Kích hoạt đợt thực tập</h3>
              <p className="text-sm text-slate-500">{batch.name}</p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-slate-600">Chọn quyền cho đợt thực tập này:</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-700">Cho phép đăng tin tuyển dụng</span>
                </div>
                <Toggle enabled={allowPosting} onChange={setAllowPosting} label="" />
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-700">Cho phép sinh viên nộp đơn</span>
                </div>
                <Toggle enabled={allowApply} onChange={setAllowApply} label="" />
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-700">
              Kích hoạt đợt này sẽ tự động đóng các đợt thực tập đang hoạt động khác.
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">Huỷ</Button>
            <Button onClick={handleActivate} disabled={isSubmitting} className="flex-1 bg-green-500 hover:bg-green-600 gap-2">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Unlock className="h-4 w-4" />}
              Kích hoạt
            </Button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

// Approve/Reject Company Modal
function ApproveCompanyModal({
  isOpen,
  onClose,
  onSuccess,
  companyBatch,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  companyBatch: any | null;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [action, setAction] = useState<'approved' | 'rejected'>('approved');
  const [maxStudents, setMaxStudents] = useState(5);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (companyBatch) {
      setMaxStudents(companyBatch.maxStudents || 5);
      setReason("");
      setAction('approved');
    }
  }, [companyBatch]);

  const handleSubmit = async () => {
    if (!companyBatch) return;
    if (action === 'rejected' && !reason.trim()) {
      setError("Vui lòng nhập lý do từ chối");
      return;
    }
    setIsSubmitting(true);
    setError("");
    try {
      await api.reviewCompanyBatch(companyBatch.id, {
        status: action,
        maxStudents: action === 'approved' ? maxStudents : undefined,
        rejectionReason: action === 'rejected' ? reason : undefined,
      });
      toast.success(
        action === 'approved'
          ? `Đã phê duyệt công ty "${companyBatch.company?.name}"`
          : `Đã từ chối công ty "${companyBatch.company?.name}"`
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !companyBatch) return null;

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
      >
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md pointer-events-auto">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl",
                action === 'approved' ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
              )}>
                {action === 'approved' ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">
                  {action === 'approved' ? 'Phê duyệt công ty' : 'Từ chối công ty'}
                </h3>
                <p className="text-xs text-slate-500">Đợt: {companyBatch.batch?.name}</p>
              </div>
            </div>
            <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="px-6 py-5 space-y-4">
            {/* Company info */}
            <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 text-sm">{companyBatch.company?.name}</p>
                <p className="text-xs text-slate-500">{companyBatch.company?.email}</p>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 text-sm text-red-600 border border-red-100 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Action toggle */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setAction('approved')}
                className={cn(
                  "flex-1 py-2 rounded-lg text-sm font-medium border transition-all",
                  action === 'approved'
                    ? "bg-green-50 border-green-300 text-green-700"
                    : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                )}
              >
                <CheckCircle2 className="h-4 w-4 mx-auto mb-1" />
                Phê duyệt
              </button>
              <button
                type="button"
                onClick={() => setAction('rejected')}
                className={cn(
                  "flex-1 py-2 rounded-lg text-sm font-medium border transition-all",
                  action === 'rejected'
                    ? "bg-red-50 border-red-300 text-red-700"
                    : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                )}
              >
                <XCircle className="h-4 w-4 mx-auto mb-1" />
                Từ chối
              </button>
            </div>

            {action === 'approved' ? (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Số sinh viên tối đa</label>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={maxStudents}
                  onChange={(e) => setMaxStudents(Number(e.target.value))}
                />
                <p className="text-xs text-slate-400 mt-1">Giới hạn số sinh viên công ty có thể nhận trong đợt này</p>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Lý do từ chối <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                  placeholder="VD: Công ty chưa đáp ứng yêu cầu..."
                />
              </div>
            )}
          </div>

          <div className="px-6 py-4 border-t border-slate-100 flex gap-3 bg-slate-50/50">
            <Button variant="outline" onClick={onClose} className="flex-1">Huỷ</Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={cn("flex-1 gap-2", action === 'approved' ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600")}
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                action === 'approved' ? <Check className="h-4 w-4" /> : <XCircle className="h-4 w-4" />
              )}
              {action === 'approved' ? "Phê duyệt" : "Từ chối"}
            </Button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

// Company Batch Tab Component
function CompanyBatchTab({ batchId }: { batchId: string }) {
  const [companyBatches, setCompanyBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchCompanyBatches = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filter !== 'all') params.status = filter;
      const data = await api.getCompanyBatchesForBatch(batchId, params);
      setCompanyBatches(Array.isArray(data) ? data : data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCompanyBatches(); }, [batchId, filter]);

  const pending = companyBatches.filter((cb) => cb.status === 'pending');
  const approved = companyBatches.filter((cb) => cb.status === 'approved');
  const rejected = companyBatches.filter((cb) => cb.status === 'rejected');
  const total = companyBatches.length;

  const counts = { all: total, pending: pending.length, approved: approved.length, rejected: rejected.length };

  const handleReview = (item: any) => {
    setSelectedItem(item);
    setModalOpen(true);
  };

  const renderRow = (cb: any) => (
    <tr key={cb.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
      <td className="py-3 px-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
            <Building2 className="h-4 w-4 text-indigo-600" />
          </div>
          <div>
            <p className="font-medium text-sm text-slate-900">{cb.company?.name}</p>
            <p className="text-xs text-slate-400">{cb.company?.email}</p>
          </div>
        </div>
      </td>
      <td className="py-3 px-3">
        <span className={cn(
          "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border",
          cb.status === 'approved' && "bg-green-50 text-green-700 border-green-200",
          cb.status === 'pending' && "bg-amber-50 text-amber-700 border-amber-200",
          cb.status === 'rejected' && "bg-red-50 text-red-700 border-red-200",
        )}>
          {cb.status === 'approved' && <CheckCircle2 className="h-3 w-3" />}
          {cb.status === 'pending' && <AlertTriangle className="h-3 w-3" />}
          {cb.status === 'rejected' && <XCircle className="h-3 w-3" />}
          {cb.status === 'approved' ? 'Đã duyệt' : cb.status === 'pending' ? 'Chờ duyệt' : 'Từ chối'}
        </span>
      </td>
      <td className="py-3 px-3 text-sm text-slate-600">
        {cb.maxStudents || 5} SV
      </td>
      <td className="py-3 px-3 text-xs text-slate-400">
        {cb.approvedAt ? new Date(cb.approvedAt).toLocaleDateString('vi-VN') : new Date(cb.createdAt).toLocaleDateString('vi-VN')}
      </td>
      <td className="py-3 px-3 text-right">
        {cb.status === 'pending' && (
          <div className="flex items-center justify-end gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleReview(cb)}
              className="h-8 px-2 text-xs text-green-600 hover:bg-green-50 gap-1"
            >
              <Check className="h-3.5 w-3.5" /> Duyệt
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleReview(cb)}
              className="h-8 px-2 text-xs text-red-600 hover:bg-red-50 gap-1"
            >
              <XCircle className="h-3.5 w-3.5" /> Từ chối
            </Button>
          </div>
        )}
        {cb.status === 'rejected' && cb.rejectionReason && (
          <p className="text-xs text-red-500 italic text-right max-w-[150px]">{cb.rejectionReason}</p>
        )}
        {cb.status === 'approved' && cb.approvedByUser && (
          <p className="text-xs text-slate-400 text-right">Duyệt bởi {cb.approvedByUser.name}</p>
        )}
      </td>
    </tr>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {(["all", "pending", "approved", "rejected"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                filter === f
                  ? "bg-indigo-500 text-white border-indigo-500"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              )}
            >
              {f === 'all' ? 'Tất cả' : f === 'pending' ? 'Chờ duyệt' : f === 'approved' ? 'Đã duyệt' : 'Từ chối'}
              <span className={cn("ml-1.5 px-1.5 py-0.5 rounded-full text-xs",
                filter === f ? "bg-white/20" : "bg-slate-100"
              )}>{counts[f]}</span>
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
        </div>
      ) : companyBatches.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
          <Building2 className="h-8 w-8 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-500 text-sm">
            {filter === 'all' ? 'Chưa có công ty nào đăng ký đợt này' : `Không có công ty nào ở trạng thái "${filter}"`}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="text-left text-xs font-semibold uppercase tracking-wider text-slate-400 py-2.5 px-3">Công ty</th>
                <th className="text-left text-xs font-semibold uppercase tracking-wider text-slate-400 py-2.5 px-3">Trạng thái</th>
                <th className="text-left text-xs font-semibold uppercase tracking-wider text-slate-400 py-2.5 px-3">Giới hạn SV</th>
                <th className="text-left text-xs font-semibold uppercase tracking-wider text-slate-400 py-2.5 px-3">Ngày</th>
                <th className="text-right text-xs font-semibold uppercase tracking-wider text-slate-400 py-2.5 px-3">Hành động</th>
              </tr>
            </thead>
            <tbody>{companyBatches.map(renderRow)}</tbody>
          </table>
        </div>
      )}

      <ApproveCompanyModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setSelectedItem(null); }}
        onSuccess={fetchCompanyBatches}
        companyBatch={selectedItem}
      />
    </div>
  );
}

// Main Page
export function AdminBatchesPage() {
  const { isAuthenticated } = useAuth();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "upcoming" | "active" | "closed">("all");
  const [pageView, setPageView] = useState<"batches" | "companies">("batches");
  const [selectedBatchForCompanies, setSelectedBatchForCompanies] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Batch | null>(null);
  const [activateTarget, setActivateTarget] = useState<Batch | null>(null);
  const [closingBatch, setClosingBatch] = useState<string | null>(null);
  const [pendingCompanyCount, setPendingCompanyCount] = useState(0);

  const fetchBatches = async () => {
    try {
      const status = activeTab === "all" ? undefined : activeTab;
      const data = await api.getBatches({ limit: 100, status });
      const list = data.data || data || [];
      setBatches(list);
    } catch (err) {
      console.error("Failed to fetch batches:", err);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await api.getBatchStats();
      setStats(data?.data || data);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

  const fetchPendingCompanyCount = async () => {
    try {
      const data = await api.getPendingCompanyBatches();
      const count = data?.meta?.total || (Array.isArray(data) ? data.length : 0);
      setPendingCompanyCount(count);
    } catch {
      setPendingCompanyCount(0);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    setLoading(true);
    Promise.all([fetchBatches(), fetchStats(), fetchPendingCompanyCount()]).finally(() => setLoading(false));
  }, [isAuthenticated, activeTab]);

  const handleClose = async (batch: Batch) => {
    if (!confirm(`Đóng đợt "${batch.name}"? Hành động này không thể hoàn tác.`)) return;
    setClosingBatch(batch.id);
    try {
      await api.closeBatch(batch.id);
      toast.success(`Đợt "${batch.name}" đã được đóng`);
      fetchBatches();
      fetchStats();
    } catch (err: any) {
      toast.error(err.message || "Đóng thất bại");
    } finally {
      setClosingBatch(null);
    }
  };

  const handleDelete = async (batch: Batch) => {
    if (!confirm(`Xóa đợt "${batch.name}"?`)) return;
    try {
      await api.deleteBatch(batch.id);
      toast.success("Đã xóa đợt thực tập");
      fetchBatches();
      fetchStats();
    } catch (err: any) {
      toast.error(err.message || "Xóa thất bại");
    }
  };

  const formatDate = (d?: string) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("vi-VN");
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-slate-500">Vui lòng đăng nhập để sử dụng chức năng này.</p>
      </div>
    );
  }

  const tabs = [
    { id: "all" as const, label: "Tất cả", badge: stats?.total },
    { id: "upcoming" as const, label: "Sắp mở", badge: stats?.upcoming },
    { id: "active" as const, label: "Đang hoạt động", badge: stats?.active },
    { id: "closed" as const, label: "Đã đóng", badge: stats?.closed },
  ];

  const viewTabs = [
    { id: "batches" as const, label: "Đợt thực tập" },
    {
      id: "companies" as const,
      label: "Duyệt công ty",
      badge: pendingCompanyCount > 0 ? pendingCompanyCount : undefined,
      badgeColor: "bg-red-500",
    },
  ];

  const handleSelectBatchForCompanies = (batch: Batch) => {
    setSelectedBatchForCompanies(batch.id);
    setPageView("companies");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản lý đợt thực tập</h1>
          <p className="text-slate-500 mt-1">Tạo và quản lý các đợt thực tập cho doanh nghiệp và sinh viên</p>
        </div>
        <Button
          onClick={() => { setEditTarget(null); setCreateModalOpen(true); }}
          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 gap-2"
        >
          <Plus className="h-4 w-4" />
          Tạo đợt thực tập
        </Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Tổng đợt", value: stats.total, color: "bg-indigo-100 text-indigo-600", icon: Briefcase },
            { label: "Sắp mở", value: stats.upcoming, color: "bg-amber-100 text-amber-600", icon: Clock },
            { label: "Đang hoạt động", value: stats.active, color: "bg-green-100 text-green-600", icon: CheckCircle2 },
            { label: "Đã đóng", value: stats.closed, color: "bg-slate-100 text-slate-500", icon: Lock },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-xl border border-slate-200 p-4"
            >
              <div className="flex items-center gap-3">
                <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center shrink-0", s.color)}>
                  <s.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-900">{s.value}</p>
                  <p className="text-xs text-slate-500">{s.label}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Active batch banner */}
      {stats?.activeBatch && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-white/80" />
            <div>
              <p className="text-white font-semibold text-sm">
                Đợt thực tập đang hoạt động: {stats.activeBatch.name}
              </p>
              <div className="flex items-center gap-3 mt-1">
                <span className={cn("text-xs px-2 py-0.5 rounded-full bg-white/20 text-white", stats.activeBatch.allowCompanyPosting ? "" : "line-through opacity-60")}>
                  Đăng tin: {stats.activeBatch.allowCompanyPosting ? "Bật" : "Tắt"}
                </span>
                <span className={cn("text-xs px-2 py-0.5 rounded-full bg-white/20 text-white", stats.activeBatch.allowStudentApplication ? "" : "line-through opacity-60")}>
                  Nộp đơn: {stats.activeBatch.allowStudentApplication ? "Bật" : "Tắt"}
                </span>
                <span className="text-xs text-white/70">
                  {stats.activeBatch._count?.positions || 0} tin · {stats.activeBatch._count?.applications || 0} đơn
                </span>
              </div>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => { setSelectedBatchForCompanies(stats.activeBatch.id); setPageView("companies"); }}
            className="border-white/30 text-white hover:bg-white/20 bg-white/10"
          >
            Quản lý
          </Button>
        </motion.div>
      )}

      {/* View switcher + Company Batch tab */}
      <div className="space-y-4">
        <div className="flex gap-2">
          {viewTabs.map((vt) => (
            <button
              key={vt.id}
              onClick={() => setPageView(vt.id)}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2",
                pageView === vt.id
                  ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/25"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50",
              )}
            >
              {vt.id === 'batches' ? <Briefcase className="h-4 w-4" /> : <Building2 className="h-4 w-4" />}
              {vt.label}
              {vt.badge != null && (
                <span className={cn(
                  "ml-1 text-xs px-1.5 py-0.5 rounded-full",
                  vt.badgeColor || "bg-white/20",
                )}>
                  {vt.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {pageView === 'companies' && !selectedBatchForCompanies && (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
            <Building2 className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium mb-1">Chọn đợt thực tập</p>
            <p className="text-slate-400 text-sm">Nhấn "Quản lý công ty" bên cạnh đợt thực tập để xem danh sách công ty.</p>
            <div className="mt-4 space-y-2 max-w-md mx-auto text-left">
              {batches.filter((b) => b.status === 'active' || b.status === 'upcoming').map((b) => (
                <div key={b.id} className="flex items-center justify-between bg-slate-50 rounded-lg px-4 py-3">
                  <div>
                    <p className="font-medium text-sm text-slate-700">{b.name}</p>
                    <p className="text-xs text-slate-400">{b.semester} {b.academicYear}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                    onClick={() => handleSelectBatchForCompanies(b)}
                  >
                    <Building2 className="h-3.5 w-3.5 mr-1" />
                    Quản lý công ty
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {pageView === 'companies' && selectedBatchForCompanies && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setPageView('batches'); setSelectedBatchForCompanies(null); }}
                className="text-slate-500"
              >
                ← Quay lại
              </Button>
              <span className="text-sm text-slate-500">|</span>
              <span className="text-sm font-medium text-slate-700">
                {batches.find((b) => b.id === selectedBatchForCompanies)?.name}
              </span>
            </div>
            <CompanyBatchTab batchId={selectedBatchForCompanies} />
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-medium transition-all",
              activeTab === tab.id
                ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/25"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50",
            )}
          >
            {tab.label}
            {tab.badge != null && (
              <span className={cn(
                "ml-1.5 text-xs px-1.5 py-0.5 rounded-full",
                activeTab === tab.id ? "bg-white/20" : "bg-slate-100",
              )}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Batch List */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          </div>
        ) : batches.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <Briefcase className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Chưa có đợt thực tập nào</p>
            <p className="text-slate-400 text-sm mt-1">Tạo đợt thực tập đầu tiên để bắt đầu</p>
          </div>
        ) : (
          batches.map((batch, idx) => (
            <motion.div
              key={batch.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              className="bg-white rounded-xl border border-slate-200 p-5 hover:border-indigo-200 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <h3 className="font-semibold text-slate-900">{batch.name}</h3>
                    <StatusBadge status={batch.status} />
                    {batch.status === "active" && (
                      <div className="flex items-center gap-2 ml-auto">
                        {batch.allowCompanyPosting && (
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                            <Briefcase className="h-3 w-3" />
                            Đăng tin: Bật
                          </span>
                        )}
                        {batch.allowStudentApplication && (
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-600 border border-green-100">
                            <Users className="h-3 w-3" />
                            Nộp đơn: Bật
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 mb-3">
                    {batch.semester} {batch.academicYear}
                    {batch.description && ` · ${batch.description}`}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-500">
                    {batch.applicationDeadline && (
                      <div>
                        <span className="font-medium text-slate-700">Hạn nộp:</span> {formatDate(batch.applicationDeadline)}
                      </div>
                    )}
                    {batch.startDate && (
                      <div>
                        <span className="font-medium text-slate-700">Bắt đầu:</span> {formatDate(batch.startDate)}
                      </div>
                    )}
                    {batch.endDate && (
                      <div>
                        <span className="font-medium text-slate-700">Kết thúc:</span> {formatDate(batch.endDate)}
                      </div>
                    )}
                    {batch.maxStudents > 0 && (
                      <div>
                        <span className="font-medium text-slate-700">Tối đa:</span> {batch.maxStudents} SV
                      </div>
                    )}
                  </div>
                  {batch._count && (
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-3 w-3" />
                        {batch._count.positions} tin tuyển dụng
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {batch._count.applications} đơn ứng tuyển
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => { setEditTarget(batch); setCreateModalOpen(true); }}
                    className="h-8 w-8 p-0 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                    title="Chỉnh sửa"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setActivateTarget(batch)}
                    className={cn(
                      "h-8 px-2 gap-1",
                      batch.status === "active"
                        ? "text-blue-600 hover:bg-blue-50"
                        : "text-green-600 hover:bg-green-50"
                    )}
                  >
                    {batch.status === "active" ? <Building2 className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
                    <span className="text-xs">{batch.status === "active" ? "Công ty" : "Kích hoạt"}</span>
                  </Button>
                  {batch.status !== "active" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleClose(batch)}
                      disabled={closingBatch === batch.id}
                      className="h-8 px-2 text-amber-600 hover:bg-amber-50 gap-1"
                    >
                      {closingBatch === batch.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Lock className="h-3.5 w-3.5" />
                      )}
                      <span className="text-xs">Đóng</span>
                    </Button>
                  )}
                  {batch.status === "upcoming" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(batch)}
                      className="h-8 w-8 p-0 text-red-400 hover:text-red-600 hover:bg-red-50"
                      title="Xóa"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Modals */}
      <BatchModal
        isOpen={createModalOpen}
        onClose={() => { setCreateModalOpen(false); setEditTarget(null); }}
        onSuccess={fetchBatches}
        editBatch={editTarget}
      />
      <AnimatePresence>
        {activateTarget && (
          <ActivateModal
            isOpen={!!activateTarget}
            onClose={() => setActivateTarget(null)}
            onSuccess={() => { fetchBatches(); fetchStats(); }}
            batch={activateTarget}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
