import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { BookOpen, Plus, Check, MessageSquare, Clock, ChevronDown, ChevronUp, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/shared/Badge";
import { api } from "@/services/api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface LogEntry {
  id: string;
  studentId: string;
  weekNumber: number;
  entryDate: string;
  completedWork: string;
  challenges?: string;
  lessonsLearned?: string;
  goalsForNextWeek?: string;
  lecturerComment?: string;
  lecturerRating?: number;
  status: 'pending' | 'reviewed' | 'approved';
  createdAt: string;
}

export function StudentJournalPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  const [newEntry, setNewEntry] = useState({
    completedWork: "",
    challenges: "",
    lessonsLearned: "",
    goalsForNextWeek: "",
  });

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.getMyLogs();
      const data = response?.data || response || [];
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch logs:", err);
      setError("Không thể tải nhật ký. Vui lòng thử lại.");
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleSubmit = async () => {
    if (!newEntry.completedWork || !newEntry.challenges || !newEntry.lessonsLearned) return;

    setIsSubmitting(true);
    try {
      const weekNumber = logs.length > 0 
        ? Math.max(...logs.map(l => l.weekNumber)) + 1 
        : 1;
      
      await api.createLog({
        weekNumber,
        entryDate: new Date().toISOString(),
        completedWork: newEntry.completedWork,
        challenges: newEntry.challenges,
        lessonsLearned: newEntry.lessonsLearned,
        goalsForNextWeek: newEntry.goalsForNextWeek,
      });

      toast.success("Đã gửi nhật ký thành công!");
      
      // Refresh logs
      fetchLogs();
      
      setNewEntry({ completedWork: "", challenges: "", lessonsLearned: "", goalsForNextWeek: "" });
      setIsCreating(false);
    } catch (err) {
      console.error("Failed to create log:", err);
      toast.error("Không thể gửi nhật ký. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusConfig = {
    pending: { icon: Clock, label: "Chờ phản hồi", variant: "warning" as const },
    reviewed: { icon: MessageSquare, label: "Đã phản hồi", variant: "info" as const },
    approved: { icon: Check, label: "Đã duyệt", variant: "success" as const },
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
            <p className="text-slate-500">Đang tải nhật ký...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4 text-center">
            <AlertCircle className="h-12 w-12 text-red-400" />
            <p className="text-slate-600">{error}</p>
            <Button onClick={fetchLogs}>Thử lại</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Nhật ký thực tập</h1>
          <p className="text-slate-500 mt-1">Ghi lại quá trình thực tập hàng tuần</p>
        </div>
        {!isCreating && (
          <Button
            onClick={() => setIsCreating(true)}
            className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Viết nhật ký
          </Button>
        )}
      </div>

      {/* Create New Entry Form */}
      {isCreating && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-slate-200 p-6"
        >
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-indigo-500" />
            Nhật ký tuần {logs.length + 1}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Công việc hoàn thành <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={newEntry.completedWork}
                onChange={(e) => setNewEntry({ ...newEntry, completedWork: e.target.value })}
                placeholder="Liệt kê các công việc bạn đã hoàn thành trong tuần..."
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Thách thức gặp phải <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={newEntry.challenges}
                onChange={(e) => setNewEntry({ ...newEntry, challenges: e.target.value })}
                placeholder="Mô tả các khó khăn, thách thức bạn đã gặp..."
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Bài học rút ra <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={newEntry.lessonsLearned}
                onChange={(e) => setNewEntry({ ...newEntry, lessonsLearned: e.target.value })}
                placeholder="Những gì bạn học được từ tuần này..."
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Mục tiêu tuần tới
              </label>
              <Textarea
                value={newEntry.goalsForNextWeek}
                onChange={(e) => setNewEntry({ ...newEntry, goalsForNextWeek: e.target.value })}
                placeholder="Những gì bạn dự định làm trong tuần tới..."
                rows={2}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !newEntry.completedWork || !newEntry.challenges || !newEntry.lessonsLearned}
                className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Gửi nhật ký
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Hủy
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Log List */}
      <div className="space-y-4">
        {logs.map((log, index) => {
          const status = statusConfig[log.status] || statusConfig.pending;
          const StatusIcon = status.icon;
          const isExpanded = expandedLog === log.id;

          return (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
            >
              {/* Log Header */}
              <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => setExpandedLog(isExpanded ? null : log.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold">
                    T{log.weekNumber}
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900">Tuần {log.weekNumber}</h4>
                    <p className="text-sm text-slate-500">{formatDate(log.entryDate || log.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={status.variant}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {status.label}
                  </Badge>
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Log Content */}
              {isExpanded && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  className="border-t border-slate-100 p-4 space-y-4"
                >
                  <div>
                    <h5 className="text-sm font-medium text-emerald-600 mb-2 flex items-center gap-2">
                      <Check className="h-4 w-4" />
                      Công việc hoàn thành
                    </h5>
                    <p className="text-slate-600 whitespace-pre-line">{log.completedWork}</p>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-amber-600 mb-2 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Thách thức gặp phải
                    </h5>
                    <p className="text-slate-600 whitespace-pre-line">{log.challenges || "Không có"}</p>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-indigo-600 mb-2 flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Bài học rút ra
                    </h5>
                    <p className="text-slate-600 whitespace-pre-line">{log.lessonsLearned || "Không có"}</p>
                  </div>
                  
                  {log.goalsForNextWeek && (
                    <div>
                      <h5 className="text-sm font-medium text-violet-600 mb-2 flex items-center gap-2">
                        <ChevronDown className="h-4 w-4" />
                        Mục tiêu tuần tới
                      </h5>
                      <p className="text-slate-600 whitespace-pre-line">{log.goalsForNextWeek}</p>
                    </div>
                  )}

                  {/* Lecturer Comment */}
                  {log.lecturerComment && (
                    <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="h-4 w-4 text-indigo-500" />
                        <span className="text-sm font-medium text-indigo-700">Phản hồi từ giảng viên</span>
                        {log.lecturerRating && (
                          <span className="ml-auto text-sm font-medium text-amber-600">
                            {log.lecturerRating}/5 sao
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-indigo-800">{log.lecturerComment}</p>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Empty State */}
      {logs.length === 0 && !isLoading && (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
          <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">Chưa có nhật ký nào</p>
          <p className="text-sm text-slate-400 mt-1">Bắt đầu viết nhật ký đầu tiên của bạn</p>
          {!isCreating && (
            <Button
              onClick={() => setIsCreating(true)}
              className="mt-4 bg-gradient-to-r from-indigo-500 to-violet-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Viết nhật ký
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
