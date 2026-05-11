import { useState } from "react";
import { motion } from "framer-motion";
import { Star, Save, User, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/shared/Badge";
import { mockEvaluations } from "@/data/mockData";
import { cn } from "@/lib/utils";

interface EvaluationForm {
  studentId: string;
  studentName: string;
  technicalScore: number;
  attitudeScore: number;
  communicationScore: number;
  teamworkScore: number;
  responsibilityScore: number;
  learningScore: number;
  comments: string;
}

const initialForm: EvaluationForm = {
  studentId: "stu-1",
  studentName: "Trần Minh Đức",
  technicalScore: 0,
  attitudeScore: 0,
  communicationScore: 0,
  teamworkScore: 0,
  responsibilityScore: 0,
  learningScore: 0,
  comments: "",
};

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
  const [form, setForm] = useState<EvaluationForm>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const scores = [
    { key: "technicalScore", label: "Kỹ năng chuyên môn", icon: <Star className="h-5 w-5 text-white" />, color: "bg-indigo-500" },
    { key: "attitudeScore", label: "Thái độ làm việc", icon: <Star className="h-5 w-5 text-white" />, color: "bg-emerald-500" },
    { key: "communicationScore", label: "Kỹ năng giao tiếp", icon: <Star className="h-5 w-5 text-white" />, color: "bg-blue-500" },
    { key: "teamworkScore", label: "Làm việc nhóm", icon: <Star className="h-5 w-5 text-white" />, color: "bg-violet-500" },
    { key: "responsibilityScore", label: "Trách nhiệm", icon: <Star className="h-5 w-5 text-white" />, color: "bg-amber-500" },
    { key: "learningScore", label: "Khả năng học hỏi", icon: <Star className="h-5 w-5 text-white" />, color: "bg-teal-500" },
  ];

  const overallScore = scores.reduce((acc, s) => acc + (form[s.key as keyof EvaluationForm] as number), 0) / scores.length;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1000));
    setIsSubmitting(false);
    setSubmitted(true);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Chấm điểm thực tập</h1>
        <p className="text-slate-500 mt-1">Đánh giá sinh viên theo các tiêu chí</p>
      </div>

      {/* Student Info */}
      <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200">
        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-lg">
          TMD
        </div>
        <div className="flex-1">
          <p className="font-medium text-slate-900">{form.studentName}</p>
          <p className="text-sm text-slate-500">Khoa học Máy tính - K2022</p>
        </div>
        <Badge variant="info">Đang thực tập</Badge>
      </div>

      {/* Previous Evaluation */}
      {mockEvaluations.length > 0 && (
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
          <p className="text-sm font-medium text-slate-700 mb-2">Đánh giá lần trước</p>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" />
              <span className="font-bold text-lg text-slate-900">
                {mockEvaluations[0].overallScore}/5
              </span>
            </div>
            <div className="text-sm text-slate-500">
              {mockEvaluations[0].date} - {mockEvaluations[0].evaluatorName}
            </div>
          </div>
        </div>
      )}

      {!submitted ? (
        <>
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
                  value={form[score.key as keyof EvaluationForm] as number}
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
                <span className="text-3xl font-bold text-amber-600">{overallScore.toFixed(1)}</span>
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
            disabled={isSubmitting || form.comments.length < 10}
            className="w-full h-12 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700"
          >
            {isSubmitting ? (
              "Đang lưu..."
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Lưu đánh giá
              </>
            )}
          </Button>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl border border-slate-200 p-8 text-center"
        >
          <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <Award className="h-8 w-8 text-emerald-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Đánh giá đã được lưu!</h3>
          <p className="text-slate-500 mb-4">Điểm trung bình: {overallScore.toFixed(1)}/5</p>
          <Button
            variant="outline"
            onClick={() => {
              setSubmitted(false);
              setForm(initialForm);
            }}
          >
            Đánh giá sinh viên khác
          </Button>
        </motion.div>
      )}
    </div>
  );
}
