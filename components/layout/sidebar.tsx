'use client';

import { useUIStore } from '@/store/use-ui-store';
import { CollectionsPanel } from '@/components/collections/collections-panel';
import { HistoryPanel } from '@/components/history/history-panel';
import { EnvironmentsPanel } from '@/components/environments/environments-panel';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const { sidebarOpen, sidebarTab } = useUIStore();

  if (!sidebarOpen) return null;

  return (
    <aside className={cn('w-80 border-r bg-card flex flex-col shrink-0')}>
      {sidebarTab === 'collections' && <CollectionsPanel />}
      {sidebarTab === 'history' && <HistoryPanel />}
      {sidebarTab === 'environments' && <EnvironmentsPanel />}
    </aside>
  );
}
