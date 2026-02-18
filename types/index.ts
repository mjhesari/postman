// HTTP Methods
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

// Body Types
export type BodyType = 'none' | 'json' | 'form-data' | 'x-www-form-urlencoded' | 'raw';

// Auth Types
export type AuthType = 'none' | 'bearer' | 'basic' | 'api-key';

// Key-Value Pair
export interface KeyValue {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
  description?: string;
}

// Form Data Item
export interface FormDataItem extends KeyValue {
  type: 'text' | 'file';
}

// HTTP Request
export interface HttpRequest {
  id: string;
  name: string;
  method: HttpMethod;
  url: string;
  params: KeyValue[];
  headers: KeyValue[];
  body: {
    type: BodyType;
    content: string | FormDataItem[];
  };
  auth: {
    type: AuthType;
    credentials: Record<string, string>;
  };
}

// HTTP Response
export interface HttpResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  time: number; // milliseconds
  size: number; // bytes
  timestamp: number;
}

// Collection & Folder
export interface Folder {
  id: string;
  name: string;
  parentId?: string;
  requests: HttpRequest[];
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  folders: Folder[];
  requests: HttpRequest[];
  createdAt: number;
  updatedAt: number;
}

// History Item
export interface HistoryItem {
  id: string;
  request: HttpRequest;
  response: HttpResponse;
  timestamp: number;
}

// Environment Variable
export interface EnvironmentVariable {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
  type: 'default' | 'secret';
}

// Environment
export interface Environment {
  id: string;
  name: string;
  variables: EnvironmentVariable[];
  isActive: boolean;
}

// UI State
export type SidebarTab = 'collections' | 'history' | 'environments';
export type RequestTab = 'params' | 'headers' | 'body' | 'auth';
export type ResponseTab = 'body' | 'headers' | 'cookies';
