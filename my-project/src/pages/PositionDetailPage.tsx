import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Users, Clock, Calendar, Loader2, Briefcase, MapPin, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PositionTabs } from "@/components/positions/PositionTabs";
import { RelatedPositions } from "@/components/positions/RelatedPositions";
import { api } from "@/services/api";
import type { Position } from "@/types";

const durationLabels: Record<string, string> = {
  one_month: "1 tháng",
  two_three_months: "2-3 tháng",
  four_six_months: "4-6 tháng",
  six_plus_months: "6+ tháng",
};

const workTypeLabels: Record<string, string> = {
  remote: "Remote",
  hybrid: "Hybrid",
  onsite: "On-site",
};

export function PositionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [position, setPosition] = useState<Position | null>(null);
  const [allPositions, setAllPositions] = useState<Position[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const [positionData, positionsData] = await Promise.all([
          api.getPosition(id),
          api.getPositions({ limit: 10 }),
        ]);
        
        // Transform position data
        const pos = positionData as any;
        const transformed: Position = {
          id: pos.id,
          title: pos.title,
          company: pos.company?.name || "Công ty",
          location: pos.location || "",
          duration: durationLabels[pos.duration || ""] || pos.duration || "",
          field: pos.field || "",
          description: pos.description || "",
          requirements: pos.requirements || [],
          responsibilities: pos.responsibilities || [],
          salaryMin: pos.salaryMin,
          salaryMax: pos.salaryMax,
          workType: pos.workType,
          slots: pos.slots,
          postedDate: pos.postedDate || pos.createdAt,
          deadline: pos.deadline,
          status: pos.status,
          applicantCount: pos._count?.applications || 0,
        };
        
        setPosition(transformed);
        
        // Transform all positions for related section
        const transformedAll: Position[] = (positionsData.data || [])
          .filter((p: any) => p.id !== id)
          .map((p: any) => ({
            id: p.id,
            title: p.title,
            company: p.company?.name || "Công ty",
            location: p.location || "",
            duration: durationLabels[p.duration || ""] || p.duration || "",
            field: p.field || "",
            description: p.description || "",
            requirements: p.requirements || [],
            postedDate: p.postedDate || p.createdAt || new Date().toISOString(),
          }));
        
        setAllPositions(transformedAll);
      } catch (err: any) {
        console.error("Failed to fetch position:", err);
        setError("Không thể tải thông tin vị trí");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  const handleApply = async () => {
    if (!id) return;

    // Check if student can apply (batch check)
    setIsApplying(true);
    try {
      const canApply = await api.canStudentApply();
      if (!canApply.can) {
        alert("Hiện không có đợt thực tập nào cho phép nộp đơn. Vui lòng đợi admin mở đợt thực tập mới.");
        return;
      }
      await api.createApplication({ positionId: id });
      alert("Ứng tuyển thành công!");
      // Refresh data
      const positionData = await api.getPosition(id);
      const pos = positionData as any;
      setPosition(prev => prev ? {
        ...prev,
        applicantCount: pos._count?.applications || (prev.applicantCount || 0) + 1,
      } : prev);
    } catch (err: any) {
      alert(err.message || "Không thể ứng tuyển. Vui lòng thử lại.");
    } finally {
      setIsApplying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[--color-background] flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (error || !position) {
    return (
      <div className="min-h-screen bg-[--color-background] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-2">Không tìm thấy vị trí</h1>
          <p className="text-[--color-muted-foreground] mb-6">
            Vị trí bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
          </p>
          <Button onClick={() => navigate('/positions')}>
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[--color-background]">
      {/* Back button */}
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/positions')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại danh sách
        </Button>
      </div>

      {/* Header */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-[--color-border] bg-white p-6 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-[--color-foreground] mb-2">
                {position.title}
              </h1>
              <p className="text-lg text-[--color-muted-foreground] mb-4">
                {position.company}
              </p>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {position.location && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[--color-border] bg-[--color-muted]/50 px-3 py-1 text-sm font-medium text-[--color-muted-foreground]">
                    <MapPin className="h-4 w-4" />
                    {position.location}
                  </span>
                )}
                {position.duration && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[--color-primary]/10 px-3 py-1 text-sm font-medium text-[--color-primary] border border-[--color-primary]/20">
                    <Clock className="h-4 w-4" />
                    {position.duration}
                  </span>
                )}
                {position.workType && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[--color-border] bg-[--color-muted]/50 px-3 py-1 text-sm font-medium text-[--color-muted-foreground]">
                    <Briefcase className="h-4 w-4" />
                    {workTypeLabels[position.workType] || position.workType}
                  </span>
                )}
                {position.field && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[--color-border] bg-[--color-muted]/50 px-3 py-1 text-sm font-medium text-[--color-muted-foreground]">
                    {position.field}
                  </span>
                )}
              </div>
              
              {/* Salary */}
              {(position.salaryMin || position.salaryMax) && (
                <div className="flex items-center gap-2 text-emerald-700">
                  <DollarSign className="h-5 w-5" />
                  <span className="font-semibold">
                    {position.salaryMin?.toLocaleString()} - {position.salaryMax?.toLocaleString()} VNĐ
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex-shrink-0">
              <Button 
                size="lg" 
                onClick={handleApply}
                disabled={isApplying || position.status !== 'active'}
              >
                {isApplying ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang ứng tuyển...
                  </>
                ) : position.status !== 'active' ? (
                  "Đã đóng"
                ) : (
                  "Ứng tuyển ngay"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs content */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2">
            <PositionTabs position={position} />
            
            {/* Related positions */}
            <div className="mt-6">
              <RelatedPositions 
                positions={allPositions}
                currentPositionId={position.id}
                onApply={(posId) => {
                  navigate(`/positions/${posId}`);
                }}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Quick info card */}
            <div className="rounded-lg border border-[--color-border] bg-white p-4">
              <h4 className="font-semibold mb-3">Thông tin nhanh</h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-sm">
                  <Users className="h-4 w-4 text-[--color-muted-foreground]" />
                  <span className="text-[--color-muted-foreground]">
                    {position.applicantCount || 0} ứng viên
                  </span>
                </li>
                {position.slots && (
                  <li className="flex items-center gap-3 text-sm">
                    <Briefcase className="h-4 w-4 text-[--color-muted-foreground]" />
                    <span className="text-[--color-muted-foreground]">
                      {position.slots} vị trí
                    </span>
                  </li>
                )}
                <li className="flex items-center gap-3 text-sm">
                  <Clock className="h-4 w-4 text-[--color-muted-foreground]" />
                  <span className="text-[--color-muted-foreground]">
                    Thời gian: {position.duration}
                  </span>
                </li>
                <li className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-[--color-muted-foreground]" />
                  <span className="text-[--color-muted-foreground]">
                    Đăng: {new Date(position.postedDate).toLocaleDateString("vi-VN")}
                  </span>
                </li>
              </ul>
            </div>

            {/* Apply card */}
            <div className="rounded-lg border border-[--color-border] bg-white p-4">
              <h4 className="font-semibold mb-3">Quan tâm đến vị trí này?</h4>
              <p className="text-sm text-[--color-muted-foreground] mb-4">
                Đừng bỏ lỡ cơ hội. Ứng tuyển ngay để bắt đầu sự nghiệp của bạn.
              </p>
              <Button 
                className="w-full" 
                onClick={handleApply}
                disabled={isApplying || position.status !== 'active'}
              >
                {isApplying ? "Đang ứng tuyển..." : "Ứng tuyển ngay"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
