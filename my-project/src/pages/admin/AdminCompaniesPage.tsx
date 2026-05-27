import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Mail,
  Phone,
  Globe,
  Loader2,
  AlertTriangle,
  X,
  Check,
  Ban,
  Info,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { api } from "@/services/api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 10;

interface Company {
  id: string;
  name: string;
  email: string;
  phone?: string;
  department?: string;
  status: string;
  createdAt?: string;
}

function ApproveModal({
  isOpen,
  onClose,
  company,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  company: Company | null;
  onSuccess: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApprove = async () => {
    if (!company) return;
    setIsSubmitting(true);
    try {
      await api.approveCompany(company.id);
      toast.success(`Đã phê duyệt công ty "${company.name}"`);
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Phê duyệt thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!company) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose}
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
      >
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden pointer-events-auto">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
              <CheckCircle2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-lg">Phê duyệt công ty</h3>
              <p className="text-emerald-100 text-sm">Kích hoạt tài khoản doanh nghiệp</p>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-slate-400" />
                <span className="font-semibold text-slate-800">{company.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-slate-400" />
                <span className="text-sm text-slate-600">{company.email}</span>
              </div>
              {company.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-600">{company.phone}</span>
                </div>
              )}
              {company.department && (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-600">{company.department}</span>
                </div>
              )}
            </div>

            <div className="rounded-xl bg-blue-50 border border-blue-200 p-3">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                <p className="text-xs text-blue-700">
                  Sau khi phê duyệt, công ty có thể đăng nhập và sử dụng hệ thống.
                </p>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-slate-100 flex gap-3 bg-slate-50/50">
            <Button variant="outline" onClick={onClose} className="flex-1" disabled={isSubmitting}>
              Huỷ
            </Button>
            <Button
              onClick={handleApprove}
              disabled={isSubmitting}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 mr-1" />}
              Phê duyệt
            </Button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

function RejectModal({
  isOpen,
  onClose,
  company,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  company: Company | null;
  onSuccess: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reason, setReason] = useState("");

  const handleReject = async () => {
    if (!company) return;
    setIsSubmitting(true);
    try {
      await api.rejectCompany(company.id);
      toast.success(`Đã từ chối công ty "${company.name}"`);
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Từ chối thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!company) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose}
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
      >
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden pointer-events-auto">
          <div className="bg-gradient-to-r from-red-500 to-rose-600 px-6 py-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
              <XCircle className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-lg">Từ chối công ty</h3>
              <p className="text-red-100 text-sm">Từ chối đăng ký doanh nghiệp</p>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-slate-400" />
                <span className="font-semibold text-slate-800">{company.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-slate-400" />
                <span className="text-sm text-slate-600">{company.email}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Lý do từ chối <span className="text-red-500">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="VD: Thông tin công ty không hợp lệ hoặc không phù hợp với hệ thống..."
                rows={3}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
              />
              <p className="text-xs text-slate-400">Lý do này có thể được gửi email cho công ty (tùy chọn)</p>
            </div>

            <div className="rounded-xl bg-red-50 border border-red-200 p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                <p className="text-xs text-red-700">
                  Công ty sẽ không thể đăng nhập sau khi bị từ chối. Họ có thể đăng ký lại với thông tin khác.
                </p>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-slate-100 flex gap-3 bg-slate-50/50">
            <Button variant="outline" onClick={onClose} className="flex-1" disabled={isSubmitting}>
              Huỷ
            </Button>
            <Button
              onClick={handleReject}
              disabled={isSubmitting}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ban className="h-4 w-4 mr-1" />}
              Từ chối
            </Button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

export function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [approveTarget, setApproveTarget] = useState<Company | null>(null);
  const [rejectTarget, setRejectTarget] = useState<Company | null>(null);

  const fetchCompanies = useCallback(async (page = 1, searchQuery = "") => {
    setIsLoading(true);
    try {
      const params: Record<string, any> = {
        page,
        limit: ITEMS_PER_PAGE,
      };
      if (searchQuery) params.search = searchQuery;

      const data = await api.getPendingCompanies(params);
      setCompanies(data?.data || []);
      setTotal(data?.meta?.total || 0);
      setCurrentPage(page);
    } catch (err) {
      console.error("Failed to fetch pending companies:", err);
      toast.error("Không thể tải danh sách công ty chờ duyệt");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCompanies(1, searchInput);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Duyệt doanh nghiệp</h1>
          <p className="text-slate-500 mt-1">
            Xem xét và phê duyệt các đăng ký doanh nghiệp mới
          </p>
        </div>
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2">
          <Clock className="h-4 w-4 text-amber-600" />
          <span className="text-sm font-medium text-amber-700">
            {total} công ty chờ duyệt
          </span>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <Input
                placeholder="Tìm theo tên công ty hoặc email..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button type="submit" variant="outline">
              Tìm kiếm
            </Button>
            {searchInput && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setSearchInput("");
                  fetchCompanies(1, "");
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Empty state */}
      {!isLoading && companies.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200 rounded-2xl p-12 text-center"
        >
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
            <Building2 className="h-7 w-7 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700 mb-1">
            {searchInput ? "Không tìm thấy công ty nào" : "Không có công ty chờ duyệt"}
          </h3>
          <p className="text-sm text-slate-400">
            {searchInput
              ? `Không có kết quả cho "${searchInput}"`
              : "Tất cả các đăng ký doanh nghiệp đã được xử lý"}
          </p>
        </motion.div>
      )}

      {/* Company list */}
      {companies.length > 0 && (
        <div className="space-y-3">
          {companies.map((company, index) => (
            <motion.div
              key={company.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100">
                        <Building2 className="h-6 w-6 text-indigo-600" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-slate-900 truncate">{company.name}</h3>
                          <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="h-3 w-3" />
                            Chờ duyệt
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                          <div className="flex items-center gap-1.5">
                            <Mail className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{company.email}</span>
                          </div>
                          {company.phone && (
                            <div className="flex items-center gap-1.5">
                              <Phone className="h-3.5 w-3.5 shrink-0" />
                              <span>{company.phone}</span>
                            </div>
                          )}
                          {company.department && (
                            <div className="flex items-center gap-1.5">
                              <Globe className="h-3.5 w-3.5 shrink-0" />
                              <span>{company.department}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-400">
                          <Clock className="h-3 w-3" />
                          Đăng ký ngày {formatDate(company.createdAt)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        onClick={() => setApproveTarget(company)}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white gap-1"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Duyệt
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setRejectTarget(company)}
                        className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200 hover:border-red-300 gap-1"
                      >
                        <XCircle className="h-4 w-4" />
                        Từ chối
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-slate-400">
                Hiển thị {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
                {Math.min(currentPage * ITEMS_PER_PAGE, total)} trong {total} công ty
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchCompanies(currentPage - 1, searchInput)}
                  disabled={currentPage === 1}
                >
                  ←
                </Button>
                <span className="text-sm text-slate-600">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchCompanies(currentPage + 1, searchInput)}
                  disabled={currentPage === totalPages}
                >
                  →
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <ApproveModal
        isOpen={!!approveTarget}
        onClose={() => setApproveTarget(null)}
        company={approveTarget}
        onSuccess={() => fetchCompanies(currentPage, searchInput)}
      />

      <RejectModal
        isOpen={!!rejectTarget}
        onClose={() => setRejectTarget(null)}
        company={rejectTarget}
        onSuccess={() => fetchCompanies(currentPage, searchInput)}
      />
    </div>
  );
}
