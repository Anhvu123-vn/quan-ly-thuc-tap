import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Save, User, Award, MessageSquare, ChevronDown, Loader2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ApplicationStatusBadge } from "@/components/shared/Badge";
import { api } from "@/services/api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ApprovedStudent {
  id: string;
  applicationId: string;
  positionId: string;
  student: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  position: {
    id: string;
    title: string;
  };
  status: string;
}

interface ExistingEvaluation {
  id: string;
  evaluationType: string;
  technicalScore: number;
  attitudeScore: number;
  communicationScore: number;
  teamworkScore: number;
  overallScore: number;
  comments?: string;
  createdAt: string;
}

interface Evaluation360Form {
  technicalScore: number;
  attitudeScore: number;
  communicationScore: number;
  teamworkScore: number;
  comments: string;
}

const initialForm: Evaluation360Form = {
  technicalScore: 0,
  attitudeScore: 0,
  communicationScore: 0,
  teamworkScore: 0,
  comments: "",
};

interface ScoreInputProps {
  label: string;
  description: string;
  value: number;
  onChange: (value: number) => void;
  color: string;
}

function ScoreInput360({ label, description, value, onChange, color }: ScoreInputProps) {
  return (
    <div className="p-4 bg-white rounded-xl border border-slate-200">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="font-medium text-slate-900">{label}</h4>
          <p className="text-xs text-slate-500">{description}</p>
        </div>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((score) => (
            <button
              key={score}
              onClick={() => onChange(score)}
              className="p-0.5 hover:scale-110 transition-transform"
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
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="h-2 flex-1 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(value / 5) * 100}%` }}
            className={cn("h-full rounded-full", color)}
          />
        </div>
        <span className="ml-3 text-sm font-medium text-slate-600 w-12">{value}/5</span>
      </div>
    </div>
  );
}

export function CompanyEvaluation360Page() {
  const [students, setStudents] = useState<ApprovedStudent[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<ApprovedStudent | null>(null);
  const [existingEvaluations, setExistingEvaluations] = useState<ExistingEvaluation[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);
  const [isLoadingEvaluations, setIsLoadingEvaluations] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [form, setForm] = useState<Evaluation360Form>(initialForm);

  const fetchStudents = useCallback(async () => {
    setIsLoadingStudents(true);
    try {
      const response = await api.getApprovedStudents();
      const data = response?.data || response || [];
      setStudents(data);
    } catch (err) {
      console.error("Failed to fetch students:", err);
      toast.error("Không thể tải danh sách sinh viên");
    } finally {
      setIsLoadingStudents(false);
    }
  }, []);

  const fetchExistingEvaluations = useCallback(async (studentId: string) => {
    setIsLoadingEvaluations(true);
    try {
      const response = await api.getStudentEvaluations(studentId);
      const data = response?.data || response || [];
      const companyEvals = (Array.isArray(data) ? data : []).filter(
        (e: any) => e.evaluationType === 'company'
      );
      setExistingEvaluations(companyEvals);
    } catch (err) {
      console.error("Failed to fetch evaluations:", err);
      setExistingEvaluations([]);
    } finally {
      setIsLoadingEvaluations(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  useEffect(() => {
    if (selectedStudent) {
      fetchExistingEvaluations(selectedStudent.student.id);
      setForm(initialForm);
      setSubmitted(false);
    }
  }, [selectedStudent, fetchExistingEvaluations]);

  const handleSelectStudent = (student: ApprovedStudent) => {
    setSelectedStudent(student);
    setShowDropdown(false);
    setSubmitted(false);
  };

  const scores = [
    {
      key: "technicalScore",
      label: "Kỹ năng kỹ thuật",
      description: "Đánh giá năng lực chuyên môn và kỹ năng xử lý công việc",
      color: "bg-indigo-500",
    },
    {
      key: "attitudeScore",
      label: "Thái độ làm việc",
      description: "Đánh giá tinh thần, thái độ và sự nhiệm tâm",
      color: "bg-blue-500",
    },
    {
      key: "communicationScore",
      label: "Kỹ năng giao tiếp",
      description: "Đánh giá cách giao tiếp với đồng nghiệp và khách hàng",
      color: "bg-violet-500",
    },
    {
      key: "teamworkScore",
      label: "Làm việc nhóm",
      description: "Đánh giá khả năng phối hợp và hỗ trợ trong nhóm",
      color: "bg-emerald-500",
    },
  ];

  const overallScore = 
    (form.technicalScore + form.attitudeScore + form.communicationScore + form.teamworkScore) / 4;

  const handleSubmit = async () => {
    if (!selectedStudent) return;
    
    setIsSubmitting(true);
    try {
      const totalScore = overallScore;
      
      await api.createEvaluation({
        type: 'company',
        studentId: selectedStudent.student.id,
        applicationId: selectedStudent.applicationId,
        technicalScore: form.technicalScore,
        attitudeScore: form.attitudeScore,
        communicationScore: form.communicationScore,
        teamworkScore: form.teamworkScore,
        overallScore: totalScore,
        comments: form.comments,
      });
      
      setSubmitted(true);
      toast.success("Đánh giá đã được gửi thành công!");
      
      // Refresh existing evaluations
      fetchExistingEvaluations(selectedStudent.student.id);
    } catch (err) {
      console.error("Failed to submit evaluation:", err);
      toast.error("Không thể gửi đánh giá. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewEvaluation = () => {
    setSubmitted(false);
    setForm(initialForm);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Đánh giá 360</h1>
        <p className="text-slate-500 mt-1">Đánh giá sinh viên thực tập từ góc nhìn doanh nghiệp</p>
      </div>

      {/* Student Selector */}
      <div className="relative">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Chọn sinh viên để đánh giá
        </label>
        
        {isLoadingStudents ? (
          <div className="flex items-center gap-2 p-4 bg-white rounded-xl border border-slate-200">
            <Loader2 className="h-5 w-5 text-indigo-500 animate-spin" />
            <span className="text-slate-500">Đang tải danh sách sinh viên...</span>
          </div>
        ) : students.length === 0 ? (
          <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <User className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">Chưa có sinh viên nào được duyệt</p>
            <p className="text-sm text-slate-400 mt-1">
              Sinh viên cần được duyệt từ khoa trước khi có thể đánh giá
            </p>
          </div>
        ) : (
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-full flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-colors"
            >
              {selectedStudent ? (
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-medium text-sm">
                    {selectedStudent.student.name.split(" ").slice(-1)[0]?.[0] || "?"}
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-slate-900">{selectedStudent.student.name}</p>
                    <p className="text-sm text-slate-500">{selectedStudent.position.title}</p>
                  </div>
                </div>
              ) : (
                <span className="text-slate-500">-- Chọn sinh viên --</span>
              )}
              <ChevronDown className={cn(
                "h-5 w-5 text-slate-400 transition-transform",
                showDropdown && "rotate-180"
              )} />
            </button>

            <AnimatePresence>
              {showDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute z-10 w-full mt-2 bg-white rounded-xl border border-slate-200 shadow-lg max-h-80 overflow-y-auto"
                >
                  {students.map((student) => (
                    <button
                      key={student.id}
                      type="button"
                      onClick={() => handleSelectStudent(student)}
                      className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0"
                    >
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-medium text-sm">
                        {student.student.name.split(" ").slice(-1)[0]?.[0] || "?"}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium text-slate-900">{student.student.name}</p>
                        <p className="text-sm text-slate-500">{student.position.title}</p>
                      </div>
                      <ApplicationStatusBadge status="department_approved" />
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Selected Student Info */}
      {selectedStudent && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200"
        >
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-lg">
            {selectedStudent.student.name.split(" ").slice(-1)[0]?.[0] || "?"}
          </div>
          <div className="flex-1">
            <p className="font-medium text-slate-900">{selectedStudent.student.name}</p>
            <p className="text-sm text-slate-500">{selectedStudent.position.title}</p>
          </div>
          <div className="text-right text-sm text-slate-400">
            <p>{selectedStudent.student.email}</p>
          </div>
        </motion.div>
      )}

      {/* Existing Evaluations */}
      {selectedStudent && !isLoadingEvaluations && existingEvaluations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-slate-50 rounded-xl border border-slate-200"
        >
          <p className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
            <Award className="h-4 w-4" />
            Đánh giá đã có
          </p>
          <div className="space-y-2">
            {existingEvaluations.map((eval_) => (
              <div key={eval_.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={cn(
                          "h-4 w-4",
                          star <= Math.round(Number(eval_.overallScore)) 
                            ? "fill-amber-400 text-amber-400" 
                            : "text-slate-300"
                        )}
                      />
                    ))}
                  </div>
                  <span className="font-medium text-slate-900">
                    {Number(eval_.overallScore).toFixed(1)}/5
                  </span>
                </div>
                <span className="text-sm text-slate-400">
                  {new Date(eval_.createdAt).toLocaleDateString("vi-VN")}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {isLoadingEvaluations && selectedStudent && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-5 w-5 text-indigo-500 animate-spin" />
        </div>
      )}

      {/* Evaluation Form */}
      {selectedStudent && !submitted && (
        <>
          {/* Score Inputs */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900">Tiêu chí đánh giá</h3>
            {scores.map((score, index) => (
              <motion.div
                key={score.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <ScoreInput360
                  label={score.label}
                  description={score.description}
                  value={form[score.key as keyof Evaluation360Form] as number}
                  onChange={(value) => setForm({ ...form, [score.key]: value })}
                  color={score.color}
                />
              </motion.div>
            ))}
          </div>

          {/* Overall Score */}
          <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
            <div className="flex items-center justify-between mb-4">
              <span className="font-semibold text-amber-800">Điểm tổng hợp</span>
              <span className="text-3xl font-bold text-amber-600">{overallScore.toFixed(1)}/5</span>
            </div>
            <div className="h-3 bg-white/50 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(overallScore / 5) * 100}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
              />
            </div>
          </div>

          {/* Comments */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Nhận xét tổng quát
            </label>
            <Textarea
              value={form.comments}
              onChange={(e) => setForm({ ...form, comments: e.target.value })}
              placeholder="Nhập nhận xét về quá trình thực tập của sinh viên tại công ty..."
              rows={4}
            />
          </div>

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || form.comments.length < 10 || overallScore === 0}
            className="w-full h-12 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Đang gửi...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Gửi đánh giá
              </>
            )}
          </Button>
        </>
      )}

      {/* Success State */}
      {submitted && selectedStudent && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl border border-slate-200 p-8 text-center"
        >
          <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <Award className="h-8 w-8 text-emerald-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Đánh giá đã được gửi!</h3>
          <p className="text-slate-500 mb-2">Điểm tổng hợp: {overallScore.toFixed(1)}/5</p>
          <div className="flex gap-3 justify-center mt-6">
            <Button
              variant="outline"
              onClick={handleNewEvaluation}
            >
              Đánh giá sinh viên khác
            </Button>
            <Button
              onClick={() => {
                setSubmitted(false);
                setForm(initialForm);
              }}
              className="bg-gradient-to-r from-indigo-500 to-violet-600"
            >
              Đánh giá lại
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
