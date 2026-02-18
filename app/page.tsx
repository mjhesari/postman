'use client';

import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { URLBar } from '@/components/request/url-bar';
import { RequestTabs } from '@/components/request/request-tabs';
import { ResponseViewer } from '@/components/response/response-viewer';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';

export default function HomePage() {
  return (
    <div className="h-screen flex flex-col bg-background">
      <Header />
      
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        
        <main className="flex-1 flex flex-col">
          <ResizablePanelGroup direction="vertical">
            {/* Request Panel */}
            <ResizablePanel defaultSize={50} minSize={30}>
              <div className="h-full flex flex-col">
                <URLBar />
                <RequestTabs />
              </div>
            </ResizablePanel>

            <ResizableHandle className="bg-border hover:bg-primary/20 transition-colors" />

            {/* Response Panel */}
            <ResizablePanel defaultSize={50} minSize={20}>
              <ResponseViewer />
            </ResizablePanel>
          </ResizablePanelGroup>
        </main>
      </div>
    </div>
  );
}
