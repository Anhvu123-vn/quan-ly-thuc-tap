import { useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Phone, FileText, ExternalLink, Calendar, MessageSquare, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge, ApplicationStatusBadge } from "@/components/shared/Badge";
import { Tabs } from "@/components/shared/Tabs";
import { mockApplications } from "@/data/mockData";
import { cn } from "@/lib/utils";

export function CompanyCandidateReviewPage() {
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const tabs = [
    { id: "all", label: "Tất cả", badge: mockApplications.length },
    { id: "applied", label: "Đã nộp", badge: mockApplications.filter((a) => a.status === "applied").length },
    { id: "screening", label: "Xét duyệt", badge: mockApplications.filter((a) => a.status === "screening").length },
    { id: "interview", label: "Phỏng vấn", badge: mockApplications.filter((a) => a.status === "interview").length },
    { id: "offer", label: "Đề nghị", badge: mockApplications.filter((a) => a.status === "offer").length },
  ];

  const filteredApps = statusFilter === "all" 
    ? mockApplications 
    : mockApplications.filter((a) => a.status === statusFilter);

  const selected = mockApplications.find((a) => a.id === selectedApp);

  const updateStatus = (id: string, status: typeof selected.status) => {
    // In real app, call API
    console.log("Update status:", id, status);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Candidate Review</h1>
        <p className="text-slate-500 mt-1">Xem chi tiết và quản lý ứng viên</p>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={tabs}
        activeTab={statusFilter}
        onChange={setStatusFilter}
      />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Candidate List */}
        <div className="space-y-3">
          {filteredApps.map((app, index) => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedApp(app.id)}
              className={cn(
                "bg-white rounded-xl border p-4 cursor-pointer transition-all",
                selectedApp === app.id
                  ? "border-indigo-500 shadow-lg shadow-indigo-500/10"
                  : "border-slate-200 hover:border-slate-300"
              )}
            >
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold">
                  {app.studentName.split(" ").slice(-1)[0][0]}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-slate-900">{app.studentName}</h4>
                  <p className="text-sm text-slate-500">{app.position}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <ApplicationStatusBadge status={app.status} />
                    <span className="text-xs text-slate-400">• {app.appliedDate}</span>
                  </div>
                </div>
                <Badge variant="info">{app.company}</Badge>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Candidate Detail */}
        <div>
          {selected ? (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl border border-slate-200 p-6 sticky top-6"
            >
              {/* Profile Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-xl">
                  {selected.studentName.split(" ").slice(-1)[0][0]}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">{selected.studentName}</h3>
                  <p className="text-slate-500">{selected.position}</p>
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Mail className="h-4 w-4 text-slate-400" />
                  {selected.studentName.toLowerCase().replace(" ", ".")}@example.com
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Phone className="h-4 w-4 text-slate-400" />
                  0901 234 567
                </div>
              </div>

              {/* Status */}
              <div className="mb-6">
                <label className="text-sm font-medium text-slate-700 block mb-2">Trạng thái hiện tại</label>
                <ApplicationStatusBadge status={selected.status} />
              </div>

              {/* e-Portfolio Link */}
              <div className="p-4 bg-slate-50 rounded-xl mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-indigo-500" />
                    <span className="font-medium text-slate-900">e-Portfolio</span>
                  </div>
                  <Button size="sm" variant="outline">
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Xem hồ sơ
                  </Button>
                </div>
              </div>

              {/* Notes */}
              {selected.notes && (
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 mb-6">
                  <p className="text-sm text-amber-800">{selected.notes}</p>
                </div>
              )}

              {/* Update Status */}
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-3">Cập nhật trạng thái</label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    onClick={() => updateStatus(selected.id, "screening")}
                    disabled={selected.status !== "applied"}
                    className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Xét duyệt
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => updateStatus(selected.id, "interview")}
                    disabled={selected.status === "interview" || selected.status === "offer" || selected.status === "rejected"}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                  >
                    <Calendar className="h-4 w-4 mr-1" />
                    Phỏng vấn
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => updateStatus(selected.id, "offer")}
                    disabled={selected.status === "offer" || selected.status === "rejected"}
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Đề nghị
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateStatus(selected.id, "rejected")}
                    disabled={selected.status === "rejected"}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Từ chối
                  </Button>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center sticky top-6">
              <User className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">Chọn một ứng viên để xem chi tiết</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
