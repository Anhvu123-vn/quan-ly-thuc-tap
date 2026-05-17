import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Star, Save, User, Award, Loader2, RefreshCw, AlertCircle, FileText, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/shared/Badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { api } from "@/services/api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Student {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  companyName?: string;
  positionTitle?: string;
  applicationId?: string;
}

interface EvaluationForm {
  studentId: string;
  applicationId?: string;
  studentName: string;
  technicalScore: number;
  attitudeScore: number;
  communicationScore: number;
  teamworkScore: number;
  overallScore: number;
  comments: string;
}

interface PreviousEvaluation {
  id: string;
  evaluatorName: string;
  evaluatorRole: string;
  technicalScore: number;
  attitudeScore: number;
  communicationScore: number;
  teamworkScore: number;
  overallScore: number;
  comments: string;
  createdAt: string;
}

interface ScoreInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  icon: React.ReactNode;
  color: string;
}

function ScoreInput({ label, value, onChange, icon, color }: ScoreInputProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200">
      <div className="flex items-center gap-3">
        <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", color)}>
          {icon}
        </div>
        <span className="font-medium text-slate-900">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((score) => (
          <button
            key={score}
            onClick={() => onChange(score)}
            className="p-1 hover:scale-110 transition-transform"
            type="button"
          >
            <Star
              className={cn(
                "h-6 w-6 transition-colors",
                score <= value ? "fill-amber-400 text-amber-400" : "text-slate-300"
              )}
            />
          </button>
        ))}
        <span className="ml-2 text-sm font-medium text-slate-600 w-8">{value}/5</span>
      </div>
    </div>
  );
}

