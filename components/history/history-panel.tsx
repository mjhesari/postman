'use client';

import { Trash2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useHistoryStore } from '@/store/use-history-store';
import { useRequestStore } from '@/store/use-request-store';
import { METHOD_COLORS, getStatusColor } from '@/lib/constants';
import { formatTime } from '@/lib/http-client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function HistoryPanel() {
  const { history, clearHistory, deleteHistoryItem } = useHistoryStore();
  const { loadRequest } = useRequestStore();

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear all history?')) {
      clearHistory();
      toast.success('History cleared');
    }
  };

  const handleLoadFromHistory = (id: string) => {
    const item = history.find((h) => h.id === id);
    if (item) {
      loadRequest(item.request);
      toast.success('Request loaded from history');
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteHistoryItem(id);
    toast.success('Item removed from history');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="font-semibold">History</h2>
        {history.length > 0 && (
          <Button
            size="sm"
            variant="ghost"
            onClick={handleClearHistory}
            className="h-8 gap-2 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-3 w-3" />
            Clear
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {history.length === 0 && (
            <div className="text-sm text-muted-foreground text-center py-8 px-4">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No history yet</p>
              <p className="text-xs mt-1">Your request history will appear here</p>
            </div>
          )}

          {history.map((item) => {
            const methodColor = METHOD_COLORS[item.request.method];
            const statusColor = getStatusColor(item.response.status);
            const date = new Date(item.timestamp);

            return (
              <button
                key={item.id}
                onClick={() => handleLoadFromHistory(item.id)}
                className="w-full p-3 rounded border hover:bg-muted text-left group relative"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Badge
                      variant="outline"
                      className={cn('text-xs font-semibold shrink-0', methodColor.badge)}
                    >
                      {item.request.method}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={cn('text-xs font-semibold shrink-0', statusColor.badge)}
                    >
                      {item.response.status}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => handleDelete(item.id, e)}
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 shrink-0"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>

                <div className="text-sm font-mono truncate mb-1">
                  {item.request.url}
                </div>

                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{date.toLocaleTimeString()}</span>
                  <span>{formatTime(item.response.time)}</span>
                </div>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
