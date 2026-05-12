import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { X, Briefcase, MapPin, DollarSign, Clock, Tag, Plus, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { jobPostingSchema, type JobPostingFormValues } from "@/lib/validation";
import type { JobPosting } from "@/data/mockData";

interface JobPostingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (job: Omit<JobPosting, "id" | "postedDate" | "applicants">) => void;
  editJob?: JobPosting | null;
}

const WORK_TYPE_OPTIONS = [
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
  { value: "on-site", label: "On-site" },
];

const FIELD_OPTIONS = [
  "Software",
  "Design",
  "Marketing",
  "Data Science",
  "Product",
  "DevOps",
  "Business",
];

const DURATION_OPTIONS = ["1 month", "2-3 months", "4-6 months", "6+ months"];

export function JobPostingModal({ isOpen, onClose, onSave, editJob }: JobPostingModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<JobPostingFormValues>({
    resolver: zodResolver(jobPostingSchema),
    defaultValues: {
      title: editJob?.title || "",
      field: editJob?.field || "",
      location: editJob?.location || "",
      workType: editJob?.workType || "on-site",
      duration: editJob?.duration || "",
      salaryMin: editJob?.salaryMin ? editJob.salaryMin / 1000000 : undefined,
      salaryMax: editJob?.salaryMax ? editJob.salaryMax / 1000000 : undefined,
      requirements: editJob?.requirements.join(", ") || "",
      status: editJob?.status || "active",
    },
  });

  // Reset form when modal opens with new data
  const handleClose = () => {
    reset();
    onClose();
  };

  const onValid = (data: JobPostingFormValues) => {
    onSave({
      title: data.title,
      field: data.field,
      location: data.location,
      workType: data.workType,
      duration: data.duration,
      salaryMin: data.salaryMin ? data.salaryMin * 1000000 : undefined,
      salaryMax: data.salaryMax ? data.salaryMax * 1000000 : undefined,
      requirements: data.requirements
        ? data.requirements.split(",").map((r) => r.trim()).filter(Boolean)
        : [],
      status: data.status || "active",
    });
    reset();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {editJob ? "Chỉnh sửa vị trí" : "Đăng tin tuyển dụng mới"}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {editJob ? "Cập nhật thông tin vị trí thực tập" : "Điền thông tin vị trí thực tập cần tuyển"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Body */}
              <form
                id="job-posting-form"
                onSubmit={handleSubmit(onValid)}
                className="px-6 py-5 space-y-4 overflow-y-auto flex-1"
              >
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Tiêu đề vị trí <span className="text-red-500">*</span>
                  </label>
                  <Input
                    {...register("title")}
                    placeholder="VD: Frontend Developer Intern"
                    className={errors.title ? "border-red-300 focus:ring-red-400" : ""}
                  />
                  {errors.title && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.title.message}
                    </p>
                  )}
                </div>

                {/* Field + Location */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Lĩnh vực <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register("field")}
                      className={`h-10 w-full rounded-md border bg-white px-3 text-sm focus:outline-none focus:ring-2 ${
                        errors.field ? "border-red-300 focus:ring-red-400" : "border-slate-200 focus:ring-indigo-400"
                      }`}
                    >
                      <option value="">Chọn lĩnh vực</option>
                      {FIELD_OPTIONS.map((f) => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                    {errors.field && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.field.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      <MapPin className="h-3.5 w-3.5 inline mr-1" />
                      Địa điểm <span className="text-red-500">*</span>
                    </label>
                    <Input
                      {...register("location")}
                      placeholder="VD: Ho Chi Minh City"
                      className={errors.location ? "border-red-300 focus:ring-red-400" : ""}
                    />
                    {errors.location && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.location.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Work Type + Duration */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Hình thức làm việc
                    </label>
                    <select
                      {...register("workType")}
                      className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    >
                      {WORK_TYPE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      <Clock className="h-3.5 w-3.5 inline mr-1" />
                      Thời hạn <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register("duration")}
                      className={`h-10 w-full rounded-md border bg-white px-3 text-sm focus:outline-none focus:ring-2 ${
                        errors.duration ? "border-red-300 focus:ring-red-400" : "border-slate-200 focus:ring-indigo-400"
                      }`}
                    >
                      <option value="">Chọn thời hạn</option>
                      {DURATION_OPTIONS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                    {errors.duration && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.duration.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Salary Range */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    <DollarSign className="h-3.5 w-3.5 inline mr-1" />
                    Mức hỗ trợ / tháng (VND) — tuỳ chọn
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Input
                        type="number"
                        step="0.5"
                        min="0"
                        {...register("salaryMin")}
                        placeholder="Tối thiểu (triệu)"
                        className={errors.salaryMin ? "border-red-300" : ""}
                      />
                      {errors.salaryMin && (
                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.salaryMin.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Input
                        type="number"
                        step="0.5"
                        min="0"
                        {...register("salaryMax")}
                        placeholder="Tối đa (triệu)"
                        className={errors.salaryMax ? "border-red-300 focus:ring-red-400" : ""}
                      />
                      {errors.salaryMax && (
                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.salaryMax.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Requirements */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    <Tag className="h-3.5 w-3.5 inline mr-1" />
                    Yêu cầu kỹ năng — phân cách bằng dấu phẩy
                  </label>
                  <Input
                    {...register("requirements")}
                    placeholder="VD: React, TypeScript, Git"
                  />
                </div>

                {/* Status */}
                {editJob && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Trạng thái</label>
                    <select
                      {...register("status")}
                      className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    >
                      <option value="active">Đang tuyển</option>
                      <option value="paused">Tạm dừng</option>
                      <option value="closed">Đã đóng</option>
                    </select>
                  </div>
                )}
              </form>

              {/* Footer */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex gap-3 flex-shrink-0">
                <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
                  Huỷ
                </Button>
                <Button
                  type="submit"
                  form="job-posting-form"
                  disabled={isSubmitting}
                  className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white"
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  {editJob ? "Lưu thay đổi" : "Đăng tin"}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
