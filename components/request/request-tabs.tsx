'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { KeyValueEditor } from '@/components/ui/key-value-editor';
import { BodyEditor } from './body-editor';
import { AuthEditor } from './auth-editor';
import { useRequestStore } from '@/store/use-request-store';
import { useUIStore } from '@/store/use-ui-store';
import { Badge } from '@/components/ui/badge';

export function RequestTabs() {
  const {
    currentRequest,
    addParam,
    updateParam,
    removeParam,
    addHeader,
    updateHeader,
    removeHeader,
  } = useRequestStore();

  const { requestTab, setRequestTab } = useUIStore();

  const activeParamsCount = currentRequest.params.filter((p) => p.enabled && p.key).length;
  const activeHeadersCount = currentRequest.headers.filter((h) => h.enabled && h.key).length;
  const hasBody = currentRequest.body.type !== 'none';
  const hasAuth = currentRequest.auth.type !== 'none';

  return (
    <Tabs value={requestTab} onValueChange={(v) => setRequestTab(v as any)} className="flex-1">
      <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-10 p-0">
        <TabsTrigger
          value="params"
          className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
        >
          Params
          {activeParamsCount > 0 && (
            <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
              {activeParamsCount}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger
          value="headers"
          className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
        >
          Headers
          {activeHeadersCount > 0 && (
            <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
              {activeHeadersCount}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger
          value="body"
          className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
        >
          Body
          {hasBody && (
            <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
              {currentRequest.body.type}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger
          value="auth"
          className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
        >
          Auth
          {hasAuth && (
            <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
              {currentRequest.auth.type}
            </Badge>
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="params" className="mt-0 p-4 space-y-2 overflow-auto">
        <p className="text-sm text-muted-foreground mb-4">
          Query parameters are appended to the request URL
        </p>
        <KeyValueEditor
          items={currentRequest.params}
          onAdd={addParam}
          onUpdate={updateParam}
          onRemove={removeParam}
          placeholder={{ key: 'Parameter', value: 'Value' }}
        />
      </TabsContent>

      <TabsContent value="headers" className="mt-0 p-4 space-y-2 overflow-auto">
        <p className="text-sm text-muted-foreground mb-4">
          Headers are sent with the request
        </p>
        <KeyValueEditor
          items={currentRequest.headers}
          onAdd={addHeader}
          onUpdate={updateHeader}
          onRemove={removeHeader}
          placeholder={{ key: 'Header', value: 'Value' }}
        />
      </TabsContent>

      <TabsContent value="body" className="mt-0 overflow-auto">
        <BodyEditor />
      </TabsContent>

      <TabsContent value="auth" className="mt-0 p-4 overflow-auto">
        <AuthEditor />
      </TabsContent>
    </Tabs>
  );
}
