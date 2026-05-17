import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { api } from "@/services/api";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  phone?: string;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_KEY = "user_data";
const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  });
  const [accessToken, setAccessToken] = useState<string | null>(() => {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  });
  const [refreshToken, setRefreshToken] = useState<string | null>(() => {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  });
  const [isLoading, setIsLoading] = useState(false);

  // Set API token when accessToken changes
  useEffect(() => {
    if (accessToken) {
      api.setToken(accessToken);
    }
  }, [accessToken]);

  // On mount, try to restore session and fetch current user data
  useEffect(() => {
    const restoreSession = async () => {
      // Wait for token to be available
      if (!accessToken) return;
      
      setIsLoading(true);
      
      try {
        // Ensure token is set before making API call
        api.setToken(accessToken);
        const currentUser = await api.getProfile();
        setUser(currentUser);
        localStorage.setItem(USER_KEY, JSON.stringify(currentUser));
      } catch (error) {
        console.error("Failed to restore session:", error);
        // Token might be expired, try to refresh
        if (refreshToken) {
          try {
            const tokens = await api.refreshToken(refreshToken);
            setAccessToken(tokens.accessToken);
            setRefreshToken(tokens.refreshToken);
            localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
            localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
            api.setToken(tokens.accessToken);
            const currentUser = await api.getProfile();
            setUser(currentUser);
            localStorage.setItem(USER_KEY, JSON.stringify(currentUser));
          } catch {
            // Refresh failed, clear session
            setAccessToken(null);
            setRefreshToken(null);
            setUser(null);
            localStorage.removeItem(ACCESS_TOKEN_KEY);
            localStorage.removeItem(REFRESH_TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
            api.setToken(null);
          }
        } else {
          setAccessToken(null);
          setRefreshToken(null);
          setUser(null);
          localStorage.removeItem(ACCESS_TOKEN_KEY);
          localStorage.removeItem(REFRESH_TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          api.setToken(null);
        }
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, [accessToken, refreshToken]);

  // Login
  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      const result = await api.login(email, password);
      
      setUser(result.user);
      setAccessToken(result.accessToken);
      setRefreshToken(result.refreshToken);
      
      localStorage.setItem(USER_KEY, JSON.stringify(result.user));
      localStorage.setItem(ACCESS_TOKEN_KEY, result.accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, result.refreshToken);
      
      api.setToken(result.accessToken);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    setIsLoading(true);
    
    try {
      if (refreshToken) {
        await api.logout(refreshToken);
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setAccessToken(null);
      setRefreshToken(null);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      api.setToken(null);
      setIsLoading(false);
    }
  }, [refreshToken]);

  // Refresh user data from server
  const refreshUser = useCallback(async () => {
    if (!accessToken) return;

    try {
      const currentUser = await api.getProfile();
      setUser(currentUser);
      localStorage.setItem(USER_KEY, JSON.stringify(currentUser));
    } catch (error) {
      console.error("Failed to refresh user:", error);
    }
  }, [accessToken]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        refreshUser,
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
