'use client';

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { VariableAutocompleteTextarea } from '@/components/ui/variable-autocomplete-textarea';
import { KeyValueEditor } from '@/components/ui/key-value-editor';
import { useRequestStore } from '@/store/use-request-store';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { prettyJSON } from '@/lib/http-client';
import { toast } from 'sonner';
import type { BodyType, FormDataItem } from '@/types';

export function BodyEditor() {
  const {
    currentRequest,
    setBodyType,
    setBodyContent,
    addBodyFormItem,
    updateBodyFormItem,
    removeBodyFormItem,
  } = useRequestStore();

  const handleFormatJSON = () => {
    if (currentRequest.body.type === 'json') {
      try {
        const formatted = prettyJSON(currentRequest.body.content as string);
        setBodyContent(formatted);
        toast.success('JSON formatted successfully');
      } catch {
        toast.error('Invalid JSON');
      }
    }
  };

  return (
    <div className="p-4 space-y-4">
      <RadioGroup
        value={currentRequest.body.type}
        onValueChange={(value) => setBodyType(value as BodyType)}
      >
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="none" id="body-none" />
            <Label htmlFor="body-none">None</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="json" id="body-json" />
            <Label htmlFor="body-json">JSON</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="form-data" id="body-form-data" />
            <Label htmlFor="body-form-data">Form Data</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="x-www-form-urlencoded" id="body-urlencoded" />
            <Label htmlFor="body-urlencoded">x-www-form-urlencoded</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="raw" id="body-raw" />
            <Label htmlFor="body-raw">Raw</Label>
          </div>
        </div>
      </RadioGroup>

      {currentRequest.body.type === 'none' && (
        <div className="text-sm text-muted-foreground py-8 text-center">
          This request does not have a body
        </div>
      )}

      {currentRequest.body.type === 'json' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>JSON Body</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={handleFormatJSON}
              className="gap-2"
            >
              <Sparkles className="h-3 w-3" />
              Format JSON
            </Button>
          </div>
          <VariableAutocompleteTextarea
            value={currentRequest.body.content as string}
            onChange={setBodyContent}
            placeholder={'{\n  "key": "value"\n}'}
            className="font-mono text-sm resize-y"
            rows={15}
          />
        </div>
      )}

      {currentRequest.body.type === 'form-data' && (
        <div className="space-y-2">
          <Label>Form Data</Label>
          <KeyValueEditor
            items={currentRequest.body.content as FormDataItem[]}
            onAdd={addBodyFormItem}
            onUpdate={updateBodyFormItem}
            onRemove={removeBodyFormItem}
            placeholder={{ key: 'Key', value: 'Value' }}
          />
        </div>
      )}

      {currentRequest.body.type === 'x-www-form-urlencoded' && (
        <div className="space-y-2">
          <Label>URL Encoded Form</Label>
          <KeyValueEditor
            items={currentRequest.body.content as FormDataItem[]}
            onAdd={addBodyFormItem}
            onUpdate={updateBodyFormItem}
            onRemove={removeBodyFormItem}
            placeholder={{ key: 'Key', value: 'Value' }}
          />
        </div>
      )}

      {currentRequest.body.type === 'raw' && (
        <div className="space-y-2">
          <Label>Raw Body</Label>
          <VariableAutocompleteTextarea
            value={currentRequest.body.content as string}
            onChange={setBodyContent}
            placeholder="Enter raw body content..."
            className="font-mono text-sm resize-y"
            rows={15}
          />
        </div>
      )}
    </div>
  );
}
