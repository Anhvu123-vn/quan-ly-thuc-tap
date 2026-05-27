import { useState, createContext, useContext } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { MainContent } from "./MainContent";
import { cn } from "@/lib/utils";

// Sidebar context for global state
interface SidebarContextType {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType>({
  isCollapsed: false,
  toggleSidebar: () => {},
});

export const useSidebar = () => useContext(SidebarContext);

interface DashboardShellProps {
  children: React.ReactNode;
  title?: string;
}

export function DashboardShell({ children, title }: DashboardShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

  return (
    <SidebarContext.Provider value={{ isCollapsed: sidebarCollapsed, toggleSidebar }}>
      <div className="min-h-screen bg-[--color-background]">
        {/* Skip to content link */}
        <a href="#main-content" className="skip-to-content">
          Skip to main content
        </a>

        <Sidebar isCollapsed={sidebarCollapsed} onToggle={toggleSidebar} />

        {/* Main area with header offset - adjusts based on sidebar state */}
        <div
          className={cn(
            "transition-all duration-300",
            sidebarCollapsed ? "lg:pl-20" : "lg:pl-64"
          )}
        >
          <Header />
          <MainContent>{children}</MainContent>
        </div>
      </div>
    </SidebarContext.Provider>
  );
}
