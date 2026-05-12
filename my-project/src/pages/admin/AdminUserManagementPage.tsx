import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import {
  Users,
  UserPlus,
  Search,
  Edit,
  Trash2,
  Shield,
  Building2,
  GraduationCap,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge, RoleBadge } from "@/components/shared/Badge";
import { Tabs } from "@/components/shared/Tabs";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { userEditSchema, type UserEditFormValues } from "@/lib/validation";
import { mockApplications } from "@/data/mockData";
import { cn } from "@/lib/utils";
import type { User as UserType } from "@/types";

interface AdminUser extends UserType {
  department?: string;
  companyName?: string;
}

const mockUsers: AdminUser[] = [
  { id: "1", name: "Trần Minh Đức", email: "minh.duc@example.com", role: "student", status: "active", joinedDate: "2026-01-15", department: "Khoa học Máy tính" },
  { id: "2", name: "TS. Nguyễn Văn A", email: "nguyen.va@example.com", role: "lecturer", status: "active", joinedDate: "2025-09-01", department: "Khoa CNTT" },
  { id: "3", name: "TechCorp Vietnam", email: "hr@techcorp.vn", role: "company", status: "pending", joinedDate: "2026-05-10", companyName: "TechCorp Vietnam" },
  { id: "4", name: "Admin User", email: "admin@example.com", role: "admin", status: "active", joinedDate: "2025-01-01" },
  { id: "5", name: "Lê Thị Bình", email: "binh.le@example.com", role: "student", status: "active", joinedDate: "2026-02-20", department: "Kỹ thuật Phần mềm" },
  { id: "6", name: "DataFlow Inc", email: "recruit@dataflow.com", role: "company", status: "inactive", joinedDate: "2026-04-15", companyName: "DataFlow Inc" },
  { id: "7", name: "Phạm Văn Cường", email: "cuong.pham@example.com", role: "student", status: "pending_role", joinedDate: "2026-05-08", department: "Khoa CNTT" },
];

const ROLE_OPTIONS = [
  { value: "student", label: "Sinh viên", icon: GraduationCap },
  { value: "lecturer", label: "Giảng viên", icon: Users },
  { value: "company", label: "Doanh nghiệp", icon: Building2 },
  { value: "admin", label: "Quản trị", icon: Shield },
];

const STATUS_OPTIONS = [
  { value: "active", label: "Hoạt động", variant: "success" as const },
  { value: "inactive", label: "Không hoạt động", variant: "danger" as const },
  { value: "pending_role", label: "Chờ phê duyệt", variant: "warning" as const },
];

// Edit User Modal Component
interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: UserEditFormValues) => void;
  user: AdminUser | null;
}

