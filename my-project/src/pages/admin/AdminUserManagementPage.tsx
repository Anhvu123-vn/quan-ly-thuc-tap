import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
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
  Loader2,
  X,
  Upload,
  UserCheck,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RoleBadge } from "@/components/shared/Badge";
import { Tabs } from "@/components/shared/Tabs";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { api } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  phone?: string;
  createdAt?: string;
}

interface LecturerAssignment {
  id: string;
  lecturerId: string;
  studentId: string;
  batchId: string | null;
  status: string;
  lecturer: { id: string; name: string; email: string };
  student: { id: string; name: string; email: string; phone?: string };
  batch: { id: string; name: string; semester: string; academicYear: string } | null;
}

const ROLE_OPTIONS = [
  { value: "student", label: "Sinh viên", icon: GraduationCap },
  { value: "lecturer", label: "Giảng viên", icon: Users },
  { value: "company", label: "Doanh nghiệp", icon: Building2 },
  { value: "admin", label: "Quản trị", icon: Shield },
];

// Add User Modal
interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function AddUserModal({ isOpen, onClose, onSuccess }: AddUserModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "student",
      department: "",
      phone: "",
    },
  });

  useEffect(() => {
    if (!isOpen) {
      reset();
      setError("");
    }
  }, [isOpen, reset]);

  const onValid = async (data: any) => {
    setIsSubmitting(true);
    setError("");
    try {
      await api.register({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
        department: data.department || undefined,
        phone: data.phone || undefined,
      });
      reset();
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
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden pointer-events-auto">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-100 text-green-600">
                <UserPlus className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Thêm người dùng mới</h3>
                <p className="text-xs text-slate-500">Tạo tài khoản mới</p>
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
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <Input {...register("name")} placeholder="Nhập họ và tên" />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Email <span className="text-red-500">*</span>
              </label>
              <Input type="email" {...register("email")} placeholder="email@example.com" />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Mật khẩu <span className="text-red-500">*</span>
              </label>
              <Input type="password" {...register("password")} placeholder="Tối thiểu 6 ký tự" />
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Vai trò <span className="text-red-500">*</span>
              </label>
              <select {...register("role")} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
                {ROLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Điện thoại</label>
                <Input {...register("phone")} placeholder="0901234567" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Khoa/Phòng</label>
                <Input {...register("department")} placeholder="Khoa CNTT" />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Huỷ
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1 bg-green-500 hover:bg-green-600">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Tạo tài khoản"}
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </>
  );
}

// Edit User Modal
interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user: User | null;
}

function EditUserModal({ isOpen, onClose, onSuccess, user }: EditUserModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      role: user?.role || "student",
      department: user?.department || "",
      phone: user?.phone || "",
    },
  });

  useEffect(() => {
    if (user && isOpen) {
      reset({
        name: user.name || "",
        email: user.email || "",
        role: user.role || "student",
        department: user.department || "",
        phone: user.phone || "",
      });
      setError(null);
    }
  }, [user, isOpen, reset]);

  const onValid = async (data: any) => {
    if (!user) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await api.updateUser(user.id, {
        name: data.name,
        email: data.email,
        role: data.role,
        department: data.department,
        phone: data.phone,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Update error:", err);
      setError(err.message || "Có lỗi xảy ra khi cập nhật");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !user) return null;

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
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden pointer-events-auto">
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
            <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onValid)} className="px-6 py-5 space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Họ và tên</label>
              <Input {...register("name")} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <Input type="email" {...register("email")} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Vai trò</label>
              <select {...register("role")} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm">
                {ROLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Điện thoại</label>
                <Input {...register("phone")} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Khoa/Phòng</label>
                <Input {...register("department")} />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">Huỷ</Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1 bg-indigo-500 hover:bg-indigo-600">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Lưu thay đổi"}
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </>
  );
}

