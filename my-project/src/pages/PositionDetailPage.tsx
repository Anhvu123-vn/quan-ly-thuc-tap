import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Users, Clock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PositionHeader } from "@/components/positions/PositionHeader";
import { PositionTabs } from "@/components/positions/PositionTabs";
import { RelatedPositions } from "@/components/positions/RelatedPositions";
import { ApplyModal } from "@/components/positions/ApplyModal";
import { mockPositions } from "@/data/positions";

export function PositionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showApplyModal, setShowApplyModal] = useState(false);

  // Simulate loading
  const position = mockPositions.find(p => p.id === id);

  if (!position) {
    return (
      <div className="min-h-screen bg-[--color-background] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-2">Position Not Found</h1>
          <p className="text-[--color-muted-foreground] mb-6">
            The position you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate('/positions')}>
            Browse Positions
          </Button>
        </div>
      </div>
    );
  }

  const handleApply = () => {
    setShowApplyModal(true);
  };

  const handleApplySubmit = (data: unknown) => {
    console.log('Application submitted:', data);
    setShowApplyModal(false);
  };

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
          Back to Positions
        </Button>
      </div>

      {/* Header */}
      <PositionHeader position={position} onApply={handleApply} />

      {/* Tabs content */}
      <PositionTabs position={position} />

      {/* Quick info sidebar on desktop */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main content area takes 2 columns */}
          <div className="lg:col-span-2">
            {/* Related positions */}
            <RelatedPositions 
              positions={mockPositions}
              currentPositionId={position.id}
              onApply={(id) => {
                navigate(`/positions/${id}`);
              }}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Quick info card */}
            <div className="rounded-lg border border-[--color-border] bg-white p-4">
              <h4 className="font-semibold mb-3">Quick Info</h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-sm">
                  <Users className="h-4 w-4 text-[--color-muted-foreground]" />
                  <span className="text-[--color-muted-foreground]">24 applicants</span>
                </li>
                <li className="flex items-center gap-3 text-sm">
                  <Clock className="h-4 w-4 text-[--color-muted-foreground]" />
                  <span className="text-[--color-muted-foreground]">Full-time commitment</span>
                </li>
                <li className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-[--color-muted-foreground]" />
                  <span className="text-[--color-muted-foreground]">Start date: Flexible</span>
                </li>
              </ul>
            </div>

            {/* Apply card */}
            <div className="rounded-lg border border-[--color-border] bg-white p-4">
              <h4 className="font-semibold mb-3">Interested?</h4>
              <p className="text-sm text-[--color-muted-foreground] mb-4">
                Don't miss this opportunity. Apply now and take the first step towards your career.
              </p>
              <Button className="w-full" onClick={handleApply}>
                Apply Now
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      <ApplyModal
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        position={position}
        onSubmit={handleApplySubmit}
      />
    </div>
  );
}
