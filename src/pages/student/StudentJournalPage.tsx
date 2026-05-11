import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Plus, Check, MessageSquare, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge, ApplicationStatusBadge } from "@/components/shared/Badge";
import { mockLogEntries, type LogEntry } from "@/data/mockData";
import { cn } from "@/lib/utils";

export function StudentJournalPage() {
  const [logs, setLogs] = useState<LogEntry[]>(mockLogEntries);
  const [isCreating, setIsCreating] = useState(false);
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  const [newEntry, setNewEntry] = useState({
    completedWork: "",
    challenges: "",
    lessonsLearned: "",
  });

  const handleSubmit = () => {
    if (!newEntry.completedWork || !newEntry.challenges || !newEntry.lessonsLearned) return;

    const entry: LogEntry = {
      id: `log-${Date.now()}`,
      studentId: "stu-1",
      week: logs.length + 1,
      date: new Date().toISOString().split("T")[0],
      ...newEntry,
      status: "pending",
    };

    setLogs([entry, ...logs]);
    setNewEntry({ completedWork: "", challenges: "", lessonsLearned: "" });
    setIsCreating(false);
  };

  const statusConfig = {
    pending: { icon: Clock, label: "Chờ phản hồi", variant: "warning" as const },
    commented: { icon: MessageSquare, label: "Đã phản hồi", variant: "info" as const },
    approved: { icon: Check, label: "Đã duyệt", variant: "success" as const },
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Nhật ký 360</h1>
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
                Công việc hoàn thành
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
                Thách thức gặp phải
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
                Bài học rút ra
              </label>
              <Textarea
                value={newEntry.lessonsLearned}
                onChange={(e) => setNewEntry({ ...newEntry, lessonsLearned: e.target.value })}
                placeholder="Những gì bạn học được từ tuần này..."
                rows={3}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleSubmit}
                disabled={!newEntry.completedWork || !newEntry.challenges || !newEntry.lessonsLearned}
                className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700"
              >
                <Check className="h-4 w-4 mr-2" />
                Gửi nhật ký
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
          const status = statusConfig[log.status];
          const StatusIcon = status.icon;
          const isExpanded = expandedLog === log.id;

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
                  exit={{ height: 0 }}
                  className="border-t border-slate-100 p-4 space-y-4"
                >
                  <div>
                    <h5 className="text-sm font-medium text-emerald-600 mb-2">
                      ✓ Công việc hoàn thành
                    </h5>
                    <p className="text-slate-600 whitespace-pre-line">{log.completedWork}</p>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-amber-600 mb-2">
                      ⚡ Thách thức gặp phải
                    </h5>
                    <p className="text-slate-600 whitespace-pre-line">{log.challenges}</p>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-indigo-600 mb-2">
                      💡 Bài học rút ra
                    </h5>
                    <p className="text-slate-600 whitespace-pre-line">{log.lessonsLearned}</p>
                  </div>

                  {/* Lecturer Comment */}
                  {log.lecturerComment && (
                    <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="h-4 w-4 text-indigo-500" />
                        <span className="text-sm font-medium text-indigo-700">Phản hồi từ giảng viên</span>
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
      {logs.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">Chưa có nhật ký nào</p>
          <p className="text-sm text-slate-400 mt-1">Bắt đầu viết nhật ký đầu tiên của bạn</p>
        </div>
      )}
    </div>
  );
}
