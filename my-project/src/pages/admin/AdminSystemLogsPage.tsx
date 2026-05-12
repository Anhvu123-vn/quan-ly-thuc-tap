import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Mail, Bell, Search, Filter, RefreshCw, CheckCircle, XCircle, Clock, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/shared/Badge";
import { Tabs } from "@/components/shared/Tabs";
import { mockSystemLogs } from "@/data/mockData";
import { cn } from "@/lib/utils";

export function AdminSystemLogsPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const tabs = [
    { id: "all", label: "Tất cả", badge: mockSystemLogs.length },
    { id: "email", label: "Email", badge: mockSystemLogs.filter((l) => l.type === "email").length },
    { id: "notification", label: "Thông báo", badge: mockSystemLogs.filter((l) => l.type === "notification").length },
    { id: "system", label: "Hệ thống", badge: mockSystemLogs.filter((l) => l.type === "system").length },
  ];

  const filteredLogs = mockSystemLogs.filter((log) => {
    const matchesTab = activeTab === "all" || log.type === activeTab;
    const matchesSearch =
      log.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.recipient.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getTypeIcon = (type: typeof mockSystemLogs[0]["type"]) => {
    switch (type) {
      case "email":
        return <Mail className="h-4 w-4" />;
      case "notification":
        return <Bell className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeColors = (type: typeof mockSystemLogs[0]["type"]) => {
    switch (type) {
      case "email":
        return "bg-blue-100 text-blue-600";
      case "notification":
        return "bg-indigo-100 text-indigo-600";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  const getStatusConfig = (status: typeof mockSystemLogs[0]["status"]) => {
    switch (status) {
      case "sent":
        return { icon: CheckCircle, variant: "success" as const, label: "Đã gửi" };
      case "failed":
        return { icon: XCircle, variant: "danger" as const, label: "Thất bại" };
      default:
        return { icon: Clock, variant: "warning" as const, label: "Đang chờ" };
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">System Logs</h1>
          <p className="text-slate-500 mt-1">Lịch sử email và thông báo trong hệ thống</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Làm mới
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Xuất logs
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Tổng logs", value: mockSystemLogs.length, color: "indigo" },
          { label: "Đã gửi", value: mockSystemLogs.filter((l) => l.status === "sent").length, color: "emerald" },
          { label: "Thất bại", value: mockSystemLogs.filter((l) => l.status === "failed").length, color: "red" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-xl border border-slate-200 p-4"
          >
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-sm text-slate-500">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Tìm kiếm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Logs List */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left p-4 text-xs font-medium text-slate-500">Loại</th>
                <th className="text-left p-4 text-xs font-medium text-slate-500">Người nhận</th>
                <th className="text-left p-4 text-xs font-medium text-slate-500">Nội dung</th>
                <th className="text-left p-4 text-xs font-medium text-slate-500">Trạng thái</th>
                <th className="text-left p-4 text-xs font-medium text-slate-500">Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log, index) => {
                const typeColors = getTypeColors(log.type);
                const statusConfig = getStatusConfig(log.status);
                const StatusIcon = statusConfig.icon;

                return (
                  <motion.tr
                    key={log.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.03 }}
                    className="border-b border-slate-50 hover:bg-slate-50 transition-colors"
                  >
                    <td className="p-4">
                      <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", typeColors)}>
                        {getTypeIcon(log.type)}
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-slate-900">{log.recipient}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-sm text-slate-700">{log.subject}</p>
                    </td>
                    <td className="p-4">
                      <Badge variant={statusConfig.variant}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusConfig.label}
                      </Badge>
                    </td>
                    <td className="p-4 text-sm text-slate-500">{log.sentAt}</td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">Hiển thị {filteredLogs.length} kết quả</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>
            Trước
          </Button>
          <Button variant="outline" size="sm">
            Sau
          </Button>
        </div>
      </div>
    </div>
  );
}
