import { useState, createContext } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { cn } from "@/lib/utils";

export { useSidebar } from "./DashboardShell";

// Sidebar context
interface SidebarContextType {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType>({
  isCollapsed: false,
  toggleSidebar: () => {},
});

export { SidebarContext };

// Main layout - Sidebar stays mounted, only Outlet content changes
export function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

  return (
    <SidebarContext.Provider value={{ isCollapsed: sidebarCollapsed, toggleSidebar }}>
      <div className="min-h-screen bg-[--color-background]">
        {/* Sidebar */}
        <Sidebar isCollapsed={sidebarCollapsed} onToggle={toggleSidebar} />

        {/* Main content area */}
        <div
          className={cn(
            "min-h-screen transition-all duration-300",
            sidebarCollapsed ? "lg:pl-20" : "lg:pl-64"
          )}
        >
          {/* Header with auto page title */}
          <Header />

          {/* Page content - rendered via Outlet */}
          <main id="main-content" className="p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarContext.Provider>
  );
}
