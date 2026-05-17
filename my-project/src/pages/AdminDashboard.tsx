import { useState, useEffect } from "react";
import { StatsGrid } from "@/components/admin/StatsCard";
import { ActivityFeed } from "@/components/admin/ActivityFeed";
import { PendingApprovals } from "@/components/admin/PendingApprovals";
import { UserManagementTable } from "@/components/admin/UserManagementTable";
import { api } from "@/services/api";
import { Loader2 } from "lucide-react";

interface Stat {
  title: string;
  value: number;
  change?: number;
  changeType?: "increase" | "decrease";
  icon: string;
  color: string;
}

interface Activity {
  id: string;
  type: string;
  user: string;
  action: string;
  target: string;
  time: string;
}

interface Approval {
  id: string;
  type: string;
  user: string;
  userEmail: string;
  target: string;
  requestDate: string;
  description: string;
}

export function AdminDashboardPage() {
  const [stats, setStats] = useState<Stat[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch user stats from public endpoint
      const statsResponse = await fetch('/users/stats');
      const statsData = await statsResponse.json();
      
      if (statsData.success && statsData.data) {
        const { total, students, lecturers, companies, admins } = statsData.data;
        setStats([
          { title: "Tổng người dùng", value: total, icon: "users", color: "indigo" },
          { title: "Sinh viên", value: students, icon: "graduation", color: "blue" },
          { title: "Giảng viên", value: lecturers, icon: "lecturer", color: "purple" },
          { title: "Doanh nghiệp", value: companies, icon: "building", color: "amber" },
        ]);
      }

      // Fetch users for table (requires auth)
      try {
        const usersResponse = await api.getUsers({ limit: 10 });
        const allUsers = usersResponse.data || usersResponse || [];
        setUsers(allUsers);
        
        // Generate activities from users
        setActivities(
          allUsers.slice(0, 5).map((u: any, i: number) => ({
            id: String(i + 1),
            type: "user",
            user: u.name || u.email,
            action: "đã tham gia hệ thống",
            target: u.role,
            time: u.createdAt ? new Date(u.createdAt).toLocaleDateString("vi-VN") : "Gần đây",
          }))
        );

        // Get pending approvals (both users and positions)
        try {
          const approvalsResponse = await api.getMyPendingApprovals();
          const pendingApprovals = approvalsResponse?.data || approvalsResponse || [];
          
          setApprovals(
            pendingApprovals.slice(0, 5).map((item: any) => {
              // Position approval
              if (item.positionId) {
                return {
                  id: item.id,
                  type: "position",
                  user: item.company?.name || "Doanh nghiệp",
                  userEmail: undefined,
                  target: "position",
                  requestDate: item.createdAt,
                  description: `Yêu cầu duyệt vị trí: ${item.position?.title || "Không rõ"}`,
                };
              }
              // User approval
              return {
                id: item.id,
                type: "user",
                user: item.student?.name || item.user?.name || "Người dùng mới",
                userEmail: item.student?.email || item.user?.email,
                target: item.student?.role || item.user?.role,
                requestDate: item.createdAt,
                description: `Yêu cầu xác minh tài khoản ${item.student?.role === "company" ? "doanh nghiệp" : "người dùng"}`,
              };
            })
          );
        } catch {
          console.log("Could not fetch approvals");
        }
      } catch {
        console.log("Could not fetch users - requires authentication");
        setUsers([]);
      }

    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      setStats([
        { title: "Tổng người dùng", value: 0, icon: "users", color: "indigo" },
        { title: "Sinh viên", value: 0, icon: "graduation", color: "blue" },
        { title: "Giảng viên", value: 0, icon: "lecturer", color: "purple" },
        { title: "Doanh nghiệp", value: 0, icon: "building", color: "amber" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await api.reviewApproval(id, { status: 'approved' });
      setApprovals((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error("Failed to approve:", err);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await api.reviewApproval(id, { status: 'rejected' });
      setApprovals((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error("Failed to reject:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <>
      {/* Stats Grid */}
      <section className="mb-8">
        <StatsGrid stats={stats} />
      </section>

      {/* Activity and Pending Approvals */}
      <section className="mb-8 grid gap-6 lg:grid-cols-2">
        <ActivityFeed activities={activities} />
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
          users={users}
          onEdit={(user) => console.log("Edit:", user)}
          onDisable={(id) => console.log("Disable:", id)}
        />
      </section>
    </>
  );
}
