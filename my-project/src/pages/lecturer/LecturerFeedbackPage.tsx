import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageSquare, Send, ChevronDown, User, Clock, Check, Reply, 
  Loader2, RefreshCw, AlertCircle, FileText 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/shared/Badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { api } from "@/services/api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface LogEntry {
  id: string;
  studentId: string;
  studentName: string;
  studentAvatar?: string;
  weekNumber: number;
  entryDate: string;
  completedWork: string;
  challenges?: string;
  lessonsLearned?: string;
  goalsForNextWeek?: string;
  status: string;
  feedback?: string;
  lecturerComment?: string;
  reviewedAt?: string;
}

interface Comment {
  id: string;
  author: string;
  authorRole: "lecturer" | "student";
  content: string;
  timestamp: string;
}

interface FeedbackThread {
  id: string;
  logId: string;
  comments: Comment[];
}

export function LecturerFeedbackPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [threads, setThreads] = useState<Record<string, FeedbackThread>>({});

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.getStudentsLogs();
      const data = response?.data || response || [];
      
      setLogs(
        data.map((log: any) => ({
          id: log.id,
          studentId: log.studentId,
          studentName: log.student?.name || "Unknown",
          studentAvatar: log.student?.avatar,
          weekNumber: log.weekNumber || 1,
          entryDate: log.entryDate || log.createdAt || "",
          completedWork: log.completedWork || "",
          challenges: log.challenges || "",
          lessonsLearned: log.lessonsLearned || "",
          goalsForNextWeek: log.goalsForNextWeek || "",
          status: log.status || "pending",
          feedback: log.feedback,
          lecturerComment: log.lecturerComment,
          reviewedAt: log.reviewedAt,
        }))
      );

      // Initialize threads with existing feedback as comments
      const initialThreads: Record<string, FeedbackThread> = {};
      data.forEach((log: any) => {
        if (log.lecturerComment || log.feedback) {
          initialThreads[log.id] = {
            id: `thread-${log.id}`,
            logId: log.id,
            comments: [
              {
                id: `c-${log.id}-1`,
                author: "Giảng viên",
                authorRole: "lecturer" as const,
                content: log.lecturerComment || log.feedback || "",
                timestamp: log.reviewedAt || log.updatedAt || log.createdAt || "",
              },
            ],
          };
        }
      });
      setThreads(initialThreads);
    } catch (err) {
      console.error("Failed to fetch logs:", err);
      setError("Không thể tải danh sách nhật ký");
      toast.error("Không thể tải dữ liệu");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleSendFeedback = async (logId: string) => {
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      // Submit feedback via API
      await api.reviewLog(logId, { 
        status: "approved", 
        feedback: newComment 
      });

      // Update local state
      setThreads((prev) => ({
        ...prev,
        [logId]: {
          ...prev[logId],
          id: prev[logId]?.id || `thread-${logId}`,
          logId,
          comments: [
            ...(prev[logId]?.comments || []),
            {
              id: `c-${Date.now()}`,
              author: "Giảng viên",
              authorRole: "lecturer" as const,
              content: newComment,
              timestamp: new Date().toISOString(),
            },
          ],
        },
      }));

      // Update log status
      setLogs((prev) =>
        prev.map((log) =>
          log.id === logId
            ? { ...log, status: "approved", lecturerComment: newComment }
            : log
        )
      );

      setNewComment("");
      toast.success("Đã gửi phản hồi thành công!");
    } catch (err) {
      console.error("Failed to send feedback:", err);
      toast.error("Không thể gửi phản hồi. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "pending":
        return { label: "Chờ phản hồi", variant: "warning" as const, icon: Clock };
      case "approved":
      case "commented":
        return { label: "Đã phản hồi", variant: "success" as const, icon: Check };
      case "submitted":
        return { label: "Đã nộp", variant: "info" as const, icon: MessageSquare };
      default:
        return { label: status, variant: "default" as const, icon: FileText };
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
          <div className="flex flex-col items-center gap-4">
            <AlertCircle className="h-12 w-12 text-red-400" />
            <p className="text-slate-600">{error}</p>
            <Button onClick={fetchLogs}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Thử lại
            </Button>
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
          <h1 className="text-2xl font-bold text-slate-900">Feedback Hub</h1>
          <p className="text-slate-500 mt-1">
            Xem và phản hồi nhật ký của sinh viên
            {logs.length > 0 && (
              <span className="ml-2 text-sm">
                ({logs.length} nhật ký)
              </span>
            )}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchLogs}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Làm mới
        </Button>
      </div>

      {/* Journal Entries */}
      <div className="space-y-4">
        {logs.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">Chưa có nhật ký nào từ sinh viên</p>
          </div>
        ) : (
          logs.map((log, index) => {
            const status = getStatusConfig(log.status);
            const StatusIcon = status.icon;
            const isExpanded = expandedLog === log.id;
            const thread = threads[log.id];

            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
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
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        {log.studentAvatar && (
                          <AvatarImage src={log.studentAvatar} alt={log.studentName} />
                        )}
                        <AvatarFallback className="text-xs bg-indigo-100 text-indigo-700 font-semibold">
                          {log.studentName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium text-slate-900">{log.studentName}</h4>
                        <p className="text-sm text-slate-500">Tuần {log.weekNumber} · {formatDate(log.entryDate)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={status.variant}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {status.label}
                    </Badge>
                    {thread && thread.comments.length > 0 && (
                      <Badge variant="purple">
                        {thread.comments.length} phản hồi
                      </Badge>
                    )}
                    <ChevronDown
                      className={cn(
                        "h-5 w-5 text-slate-400 transition-transform",
                        isExpanded && "rotate-180"
                      )}
                    />
                  </div>
                </div>

                {/* Expanded Content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-slate-100"
                    >
                      <div className="p-4 space-y-4">
                        {/* Log Content */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                            <h5 className="text-sm font-medium text-emerald-700 mb-2">Công việc hoàn thành</h5>
                            <p className="text-sm text-emerald-800 whitespace-pre-line">
                              {log.completedWork || "Không có thông tin"}
                            </p>
                          </div>
                          <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                            <h5 className="text-sm font-medium text-amber-700 mb-2">Thách thức</h5>
                            <p className="text-sm text-amber-800 whitespace-pre-line">
                              {log.challenges || "Không có thông tin"}
                            </p>
                          </div>
                          <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                            <h5 className="text-sm font-medium text-indigo-700 mb-2">Bài học rút ra</h5>
                            <p className="text-sm text-indigo-800 whitespace-pre-line">
                              {log.lessonsLearned || "Không có thông tin"}
                            </p>
                          </div>
                        </div>

                        {/* Goals for Next Week */}
                        {log.goalsForNextWeek && (
                          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                            <h5 className="text-sm font-medium text-slate-700 mb-2">Mục tiêu tuần tới</h5>
                            <p className="text-sm text-slate-600 whitespace-pre-line">
                              {log.goalsForNextWeek}
                            </p>
                          </div>
                        )}

                        {/* Feedback Thread */}
                        <div className="border-t border-slate-100 pt-4">
                          <h5 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" />
                            Phản hồi ({thread?.comments.length || 0})
                          </h5>

                          <div className="space-y-3 mb-4">
                            {thread?.comments.map((comment) => (
                              <div
                                key={comment.id}
                                className={cn(
                                  "p-3 rounded-xl",
                                  comment.authorRole === "lecturer"
                                    ? "bg-indigo-50 border border-indigo-100 ml-4"
                                    : "bg-slate-50 border border-slate-100 mr-4"
                                )}
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <User className="h-4 w-4 text-slate-400" />
                                  <span className="text-sm font-medium text-slate-900">
                                    {comment.author}
                                  </span>
                                  <span className="text-xs text-slate-400">
                                    {formatDate(comment.timestamp)}
                                  </span>
                                </div>
                                <p className="text-sm text-slate-700 ml-6">{comment.content}</p>
                              </div>
                            ))}
                          </div>

                          {/* Reply Form */}
                          <div className="flex gap-3">
                            <Textarea
                              value={expandedLog === log.id ? newComment : ""}
                              onChange={(e) => {
                                setExpandedLog(log.id);
                                setNewComment(e.target.value);
                              }}
                              placeholder="Viết phản hồi của bạn cho sinh viên..."
                              rows={2}
                              className="flex-1"
                              disabled={isSubmitting}
                            />
                            <Button
                              onClick={() => handleSendFeedback(log.id)}
                              disabled={!newComment.trim() || isSubmitting}
                              className="self-end bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700"
                            >
                              {isSubmitting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Send className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
