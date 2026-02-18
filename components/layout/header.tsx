'use client';

import { Code2, FolderOpen, Clock, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useUIStore } from '@/store/use-ui-store';
import { cn } from '@/lib/utils';

export function Header() {
  const { sidebarTab, setSidebarTab, sidebarOpen, toggleSidebar } = useUIStore();

  const tabs = [
    { id: 'collections' as const, label: 'Collections', icon: FolderOpen },
    { id: 'history' as const, label: 'History', icon: Clock },
    { id: 'environments' as const, label: 'Environments', icon: Settings2 },
  ];

  return (
    <header className="h-14 border-b bg-card flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          title={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        >
          <Code2 className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold">API Tester</h1>
      </div>

      <div className="flex items-center gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = sidebarTab === tab.id;
          return (
            <Button
              key={tab.id}
              variant={isActive ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => {
                setSidebarTab(tab.id);
                if (!sidebarOpen) toggleSidebar();
              }}
              className={cn(
                'gap-2',
                isActive && 'bg-muted'
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </Button>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
      </div>
    </header>
  );
}
