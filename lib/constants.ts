import type { HttpMethod, BodyType, AuthType } from '@/types';

// HTTP Methods
export const HTTP_METHODS: HttpMethod[] = [
  'GET',
  'POST',
  'PUT',
  'DELETE',
  'PATCH',
  'HEAD',
  'OPTIONS',
];

// Method Colors
export const METHOD_COLORS: Record<HttpMethod, { bg: string; text: string; badge: string }> = {
  GET: { bg: 'bg-green-500', text: 'text-green-600', badge: 'bg-green-500/10 text-green-600 border-green-600/20' },
  POST: { bg: 'bg-orange-500', text: 'text-orange-600', badge: 'bg-orange-500/10 text-orange-600 border-orange-600/20' },
  PUT: { bg: 'bg-blue-500', text: 'text-blue-600', badge: 'bg-blue-500/10 text-blue-600 border-blue-600/20' },
  DELETE: { bg: 'bg-red-500', text: 'text-red-600', badge: 'bg-red-500/10 text-red-600 border-red-600/20' },
  PATCH: { bg: 'bg-purple-500', text: 'text-purple-600', badge: 'bg-purple-500/10 text-purple-600 border-purple-600/20' },
  HEAD: { bg: 'bg-gray-500', text: 'text-gray-600', badge: 'bg-gray-500/10 text-gray-600 border-gray-600/20' },
  OPTIONS: { bg: 'bg-gray-500', text: 'text-gray-600', badge: 'bg-gray-500/10 text-gray-600 border-gray-600/20' },
};

// Status Code Colors
export const getStatusColor = (status: number): { bg: string; text: string; badge: string } => {
  if (status >= 200 && status < 300) {
    return { bg: 'bg-green-500', text: 'text-green-600', badge: 'bg-green-500/10 text-green-600 border-green-600/20' };
  } else if (status >= 300 && status < 400) {
    return { bg: 'bg-blue-500', text: 'text-blue-600', badge: 'bg-blue-500/10 text-blue-600 border-blue-600/20' };
  } else if (status >= 400 && status < 500) {
    return { bg: 'bg-orange-500', text: 'text-orange-600', badge: 'bg-orange-500/10 text-orange-600 border-orange-600/20' };
  } else if (status >= 500) {
    return { bg: 'bg-red-500', text: 'text-red-600', badge: 'bg-red-500/10 text-red-600 border-red-600/20' };
  }
  return { bg: 'bg-gray-500', text: 'text-gray-600', badge: 'bg-gray-500/10 text-gray-600 border-gray-600/20' };
};

// Body Types
export const BODY_TYPES: BodyType[] = [
  'none',
  'json',
  'form-data',
  'x-www-form-urlencoded',
  'raw',
];

// Auth Types
export const AUTH_TYPES: AuthType[] = ['none', 'bearer', 'basic', 'api-key'];

// Content Types
export const CONTENT_TYPES = {
  JSON: 'application/json',
  FORM_DATA: 'multipart/form-data',
  FORM_URLENCODED: 'application/x-www-form-urlencoded',
  TEXT: 'text/plain',
  HTML: 'text/html',
  XML: 'application/xml',
};

// Default Values
export const DEFAULT_REQUEST = {
  method: 'GET' as HttpMethod,
  url: '',
  params: [],
  headers: [],
  body: {
    type: 'none' as BodyType,
    content: '',
  },
  auth: {
    type: 'none' as AuthType,
    credentials: {},
  },
};

// LocalStorage Keys
export const STORAGE_KEYS = {
  COLLECTIONS: 'postman-clone-collections',
  HISTORY: 'postman-clone-history',
  ENVIRONMENTS: 'postman-clone-environments',
  CURRENT_REQUEST: 'postman-clone-current-request',
  UI_STATE: 'postman-clone-ui-state',
};

// Limits
export const MAX_HISTORY_ITEMS = 100;
export const MAX_REQUEST_NAME_LENGTH = 100;
export const MAX_COLLECTION_NAME_LENGTH = 100;
