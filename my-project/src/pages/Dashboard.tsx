import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DollarSign, ShoppingCart, TrendingUp } from "lucide-react";

const stats = [
  { title: "Total Users", value: "2,847", change: "+12%", icon: Users },
  { title: "Revenue", value: "$48,294", change: "+8.1%", icon: DollarSign },
  { title: "Orders", value: "1,284", change: "+23%", icon: ShoppingCart },
  { title: "Growth", value: "+18.4%", change: "+4.2%", icon: TrendingUp },
];

const recentActivity = [
  { id: 1, action: "New user registered", time: "2 minutes ago", user: "john@example.com" },
  { id: 2, action: "Order completed", time: "15 minutes ago", user: "Order #1234" },
  { id: 3, action: "Payment received", time: "1 hour ago", user: "$299.00" },
  { id: 4, action: "New subscription", time: "3 hours ago", user: "pro@example.com" },
];

export function DashboardPage() {
  const { user } = useAuth();

  return (
    <>
      {/* Welcome */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold">
          Welcome back, {user?.name || "User"}
        </h2>
        <p className="text-slate-500">
          Here is what is happening with your projects today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-slate-400" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-emerald-600">{stat.change} from last month</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((item) => (
              <div key={item.id} className="flex items-center gap-4">
                <div className="h-2 w-2 rounded-full bg-indigo-500" aria-hidden="true" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{item.action}</p>
                  <p className="text-xs text-slate-500 truncate">
                    {item.user}
                  </p>
                </div>
                <span className="text-xs text-slate-400">{item.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