// Main Page
export function AdminUserManagementPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Lecturer assignments
  const [assignments, setAssignments] = useState<LecturerAssignment[]>([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [assignmentsExpanded, setAssignmentsExpanded] = useState<Record<string, boolean>>({});

  // Calculate stats from users array
  const stats = {
    total: users.length,
    students: users.filter((u) => u.role === "student").length,
    lecturers: users.filter((u) => u.role === "lecturer").length,
    companies: users.filter((u) => u.role === "company").length,
    admins: users.filter((u) => u.role === "admin").length,
  };

  const fetchUsers = async () => {
    if (!isAuthenticated) {
      setUsers([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await api.getUsers({ limit: 100 });
      const usersData = response.data || response || [];
      setUsers(usersData);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async () => {
    try {
      setLoadingAssignments(true);
      const response = await api.getLecturerAssignments();
      // API service unwraps { success, data, meta } so response is the data array directly
      const assignmentsData = Array.isArray(response) ? response : (response?.data || []);
      setAssignments(assignmentsData);
    } catch (err) {
      console.error("Failed to fetch assignments:", err);
    } finally {
      setLoadingAssignments(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchAssignments();
  }, [isAuthenticated]);

  const tabs = [
    { id: "all", label: "Tất cả", badge: stats.total },
    { id: "student", label: "Sinh viên", badge: stats.students },
    { id: "lecturer", label: "Giảng viên", badge: stats.lecturers },
    { id: "company", label: "Doanh nghiệp", badge: stats.companies },
    { id: "admin", label: "Admin", badge: stats.admins },
    { id: "assignment", label: "Phân công GV", badge: assignments.length },
  ];

  const filteredUsers = users.filter((user) => {
    const matchesTab = activeTab === "all" || user.role === activeTab;
    const matchesSearch =
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // Group assignments by lecturer for the assignments tab
  const assignmentsByLecturer = assignments.reduce<Record<string, LecturerAssignment[]>>((acc, a) => {
    if (!acc[a.lecturerId]) acc[a.lecturerId] = [];
    acc[a.lecturerId].push(a);
    return acc;
  }, {});

  // Map studentId → lecturer name for quick lookup in user table
  const studentLecturerMap = assignments.reduce<Record<string, string>>((acc, a) => {
    acc[a.studentId] = a.lecturer.name;
    return acc;
  }, {});

  const toggleLecturer = (lecturerId: string) => {
    setAssignmentsExpanded((prev) => ({ ...prev, [lecturerId]: !prev[lecturerId] }));
  };

  const isAssignmentTab = activeTab === "assignment";

  const handleEdit = (user: User) => {
    setEditTarget(user);
    setEditModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.deleteUser(deleteTarget.id);
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
    } catch (err) {
      console.error("Failed to delete user:", err);
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("vi-VN");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản lý người dùng</h1>
          <p className="text-slate-500 mt-1">Quản lý tài khoản và phân quyền</p>
        </div>
        <Button onClick={() => setAddModalOpen(true)} className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
          <UserPlus className="h-4 w-4 mr-2" />
          Thêm người dùng
        </Button>
        <Button onClick={() => navigate("/admin/users/import")} variant="outline" className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 gap-2">
          <Upload className="h-4 w-4" />
          Nhập hàng loạt
        </Button>
      </div>

      {/* Stats - calculated from users data */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Tổng người dùng", value: stats.total, color: "bg-indigo-100 text-indigo-600" },
          { label: "Sinh viên", value: stats.students, color: "bg-blue-100 text-blue-600" },
          { label: "Doanh nghiệp", value: stats.companies, color: "bg-amber-100 text-amber-600" },
          { label: "Giảng viên", value: stats.lecturers, color: "bg-emerald-100 text-emerald-600" },
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
                <p className="text-xl font-bold text-slate-900">{loading || authLoading ? "-" : stat.value}</p>
                <p className="text-xs text-slate-500">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        {!isAssignmentTab && (
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="Tìm kiếm..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
        )}
      </div>

      {/* Lecturer Assignments Tab */}
      {isAssignmentTab ? (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            {loadingAssignments ? (
              <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
              </div>
            ) : Object.keys(assignmentsByLecturer).length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <UserCheck className="h-12 w-12 text-slate-300 mb-3" />
                <p className="text-slate-500 font-medium">Chưa có phân công giảng viên</p>
                <p className="text-slate-400 text-sm mt-1">Sinh viên được phân công sẽ hiển thị tại đây.</p>
              </div>
            ) : (
              Object.entries(assignmentsByLecturer).map(([lecturerId, lecturerAssignments]) => {
                const lecturer = lecturerAssignments[0].lecturer;
                const isExpanded = !!assignmentsExpanded[lecturerId];
                return (
                  <div key={lecturerId} className="border-b border-slate-100 last:border-0">
                    {/* Lecturer row */}
                    <div
                      className="flex items-center gap-4 p-4 cursor-pointer hover:bg-slate-50 transition-colors"
                      onClick={() => toggleLecturer(lecturerId)}
                    >
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-semibold text-sm shrink-0">
                        {lecturer.name?.[0] || "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 text-sm">{lecturer.name}</p>
                        <p className="text-xs text-slate-500">{lecturer.email}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-100">
                          {lecturerAssignments.length} sinh viên
                        </span>
                        {isExpanded
                          ? <ChevronDown className="h-4 w-4 text-slate-400" />
                          : <ChevronRight className="h-4 w-4 text-slate-400" />
                        }
                      </div>
                    </div>

                    {/* Student rows */}
                    {isExpanded && (
                      <div className="border-t border-slate-100 bg-slate-50/50">
                        {lecturerAssignments.map((a) => (
                          <div key={a.id} className="flex items-center gap-4 px-4 py-3 pl-8 border-b border-slate-100 last:border-0">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-400 to-violet-600 flex items-center justify-center text-white font-semibold text-xs shrink-0">
                              {a.student.name?.[0] || "?"}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-800">{a.student.name}</p>
                              <p className="text-xs text-slate-500">{a.student.email}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-xs text-slate-500">{a.batch?.name}</p>
                              <p className="text-xs text-slate-400">{a.batch?.semester} {a.batch?.academicYear}</p>
                            </div>
                            <span className={cn(
                              "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium shrink-0",
                              a.status === "active"
                                ? "bg-green-50 text-green-700 border border-green-100"
                                : "bg-slate-100 text-slate-500 border border-slate-200"
                            )}>
                              {a.status === "active" ? "Đang hoạt động" : a.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
      /* User Table */
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          {loading || authLoading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            </div>
          ) : !isAuthenticated ? (
            <div className="flex items-center justify-center p-12">
              <p className="text-slate-500">Vui lòng đăng nhập để xem danh sách người dùng</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left p-4 text-xs font-medium text-slate-500 uppercase">Người dùng</th>
                  <th className="text-left p-4 text-xs font-medium text-slate-500 uppercase">Vai trò</th>
                  <th className="text-left p-4 text-xs font-medium text-slate-500 uppercase">Giảng viên phụ trách</th>
                  <th className="text-left p-4 text-xs font-medium text-slate-500 uppercase">Ngày tham gia</th>
                  <th className="text-right p-4 text-xs font-medium text-slate-500 uppercase">Hành động</th>
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
                      className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-semibold">
                            {user.name?.[0] || "?"}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 text-sm">{user.name}</p>
                            <p className="text-xs text-slate-500">{user.email}</p>
                            {user.department && <p className="text-xs text-slate-400">{user.department}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="p-4"><RoleBadge role={user.role} /></td>
                      <td className="p-4">
                        {user.role === "student" ? (
                          studentLecturerMap[user.id] ? (
                            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
                              <span className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px] font-bold shrink-0">
                                {studentLecturerMap[user.id]?.[0] || "?"}
                              </span>
                              {studentLecturerMap[user.id]}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400 italic">Chưa phân công</span>
                          )
                        ) : (
                          <span className="text-xs text-slate-300">—</span>
                        )}
                      </td>
                      <td className="p-4 text-sm text-slate-500">{formatDate(user.createdAt)}</td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button size="sm" variant="ghost" onClick={() => handleEdit(user)} className="h-8 w-8 p-0 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50">
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setDeleteTarget(user)} className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
      )}

      {/* Modals */}
      <AddUserModal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} onSuccess={fetchUsers} />
      <EditUserModal isOpen={editModalOpen} onClose={() => { setEditModalOpen(false); setEditTarget(null); }} onSuccess={fetchUsers} user={editTarget} />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Xóa tài khoản người dùng"
        description={`Bạn có chắc chắn muốn xóa tài khoản "${deleteTarget?.name}"? Toàn bộ dữ liệu liên quan sẽ bị xóa vĩnh viễn.`}
        confirmLabel="Xóa tài khoản"
        cancelLabel="Huỷ"
        variant="danger"
      />
    </div>
  );
}
