import type { HttpRequest, HttpResponse, FormDataItem, KeyValue } from '@/types';
import { replaceVariables } from './variable-replacer';

/**
 * Send HTTP request and return response
 */
export async function sendHttpRequest(
  request: HttpRequest,
  variables: Record<string, string> = {}
): Promise<HttpResponse> {
  const startTime = performance.now();

  try {
    // 1. Process URL with variables
    let processedUrl = replaceVariables(request.url, variables);

    // 2. Build query params
    const url = new URL(processedUrl);
    request.params
      .filter((p) => p.enabled && p.key)
      .forEach((p) => {
        const key = replaceVariables(p.key, variables);
        const value = replaceVariables(p.value, variables);
        url.searchParams.append(key, value);
      });

    // 3. Build headers
    const headers = new Headers();
    request.headers
      .filter((h) => h.enabled && h.key)
      .forEach((h) => {
        const key = replaceVariables(h.key, variables);
        const value = replaceVariables(h.value, variables);
        headers.append(key, value);
      });

    // 4. Build body
    let body: string | FormData | null = null;

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      if (request.body.type === 'json') {
        body = replaceVariables(request.body.content as string, variables);
        if (!headers.has('Content-Type')) {
          headers.set('Content-Type', 'application/json');
        }
      } else if (request.body.type === 'form-data') {
        const formData = new FormData();
        const items = request.body.content as FormDataItem[];
        items
          .filter((item) => item.enabled && item.key)
          .forEach((item) => {
            const key = replaceVariables(item.key, variables);
            const value = replaceVariables(item.value, variables);
            formData.append(key, value);
          });
        body = formData;
        // Don't set Content-Type for FormData, browser will set it with boundary
      } else if (request.body.type === 'x-www-form-urlencoded') {
        const items = request.body.content as KeyValue[];
        const params = new URLSearchParams();
        items
          .filter((item) => item.enabled && item.key)
          .forEach((item) => {
            const key = replaceVariables(item.key, variables);
            const value = replaceVariables(item.value, variables);
            params.append(key, value);
          });
        body = params.toString();
        if (!headers.has('Content-Type')) {
          headers.set('Content-Type', 'application/x-www-form-urlencoded');
        }
      } else if (request.body.type === 'raw') {
        body = replaceVariables(request.body.content as string, variables);
        if (!headers.has('Content-Type')) {
          headers.set('Content-Type', 'text/plain');
        }
      }
    }

    // 5. Add auth headers
    if (request.auth.type === 'bearer' && request.auth.credentials.token) {
      const token = replaceVariables(request.auth.credentials.token, variables);
      headers.set('Authorization', `Bearer ${token}`);
    } else if (request.auth.type === 'basic') {
      const username = replaceVariables(
        request.auth.credentials.username || '',
        variables
      );
      const password = replaceVariables(
        request.auth.credentials.password || '',
        variables
      );
      const encoded = btoa(`${username}:${password}`);
      headers.set('Authorization', `Basic ${encoded}`);
    } else if (request.auth.type === 'api-key') {
      const key = replaceVariables(request.auth.credentials.key || '', variables);
      const value = replaceVariables(
        request.auth.credentials.value || '',
        variables
      );
      headers.set(key, value);
    }

    // 6. Send request via proxy (bypasses CORS)
    const headersObj: Record<string, string> = {};
    headers.forEach((value, key) => {
      headersObj[key] = value;
    });

    let proxyBody: string | FormDataItem[] | null = null;
    let bodyType: 'json' | 'form-data' | 'x-www-form-urlencoded' | 'raw' | 'none' =
      'none';
    if (body !== null) {
      if (request.body.type === 'form-data') {
        proxyBody = request.body.content as FormDataItem[];
        bodyType = 'form-data';
      } else {
        proxyBody = body as string;
        bodyType =
          request.body.type === 'json'
            ? 'json'
            : request.body.type === 'x-www-form-urlencoded'
              ? 'x-www-form-urlencoded'
              : 'raw';
      }
    }

    const proxyResponse = await fetch('/api/proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: request.method,
        url: url.toString(),
        headers: headersObj,
        body: proxyBody,
        bodyType,
      }),
    });

    if (!proxyResponse.ok) {
      const errData = await proxyResponse.json().catch(() => ({}));
      throw new Error(
        errData.error || `Proxy error: ${proxyResponse.status}`
      );
    }

    const proxyData = await proxyResponse.json();
    const response = {
      status: proxyData.status,
      statusText: proxyData.statusText,
      headers: proxyData.headers || {},
      body: proxyData.body,
    };

    const endTime = performance.now();

    // 7. Return response (already parsed from proxy)
    const responseBody =
      typeof response.body === 'string' ? response.body : String(response.body);
    return {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers || {},
      body: responseBody,
      time: Math.round(endTime - startTime),
      size: new Blob([responseBody]).size,
      timestamp: Date.now(),
    };
  } catch (error) {
    const endTime = performance.now();

    // Return error as response
    return {
      status: 0,
      statusText: 'Error',
      headers: {},
      body: JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }),
      time: Math.round(endTime - startTime),
      size: 0,
      timestamp: Date.now(),
    };
  }
}

/**
 * Format bytes to human readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

/**
 * Format milliseconds to human readable string
 */
export function formatTime(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

/**
 * Try to parse response body as JSON
 */
export function tryParseJSON(text: string): { success: boolean; data?: any } {
  try {
    const data = JSON.parse(text);
    return { success: true, data };
  } catch {
    return { success: false };
  }
}

/**
 * Pretty print JSON
 */
export function prettyJSON(json: string): string {
  try {
    const parsed = JSON.parse(json);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return json;
  }
}
