import { useContext } from "react";
import { Search, PanelLeftClose } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { NotificationBell } from "@/components/shared/NotificationBell";
import { RoleBadge } from "@/components/shared/Badge";
import { SidebarContext } from "./DashboardLayout";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";

// Page titles by route
const pageTitles: Record<string, string> = {
  "/positions": "Vị trí thực tập",
  "/student": "Dashboard",
  "/student/profile": "Hồ sơ e-Portfolio",
  "/student/journal": "Nhật ký 360",
  "/student/roadmap": "Lộ trình phát triển",
  "/lecturer": "Dashboard Giảng viên",
  "/lecturer/approval": "Phê duyệt đơn",
  "/lecturer/feedback": "Feedback Hub",
  "/lecturer/evaluation": "Chấm điểm thực tập",
  "/company": "Dashboard Doanh nghiệp",
  "/company/jobs": "Quản lý tuyển dụng",
  "/company/candidates": "Xem ứng viên",
  "/company/evaluation": "Đánh giá 360",
  "/admin": "Dashboard Admin",
  "/admin/users": "Quản lý người dùng",
  "/admin/analytics": "Analytics Dashboard",
  "/admin/logs": "System Logs",
  "/settings": "Cài đặt",
};

function getPageTitle(pathname: string): string {
  if (pageTitles[pathname]) return pageTitles[pathname];
  for (const [path, title] of Object.entries(pageTitles)) {
    if (pathname.startsWith(path + "/")) return title;
  }
  return "Dashboard";
}

export function Header() {
  const { user } = useAuth();
  const { isCollapsed, toggleSidebar } = useContext(SidebarContext);
  const location = useLocation();
  const pageTitle = getPageTitle(location.pathname);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-slate-200 bg-white/80 backdrop-blur-lg px-4 sm:px-6 lg:px-8">
      {/* Toggle Sidebar Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className="h-9 w-9 hover:bg-slate-100 transition-all duration-200"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <motion.div
          initial={false}
          animate={{ rotate: isCollapsed ? 180 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <PanelLeftClose className="h-5 w-5 text-slate-600" />
        </motion.div>
      </Button>

      {/* Page title */}
      <motion.h1
        key={pageTitle}
        className="text-lg font-bold text-slate-900 sm:text-xl"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
      >
        {pageTitle}
      </motion.h1>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search */}
      <div className="hidden md:block relative w-full max-w-sm">
        <Search
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        />
        <input
          type="search"
          placeholder="Tìm kiếm..."
          className="pl-10 w-full bg-slate-50 border border-slate-200 rounded-xl focus:bg-white transition-colors h-10 px-4 text-sm"
          aria-label="Search"
        />
      </div>

      {/* Notifications */}
      <NotificationBell />

      {/* User */}
      <div className="flex items-center gap-3">
        {user?.role && <RoleBadge role={user.role} />}
        <Avatar className="h-9 w-9 ring-2 ring-indigo-500/20">
          <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-indigo-100 to-violet-100 text-indigo-700">
            {user?.name?.slice(0, 2).toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
