'use client';

import { Plus, FolderPlus, FileText, Trash2, Edit2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCollectionsStore } from '@/store/use-collections-store';
import { useRequestStore } from '@/store/use-request-store';
import { useState } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { METHOD_COLORS } from '@/lib/constants';
import { Badge } from '@/components/ui/badge';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

export function CollectionsPanel() {
  const { collections, addCollection, deleteCollection, getRequest } = useCollectionsStore();
  const { loadRequest } = useRequestStore();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDesc, setNewCollectionDesc] = useState('');
  const [expandedCollections, setExpandedCollections] = useState<Set<string>>(new Set());

  const handleAddCollection = () => {
    if (!newCollectionName.trim()) {
      toast.error('Collection name is required');
      return;
    }

    addCollection(newCollectionName, newCollectionDesc);
    toast.success('Collection created');
    setNewCollectionName('');
    setNewCollectionDesc('');
    setIsAddDialogOpen(false);
  };

  const handleDeleteCollection = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteCollection(id);
      toast.success('Collection deleted');
    }
  };

  const handleLoadRequest = (collectionId: string, requestId: string) => {
    const request = getRequest(collectionId, requestId);
    if (request) {
      loadRequest(request);
      toast.success(`Loaded: ${request.name}`);
    }
  };

  const toggleCollection = (id: string) => {
    setExpandedCollections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="font-semibold">Collections</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Collection</DialogTitle>
              <DialogDescription>
                Create a new collection to organize your requests
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  placeholder="My API"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  value={newCollectionDesc}
                  onChange={(e) => setNewCollectionDesc(e.target.value)}
                  placeholder="API endpoints for..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddCollection}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {collections.length === 0 && (
            <div className="text-sm text-muted-foreground text-center py-8 px-4">
              No collections yet. Create one to get started!
            </div>
          )}

          {collections.map((collection) => (
            <Collapsible
              key={collection.id}
              open={expandedCollections.has(collection.id)}
              onOpenChange={() => toggleCollection(collection.id)}
            >
              <ContextMenu>
                <ContextMenuTrigger>
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center gap-2 p-2 rounded hover:bg-muted cursor-pointer group">
                      <ChevronRight
                        className={cn(
                          'h-4 w-4 transition-transform',
                          expandedCollections.has(collection.id) && 'rotate-90'
                        )}
                      />
                      <FolderPlus className="h-4 w-4 text-muted-foreground" />
                      <span className="flex-1 text-sm font-medium truncate">
                        {collection.name}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {collection.requests.length}
                      </Badge>
                    </div>
                  </CollapsibleTrigger>
                </ContextMenuTrigger>
                <ContextMenuContent>
                  <ContextMenuItem>
                    <Edit2 className="h-3 w-3 mr-2" />
                    Edit
                  </ContextMenuItem>
                  <ContextMenuItem
                    onClick={() => handleDeleteCollection(collection.id, collection.name)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-3 w-3 mr-2" />
                    Delete
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>

              <CollapsibleContent>
                <div className="ml-6 space-y-1">
                  {collection.requests.length === 0 && (
                    <div className="text-xs text-muted-foreground py-2 px-2">
                      No requests yet
                    </div>
                  )}
                  {collection.requests.map((request) => (
                    <button
                      key={request.id}
                      onClick={() => handleLoadRequest(collection.id, request.id)}
                      className="w-full flex items-center gap-2 p-2 rounded hover:bg-muted text-left group"
                    >
                      <FileText className="h-3 w-3 text-muted-foreground" />
                      <Badge
                        variant="outline"
                        className={cn('text-xs font-semibold', METHOD_COLORS[request.method].badge)}
                      >
                        {request.method}
                      </Badge>
                      <span className="flex-1 text-sm truncate">{request.name}</span>
                    </button>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