export function LecturerEvaluationPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [previousEvaluations, setPreviousEvaluations] = useState<PreviousEvaluation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);

  const [form, setForm] = useState<EvaluationForm>({
    studentId: "",
    studentName: "",
    technicalScore: 0,
    attitudeScore: 0,
    communicationScore: 0,
    teamworkScore: 0,
    overallScore: 0,
    comments: "",
  });

  const scores = [
    { key: "technicalScore" as const, label: "Kỹ năng chuyên môn", icon: <Star className="h-5 w-5 text-white" />, color: "bg-indigo-500" },
    { key: "attitudeScore" as const, label: "Thái độ làm việc", icon: <Star className="h-5 w-5 text-white" />, color: "bg-emerald-500" },
    { key: "communicationScore" as const, label: "Kỹ năng giao tiếp", icon: <Star className="h-5 w-5 text-white" />, color: "bg-blue-500" },
    { key: "teamworkScore" as const, label: "Làm việc nhóm", icon: <Star className="h-5 w-5 text-white" />, color: "bg-violet-500" },
  ];

  const overallScore = scores.reduce((acc, s) => acc + form[s.key], 0) / scores.length;

  const fetchStudents = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.getStudentsForEvaluation();
      const data = response?.data || response || [];
      
      setStudents(
        data.map((item: any) => ({
          id: item.id,
          name: item.name || "Unknown",
          email: item.email || "",
          avatar: item.avatar,
          companyName: item.companyName,
          positionTitle: item.positionTitle,
          applicationId: item.applicationId,
        }))
      );
    } catch (err) {
      console.error("Failed to fetch students:", err);
      toast.error("Không thể tải danh sách sinh viên");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchStudentEvaluations = useCallback(async (studentId: string) => {
    try {
      const response = await api.getStudentEvaluations(studentId);
      const data = response?.data || response || [];
      
      if (!Array.isArray(data)) {
        setPreviousEvaluations([]);
        return;
      }

      setPreviousEvaluations(
        data.map((item: any) => ({
          id: item.id || "",
          evaluatorName: item.evaluator?.name || item.evaluatorName || "Giảng viên",
          evaluatorRole: item.evaluator?.role || item.evaluatorRole || "lecturer",
          technicalScore: Number(item.technicalScore) || 0,
          attitudeScore: Number(item.attitudeScore) || 0,
          communicationScore: Number(item.communicationScore) || 0,
          teamworkScore: Number(item.teamworkScore) || 0,
          overallScore: Number(item.overallScore) || 0,
          comments: item.comments || "",
          createdAt: item.createdAt || "",
        }))
      );
    } catch (err) {
      console.error("Failed to fetch evaluations:", err);
      setPreviousEvaluations([]);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  useEffect(() => {
    if (selectedStudent) {
      fetchStudentEvaluations(selectedStudent.id);
    }
  }, [selectedStudent, fetchStudentEvaluations]);

  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student);
    setPreviousEvaluations([]);
    setForm({
      studentId: student.id,
      applicationId: student.applicationId,
      studentName: student.name,
      technicalScore: 0,
      attitudeScore: 0,
      communicationScore: 0,
      teamworkScore: 0,
      overallScore: 0,
      comments: "",
    });
    setSubmitted(false);
    setShowStudentDropdown(false);
  };

  const handleSubmit = async () => {
    if (!selectedStudent) {
      toast.error("Vui lòng chọn sinh viên");
      return;
    }

    if (form.comments.length < 10) {
      toast.error("Vui lòng nhập nhận xét (ít nhất 10 ký tự)");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.createEvaluation({
        type: "final",
        studentId: selectedStudent.id,
        applicationId: selectedStudent.applicationId,
        technicalScore: form.technicalScore,
        attitudeScore: form.attitudeScore,
        communicationScore: form.communicationScore,
        teamworkScore: form.teamworkScore,
        overallScore: overallScore,
        comments: form.comments,
      });

      toast.success("Đánh giá đã được lưu thành công!");
      setSubmitted(true);
      
      // Refresh evaluations
      fetchStudentEvaluations(selectedStudent.id);
    } catch (err) {
      console.error("Failed to submit evaluation:", err);
      toast.error("Không thể lưu đánh giá. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      return new Date(dateStr).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
            <p className="text-slate-500">Đang tải danh sách sinh viên...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Chấm điểm thực tập</h1>
          <p className="text-slate-500 mt-1">Đánh giá sinh viên theo các tiêu chí</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchStudents}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Làm mới
        </Button>
      </div>

      {/* Student Selector */}
      <div className="relative">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Chọn sinh viên để đánh giá
        </label>
        <button
          type="button"
          onClick={() => setShowStudentDropdown(!showStudentDropdown)}
          className="w-full flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 hover:border-indigo-300 transition-colors"
        >
          {selectedStudent ? (
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                {selectedStudent.avatar && (
                  <AvatarImage src={selectedStudent.avatar} alt={selectedStudent.name} />
                )}
                <AvatarFallback className="text-xs bg-indigo-100 text-indigo-700 font-semibold">
                  {selectedStudent.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="text-left">
                <p className="font-medium text-slate-900">{selectedStudent.name}</p>
                <p className="text-sm text-slate-500">
                  {selectedStudent.companyName} · {selectedStudent.positionTitle}
                </p>
              </div>
            </div>
          ) : (
            <span className="text-slate-500">-- Chọn sinh viên --</span>
          )}
          <ChevronDown className={cn("h-5 w-5 text-slate-400 transition-transform", showStudentDropdown && "rotate-180")} />
        </button>

        {showStudentDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute z-10 w-full mt-2 bg-white rounded-xl border border-slate-200 shadow-lg max-h-64 overflow-y-auto"
          >
            {students.length === 0 ? (
              <div className="p-4 text-center text-slate-500">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                <p>Chưa có sinh viên nào được duyệt</p>
              </div>
            ) : (
              students.map((student) => (
                <button
                  key={student.id}
                  type="button"
                  onClick={() => handleStudentSelect(student)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0"
                >
                  <Avatar className="h-9 w-9">
                    {student.avatar && (
                      <AvatarImage src={student.avatar} alt={student.name} />
                    )}
                    <AvatarFallback className="text-xs bg-indigo-100 text-indigo-700 font-semibold">
                      {student.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left flex-1">
                    <p className="font-medium text-slate-900">{student.name}</p>
                    <p className="text-sm text-slate-500">
                      {student.companyName} · {student.positionTitle}
                    </p>
                  </div>
                  {selectedStudent?.id === student.id && (
                    <Badge variant="success" size="sm">Đã chọn</Badge>
                  )}
                </button>
              ))
            )}
          </motion.div>
        )}
      </div>

      {selectedStudent && !submitted && (
        <>
          {/* Previous Evaluations */}
          {previousEvaluations.length > 0 && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-slate-700">Đánh giá trước đó</p>
                <Badge variant="info">{previousEvaluations.length} lần</Badge>
              </div>
              <div className="space-y-3">
                {previousEvaluations.slice(0, 2).map((eval_) => (
                  <div key={eval_.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-100">
                    <div className="flex items-center gap-3">
                      <Award className="h-5 w-5 text-amber-500" />
                      <div>
                        <p className="font-medium text-slate-900">{eval_.overallScore.toFixed(1)}/5</p>
                        <p className="text-xs text-slate-500">{formatDate(eval_.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-slate-500">
                        {eval_.evaluatorName}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Score Inputs */}
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-900">Tiêu chí đánh giá</h3>
            {scores.map((score, index) => (
              <motion.div
                key={score.key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <ScoreInput
                  label={score.label}
                  value={form[score.key]}
                  onChange={(value) => setForm({ ...form, [score.key]: value })}
                  icon={score.icon}
                  color={score.color}
                />
              </motion.div>
            ))}
          </div>

          {/* Overall Score */}
          <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-amber-800">Điểm trung bình</span>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-amber-600">
                  {overallScore > 0 ? overallScore.toFixed(1) : "0.0"}
                </span>
                <span className="text-amber-600">/5</span>
              </div>
            </div>
          </div>

          {/* Comments */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Nhận xét tổng quát
            </label>
            <Textarea
              value={form.comments}
              onChange={(e) => setForm({ ...form, comments: e.target.value })}
              placeholder="Nhập nhận xét về quá trình thực tập của sinh viên..."
              rows={4}
            />
          </div>

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full h-12 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Lưu đánh giá
              </>
            )}
          </Button>
        </>
      )}

      {submitted && selectedStudent && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl border border-slate-200 p-8 text-center"
        >
          <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <Award className="h-8 w-8 text-emerald-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Đánh giá đã được lưu!</h3>
          <p className="text-slate-500 mb-4">
            Điểm trung bình: {overallScore.toFixed(1)}/5 cho {selectedStudent.name}
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              onClick={() => {
                setSubmitted(false);
                setForm({
                  ...form,
                  technicalScore: 0,
                  attitudeScore: 0,
                  communicationScore: 0,
                  teamworkScore: 0,
                  overallScore: 0,
                  comments: "",
                });
              }}
            >
              Đánh giá lại
            </Button>
            <Button
              onClick={() => {
                setSelectedStudent(null);
                setSubmitted(false);
              }}
            >
              Chọn sinh viên khác
            </Button>
          </div>
        </motion.div>
      )}

      {!selectedStudent && students.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">Chưa có sinh viên nào được duyệt thực tập</p>
          <p className="text-sm text-slate-400 mt-2">Danh sách sinh viên sẽ hiển thị sau khi đơn thực tập được phê duyệt</p>
        </div>
      )}
    </div>
  );
}
