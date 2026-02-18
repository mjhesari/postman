'use client';

import { Plus, Trash2 } from 'lucide-react';
import { Button } from './button';
import { Input } from './input';
import { Checkbox } from './checkbox';
import type { KeyValue } from '@/types';

interface KeyValueEditorProps {
  items: KeyValue[];
  onAdd: () => void;
  onUpdate: (id: string, updates: Partial<KeyValue>) => void;
  onRemove: (id: string) => void;
  placeholder?: { key: string; value: string };
}

export function KeyValueEditor({
  items,
  onAdd,
  onUpdate,
  onRemove,
  placeholder = { key: 'Key', value: 'Value' },
}: KeyValueEditorProps) {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[40px,1fr,1fr,40px] gap-2 text-sm font-medium text-muted-foreground px-2">
        <div></div>
        <div>Key</div>
        <div>Value</div>
        <div></div>
      </div>

      <div className="space-y-1">
        {items.map((item) => (
          <div
            key={item.id}
            className="grid grid-cols-[40px,1fr,1fr,40px] gap-2 items-center group"
          >
            <div className="flex items-center justify-center">
              <Checkbox
                checked={item.enabled}
                onCheckedChange={(checked) =>
                  onUpdate(item.id, { enabled: checked === true })
                }
              />
            </div>
            <Input
              placeholder={placeholder.key}
              value={item.key}
              onChange={(e) => onUpdate(item.id, { key: e.target.value })}
              className="h-9"
            />
            <Input
              placeholder={placeholder.value}
              value={item.value}
              onChange={(e) => onUpdate(item.id, { value: e.target.value })}
              className="h-9"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onRemove(item.id)}
              className="h-9 w-9 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={onAdd}
        className="w-full gap-2"
      >
        <Plus className="h-4 w-4" />
        Add {placeholder.key}
      </Button>
    </div>
  );
}