function EditUserModal({ isOpen, onClose, onSave, user }: EditUserModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UserEditFormValues>({
    resolver: zodResolver(userEditSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      role: user?.role || "student",
      phone: "",
      department: user?.department || "",
      status: user?.status || "active",
    },
  });

  const onValid = (data: UserEditFormValues) => {
    onSave(data);
    reset();
    onClose();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
        />
      )}

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={isOpen ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
      >
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden pointer-events-auto">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                <Edit className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Chỉnh sửa người dùng</h3>
                <p className="text-xs text-slate-500">Cập nhật thông tin tài khoản</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <form id="edit-user-form" onSubmit={handleSubmit(onValid)} className="px-6 py-5 space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <Input
                {...register("name")}
                placeholder="Nhập họ và tên"
                className={errors.name ? "border-red-300 focus:ring-red-400" : ""}
              />
              {errors.name && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Email <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
                {...register("email")}
                placeholder="email@example.com"
                className={errors.email ? "border-red-300 focus:ring-red-400" : ""}
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Vai trò <span className="text-red-500">*</span>
              </label>
              <select
                {...register("role")}
                className={`h-10 w-full rounded-md border bg-white px-3 text-sm focus:outline-none focus:ring-2 ${
                  errors.role ? "border-red-300 focus:ring-red-400" : "border-slate-200 focus:ring-indigo-400"
                }`}
              >
                {ROLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {errors.role && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.role.message}
                </p>
              )}
            </div>

            {/* Phone + Status */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Điện thoại</label>
                <Input
                  {...register("phone")}
                  placeholder="0901234567"
                  className={errors.phone ? "border-red-300 focus:ring-red-400" : ""}
                />
                {errors.phone && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.phone.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Trạng thái</label>
                <select
                  {...register("status")}
                  className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Khoa / Phòng ban</label>
              <Input
                {...register("department")}
                placeholder="VD: Khoa CNTT"
              />
            </div>
          </form>

          {/* Footer */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex gap-3">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
              Huỷ
            </Button>
            <Button
              type="submit"
              form="edit-user-form"
              disabled={isSubmitting}
              className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white"
            >
              Lưu thay đổi
            </Button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

// Main Admin User Management Page
export function AdminUserManagementPage() {
  const [users, setUsers] = useState<AdminUser[]>(mockUsers);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AdminUser | null>(null);

  // Delete confirmation dialog state
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);

  const tabs = [
    { id: "all", label: "Tất cả", badge: users.length },
    { id: "student", label: "Sinh viên", badge: users.filter((u) => u.role === "student").length },
    { id: "lecturer", label: "Giảng viên", badge: users.filter((u) => u.role === "lecturer").length },
    { id: "company", label: "Doanh nghiệp", badge: users.filter((u) => u.role === "company").length },
    { id: "admin", label: "Admin", badge: users.filter((u) => u.role === "admin").length },
  ];

  const filteredUsers = users.filter((user) => {
    const matchesTab = activeTab === "all" || user.role === activeTab;
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const pendingCompanies = users.filter((u) => u.role === "company" && u.status === "pending");

  const handleEdit = (user: AdminUser) => {
    setEditTarget(user);
    setEditModalOpen(true);
  };

  const handleSaveEdit = (data: UserEditFormValues) => {
    if (!editTarget) return;
    setUsers((prev) =>
      prev.map((u) =>
        u.id === editTarget.id
          ? {
              ...u,
              name: data.name,
              email: data.email,
              role: data.role as AdminUser["role"],
              department: data.department,
              status: (data.status || "active") as AdminUser["status"],
            }
          : u
      )
    );
  };

  const handleDelete = (user: AdminUser) => {
    setDeleteTarget(user);
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const statusVariant = (status: AdminUser["status"]) => {
    if (status === "active") return "success";
    if (status === "pending_role") return "warning";
    return "danger";
  };

  const statusLabel = (status: AdminUser["status"]) => {
    if (status === "active") return "Hoạt động";
    if (status === "pending_role") return "Chờ phê duyệt";
    return "Không hoạt động";
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản lý người dùng</h1>
          <p className="text-slate-500 mt-1">Quản lý tài khoản và phân quyền</p>
        </div>
        <Button className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700">
          <UserPlus className="h-4 w-4 mr-2" />
          Thêm người dùng
        </Button>
      </div>

      {/* Pending Approvals Alert */}
      {pendingCompanies.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="font-medium text-amber-800">
                {pendingCompanies.length} doanh nghiệp chờ phê duyệt
              </p>
              <p className="text-sm text-amber-600">Cần xác minh và phê duyệt tài khoản doanh nghiệp mới</p>
            </div>
          </div>
          <Button size="sm" className="bg-amber-500 hover:bg-amber-600">
            Xem ngay
          </Button>
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Tổng người dùng", value: users.length, color: "bg-indigo-100 text-indigo-600" },
          { label: "Sinh viên", value: users.filter((u) => u.role === "student").length, color: "bg-blue-100 text-blue-600" },
          { label: "Doanh nghiệp", value: users.filter((u) => u.role === "company").length, color: "bg-amber-100 text-amber-600" },
          { label: "Giảng viên", value: users.filter((u) => u.role === "lecturer").length, color: "bg-emerald-100 text-emerald-600" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-xl border border-slate-200 p-4"
          >
            <div className="flex items-center gap-3">
              <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center shrink-0", stat.color)}>
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-xs text-slate-500">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Tìm kiếm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* User Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left p-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Người dùng</th>
                <th className="text-left p-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Vai trò</th>
                <th className="text-left p-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Trạng thái</th>
                <th className="text-left p-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Ngày tham gia</th>
                <th className="text-right p-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-sm text-slate-400">
                    Không tìm thấy người dùng nào
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.03 }}
                    className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-semibold shrink-0">
                          {user.name[0]}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 text-sm">{user.name}</p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                          {user.department && (
                            <p className="text-xs text-slate-400">{user.department}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="p-4">
                      <Badge variant={statusVariant(user.status)}>
                        {statusLabel(user.status)}
                      </Badge>
                    </td>
                    <td className="p-4 text-sm text-slate-500">{user.joinedDate}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(user)}
                          className="h-8 w-8 p-0 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                          title="Sửa"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(user)}
                          className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50"
                          title="Xóa"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={editModalOpen}
        onClose={() => { setEditModalOpen(false); setEditTarget(null); }}
        onSave={handleSaveEdit}
        user={editTarget}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Xóa tài khoản người dùng"
        description={`Bạn có chắc chắn muốn xóa tài khoản "${deleteTarget?.name}"? Toàn bộ dữ liệu liên quan sẽ bị xóa vĩnh viễn.`}
        confirmLabel="Xóa tài khoản"
        cancelLabel="Huỷ"
        variant="danger"
      />
    </div>
  );
}
