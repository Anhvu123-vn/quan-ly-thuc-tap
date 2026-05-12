import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check, FileText, MessageSquare, AlertTriangle, Calendar } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types";

export type NotificationType = "approval" | "log" | "deadline" | "info";

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  read: boolean;
  actionUrl?: string;
}

// Mock notifications by role
const mockNotifications: Record<UserRole, NotificationItem[]> = {
  student: [
    { id: "1", type: "approval", title: "Đơn được duyệt!", message: "Đơn thực tập tại TechCorp đã được duyệt", time: "2 giờ trước", read: false },
    { id: "2", type: "log", title: "Phản hồi mới", message: "GV Nguyễn Văn A đã phản hồi nhật ký tuần 3", time: "5 giờ trước", read: false },
    { id: "3", type: "deadline", title: "Hạn chót sắp đến", message: "Nộp báo cáo thực tập tuần 4 trong 2 ngày", time: "1 ngày trước", read: true },
    { id: "4", type: "info", title: "Công việc mới", message: "FPT Software có vị trí Fresher React phù hợp với bạn", time: "2 ngày trước", read: true },
  ],
  lecturer: [
    { id: "1", type: "approval", title: "Cần phê duyệt", message: "5 đơn thực tập chờ phê duyệt cấp Khoa", time: "10 phút trước", read: false },
    { id: "2", type: "log", title: "Nhật ký mới", message: "Trần Minh có 2 nhật ký mới cần phản hồi", time: "1 giờ trước", read: false },
    { id: "3", type: "deadline", title: "Học kỳ kết thúc", message: "Thời hạn chấm điểm: 15/06/2026", time: "3 ngày trước", read: true },
  ],
  company: [
    { id: "1", type: "approval", title: "Ứng viên mới", message: "10 sinh viên ứng tuyển vị trí Frontend Developer", time: "30 phút trước", read: false },
    { id: "2", type: "info", title: "Yêu cầu đánh giá", message: "Cần đánh giá sinh viên thực tập tháng 5", time: "2 giờ trước", read: false },
    { id: "3", type: "deadline", title: "Hạn hợp đồng", message: "Hợp đồng thực tập của 3 sinh viên sắp hết hạn", time: "1 ngày trước", read: true },
  ],
  admin: [
    { id: "1", type: "approval", title: "Tài khoản mới", message: "3 doanh nghiệp chờ phê duyệt", time: "5 phút trước", read: false },
    { id: "2", type: "info", title: "Báo cáo tháng", message: "Báo cáo thống kê tháng 5 đã sẵn sàng", time: "1 giờ trước", read: false },
    { id: "3", type: "deadline", title: "Cập nhật hệ thống", message: "Lên lịch bảo trì server: 20/05/2026", time: "1 ngày trước", read: true },
  ],
};

const iconMap: Record<NotificationType, typeof Bell> = {
  approval: FileText,
  log: MessageSquare,
  deadline: Calendar,
  info: AlertTriangle,
};

const colorMap: Record<NotificationType, string> = {
  approval: "text-emerald-500 bg-emerald-50",
  log: "text-indigo-500 bg-indigo-50",
  deadline: "text-amber-500 bg-amber-50",
  info: "text-blue-500 bg-blue-50",
};

export function NotificationBell() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const role = user?.role || "student";
  const notifications = mockNotifications[role];
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = (id: string) => {
    // In real app, call API to mark as read
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl hover:bg-slate-100 transition-colors"
      >
        <Bell className="h-5 w-5 text-slate-600" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 h-5 w-5 rounded-full bg-red-500 text-white text-xs font-medium flex items-center justify-center"
          >
            {unreadCount}
          </motion.span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">Thông báo</h3>
              {unreadCount > 0 && (
                <span className="text-xs text-indigo-600 font-medium">
                  {unreadCount} chưa đọc
                </span>
              )}
            </div>

            {/* Notification List */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Không có thông báo</p>
                </div>
              ) : (
                notifications.map((notification, index) => {
                  const Icon = iconMap[notification.type];
                  const colors = colorMap[notification.type];

                  return (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => markAsRead(notification.id)}
                      className={cn(
                        "px-4 py-3 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors",
                        !notification.read && "bg-indigo-50/50"
                      )}
                    >
                      <div className="flex gap-3">
                        <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center shrink-0", colors)}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className={cn("text-sm font-medium text-slate-900", !notification.read && "text-indigo-700")}>
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <span className="h-2 w-2 rounded-full bg-indigo-500" />
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{notification.message}</p>
                          <p className="text-xs text-slate-400 mt-1">{notification.time}</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-slate-100 bg-slate-50">
              <button className="w-full text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors">
                Xem tất cả thông báo
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
