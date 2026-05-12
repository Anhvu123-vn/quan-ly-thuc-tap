import { useState } from "react";
import { FileText, ListChecks, Gift, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Position } from "@/types";

interface PositionTabsProps {
  position: Position;
}

type TabId = 'description' | 'requirements' | 'benefits' | 'company';

interface Tab {
  id: TabId;
  label: string;
  icon: typeof FileText;
}

const tabs: Tab[] = [
  { id: 'description', label: 'Description', icon: FileText },
  { id: 'requirements', label: 'Requirements', icon: ListChecks },
  { id: 'benefits', label: 'Benefits', icon: Gift },
  { id: 'company', label: 'Company', icon: Building2 },
];

export function PositionTabs({ position }: PositionTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>('description');

  return (
    <div className="bg-white">
      {/* Tab navigation */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav className="flex gap-1 border-b border-[--color-border]" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "border-[--color-accent] text-[--color-accent]"
                  : "border-transparent text-[--color-muted-foreground] hover:text-[--color-foreground]"
              )}
            >
              <tab.icon className="h-4 w-4" aria-hidden="true" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {activeTab === 'description' && (
          <div className="prose max-w-none">
            <h3 className="text-lg font-semibold mb-3">About this position</h3>
            <p className="text-[--color-muted-foreground] leading-relaxed whitespace-pre-line">
              {position.description}
            </p>
            <p className="mt-4 text-[--color-muted-foreground] leading-relaxed">
              As a member of our team, you will have the opportunity to work on real projects, 
              collaborate with experienced professionals, and develop your skills in a supportive environment.
            </p>
          </div>
        )}

        {activeTab === 'requirements' && (
          <div>
            <h3 className="text-lg font-semibold mb-3">What we're looking for</h3>
            <ul className="space-y-3">
              {position.requirements.map((req, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[--color-accent]" />
                  <span className="text-[--color-muted-foreground]">{req}</span>
                </li>
              ))}
              <li className="flex items-start gap-3">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[--color-accent]" />
                <span className="text-[--color-muted-foreground]">Strong communication skills in English</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[--color-accent]" />
                <span className="text-[--color-muted-foreground]">Ability to work independently and as part of a team</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[--color-accent]" />
                <span className="text-[--color-muted-foreground]">Eagerness to learn and grow</span>
              </li>
            </ul>
          </div>
        )}

        {activeTab === 'benefits' && (
          <div>
            <h3 className="text-lg font-semibold mb-3">What we offer</h3>
            <ul className="grid gap-4 sm:grid-cols-2">
              {[
                { icon: '💰', text: 'Competitive stipend' },
                { icon: '📚', text: 'Learning resources access' },
                { icon: '👥', text: 'Mentorship from senior professionals' },
                { icon: '🏢', text: 'Flexible work arrangements' },
                { icon: '🎓', text: 'Certificate upon completion' },
                { icon: '🍽️', text: 'Meals and transportation allowance' },
              ].map((benefit, index) => (
                <li key={index} className="flex items-center gap-3">
                  <span className="text-xl" role="img" aria-label={benefit.text}>{benefit.icon}</span>
                  <span className="text-[--color-muted-foreground]">{benefit.text}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === 'company' && (
          <div>
            <div className="flex items-start gap-4 mb-6">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-[--color-muted] text-lg font-bold text-[--color-muted-foreground]">
                {position.company.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-semibold">{position.company}</h3>
                <p className="text-[--color-muted-foreground]">Technology & Innovation</p>
              </div>
            </div>
            <p className="text-[--color-muted-foreground] leading-relaxed">
              {position.company} is a leading technology company focused on building innovative solutions. 
              We pride ourselves on fostering a culture of creativity, collaboration, and continuous learning. 
              Our team consists of passionate professionals who are dedicated to making a positive impact through technology.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-[--color-border] p-4">
                <p className="text-2xl font-semibold">50+</p>
                <p className="text-sm text-[--color-muted-foreground]">Employees</p>
              </div>
              <div className="rounded-lg border border-[--color-border] p-4">
                <p className="text-2xl font-semibold">5</p>
                <p className="text-sm text-[--color-muted-foreground]">Office Locations</p>
              </div>
              <div className="rounded-lg border border-[--color-border] p-4">
                <p className="text-2xl font-semibold">2018</p>
                <p className="text-sm text-[--color-muted-foreground]">Founded</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
