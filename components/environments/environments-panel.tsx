'use client';

import { Plus, Settings2, Trash2, Edit2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
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
import { useEnvironmentsStore } from '@/store/use-environments-store';
import { useState } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { KeyValueEditor } from '@/components/ui/key-value-editor';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function EnvironmentsPanel() {
  const {
    environments,
    activeEnvironmentId,
    addEnvironment,
    deleteEnvironment,
    setActiveEnvironment,
    addVariable,
    updateVariable,
    deleteVariable,
  } = useEnvironmentsStore();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newEnvName, setNewEnvName] = useState('');
  const [selectedEnvId, setSelectedEnvId] = useState<string | null>(
    activeEnvironmentId
  );

  const handleAddEnvironment = () => {
    if (!newEnvName.trim()) {
      toast.error('Environment name is required');
      return;
    }

    const id = addEnvironment(newEnvName);
    setSelectedEnvId(id);
    toast.success('Environment created');
    setNewEnvName('');
    setIsAddDialogOpen(false);
  };

  const handleDeleteEnvironment = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteEnvironment(id);
      if (selectedEnvId === id) {
        setSelectedEnvId(null);
      }
      toast.success('Environment deleted');
    }
  };

  const handleSetActive = (id: string | null) => {
    setActiveEnvironment(id);
    toast.success(id ? 'Environment activated' : 'Environment deactivated');
  };

  const selectedEnv = environments.find((env) => env.id === selectedEnvId);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Environments</h2>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Environment</DialogTitle>
                <DialogDescription>
                  Create a new environment to manage variables
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="env-name">Name</Label>
                  <Input
                    id="env-name"
                    value={newEnvName}
                    onChange={(e) => setNewEnvName(e.target.value)}
                    placeholder="Production"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddEnvironment}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Active Environment</Label>
          <Select
            value={activeEnvironmentId || 'none'}
            onValueChange={(v) => handleSetActive(v === 'none' ? null : v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="No environment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No environment</SelectItem>
              {environments.map((env) => (
                <SelectItem key={env.id} value={env.id}>
                  {env.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {environments.length === 0 && (
            <div className="text-sm text-muted-foreground text-center py-8">
              <Settings2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No environments yet</p>
              <p className="text-xs mt-1">Create one to manage variables</p>
            </div>
          )}

          {environments.map((env) => (
            <div
              key={env.id}
              className={cn(
                'border rounded-lg overflow-hidden',
                selectedEnvId === env.id && 'ring-2 ring-primary'
              )}
            >
              <div
                className="p-3 bg-muted/30 flex items-center justify-between cursor-pointer"
                onClick={() => setSelectedEnvId(env.id)}
              >
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{env.name}</span>
                  {env.isActive && (
                    <Badge variant="default" className="h-5 text-xs">
                      Active
                    </Badge>
                  )}
                  <Badge variant="secondary" className="h-5 text-xs">
                    {env.variables.length} vars
                  </Badge>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteEnvironment(env.id, env.name);
                    }}
                    className="h-7 w-7"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {selectedEnvId === env.id && (
                <div className="p-3 space-y-2">
                  <Label className="text-xs">Variables</Label>
                  <KeyValueEditor
                    items={env.variables}
                    onAdd={() => addVariable(env.id, '', '')}
                    onUpdate={(id, updates) => updateVariable(env.id, id, updates)}
                    onRemove={(id) => deleteVariable(env.id, id)}
                    placeholder={{ key: 'Variable', value: 'Value' }}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Use variables in requests with {'{{variableName}}'} syntax
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
