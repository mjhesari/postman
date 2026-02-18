'use client';

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useRequestStore } from '@/store/use-request-store';
import type { AuthType } from '@/types';

export function AuthEditor() {
  const { currentRequest, setAuthType, setAuthCredentials } = useRequestStore();

  const updateCredential = (key: string, value: string) => {
    setAuthCredentials({
      ...currentRequest.auth.credentials,
      [key]: value,
    });
  };

  return (
    <div className="space-y-4">
      <RadioGroup
        value={currentRequest.auth.type}
        onValueChange={(value) => setAuthType(value as AuthType)}
      >
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="none" id="auth-none" />
            <Label htmlFor="auth-none">No Auth</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="bearer" id="auth-bearer" />
            <Label htmlFor="auth-bearer">Bearer Token</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="basic" id="auth-basic" />
            <Label htmlFor="auth-basic">Basic Auth</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="api-key" id="auth-api-key" />
            <Label htmlFor="auth-api-key">API Key</Label>
          </div>
        </div>
      </RadioGroup>

      {currentRequest.auth.type === 'none' && (
        <div className="text-sm text-muted-foreground py-8 text-center">
          This request does not use authentication
        </div>
      )}

      {currentRequest.auth.type === 'bearer' && (
        <div className="space-y-2">
          <Label htmlFor="bearer-token">Bearer Token</Label>
          <Input
            id="bearer-token"
            type="password"
            placeholder="Enter token"
            value={currentRequest.auth.credentials.token || ''}
            onChange={(e) => updateCredential('token', e.target.value)}
            className="font-mono"
          />
          <p className="text-xs text-muted-foreground">
            The token will be sent as: Authorization: Bearer {'<token>'}
          </p>
        </div>
      )}

      {currentRequest.auth.type === 'basic' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="basic-username">Username</Label>
            <Input
              id="basic-username"
              placeholder="Enter username"
              value={currentRequest.auth.credentials.username || ''}
              onChange={(e) => updateCredential('username', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="basic-password">Password</Label>
            <Input
              id="basic-password"
              type="password"
              placeholder="Enter password"
              value={currentRequest.auth.credentials.password || ''}
              onChange={(e) => updateCredential('password', e.target.value)}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Credentials will be Base64 encoded and sent as: Authorization: Basic {'<encoded>'}
          </p>
        </div>
      )}

      {currentRequest.auth.type === 'api-key' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-key-name">Header Name</Label>
            <Input
              id="api-key-name"
              placeholder="e.g., X-API-Key"
              value={currentRequest.auth.credentials.key || ''}
              onChange={(e) => updateCredential('key', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="api-key-value">Header Value</Label>
            <Input
              id="api-key-value"
              type="password"
              placeholder="Enter API key"
              value={currentRequest.auth.credentials.value || ''}
              onChange={(e) => updateCredential('value', e.target.value)}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            The API key will be sent as a custom header
          </p>
        </div>
      )}
    </div>
  );
}
