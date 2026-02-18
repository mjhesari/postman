import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { HttpRequest, HttpResponse, KeyValue, FormDataItem } from '@/types';
import { DEFAULT_REQUEST, STORAGE_KEYS } from '@/lib/constants';
import { nanoid } from 'nanoid';

interface RequestState {
  currentRequest: HttpRequest;
  currentResponse: HttpResponse | null;
  isLoading: boolean;
  
  // Actions
  setMethod: (method: HttpRequest['method']) => void;
  setUrl: (url: string) => void;
  setRequestName: (name: string) => void;
  
  // Params
  addParam: () => void;
  updateParam: (id: string, updates: Partial<KeyValue>) => void;
  removeParam: (id: string) => void;
  setParams: (params: KeyValue[]) => void;
  
  // Headers
  addHeader: () => void;
  updateHeader: (id: string, updates: Partial<KeyValue>) => void;
  removeHeader: (id: string) => void;
  setHeaders: (headers: KeyValue[]) => void;
  
  // Body
  setBodyType: (type: HttpRequest['body']['type']) => void;
  setBodyContent: (content: string | FormDataItem[]) => void;
  addBodyFormItem: () => void;
  updateBodyFormItem: (id: string, updates: Partial<FormDataItem>) => void;
  removeBodyFormItem: (id: string) => void;
  
  // Auth
  setAuthType: (type: HttpRequest['auth']['type']) => void;
  setAuthCredentials: (credentials: Record<string, string>) => void;
  
  // Response
  setResponse: (response: HttpResponse) => void;
  clearResponse: () => void;
  setLoading: (loading: boolean) => void;
  
  // Request Management
  loadRequest: (request: HttpRequest) => void;
  resetRequest: () => void;
}

const createEmptyRequest = (): HttpRequest => ({
  id: nanoid(),
  name: 'Untitled Request',
  ...DEFAULT_REQUEST,
  params: [],
  headers: [],
});

export const useRequestStore = create<RequestState>()(
  persist(
    (set, get) => ({
      currentRequest: createEmptyRequest(),
      currentResponse: null,
      isLoading: false,
      
      setMethod: (method) =>
        set((state) => ({
          currentRequest: { ...state.currentRequest, method },
        })),
      
      setUrl: (url) =>
        set((state) => ({
          currentRequest: { ...state.currentRequest, url },
        })),
      
      setRequestName: (name) =>
        set((state) => ({
          currentRequest: { ...state.currentRequest, name },
        })),
      
      // Params
      addParam: () =>
        set((state) => ({
          currentRequest: {
            ...state.currentRequest,
            params: [
              ...state.currentRequest.params,
              { id: nanoid(), key: '', value: '', enabled: true },
            ],
          },
        })),
      
      updateParam: (id, updates) =>
        set((state) => ({
          currentRequest: {
            ...state.currentRequest,
            params: state.currentRequest.params.map((p) =>
              p.id === id ? { ...p, ...updates } : p
            ),
          },
        })),
      
      removeParam: (id) =>
        set((state) => ({
          currentRequest: {
            ...state.currentRequest,
            params: state.currentRequest.params.filter((p) => p.id !== id),
          },
        })),
      
      setParams: (params) =>
        set((state) => ({
          currentRequest: { ...state.currentRequest, params },
        })),
      
      // Headers
      addHeader: () =>
        set((state) => ({
          currentRequest: {
            ...state.currentRequest,
            headers: [
              ...state.currentRequest.headers,
              { id: nanoid(), key: '', value: '', enabled: true },
            ],
          },
        })),
      
      updateHeader: (id, updates) =>
        set((state) => ({
          currentRequest: {
            ...state.currentRequest,
            headers: state.currentRequest.headers.map((h) =>
              h.id === id ? { ...h, ...updates } : h
            ),
          },
        })),
      
      removeHeader: (id) =>
        set((state) => ({
          currentRequest: {
            ...state.currentRequest,
            headers: state.currentRequest.headers.filter((h) => h.id !== id),
          },
        })),
      
      setHeaders: (headers) =>
        set((state) => ({
          currentRequest: { ...state.currentRequest, headers },
        })),
      
      // Body
      setBodyType: (type) =>
        set((state) => ({
          currentRequest: {
            ...state.currentRequest,
            body: {
              type,
              content:
                type === 'form-data' || type === 'x-www-form-urlencoded'
                  ? []
                  : '',
            },
          },
        })),
      
      setBodyContent: (content) =>
        set((state) => ({
          currentRequest: {
            ...state.currentRequest,
            body: { ...state.currentRequest.body, content },
          },
        })),
      
      addBodyFormItem: () =>
        set((state) => {
          const currentContent = state.currentRequest.body.content;
          const items = Array.isArray(currentContent) ? currentContent : [];
          return {
            currentRequest: {
              ...state.currentRequest,
              body: {
                ...state.currentRequest.body,
                content: [
                  ...items,
                  { id: nanoid(), key: '', value: '', enabled: true, type: 'text' as const },
                ],
              },
            },
          };
        }),
      
      updateBodyFormItem: (id, updates) =>
        set((state) => {
          const currentContent = state.currentRequest.body.content;
          if (!Array.isArray(currentContent)) return state;
          
          return {
            currentRequest: {
              ...state.currentRequest,
              body: {
                ...state.currentRequest.body,
                content: currentContent.map((item) =>
                  item.id === id ? { ...item, ...updates } : item
                ),
              },
            },
          };
        }),
      
      removeBodyFormItem: (id) =>
        set((state) => {
          const currentContent = state.currentRequest.body.content;
          if (!Array.isArray(currentContent)) return state;
          
          return {
            currentRequest: {
              ...state.currentRequest,
              body: {
                ...state.currentRequest.body,
                content: currentContent.filter((item) => item.id !== id),
              },
            },
          };
        }),
      
      // Auth
      setAuthType: (type) =>
        set((state) => ({
          currentRequest: {
            ...state.currentRequest,
            auth: { type, credentials: {} },
          },
        })),
      
      setAuthCredentials: (credentials) =>
        set((state) => ({
          currentRequest: {
            ...state.currentRequest,
            auth: { ...state.currentRequest.auth, credentials },
          },
        })),
      
      // Response
      setResponse: (response) => set({ currentResponse: response }),
      clearResponse: () => set({ currentResponse: null }),
      setLoading: (loading) => set({ isLoading: loading }),
      
      // Request Management
      loadRequest: (request) =>
        set({
          currentRequest: { ...request },
          currentResponse: null,
        }),
      
      resetRequest: () =>
        set({
          currentRequest: createEmptyRequest(),
          currentResponse: null,
          isLoading: false,
        }),
    }),
    {
      name: STORAGE_KEYS.CURRENT_REQUEST,
      partialize: (state) => ({
        currentRequest: state.currentRequest,
      }),
    }
  )
);
