import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import type { User, UserRole } from "@/types";
import { 
  authLogin as trpcLogin, 
  authMe as trpcGetMe, 
  authLogout as trpcLogout,
  updateUserRole as trpcUpdateRole,
  needsRoleSelection
} from "@/lib/trpc";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  needsRole: boolean; // Chỉ true khi đã đăng nhập VÀ chưa có role
  sessionId: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateRole: (role: UserRole) => Promise<void>;
  refreshUser: () => Promise<void>;
  switchRole: (role: UserRole) => void; // DEV: chuyển role nhanh
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_KEY = "session_id";
const USER_KEY = "user_data";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  });
  const [sessionId, setSessionId] = useState<string | null>(() => {
    return localStorage.getItem(SESSION_KEY);
  });
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Check if user needs to select role - CHỈ khi đã đăng nhập VÀ chưa có role
  const isLoggedIn = !!user;
  const needsRole = isLoggedIn && needsRoleSelection(user);

  // On mount, try to restore session and fetch current user data
  useEffect(() => {
    const restoreSession = async () => {
      if (sessionId) {
        try {
          const currentUser = await trpcGetMe(sessionId);
          if (currentUser) {
            setUser(currentUser);
            localStorage.setItem(USER_KEY, JSON.stringify(currentUser));
          } else {
            // Session expired or invalid
            setSessionId(null);
            localStorage.removeItem(SESSION_KEY);
            localStorage.removeItem(USER_KEY);
          }
        } catch (error) {
          console.error("Failed to restore session:", error);
          setSessionId(null);
          localStorage.removeItem(SESSION_KEY);
          localStorage.removeItem(USER_KEY);
        }
      }
      setInitialLoading(false);
    };

    restoreSession();
  }, []);

  // Login with mock tRPC
  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      const result = await trpcLogin({ email, password });
      
      setUser(result.user);
      setSessionId(result.sessionId);
      
      localStorage.setItem(SESSION_KEY, result.sessionId);
      localStorage.setItem(USER_KEY, JSON.stringify(result.user));
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout with mock tRPC
  const logout = useCallback(async () => {
    setIsLoading(true);
    
    try {
      await trpcLogout(sessionId);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setSessionId(null);
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(USER_KEY);
      setIsLoading(false);
    }
  }, [sessionId]);

  // Update user role
  const updateRole = useCallback(async (role: UserRole) => {
    setIsLoading(true);
    
    try {
      const updatedUser = await trpcUpdateRole(sessionId, { role });
      
      setUser(updatedUser);
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  // Refresh user data from server
  const refreshUser = useCallback(async () => {
    if (!sessionId) return;

    try {
      const currentUser = await trpcGetMe(sessionId);
      if (currentUser) {
        setUser(currentUser);
        localStorage.setItem(USER_KEY, JSON.stringify(currentUser));
      }
    } catch (error) {
      console.error("Failed to refresh user:", error);
    }
  }, [sessionId]);

  // DEV ONLY: Switch role instantly for testing
  const switchRole = useCallback((role: UserRole) => {
    if (!user) return;
    const updatedUser = { ...user, role };
    setUser(updatedUser);
    localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading: isLoading || initialLoading,
        needsRole,
        sessionId,
        login,
        logout,
        updateRole,
        refreshUser,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
