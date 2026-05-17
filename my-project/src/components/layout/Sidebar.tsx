import { NavLink, useNavigate } from "react-router-dom";
import { 
  User, Settings, LogOut, Briefcase, Shield, Sparkles,
  BookOpen, BarChart3, ClipboardCheck, MessageSquare, Star,
  Building2, Users as UsersIcon, FileText, Download
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { RoleBadge } from "@/components/shared/Badge";
import { motion, AnimatePresence } from "framer-motion";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

interface NavItem {
  to: string;
  icon: typeof User;
  label: string;
  roles?: ("student" | "lecturer" | "company" | "admin")[];
  exact?: boolean;
}

// Navigation items by role
const navItemsByRole: Record<string, NavItem[]> = {
  student: [
    { to: "/positions", icon: Briefcase, label: "Vị trí thực tập", exact: true },
    { to: "/student", icon: User, label: "Dashboard", exact: true },
    { to: "/student/profile", icon: User, label: "Hồ sơ e-Portfolio" },
    { to: "/student/journal", icon: BookOpen, label: "Nhật ký 360" },
    { to: "/student/roadmap", icon: BarChart3, label: "Lộ trình phát triển" },
    { to: "/settings", icon: Settings, label: "Cài đặt" },
  ],
  lecturer: [
    { to: "/positions", icon: Briefcase, label: "Vị trí thực tập", exact: true },
    { to: "/lecturer/dashboard", icon: User, label: "Dashboard", exact: true },
    { to: "/lecturer/approval", icon: ClipboardCheck, label: "Phê duyệt đơn", roles: ["lecturer", "admin"] },
    { to: "/lecturer/feedback", icon: MessageSquare, label: "Feedback Hub", roles: ["lecturer"] },
    { to: "/lecturer/evaluation", icon: Star, label: "Chấm điểm", roles: ["lecturer"] },
    { to: "/settings", icon: Settings, label: "Cài đặt" },
  ],
  company: [
    { to: "/positions", icon: Briefcase, label: "Vị trí thực tập", exact: true },
    { to: "/company/dashboard", icon: Building2, label: "Dashboard", exact: true },
    { to: "/company/jobs", icon: Briefcase, label: "Quản lý tuyển dụng", roles: ["company"] },
    { to: "/company/candidates", icon: UsersIcon, label: "Xem ứng viên", roles: ["company"] },
    { to: "/company/evaluation", icon: Star, label: "Đánh giá 360", roles: ["company"] },
    { to: "/settings", icon: Settings, label: "Cài đặt" },
  ],
  admin: [
    { to: "/positions", icon: Briefcase, label: "Vị trí thực tập", exact: true },
    { to: "/admin", icon: Shield, label: "Dashboard", exact: true },
    { to: "/admin/users", icon: UsersIcon, label: "Quản lý người dùng", roles: ["admin"] },
    { to: "/admin/analytics", icon: BarChart3, label: "Analytics", roles: ["admin"] },
    { to: "/admin/logs", icon: FileText, label: "System Logs", roles: ["admin"] },
    { to: "/settings", icon: Settings, label: "Cài đặt" },
  ],
};

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const role = user?.role || "student";
  const navItems = navItemsByRole[role] || navItemsByRole.student;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      {/* Overlay for mobile when expanded */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onToggle}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Glassmorphism effect with collapse */}
      <motion.aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-full flex-col glass border-r border-slate-200/50 shadow-xl shadow-slate-900/5 transition-all duration-300 ease-out",
          isCollapsed ? "w-20" : "w-64"
        )}
        animate={{ width: isCollapsed ? 80 : 256 }}
        aria-label="Main navigation"
      >
        {/* Logo Section */}
        <div className={cn(
          "flex h-16 items-center border-b border-slate-200/50 transition-all duration-300",
          isCollapsed ? "justify-center px-2" : "justify-between px-6"
        )}>
          {/* Logo - hidden when collapsed */}
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-3"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-bold bg-gradient-to-r from-slate-800 to-slate-500 bg-clip-text text-transparent">
                  InternHub
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Logo Icon only when collapsed */}
          <AnimatePresence mode="wait">
            {isCollapsed && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25"
              >
                <Sparkles className="h-5 w-5 text-white" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-2 lg:p-4 overflow-hidden">
          {/* Role Label */}
          {!isCollapsed && (
            <div className="px-4 py-2 mb-2">
              <RoleBadge role={role} />
            </div>
          )}
          
          {navItems.map((item, index) => (
            <motion.div
              key={item.to}
              initial={false}
              animate={{
                opacity: isCollapsed ? 1 : 1,
                x: isCollapsed ? 0 : 0,
              }}
              transition={{ delay: index * 0.03, duration: 0.2 }}
            >
              <NavLink
                to={item.to}
                end={item.exact}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200",
                    isCollapsed && "lg:justify-center lg:px-0",
                    isActive
                      ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  )
                }
              >
                <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                <AnimatePresence mode="wait">
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.15 }}
                      className="truncate overflow-hidden whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </NavLink>
            </motion.div>
          ))}
        </nav>

        {/* User section */}
        <div className="border-t border-slate-200/50 p-2 lg:p-4">
          {/* User info - hidden when collapsed */}
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-3 mb-3 p-2 rounded-xl bg-slate-100/80">
                  <Avatar className="h-10 w-10 ring-2 ring-indigo-500/20">
                    <AvatarFallback className="text-sm font-semibold bg-gradient-to-br from-indigo-100 to-violet-100 text-indigo-700">
                      {user?.name?.slice(0, 2).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{user?.name || "User"}</p>
                    <p className="text-xs text-slate-500 truncate">
                      {user?.email || "user@example.com"}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sign out button */}
          <Button
            variant="ghost"
            className={cn(
              "w-full text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200",
              isCollapsed && "lg:justify-center lg:px-0"
            )}
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.15 }}
                  className="truncate overflow-hidden whitespace-nowrap"
                >
                  Đăng xuất
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
        </div>
      </motion.aside>
    </>
  );
}
