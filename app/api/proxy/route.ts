import { NextRequest, NextResponse } from 'next/server';
import type { FormDataItem } from '@/types';

interface ProxyRequestBody {
  method: string;
  url: string;
  headers: Record<string, string>;
  body: string | FormDataItem[] | null;
  bodyType: 'json' | 'form-data' | 'x-www-form-urlencoded' | 'raw' | 'none';
}

export async function POST(request: NextRequest) {
  try {
    const body: ProxyRequestBody = await request.json();

    const { method, url, headers: headerObj, body: reqBody, bodyType } = body;

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    const headers = new Headers();
    if (headerObj) {
      Object.entries(headerObj).forEach(([key, value]) => {
        if (key && value) headers.set(key, value);
      });
    }

    let fetchBody: string | FormData | null = null;
    if (reqBody && method !== 'GET' && method !== 'HEAD') {
      if (bodyType === 'form-data' && Array.isArray(reqBody)) {
        const formData = new FormData();
        (reqBody as FormDataItem[])
          .filter((item) => item.enabled !== false && item.key)
          .forEach((item) => {
            formData.append(item.key, item.value);
          });
        fetchBody = formData;
      } else if (typeof reqBody === 'string') {
        fetchBody = reqBody;
      }
    }

    // Don't set Content-Type for FormData - fetch will set it with boundary
    if (bodyType === 'form-data') {
      headers.delete('content-type');
    }

    const response = await fetch(url, {
      method: method || 'GET',
      headers,
      body: fetchBody,
    });

    const responseBody = await response.text();
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    return NextResponse.json({
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      body: responseBody,
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        status: 0,
        statusText: 'Error',
        headers: {},
        body: '',
      },
      { status: 502 }
    );
  }
}
