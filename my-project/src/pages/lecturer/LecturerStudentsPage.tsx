import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Search, Mail, Phone, BookOpen, Loader2, AlertCircle, GraduationCap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface AssignedStudent {
  id: string;
  lecturerId: string;
  studentId: string;
  batchId: string | null;
  status: string;
  notes: string | null;
  assignedAt: string;
  student: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
  batch: {
    id: string;
    name: string;
    semester: string;
    academicYear: string;
  } | null;
}

function StudentCard({ student, index }: { student: AssignedStudent; index: number }) {
  const initials = student.student.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md hover:border-indigo-200 transition-all duration-200"
    >
      <div className="flex items-start gap-4">
        <Avatar className="h-12 w-12 shrink-0">
          <AvatarImage src={student.student.avatar} />
          <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-violet-600 text-white font-bold text-sm">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-slate-900">{student.student.name}</h3>
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                student.status === "active"
                  ? "bg-green-50 text-green-700 border border-green-100"
                  : "bg-slate-50 text-slate-500 border border-slate-100"
              )}
            >
              {student.status === "active" ? "Đang thực tập" : student.status}
            </span>
          </div>
          <div className="mt-1.5 space-y-0.5">
            <div className="flex items-center gap-1.5 text-sm text-slate-600">
              <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{student.student.email}</span>
            </div>
            {student.student.phone && (
              <div className="flex items-center gap-1.5 text-sm text-slate-600">
                <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span>{student.student.phone}</span>
              </div>
            )}
            {student.batch && (
              <div className="flex items-center gap-1.5 text-sm text-slate-500">
                <BookOpen className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span>
                  {student.batch.name} · {student.batch.semester} {student.batch.academicYear}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function LecturerStudentsPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState<AssignedStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!user?.id) return;
    const fetchStudents = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.getLecturerAssignments({ lecturerId: user.id });
        setStudents(res.data || []);
      } catch (err: any) {
        setError(err.message || "Không thể tải danh sách sinh viên");
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [user?.id]);

  const filtered = students.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.student.name.toLowerCase().includes(q) ||
      s.student.email.toLowerCase().includes(q)
    );
  });

  const activeCount = students.filter((s) => s.status === "active").length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Sinh viên của tôi</h1>
        <p className="text-slate-500 mt-1">
          Danh sách sinh viên được phân công hướng dẫn cho bạn
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-indigo-50 to-violet-50 border-indigo-100">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center">
              <Users className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-indigo-700">{students.length}</p>
              <p className="text-xs text-indigo-600 font-medium">Tổng sinh viên</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-100">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-700">{activeCount}</p>
              <p className="text-xs text-green-600 font-medium">Đang thực tập</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-700">{students.length - activeCount}</p>
              <p className="text-xs text-slate-600 font-medium">Đã hoàn thành</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Tìm theo tên hoặc email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && students.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <Users className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="font-semibold text-slate-700">Chưa có sinh viên nào</h3>
          <p className="text-sm text-slate-500 mt-1">
            Bạn chưa được phân công hướng dẫn sinh viên nào.
          </p>
        </div>
      )}

      {/* Student grid */}
      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((student, index) => (
            <StudentCard key={student.id} student={student} index={index} />
          ))}
        </div>
      )}

      {/* No search results */}
      {!loading && !error && search && filtered.length === 0 && students.length > 0 && (
        <div className="text-center py-8 text-slate-500 text-sm">
          Không tìm thấy sinh viên nào phù hợp với "{search}"
        </div>
      )}
    </div>
  );
}
