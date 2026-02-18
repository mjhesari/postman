'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, Download } from 'lucide-react';
import { useRequestStore } from '@/store/use-request-store';
import { useUIStore } from '@/store/use-ui-store';
import { getStatusColor } from '@/lib/constants';
import { formatBytes, formatTime, tryParseJSON, prettyJSON } from '@/lib/http-client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';

export function ResponseViewer() {
  const { currentResponse } = useRequestStore();
  const { responseTab, setResponseTab } = useUIStore();

  if (!currentResponse) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <div className="text-center space-y-2">
          <p className="text-lg font-medium">No response yet</p>
          <p className="text-sm">Send a request to see the response here</p>
        </div>
      </div>
    );
  }

  const statusColor = getStatusColor(currentResponse.status);
  const { success: isJSON, data: jsonData } = tryParseJSON(currentResponse.body);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentResponse.body);
    toast.success('Response copied to clipboard');
  };

  const handleDownload = () => {
    const blob = new Blob([currentResponse.body], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `response-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Response downloaded');
  };

  return (
    <div className="flex-1 flex flex-col border-t">
      {/* Response Metadata */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
        <div className="flex items-center gap-4">
          <Badge
            variant="outline"
            className={cn('font-semibold border', statusColor.badge)}
          >
            {currentResponse.status} {currentResponse.statusText}
          </Badge>
          <span className="text-sm text-muted-foreground">
            Time: {formatTime(currentResponse.time)}
          </span>
          <span className="text-sm text-muted-foreground">
            Size: {formatBytes(currentResponse.size)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleCopy} className="gap-2">
            <Copy className="h-3 w-3" />
            Copy
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDownload} className="gap-2">
            <Download className="h-3 w-3" />
            Download
          </Button>
        </div>
      </div>

      {/* Response Tabs */}
      <Tabs
        value={responseTab}
        onValueChange={(v) => setResponseTab(v as any)}
        className="flex-1 flex flex-col"
      >
        <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-10 p-0 px-4">
          <TabsTrigger
            value="body"
            className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
          >
            Body
          </TabsTrigger>
          <TabsTrigger
            value="headers"
            className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
          >
            Headers
            <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
              {Object.keys(currentResponse.headers).length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value="cookies"
            className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
          >
            Cookies
          </TabsTrigger>
        </TabsList>

        <TabsContent value="body" className="flex-1 m-0">
          <ScrollArea className="h-full">
            <div className="p-4">
              {isJSON ? (
                <pre className="text-sm font-mono bg-muted/30 p-4 rounded-lg overflow-x-auto">
                  {prettyJSON(currentResponse.body)}
                </pre>
              ) : (
                <Textarea
                  value={currentResponse.body}
                  readOnly
                  className="font-mono text-sm min-h-[400px] resize-y"
                />
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="headers" className="flex-1 m-0">
          <ScrollArea className="h-full">
            <div className="p-4">
              <div className="space-y-2">
                {Object.entries(currentResponse.headers).map(([key, value]) => (
                  <div
                    key={key}
                    className="grid grid-cols-[200px,1fr] gap-4 text-sm p-2 rounded hover:bg-muted/50"
                  >
                    <div className="font-semibold text-muted-foreground">{key}</div>
                    <div className="font-mono break-all">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="cookies" className="flex-1 m-0">
          <ScrollArea className="h-full">
            <div className="p-4">
              <div className="text-sm text-muted-foreground text-center py-8">
                Cookie parsing coming soon
              </div>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
