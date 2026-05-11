import { useState } from "react";
import { StatsGrid } from "@/components/admin/StatsCard";
import { ActivityFeed } from "@/components/admin/ActivityFeed";
import { PendingApprovals } from "@/components/admin/PendingApprovals";
import { UserManagementTable } from "@/components/admin/UserManagementTable";
import { mockStats, mockActivities, mockPendingApprovals, mockUsers } from "@/data/admin";

export function AdminDashboardPage() {
  const [approvals, setApprovals] = useState(mockPendingApprovals);

  const handleApprove = (id: string) => {
    setApprovals((prev) => prev.filter((a) => a.id !== id));
    console.log("Approve:", id);
  };

  const handleReject = (id: string) => {
    setApprovals((prev) => prev.filter((a) => a.id !== id));
    console.log("Reject:", id);
  };

  return (
    <>
      {/* Stats Grid */}
      <section className="mb-8">
        <StatsGrid stats={mockStats} />
      </section>

      {/* Activity and Pending Approvals */}
      <section className="mb-8 grid gap-6 lg:grid-cols-2">
        <ActivityFeed activities={mockActivities} />
        <PendingApprovals
          approvals={approvals}
          onApprove={handleApprove}
          onReject={handleReject}
          onViewDetails={(id) => console.log("View details:", id)}
        />
      </section>

      {/* User Management Table */}
      <section>
        <UserManagementTable
          users={mockUsers}
          onEdit={(user) => console.log("Edit:", user)}
          onDisable={(id) => console.log("Disable:", id)}
        />
      </section>
    </>
  );
}
