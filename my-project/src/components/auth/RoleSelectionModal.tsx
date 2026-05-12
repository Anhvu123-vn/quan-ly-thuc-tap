import { useState } from "react";
import { GraduationCap, Building2, Users, Shield, ArrowRight, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import type { UserRole } from "@/types";

const roleOptions: {
  value: UserRole;
  label: string;
  description: string;
  icon: typeof GraduationCap;
  color: string;
}[] = [
  {
    value: "student",
    label: "Student",
    description: "Find internship opportunities and track your applications",
    icon: GraduationCap,
    color: "from-indigo-500 to-violet-600",
  },
  {
    value: "lecturer",
    label: "Lecturer",
    description: "Supervise and approve student internship applications",
    icon: Users,
    color: "from-emerald-500 to-teal-600",
  },
  {
    value: "company",
    label: "Company",
    description: "Post internships and manage applications from students",
    icon: Building2,
    color: "from-amber-500 to-orange-600",
  },
  {
    value: "admin",
    label: "Administrator",
    description: "Manage users, system settings, and oversee the platform",
    icon: Shield,
    color: "from-slate-600 to-slate-800",
  },
];

export function RoleSelectionModal() {
  const { needsRole, updateRole, isLoading } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!selectedRole) return;
    
    setError(null);
    
    try {
      await updateRole(selectedRole);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update role");
    }
  };

  // Don't show modal if user already has a role
  if (!needsRole) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-lg mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-600 px-6 py-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">
              Welcome! Select Your Role
            </h2>
            <p className="text-indigo-100 text-sm">
              Choose a role that best describes you to personalize your experience
            </p>
          </div>

          {/* Role Selection Grid */}
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {roleOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = selectedRole === option.value;

                return (
                  <motion.button
                    key={option.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedRole(option.value)}
                    className={cn(
                      "relative flex flex-col items-start p-4 rounded-xl border-2 transition-all duration-200 text-left",
                      isSelected
                        ? "border-indigo-500 bg-indigo-50 shadow-lg shadow-indigo-500/20"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md"
                    )}
                  >
                    {/* Selection indicator */}
                    <div
                      className={cn(
                        "absolute top-3 right-3 h-6 w-6 rounded-full flex items-center justify-center transition-all duration-200",
                        isSelected
                          ? "bg-indigo-500 text-white"
                          : "bg-slate-100"
                      )}
                    >
                      {isSelected ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <span className="h-2 w-2 rounded-full bg-slate-300" />
                      )}
                    </div>

                    {/* Icon */}
                    <div
                      className={cn(
                        "h-10 w-10 rounded-xl flex items-center justify-center mb-3 bg-gradient-to-br",
                        option.color,
                        !isSelected && "opacity-60"
                      )}
                    >
                      <Icon className="h-5 w-5 text-white" />
                    </div>

                    {/* Content */}
                    <h3 className={cn(
                      "font-semibold mb-1",
                      isSelected ? "text-indigo-700" : "text-slate-900"
                    )}>
                      {option.label}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {option.description}
                    </p>
                  </motion.button>
                );
              })}
            </div>

            {/* Error message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Submit button */}
            <Button
              onClick={handleSubmit}
              disabled={!selectedRole || isLoading}
              className={cn(
                "w-full h-12 text-base font-medium rounded-xl transition-all duration-200",
                selectedRole
                  ? "bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 shadow-lg shadow-indigo-500/25"
                  : "bg-slate-200 text-slate-400"
              )}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Updating...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Continue as {selectedRole ? roleOptions.find(r => r.value === selectedRole)?.label : "..."}
                  <ArrowRight className="h-5 w-5" />
                </span>
              )}
            </Button>

            {/* Skip option */}
            <p className="mt-4 text-center text-xs text-slate-400">
              You can change your role later in Settings
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
