import { useState } from "react";
import { motion } from "framer-motion";
import { Star, Save, User, Award, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { mockEvaluations } from "@/data/mockData";
import { cn } from "@/lib/utils";

interface Evaluation360Form {
  studentId: string;
  studentName: string;
  technicalScore: number;
  communicationScore: number;
  teamworkScore: number;
  responsibilityScore: number;
  learningScore: number;
  comments: string;
}

const initialForm: Evaluation360Form = {
  studentId: "stu-1",
  studentName: "Trần Minh Đức",
  technicalScore: 0,
  communicationScore: 0,
  teamworkScore: 0,
  responsibilityScore: 0,
  learningScore: 0,
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
  const [form, setForm] = useState<Evaluation360Form>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const scores = [
    {
      key: "technicalScore",
      label: "Kỹ năng kỹ thuật",
      description: "Đánh giá năng lực chuyên môn và kỹ năng xử lý công việc",
      color: "bg-indigo-500",
    },
    {
      key: "communicationScore",
      label: "Kỹ năng giao tiếp",
      description: "Đánh giá cách giao tiếp với đồng nghiệp và khách hàng",
      color: "bg-blue-500",
    },
    {
      key: "teamworkScore",
      label: "Làm việc nhóm",
      description: "Đánh giá khả năng phối hợp và hỗ trợ trong nhóm",
      color: "bg-violet-500",
    },
    {
      key: "responsibilityScore",
      label: "Trách nhiệm",
      description: "Đánh giá mức độ hoàn thành công việc và tính chủ động",
      color: "bg-emerald-500",
    },
    {
      key: "learningScore",
      label: "Khả năng học hỏi",
      description: "Đánh giá tốc độ tiếp thu và thái độ với công việc mới",
      color: "bg-amber-500",
    },
  ];

  const overallScore =
    scores.reduce((acc, s) => acc + (form[s.key as keyof Evaluation360Form] as number), 0) /
    scores.length;

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
        <h1 className="text-2xl font-bold text-slate-900">Đánh giá 360</h1>
        <p className="text-slate-500 mt-1">Đánh giá sinh viên thực tập từ góc nhìn doanh nghiệp</p>
      </div>

      {/* Student Info */}
      <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200">
        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-lg">
          TMD
        </div>
        <div className="flex-1">
          <p className="font-medium text-slate-900">{form.studentName}</p>
          <p className="text-sm text-slate-500">Thực tập sinh Frontend Developer</p>
        </div>
      </div>

      {/* Previous Evaluation */}
      {mockEvaluations.filter((e) => e.type === "company").length > 0 && (
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
          <p className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
            <Award className="h-4 w-4" />
            Đánh giá lần trước
          </p>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-slate-900">
                {mockEvaluations[0].overallScore}/5
              </span>
            </div>
            <div className="text-sm text-slate-500">{mockEvaluations[0].date}</div>
          </div>
        </div>
      )}

      {!submitted ? (
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
            disabled={isSubmitting || form.comments.length < 10}
            className="w-full h-12 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700"
          >
            {isSubmitting ? (
              "Đang gửi..."
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Gửi đánh giá
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
          <h3 className="text-xl font-bold text-slate-900 mb-2">Đánh giá đã được gửi!</h3>
          <p className="text-slate-500 mb-4">Điểm tổng hợp: {overallScore.toFixed(1)}/5</p>
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
