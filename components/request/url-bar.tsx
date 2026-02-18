'use client';

import { Send, Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRequestStore } from '@/store/use-request-store';
import { useEnvironmentsStore } from '@/store/use-environments-store';
import { useHistoryStore } from '@/store/use-history-store';
import { sendHttpRequest } from '@/lib/http-client';
import { HTTP_METHODS, METHOD_COLORS } from '@/lib/constants';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export function URLBar() {
  const {
    currentRequest,
    setMethod,
    setUrl,
    setResponse,
    isLoading,
    setLoading,
  } = useRequestStore();

  const { getActiveVariables } = useEnvironmentsStore();
  const { addToHistory } = useHistoryStore();
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const handleSend = async () => {
    if (!currentRequest.url.trim()) {
      toast.error('Please enter a URL');
      return;
    }

    setLoading(true);
    try {
      const variables = getActiveVariables();
      const response = await sendHttpRequest(currentRequest, variables);
      setResponse(response);
      addToHistory(currentRequest, response);

      if (response.status === 0) {
        toast.error('Request failed', {
          description: 'Check console for details',
        });
      } else if (response.status >= 200 && response.status < 300) {
        toast.success('Request successful', {
          description: `${response.status} ${response.statusText}`,
        });
      } else {
        toast.warning('Request completed', {
          description: `${response.status} ${response.statusText}`,
        });
      }
    } catch (error) {
      toast.error('Request failed', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  };

  const methodColor = METHOD_COLORS[currentRequest.method];

  return (
    <div className="flex gap-2 p-4">
      <Select value={currentRequest.method} onValueChange={setMethod}>
        <SelectTrigger
          className={cn(
            'w-[110px] font-semibold border',
            methodColor.text
          )}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {HTTP_METHODS.map((method) => (
            <SelectItem
              key={method}
              value={method}
              className={cn('font-semibold', METHOD_COLORS[method].text)}
            >
              {method}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        placeholder="Enter request URL"
        value={currentRequest.url}
        onChange={(e) => setUrl(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !isLoading) {
            handleSend();
          }
        }}
        className="flex-1 font-mono text-sm"
      />

      <Button
        onClick={handleSend}
        disabled={isLoading || !currentRequest.url.trim()}
        className="gap-2 min-w-[100px]"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            Send
          </>
        )}
      </Button>

      <Button
        variant="outline"
        size="icon"
        onClick={() => setShowSaveDialog(true)}
        title="Save to collection"
      >
        <Save className="h-4 w-4" />
      </Button>
    </div>
  );
}
