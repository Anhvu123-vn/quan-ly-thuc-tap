import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Send, ChevronDown, User, Clock, Check, Reply } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/shared/Badge";
import { mockLogEntries, type LogEntry } from "@/data/mockData";
import { cn } from "@/lib/utils";

interface FeedbackThread {
  id: string;
  logId: string;
  comments: Comment[];
}

interface Comment {
  id: string;
  author: string;
  authorRole: "lecturer" | "student";
  content: string;
  timestamp: string;
}

const mockThreads: Record<string, FeedbackThread> = {
  "log-1": {
    id: "thread-1",
    logId: "log-1",
    comments: [
      {
        id: "c1",
        author: "TS. Nguyễn Văn A",
        authorRole: "lecturer",
        content: "Bài làm tốt! Cần chú ý về security khi handle tokens.",
        timestamp: "2026-05-06 10:30:00",
      },
      {
        id: "c2",
        author: "Trần Minh Đức",
        authorRole: "student",
        content: "Dạ, em sẽ cải thiện phần security. Cảm ơn thầy!",
        timestamp: "2026-05-06 14:20:00",
      },
    ],
  },
};

export function LecturerFeedbackPage() {
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [threads, setThreads] = useState<Record<string, FeedbackThread>>(mockThreads);

  const handleSendComment = (logId: string) => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: `c${Date.now()}`,
      author: "TS. Nguyễn Văn A",
      authorRole: "lecturer",
      content: newComment,
      timestamp: new Date().toISOString().replace("T", " ").split(".")[0],
    };

    setThreads((prev) => ({
      ...prev,
      [logId]: {
        ...prev[logId],
        comments: [...(prev[logId]?.comments || []), comment],
      },
    }));

    setNewComment("");
    setReplyingTo(null);
  };

  const getStatusConfig = (status: LogEntry["status"]) => {
    switch (status) {
      case "pending":
        return { label: "Chờ phản hồi", variant: "warning" as const, icon: Clock };
      case "commented":
        return { label: "Đã phản hồi", variant: "info" as const, icon: MessageSquare };
      case "approved":
        return { label: "Đã duyệt", variant: "success" as const, icon: Check };
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Feedback Hub</h1>
        <p className="text-slate-500 mt-1">Xem và phản hồi nhật ký của sinh viên</p>
      </div>

      {/* Student Filter */}
      <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-medium">
          TMD
        </div>
        <div>
          <p className="font-medium text-slate-900">Trần Minh Đức</p>
          <p className="text-sm text-slate-500">Khoa học Máy tính - K2022</p>
        </div>
        <div className="ml-auto">
          <Badge variant="info">
            {mockLogEntries.length} nhật ký
          </Badge>
        </div>
      </div>

      {/* Journal Entries */}
      <div className="space-y-4">
        {mockLogEntries.map((log, index) => {
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
                    T{log.week}
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900">Tuần {log.week}</h4>
                    <p className="text-sm text-slate-500">{log.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={status.variant}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {status.label}
                  </Badge>
                  {thread && (
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
                    className="border-t border-slate-100"
                  >
                    <div className="p-4 space-y-4">
                      {/* Log Content */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                          <h5 className="text-sm font-medium text-emerald-700 mb-2">Công việc hoàn thành</h5>
                          <p className="text-sm text-emerald-800 whitespace-pre-line">{log.completedWork}</p>
                        </div>
                        <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                          <h5 className="text-sm font-medium text-amber-700 mb-2">Thách thức</h5>
                          <p className="text-sm text-amber-800 whitespace-pre-line">{log.challenges}</p>
                        </div>
                        <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                          <h5 className="text-sm font-medium text-indigo-700 mb-2">Bài học rút ra</h5>
                          <p className="text-sm text-indigo-800 whitespace-pre-line">{log.lessonsLearned}</p>
                        </div>
                      </div>

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
                                  {comment.timestamp.split(" ")[1]}
                                </span>
                              </div>
                              <p className="text-sm text-slate-700 ml-6">{comment.content}</p>
                              {comment.authorRole === "student" && (
                                <button
                                  onClick={() => setReplyingTo(comment.id)}
                                  className="mt-2 ml-6 text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                                >
                                  <Reply className="h-3 w-3" />
                                  Phản hồi
                                </button>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Reply Form */}
                        <div className="flex gap-3">
                          <Textarea
                            value={replyingTo === log.id ? newComment : ""}
                            onChange={(e) => {
                              setReplyingTo(log.id);
                              setNewComment(e.target.value);
                            }}
                            placeholder="Viết phản hồi của bạn..."
                            rows={2}
                            className="flex-1"
                          />
                          <Button
                            onClick={() => handleSendComment(log.id)}
                            disabled={!newComment.trim()}
                            className="self-end bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700"
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
