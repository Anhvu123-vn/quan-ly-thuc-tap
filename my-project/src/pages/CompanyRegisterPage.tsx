import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Building2, Mail, Lock, User, Phone, MapPin, Globe, Loader2, AlertCircle, CheckCircle2, Sparkles, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/services/api";

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  department: string;
  website: string;
  address: string;
}

export function CompanyRegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"form" | "success">("form");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [serverError, setServerError] = useState("");

  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    department: "",
    website: "",
    address: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    setServerError("");
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Tên công ty là bắt buộc";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Tên công ty phải có ít nhất 2 ký tự";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email là bắt buộc";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (!formData.password) {
      newErrors.password = "Mật khẩu là bắt buộc";
    } else if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Số điện thoại là bắt buộc";
    } else if (!/^[0-9+\-\s]{8,15}$/.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }

    if (!formData.department.trim()) {
      newErrors.department = "Lĩnh vực hoạt động là bắt buộc";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setServerError("");

    try {
      await api.register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: "company",
        phone: formData.phone.trim(),
        department: formData.department.trim(),
      });
      setStep("success");
    } catch (err: any) {
      setServerError(
        err.message || "Đăng ký thất bại. Vui lòng thử lại."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (step === "success") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50/30 to-violet-50/30 p-4">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-emerald-500/10 to-teal-500/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-br from-teal-500/10 to-emerald-500/10 blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative w-full max-w-md"
        >
          <Card className="border-slate-200/50 shadow-2xl shadow-slate-200/50 rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 px-6 py-10 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm shadow-lg"
              >
                <CheckCircle2 className="h-8 w-8 text-white" />
              </motion.div>
              <CardTitle className="text-2xl font-bold text-white">Đăng ký thành công!</CardTitle>
              <CardDescription className="text-emerald-100 mt-2 text-base">
                Cảm ơn bạn đã đăng ký
              </CardDescription>
            </div>

            <CardContent className="p-6 space-y-4">
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                  <div className="text-sm">
                    <p className="font-semibold text-amber-800">Tài khoản đang chờ phê duyệt</p>
                    <p className="text-amber-700 mt-1">
                      Tài khoản của bạn đã được tạo nhưng chưa được kích hoạt. Vui lòng chờ quản trị viên phê duyệt trước khi đăng nhập.
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-sm text-slate-500 text-center">
                Bạn sẽ nhận được email thông báo khi tài khoản được phê duyệt.
              </p>

              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => navigate("/login")}
                  className="w-full h-11 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 shadow-lg shadow-indigo-500/25 font-medium"
                >
                  Quay lại trang đăng nhập
                </Button>
                <p className="text-center text-sm text-slate-400">
                  <Link to="/register" className="hover:text-indigo-500 transition-colors">
                    ← Đăng ký tài khoản khác
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50/30 to-violet-50/30 p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-indigo-500/10 to-violet-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-br from-violet-500/10 to-indigo-500/10 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-2xl"
      >
        <Card className="border-slate-200/50 shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-600 px-6 py-8 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm shadow-lg">
              <Building2 className="h-7 w-7 text-white" />
            </div>
            <CardTitle className="text-xl font-bold text-white">Đăng ký tài khoản Doanh nghiệp</CardTitle>
            <CardDescription className="text-indigo-100 mt-1">
              Tham gia cùng hệ thống quản lý thực tập
            </CardDescription>
          </div>

          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {serverError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-600 border border-red-100"
                  role="alert"
                >
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {serverError}
                </motion.div>
              )}

              {/* Company Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-700 font-medium">
                  Tên công ty <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Công ty TNHH ABC"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={isLoading}
                    className={`pl-10 rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 ${
                      errors.name ? "border-red-400 focus:border-red-500 focus:ring-red-500/20" : ""
                    }`}
                  />
                </div>
                {errors.name && (
                  <p className="text-xs text-red-500 mt-1">{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 font-medium">
                  Email công ty <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="hr@company.com"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                    disabled={isLoading}
                    className={`pl-10 rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 ${
                      errors.email ? "border-red-400 focus:border-red-500 focus:ring-red-500/20" : ""
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                )}
              </div>

              {/* Password + Confirm */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-700 font-medium">
                    Mật khẩu <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Ít nhất 6 ký tự"
                      value={formData.password}
                      onChange={handleChange}
                      autoComplete="new-password"
                      disabled={isLoading}
                      className={`pl-10 rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 ${
                        errors.password ? "border-red-400 focus:border-red-500 focus:ring-red-500/20" : ""
                      }`}
                    />
                  </div>
                  {errors.password && (
                    <p className="text-xs text-red-500 mt-1">{errors.password}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-slate-700 font-medium">
                    Xác nhận mật khẩu <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="Nhập lại mật khẩu"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      autoComplete="new-password"
                      disabled={isLoading}
                      className={`pl-10 rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 ${
                        errors.confirmPassword ? "border-red-400 focus:border-red-500 focus:ring-red-500/20" : ""
                      }`}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>

              {/* Phone + Field */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-slate-700 font-medium">
                    Số điện thoại <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="0123 456 789"
                      value={formData.phone}
                      onChange={handleChange}
                      autoComplete="tel"
                      disabled={isLoading}
                      className={`pl-10 rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 ${
                        errors.phone ? "border-red-400 focus:border-red-500 focus:ring-red-500/20" : ""
                      }`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department" className="text-slate-700 font-medium">
                    Lĩnh vực hoạt động <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <Input
                      id="department"
                      name="department"
                      type="text"
                      placeholder="Công nghệ thông tin"
                      value={formData.department}
                      onChange={handleChange}
                      disabled={isLoading}
                      className={`pl-10 rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 ${
                        errors.department ? "border-red-400 focus:border-red-500 focus:ring-red-500/20" : ""
                      }`}
                    />
                  </div>
                  {errors.department && (
                    <p className="text-xs text-red-500 mt-1">{errors.department}</p>
                  )}
                </div>
              </div>

              {/* Website + Address */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="website" className="text-slate-700 font-medium">
                    Website
                  </Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <Input
                      id="website"
                      name="website"
                      type="url"
                      placeholder="https://company.com"
                      value={formData.website}
                      onChange={handleChange}
                      autoComplete="url"
                      disabled={isLoading}
                      className="pl-10 rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="text-slate-700 font-medium">
                    Địa chỉ
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <Input
                      id="address"
                      name="address"
                      type="text"
                      placeholder="TP. Hồ Chí Minh"
                      value={formData.address}
                      onChange={handleChange}
                      autoComplete="street-address"
                      disabled={isLoading}
                      className="pl-10 rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>
              </div>

              {/* Notice */}
              <div className="rounded-xl bg-blue-50 border border-blue-200 p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                  <p className="text-xs text-blue-700">
                    Sau khi đăng ký, tài khoản của bạn sẽ ở trạng thái <strong>chờ phê duyệt</strong>. Quản trị viên sẽ xem xét và kích hoạt tài khoản trong thời gian sớm nhất.
                  </p>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 shadow-lg shadow-indigo-500/25 font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang đăng ký...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Đăng ký tài khoản Doanh nghiệp
                  </>
                )}
              </Button>

              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="flex items-center gap-1 text-slate-500 hover:text-indigo-600 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Đã có tài khoản? Đăng nhập
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
