import { useState, useEffect, useCallback } from "react";
import { InternshipSuggestions } from "@/components/dashboard/InternshipSuggestions";
import { ApplicationStatus } from "@/components/dashboard/ApplicationStatus";
import { ProgressTimeline } from "@/components/dashboard/ProgressTimeline";
import { InternshipLogPreview } from "@/components/dashboard/InternshipLogPreview";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { api } from "@/services/api";
import { toast } from "sonner";

interface Application {
  id: string;
  positionId: string;
  studentId: string;
  status: string;
  appliedAt: string;
  position?: {
    id: string;
    title: string;
    company?: {
      name: string;
    };
  };
}

interface LogEntry {
  id: string;
  weekNumber: number;
  entryDate: string;
  completedWork: string;
  challenges?: string;
  lessonsLearned?: string;
  goalsForNextWeek?: string;
  status: string;
  createdAt: string;
}

interface TimelineStage {
  id: string;
  label: string;
  completed: boolean;
  current: boolean;
}

const statusToStageIndex: Record<string, number> = {
  applied: 0,
  screening: 1,
  interview: 2,
  offer: 3,
  department_approved: 4,
  accepted: 4,
  rejected: -1,
  withdrawn: -1,
};

export function StudentDashboardPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [appsData, logsData] = await Promise.all([
        api.getMyApplications(),
        api.getMyLogs(),
      ]);
      
      // Transform applications data
      const transformedApps: Application[] = (appsData || []).map((app: any) => ({
        id: app.id,
        positionId: app.positionId || app.position?.id,
        studentId: app.studentId,
        status: app.status,
        appliedAt: app.appliedAt || app.createdAt,
        position: app.position ? {
          id: app.position.id,
          title: app.position.title,
          company: app.position.company ? { name: app.position.company.name } : undefined,
        } : undefined,
      }));
      
      setApplications(transformedApps);
      setLogEntries(logsData || []);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError("Không thể tải dữ liệu");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Calculate progress timeline based on best application status
  const getBestApplicationStatus = () => {
    const priority = ['department_approved', 'offer', 'interview', 'screening', 'applied'];
    for (const status of priority) {
      if (applications.some(a => a.status === status)) {
        return status;
      }
    }
    return applications.length > 0 ? 'applied' : null;
  };

  const buildTimelineStages = (): TimelineStage[] => {
    const currentStatus = getBestApplicationStatus();
    const currentIndex = currentStatus ? statusToStageIndex[currentStatus] ?? 0 : -1;
    
    const stages: TimelineStage[] = [
      { id: '1', label: 'Đã nộp', completed: currentIndex >= 0, current: currentIndex === 0 },
      { id: '2', label: 'Xét duyệt', completed: currentIndex >= 1, current: currentIndex === 1 },
      { id: '3', label: 'Phỏng vấn', completed: currentIndex >= 2, current: currentIndex === 2 },
      { id: '4', label: 'Offer', completed: currentIndex >= 3, current: currentIndex === 3 },
      { id: '5', label: 'Hoàn tất', completed: currentIndex >= 4, current: currentIndex === 4 },
    ];
    
    return stages;
  };

  const calculateProgress = () => {
    const currentStatus = getBestApplicationStatus();
    if (!currentStatus) return 0;
    const index = statusToStageIndex[currentStatus] ?? 0;
    return Math.min(100, ((index + 1) / 5) * 100);
  };

  // Business rule: nếu sinh viên đã có đơn ở trạng thái department_approved → disabled nút Ứng tuyển
  const hasDepartmentApproved = applications.some((a) => a.status === "department_approved");

  const handleCancel = async (id: string) => {
    try {
      await api.updateApplicationStatus(id, "withdrawn");
      setApplications((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, status: "withdrawn" } : a
        )
      );
      toast.success("Đã rút đơn thành công!");
    } catch (err: any) {
      console.error("Failed to cancel application:", err);
      toast.error(err?.message || "Không thể rút đơn. Vui lòng thử lại.");
    }
  };

  // Transform data for components
  const transformedLogEntries = logEntries.slice(0, 5).map((entry) => ({
    id: entry.id,
    date: new Date(entry.entryDate || entry.createdAt).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }),
    hours: 0, // LogEntry doesn't have hours, could calculate from duration
    description: entry.completedWork,
  }));

  const totalHours = logEntries.length * 40; // Approximate hours per week

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
          <p className="text-slate-500">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-red-500">{error}</p>
          <button onClick={fetchData} className="px-4 py-2 bg-indigo-500 text-white rounded-lg">
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  // Transform applications for ApplicationStatus component
  const transformedApplications = applications.map((app) => ({
    id: app.id,
    positionId: app.positionId,
    studentId: app.studentId,
    studentName: "", // Not needed for display
    company: app.position?.company?.name || "Công ty",
    position: app.position?.title || "Vị trí",
    status: app.status as any,
    appliedDate: new Date(app.appliedAt).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }),
  }));

  return (
    <>
      {/* Progress Timeline - Full width */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <ProgressTimeline 
          stages={buildTimelineStages()} 
          progressPercentage={calculateProgress()} 
        />
      </motion.div>

      {/* Main content grid */}
      <div className="grid gap-8 lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px]">
        {/* Left column */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <InternshipSuggestions applyDisabled={hasDepartmentApproved} />
        </motion.div>

        {/* Right column */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-6"
        >
          <ApplicationStatus
            applications={transformedApplications}
            onCancel={handleCancel}
          />
          <InternshipLogPreview entries={transformedLogEntries} totalHours={totalHours} />
        </motion.div>
      </div>
    </>
  );
}
