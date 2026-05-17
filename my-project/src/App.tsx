import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { LoginPage } from "@/pages/Login";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { PositionsPage } from "@/pages/PositionsPage";
import { PositionDetailPage } from "@/pages/PositionDetailPage";
import { ApprovalTimelineDemo } from "@/pages/ApprovalTimelineDemo";
import { ApplicationDetailPage } from "@/pages/ApplicationDetailPage";
import { ApplicationFormPage } from "@/pages/ApplicationFormPage";
import { RoleSelectionModal } from "@/components/auth/RoleSelectionModal";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

// Import all page components
import { StudentDashboardPage } from "@/pages/StudentDashboard";
import { StudentProfilePage } from "@/pages/student/StudentProfilePage";
import { StudentJournalPage } from "@/pages/student/StudentJournalPage";
import { StudentRoadmapPage } from "@/pages/student/StudentRoadmapPage";
import { LecturerDashboardPage } from "@/pages/lecturer/LecturerDashboardPage";
import { LecturerApprovalPage } from "@/pages/lecturer/LecturerApprovalPage";
import { LecturerFeedbackPage } from "@/pages/lecturer/LecturerFeedbackPage";
import { LecturerEvaluationPage } from "@/pages/lecturer/LecturerEvaluationPage";
import { CompanyDashboardPage } from "@/pages/company/CompanyDashboardPage";
import { CompanyJobManagerPage } from "@/pages/company/CompanyJobManagerPage";
import { CompanyCandidateReviewPage } from "@/pages/company/CompanyCandidateReviewPage";
import { CompanyEvaluation360Page } from "@/pages/company/CompanyEvaluation360Page";
import { AdminDashboardPage } from "@/pages/AdminDashboard";
import { AdminUserManagementPage } from "@/pages/admin/AdminUserManagementPage";
import { AdminAnalyticsPage } from "@/pages/admin/AdminAnalyticsPage";
import { AdminSystemLogsPage } from "@/pages/admin/AdminSystemLogsPage";
import { SettingsPage } from "@/pages/Settings";

// Default route: goes to login if unauthenticated, else to role-based dashboard
function DefaultRoute() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
          <p className="text-sm text-slate-500">Loading...</p>
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const roleRedirects: Record<string, string> = {
    student: "/student",
    lecturer: "/lecturer",
    company: "/company",
    admin: "/admin",
  };

  const redirectPath = user?.role ? (roleRedirects[user.role] || "/positions") : "/positions";
  return <Navigate to={redirectPath} replace />;
}

// Wildcard fallback route
function CatchAllRoute() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
          <p className="text-sm text-slate-500">Loading...</p>
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const roleRedirects: Record<string, string> = {
    student: "/student",
    lecturer: "/lecturer",
    company: "/company",
    admin: "/admin",
  };

  const redirectPath = user?.role ? (roleRedirects[user.role] || "/positions") : "/positions";
  return <Navigate to={redirectPath} replace />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ===== PUBLIC ROUTES ===== */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/approval-demo" element={<ApprovalTimelineDemo />} />

          {/* ===== PROTECTED ROUTES - wrapped in DashboardLayout ===== */}
          <Route element={<DashboardLayout />}>
            {/* Vị trí thực tập */}
            <Route path="/positions" element={<PositionsPage />} />
            <Route path="/positions/:id" element={<PositionDetailPage />} />

            {/* Apply for position */}
            <Route
              path="/apply/:positionId"
              element={
                <ProtectedRoute>
                  <ApplicationFormPage />
                </ProtectedRoute>
              }
            />

            {/* ===== STUDENT ROUTES ===== */}
            <Route path="/student" element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentDashboardPage />
              </ProtectedRoute>
            } />
            <Route path="/student/profile" element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/student/:studentId/profile" element={
              <ProtectedRoute allowedRoles={["company", "lecturer", "admin"]}>
                <StudentProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/student/journal" element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentJournalPage />
              </ProtectedRoute>
            } />
            <Route path="/student/roadmap" element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentRoadmapPage />
              </ProtectedRoute>
            } />

            {/* ===== LECTURER ROUTES ===== */}
            <Route path="/lecturer" element={
              <ProtectedRoute allowedRoles={["lecturer", "admin"]}>
                <LecturerDashboardPage />
              </ProtectedRoute>
            } />
            <Route path="/lecturer/dashboard" element={
              <ProtectedRoute allowedRoles={["lecturer", "admin"]}>
                <LecturerDashboardPage />
              </ProtectedRoute>
            } />
            <Route path="/lecturer/approval" element={
              <ProtectedRoute allowedRoles={["lecturer", "admin"]}>
                <LecturerApprovalPage />
              </ProtectedRoute>
            } />
            <Route path="/lecturer/feedback" element={
              <ProtectedRoute allowedRoles={["lecturer", "admin"]}>
                <LecturerFeedbackPage />
              </ProtectedRoute>
            } />
            <Route path="/lecturer/evaluation" element={
              <ProtectedRoute allowedRoles={["lecturer", "admin"]}>
                <LecturerEvaluationPage />
              </ProtectedRoute>
            } />

            {/* ===== COMPANY ROUTES ===== */}
            <Route path="/company" element={
              <ProtectedRoute allowedRoles={["company"]}>
                <CompanyDashboardPage />
              </ProtectedRoute>
            } />
            <Route path="/company/dashboard" element={
              <ProtectedRoute allowedRoles={["company"]}>
                <CompanyDashboardPage />
              </ProtectedRoute>
            } />
            <Route path="/company/jobs" element={
              <ProtectedRoute allowedRoles={["company"]}>
                <CompanyJobManagerPage />
              </ProtectedRoute>
            } />
            <Route path="/company/candidates" element={
              <ProtectedRoute allowedRoles={["company"]}>
                <CompanyCandidateReviewPage />
              </ProtectedRoute>
            } />
            <Route path="/company/evaluation" element={
              <ProtectedRoute allowedRoles={["company"]}>
                <CompanyEvaluation360Page />
              </ProtectedRoute>
            } />

            {/* ===== ADMIN ROUTES ===== */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboardPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminUserManagementPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/analytics" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminAnalyticsPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/logs" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminSystemLogsPage />
              </ProtectedRoute>
            } />

            {/* ===== SHARED ROUTES ===== */}
            <Route path="/applications/:id" element={
              <ProtectedRoute>
                <ApplicationDetailPage />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            } />
          </Route>

          {/* ===== DEFAULT - redirect based on auth state ===== */}
          <Route path="/" element={<DefaultRoute />} />
          <Route path="*" element={<CatchAllRoute />} />
        </Routes>
        <RoleSelectionModal />
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
