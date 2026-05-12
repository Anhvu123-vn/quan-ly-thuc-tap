import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, AlertTriangle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/shared/Badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { ApprovalItem } from "@/data/mockData";

interface ApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: ApprovalItem | null;
  onConfirm: (id: string, comment: string) => void;
  type: "approve" | "reject";
}

export function ApprovalModal({
  isOpen,
  onClose,
  item,
  onConfirm,
  type,
}: ApprovalModalProps) {
  const [comment, setComment] = useState("");

  const handleConfirm = () => {
    if (!item) return;
    onConfirm(item.id, comment);
    setComment("");
    onClose();
  };

  const handleClose = () => {
    setComment("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && item && (
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
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
              {/* Header */}
              <div
                className={`px-6 py-4 flex items-center justify-between ${
                  type === "approve"
                    ? "bg-emerald-50 border-b border-emerald-100"
                    : "bg-red-50 border-b border-red-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                      type === "approve"
                        ? "bg-emerald-100 text-emerald-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {type === "approve" ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <AlertTriangle className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {type === "approve"
                        ? "Phê duyệt đơn"
                        : "Từ chối đơn"}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {type === "approve"
                        ? "Hành động này sẽ chấp thuận đơn thực tập"
                        : "Hành động này sẽ từ chối đơn thực tập"}
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
              <div className="p-6 space-y-4">
                {/* Applicant Info */}
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarFallback className="text-xs bg-indigo-100 text-indigo-700 font-semibold">
                      {item.studentName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900">
                      {item.studentName}
                    </p>
                    <p className="text-sm text-slate-500">{item.studentEmail}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {item.company} · {item.position}
                    </p>
                  </div>
                  <Badge
                    variant={
                      item.level === "faculty" ? "default" : "secondary"
                    }
                    size="sm"
                  >
                    {item.level === "faculty" ? "Cấp Khoa" : "GV HD"}
                  </Badge>
                </div>

                {/* Warning for rejection */}
                {type === "reject" && (
                  <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-sm">
                    <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-red-700">
                      Đơn đã bị từ chối sẽ{" "}
                      <span className="font-semibold">không thể khôi phục</span>.
                      Sinh viên sẽ nhận được thông báo qua email.
                    </p>
                  </div>
                )}

                {/* Info for approval */}
                {type === "approve" && (
                  <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-100 rounded-xl text-sm">
                    <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-blue-700">
                      Đơn sẽ được chuyển đến bộ phận tiếp theo trong quy trình
                      phê duyệt.
                    </p>
                  </div>
                )}

                {/* Comment textarea */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    {type === "approve"
                      ? "Nhận xét (không bắt buộc)"
                      : "Lý do từ chối"}
                    {type === "reject" && (
                      <span className="text-red-500 ml-0.5">*</span>
                    )}
                  </label>
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={
                      type === "approve"
                        ? "Nhập nhận xét của bạn cho sinh viên..."
                        : "Nhập lý do từ chối để sinh viên biết..."
                    }
                    rows={3}
                    className="resize-none"
                  />
                  {type === "reject" && !comment.trim() && (
                    <p className="text-xs text-red-500 mt-1">
                      Vui lòng nhập lý do từ chối
                    </p>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                >
                  Huỷ
                </Button>
                <Button
                  onClick={handleConfirm}
                  disabled={type === "reject" && !comment.trim()}
                  className={`flex-1 ${
                    type === "approve"
                      ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                      : "bg-red-500 hover:bg-red-600 text-white"
                  }`}
                >
                  {type === "approve" ? (
                    <>
                      <Check className="h-4 w-4 mr-1.5" />
                      Xác nhận duyệt
                    </>
                  ) : (
                    <>
                      <X className="h-4 w-4 mr-1.5" />
                      Xác nhận từ chối
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
