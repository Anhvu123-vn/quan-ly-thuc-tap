import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check, FileText, MessageSquare, AlertTriangle, Calendar, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { api } from "@/services/api";

export type NotificationType =
  | "approval"
  | "log"
  | "deadline"
  | "info"
  | "application"
  | "evaluation"
  | "system";

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  read: boolean;
  actionUrl?: string;
  createdAt?: string;
}

const iconMap: Record<NotificationType, typeof Bell> = {
  approval: FileText,
  log: MessageSquare,
  deadline: Calendar,
  info: AlertTriangle,
  application: FileText,
  evaluation: MessageSquare,
  system: AlertTriangle,
};

const colorMap: Record<NotificationType, { icon: string; bg: string }> = {
  approval: { icon: "text-emerald-500", bg: "bg-emerald-50" },
  log: { icon: "text-indigo-500", bg: "bg-indigo-50" },
  deadline: { icon: "text-amber-500", bg: "bg-amber-50" },
  info: { icon: "text-blue-500", bg: "bg-blue-50" },
  application: { icon: "text-emerald-500", bg: "bg-emerald-50" },
  evaluation: { icon: "text-purple-500", bg: "bg-purple-50" },
  system: { icon: "text-slate-500", bg: "bg-slate-50" },
};

const POLL_INTERVAL_MS = 30_000; // 30 seconds

function formatTimeAgo(dateString?: string): string {
  if (!dateString) return "Vừa xong";

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMins < 1) return "Vừa xong";
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return date.toLocaleDateString("vi-VN", { day: "numeric", month: "short" });
}

function parseNotificationType(type?: string): NotificationType {
  const t = (type || "").toLowerCase();
  if (t.includes("approval") || t.includes("approved") || t.includes("accept")) return "approval";
  if (t.includes("log") || t.includes("journal")) return "log";
  if (t.includes("deadline") || t.includes("reminder")) return "deadline";
  if (t.includes("application") || t.includes("apply")) return "application";
  if (t.includes("evaluation") || t.includes("score")) return "evaluation";
  if (t.includes("system") || t.includes("admin")) return "system";
  return "info";
}

function transformNotification(n: any): NotificationItem {
  return {
    id: n.id || String(Math.random()),
    type: parseNotificationType(n.type || n.notificationType),
    title: n.title || n.content?.slice(0, 50) || "Thông báo mới",
    message: n.message || n.content || "",
    time: formatTimeAgo(n.createdAt || n.timestamp),
    read: n.isRead === true || n.read === true,
    actionUrl: n.actionUrl || n.link,
    createdAt: n.createdAt,
  };
}

export function NotificationBell() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch only unread count — fast lightweight call
  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;
    try {
      const data = await api.getUnreadCount();
      setUnreadCount(typeof data === "number" ? data : (data?.count ?? 0));
    } catch {
      // Silently ignore — badge just stays stale
    }
  }, [user]);

  // Fetch full notification list when dropdown opens
  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const response = await api.getNotifications({ page: 1 });
      const raw: any[] = response?.data || response || [];
      const transformed = Array.isArray(raw) ? raw.map(transformNotification) : [];
      setNotifications(transformed);
    } catch {
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Start/stop polling for unread count
  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      setNotifications([]);
      return;
    }

    // Immediate fetch on mount / user change
    fetchUnreadCount();

    pollIntervalRef.current = setInterval(fetchUnreadCount, POLL_INTERVAL_MS);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [user, fetchUnreadCount]);

  // Refresh full list when dropdown opens
  useEffect(() => {
    if (isOpen && user) {
      fetchNotifications();
    }
  }, [isOpen, user, fetchNotifications]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await api.markAsRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const openDropdown = () => {
    setIsOpen(true);
    if (user) fetchNotifications();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => (isOpen ? setIsOpen(false) : openDropdown())}
        className="relative p-2.5 rounded-xl hover:bg-slate-100 transition-colors"
        aria-label={`Thông báo${unreadCount > 0 ? ` (${unreadCount} chưa đọc)` : ""}`}
      >
        <motion.div
          whileHover={{ rotate: 15 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Bell className="h-5 w-5 text-slate-600" />
        </motion.div>

        {/* Unread badge */}
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              key="badge"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
              className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none shadow-sm"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-900">Thông báo</h3>
                {unreadCount > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-red-50 text-red-600 text-xs font-semibold">
                    {unreadCount}
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                >
                  <Check className="h-3 w-3" />
                  Đánh dấu đã đọc
                </button>
              )}
            </div>

            {/* Notification List */}
            <div className="max-h-80 overflow-y-auto">
              {isLoading ? (
                <div className="p-8 text-center text-slate-400">
                  <Loader2 className="h-6 w-6 mx-auto mb-2 animate-spin" />
                  <p className="text-sm">Đang tải...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Không có thông báo</p>
                </div>
              ) : (
                notifications.map((notification, index) => {
                  const Icon = iconMap[notification.type] || Bell;
                  const colors = colorMap[notification.type] || colorMap.info;

                  return (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.04 }}
                      onClick={() => !notification.read && markAsRead(notification.id)}
                      className={cn(
                        "px-4 py-3 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors",
                        !notification.read && "bg-indigo-50/50"
                      )}
                    >
                      <div className="flex gap-3">
                        <div
                          className={cn(
                            "h-9 w-9 rounded-lg flex items-center justify-center shrink-0",
                            colors.bg
                          )}
                        >
                          <Icon className={cn("h-4 w-4", colors.icon)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p
                              className={cn(
                                "text-sm font-medium text-slate-900 line-clamp-1",
                                !notification.read && "text-indigo-700"
                              )}
                            >
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <motion.span
                                layoutId="unread-dot"
                                className="h-2 w-2 rounded-full bg-indigo-500 shrink-0"
                              />
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-slate-400 mt-1">{notification.time}</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 text-center">
              <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors">
                Xem tất cả thông báo
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
