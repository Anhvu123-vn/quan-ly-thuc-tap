import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ("student" | "admin" | "lecturer" | "company")[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="relative">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
            <div className="absolute inset-0 h-10 w-10 animate-ping rounded-full bg-indigo-500/20" />
          </div>
          <p className="text-sm text-slate-500">Loading...</p>
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access if specified
  if (allowedRoles && user && user.role && !allowedRoles.includes(user.role as string)) {
    const roleRedirects: Record<string, string> = {
      student: "/student",
      lecturer: "/lecturer",
      company: "/company",
      admin: "/admin",
    };

    const redirectPath = roleRedirects[user.role] || "/positions";
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
}
