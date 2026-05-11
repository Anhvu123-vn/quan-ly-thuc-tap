import { useState } from "react";
import { motion } from "framer-motion";
import { User, Bell, Settings as SettingsIcon, Code, Eye, EyeOff, Camera, Sun, Moon, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/shared/Badge";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

export function SettingsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  return (
    <div className="max-w-3xl mx-auto">
      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-slate-100 rounded-xl p-1">
          <TabsTrigger value="account" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Tài khoản</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Tùy chỉnh</span>
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="system" className="flex items-center gap-2">
              <SettingsIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Hệ thống</span>
            </TabsTrigger>
          )}
          <TabsTrigger value="developer" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            <span className="hidden sm:inline">Dev Tools</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="mt-6">
          <AccountSettings />
        </TabsContent>

        <TabsContent value="preferences" className="mt-6">
          <PreferencesSettings />
        </TabsContent>

        {isAdmin && (
          <TabsContent value="system" className="mt-6">
            <SystemSettings />
          </TabsContent>
        )}

        <TabsContent value="developer" className="mt-6">
          <DeveloperTools />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ===== ACCOUNT TAB =====
function AccountSettings() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || "Trần Minh Đức");
  const [email, setEmail] = useState(user?.email || "minh.duc@example.com");
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <Card className="border-slate-200 rounded-xl">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5 text-indigo-500" />
            Thông tin tài khoản
          </CardTitle>
          <CardDescription>Quản lý thông tin cá nhân của bạn</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-20 w-20 ring-4 ring-indigo-100">
                <AvatarFallback className="text-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
                  TMD
                </AvatarFallback>
              </Avatar>
              <button className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center hover:bg-slate-50 transition-colors">
                <Camera className="h-4 w-4 text-slate-600" />
              </button>
            </div>
            <div>
              <p className="font-medium text-slate-900">{name}</p>
              <p className="text-sm text-slate-500">Ảnh đại diện</p>
            </div>
          </div>

          {/* Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Họ và tên</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-lg border-slate-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-lg border-slate-200"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 rounded-xl">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <SettingsIcon className="h-5 w-5 text-indigo-500" />
            Bảo mật
          </CardTitle>
          <CardDescription>Quản lý mật khẩu và bảo mật tài khoản</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Mật khẩu hiện tại</label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                defaultValue="••••••••"
                className="rounded-lg border-slate-200 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Mật khẩu mới</label>
              <Input type="password" placeholder="Nhập mật khẩu mới" className="rounded-lg border-slate-200" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Xác nhận mật khẩu</label>
              <Input type="password" placeholder="Nhập lại mật khẩu" className="rounded-lg border-slate-200" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 rounded-lg"
        >
          {saving ? "Đang lưu..." : "Lưu thay đổi"}
        </Button>
      </div>
    </div>
  );
}

// ===== PREFERENCES TAB =====
function PreferencesSettings() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [inAppNotifications, setInAppNotifications] = useState(true);
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light");

  const themeOptions = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ] as const;

  return (
    <div className="space-y-6">
      <Card className="border-slate-200 rounded-xl">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="h-5 w-5 text-indigo-500" />
            Thông báo
          </CardTitle>
          <CardDescription>Quản lý cách bạn nhận thông báo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900">Thông báo qua Email</p>
              <p className="text-sm text-slate-500">Nhận email khi có cập nhật quan trọng</p>
            </div>
            <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
          </div>
          <div className="border-t border-slate-100" />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900">Thông báo In-App</p>
              <p className="text-sm text-slate-500">Hiển thị thông báo trên ứng dụng</p>
            </div>
            <Switch checked={inAppNotifications} onCheckedChange={setInAppNotifications} />
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 rounded-xl">
        <CardHeader>
          <CardTitle className="text-lg">Giao diện</CardTitle>
          <CardDescription>Chọn giao diện phù hợp với bạn</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {themeOptions.map((option) => {
              const Icon = option.icon;
              const isActive = theme === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setTheme(option.value)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                    isActive ? "border-indigo-500 bg-indigo-50" : "border-slate-200 hover:border-slate-300"
                  )}
                >
                  <div className={cn(
                    "h-10 w-10 rounded-xl flex items-center justify-center",
                    isActive ? "bg-indigo-500 text-white" : "bg-slate-100 text-slate-600"
                  )}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className={cn(
                    "text-sm font-medium",
                    isActive ? "text-indigo-700" : "text-slate-600"
                  )}>
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 rounded-xl">
        <CardHeader>
          <CardTitle className="text-lg">Ngôn ngữ</CardTitle>
          <CardDescription>Chọn ngôn ngữ hiển thị</CardDescription>
        </CardHeader>
        <CardContent>
          <select className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option>Tiếng Việt</option>
            <option>English</option>
          </select>
        </CardContent>
      </Card>
    </div>
  );
}

// ===== SYSTEM TAB (Admin only) =====
function SystemSettings() {
  const [allowRegistration, setAllowRegistration] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  return (
    <div className="space-y-6">
      <Card className="border-slate-200 rounded-xl">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <SettingsIcon className="h-5 w-5 text-red-500" />
            Quản trị hệ thống
          </CardTitle>
          <CardDescription>Các cài đặt dành riêng cho quản trị viên</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900">Mở đăng ký Doanh nghiệp</p>
              <p className="text-sm text-slate-500">Cho phép doanh nghiệp mới đăng ký tài khoản</p>
            </div>
            <Switch checked={allowRegistration} onCheckedChange={setAllowRegistration} />
          </div>
          <div className="border-t border-slate-100" />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900">Chế độ bảo trì</p>
              <p className="text-sm text-slate-500">Tạm khóa hệ thống để bảo trì</p>
            </div>
            <Switch checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />
          </div>
          {maintenanceMode && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="p-4 bg-amber-50 border border-amber-200 rounded-xl"
            >
              <p className="text-sm text-amber-800">
                Hệ thống đang trong chế độ bảo trì. Người dùng sẽ thấy trang thông báo khi truy cập.
              </p>
            </motion.div>
          )}
        </CardContent>
      </Card>

      <Card className="border-slate-200 rounded-xl">
        <CardHeader>
          <CardTitle className="text-lg">Cấu hình email</CardTitle>
          <CardDescription>Thiết lập SMTP để gửi email tự động</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">SMTP Server</label>
            <Input placeholder="smtp.gmail.com" className="rounded-lg border-slate-200" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Port</label>
              <Input placeholder="587" className="rounded-lg border-slate-200" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Username</label>
              <Input placeholder="your@email.com" className="rounded-lg border-slate-200" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline" className="rounded-lg">Gửi email test</Button>
        <Button className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 rounded-lg">
          Lưu cấu hình
        </Button>
      </div>
    </div>
  );
}

// ===== DEVELOPER TOOLS TAB =====
const roleOptions = [
  { value: "student", label: "Sinh viên", color: "bg-blue-500", description: "Truy cập e-Portfolio, Nhật ký 360, Lộ trình" },
  { value: "lecturer", label: "Giảng viên", color: "bg-violet-500", description: "Phê duyệt, Feedback Hub, Chấm điểm" },
  { value: "company", label: "Doanh nghiệp", color: "bg-amber-500", description: "Quản lý tuyển dụng, Xem ứng viên, Đánh giá 360" },
  { value: "admin", label: "Quản trị", color: "bg-red-500", description: "Quản lý người dùng, Analytics, System Logs" },
] as const;

function DeveloperTools() {
  const { user, switchRole } = useAuth();

  return (
    <div className="space-y-6">
      <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-violet-50 rounded-xl">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Code className="h-5 w-5 text-indigo-500" />
            Developer Tools
          </CardTitle>
          <CardDescription>
            Công cụ test dành cho developer. Chuyển đổi vai trò để xem giao diện tương ứng.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {roleOptions.map((role) => {
              const isActive = user?.role === role.value;
              return (
                <motion.button
                  key={role.value}
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => switchRole(role.value)}
                  className={cn(
                    "flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all",
                    isActive
                      ? "border-indigo-500 bg-white shadow-lg shadow-indigo-500/20"
                      : "border-slate-200 bg-white/80 hover:border-indigo-300"
                  )}
                >
                  <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center text-white shrink-0", role.color)}>
                    <User className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">{role.label}</span>
                      {isActive && <Badge variant="success">Active</Badge>}
                    </div>
                    <p className="text-sm text-slate-500 mt-1">{role.description}</p>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Current User Info */}
      <Card className="border-slate-200 rounded-xl">
        <CardHeader>
          <CardTitle className="text-lg">Current Mock User</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-500">Name:</span>
              <span className="ml-2 font-medium text-slate-900">{user?.name}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-500">Email:</span>
              <span className="ml-2 font-medium text-slate-900">{user?.email}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-500">Role:</span>
              <span className="ml-2 font-medium text-slate-900 capitalize">{user?.role}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-500">User ID:</span>
              <span className="ml-2 font-medium text-slate-900">{user?.id}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
