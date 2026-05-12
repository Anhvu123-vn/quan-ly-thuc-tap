import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: number | string;
}

export interface TabPanelProps {
  children: React.ReactNode;
  className?: string;
}

export function TabPanel({ children, className }: TabPanelProps) {
  return <div className={cn("pt-4", className)}>{children}</div>;
}

export interface TabItemProps {
  tab: Tab;
  isActive: boolean;
  onClick: () => void;
}

function TabItem({ tab, isActive, onClick }: TabItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative px-4 py-2.5 text-sm font-medium transition-colors rounded-lg",
        isActive
          ? "text-indigo-600"
          : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
      )}
    >
      <span className="flex items-center gap-2">
        {tab.icon}
        {tab.label}
        {tab.badge !== undefined && (
          <span
            className={cn(
              "px-1.5 py-0.5 text-xs rounded-full font-medium",
              isActive
                ? "bg-indigo-100 text-indigo-600"
                : "bg-slate-100 text-slate-500"
            )}
          >
            {tab.badge}
          </span>
        )}
      </span>
      {isActive && (
        <motion.div
          layoutId="activeTab"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full"
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      )}
    </button>
  );
}

export interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  children?: React.ReactNode;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, children, className }: TabsProps) {
  return (
    <div className={className}>
      {/* Tab List */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit">
        {tabs.map((tab) => (
          <TabItem
            key={tab.id}
            tab={tab}
            isActive={activeTab === tab.id}
            onClick={() => onChange(tab.id)}
          />
        ))}
      </div>

      {/* Tab Content */}
      {children}
    </div>
  );
}

// Simplified Tab for sidebar navigation
export interface NavTab {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: number | string;
  roles?: ("student" | "lecturer" | "company" | "admin")[];
}
