import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Collection, Folder, HttpRequest } from '@/types';
import { STORAGE_KEYS } from '@/lib/constants';
import { nanoid } from 'nanoid';

interface CollectionsState {
  collections: Collection[];
  
  // Collection Actions
  addCollection: (name: string, description?: string) => string;
  updateCollection: (id: string, updates: Partial<Collection>) => void;
  deleteCollection: (id: string) => void;
  
  // Folder Actions
  addFolder: (collectionId: string, name: string, parentId?: string) => void;
  updateFolder: (collectionId: string, folderId: string, name: string) => void;
  deleteFolder: (collectionId: string, folderId: string) => void;
  
  // Request Actions
  addRequest: (collectionId: string, request: HttpRequest, folderId?: string) => void;
  updateRequest: (collectionId: string, requestId: string, updates: Partial<HttpRequest>) => void;
  deleteRequest: (collectionId: string, requestId: string) => void;
  getRequest: (collectionId: string, requestId: string) => HttpRequest | null;
  
  // Utility
  findCollection: (id: string) => Collection | null;
}

export const useCollectionsStore = create<CollectionsState>()(
  persist(
    (set, get) => ({
      collections: [],
      
      addCollection: (name, description) => {
        const id = nanoid();
        set((state) => ({
          collections: [
            ...state.collections,
            {
              id,
              name,
              description,
              folders: [],
              requests: [],
              createdAt: Date.now(),
              updatedAt: Date.now(),
            },
          ],
        }));
        return id;
      },
      
      updateCollection: (id, updates) =>
        set((state) => ({
          collections: state.collections.map((c) =>
            c.id === id ? { ...c, ...updates, updatedAt: Date.now() } : c
          ),
        })),
      
      deleteCollection: (id) =>
        set((state) => ({
          collections: state.collections.filter((c) => c.id !== id),
        })),
      
      addFolder: (collectionId, name, parentId) =>
        set((state) => ({
          collections: state.collections.map((c) => {
            if (c.id !== collectionId) return c;
            
            return {
              ...c,
              folders: [
                ...c.folders,
                {
                  id: nanoid(),
                  name,
                  parentId,
                  requests: [],
                },
              ],
              updatedAt: Date.now(),
            };
          }),
        })),
      
      updateFolder: (collectionId, folderId, name) =>
        set((state) => ({
          collections: state.collections.map((c) => {
            if (c.id !== collectionId) return c;
            
            return {
              ...c,
              folders: c.folders.map((f) =>
                f.id === folderId ? { ...f, name } : f
              ),
              updatedAt: Date.now(),
            };
          }),
        })),
      
      deleteFolder: (collectionId, folderId) =>
        set((state) => ({
          collections: state.collections.map((c) => {
            if (c.id !== collectionId) return c;
            
            // Remove folder and its child folders
            const foldersToDelete = new Set<string>([folderId]);
            let changed = true;
            
            while (changed) {
              changed = false;
              c.folders.forEach((f) => {
                if (f.parentId && foldersToDelete.has(f.parentId) && !foldersToDelete.has(f.id)) {
                  foldersToDelete.add(f.id);
                  changed = true;
                }
              });
            }
            
            return {
              ...c,
              folders: c.folders.filter((f) => !foldersToDelete.has(f.id)),
              updatedAt: Date.now(),
            };
          }),
        })),
      
      addRequest: (collectionId, request, folderId) =>
        set((state) => ({
          collections: state.collections.map((c) => {
            if (c.id !== collectionId) return c;
            
            const newRequest = { ...request, id: request.id || nanoid() };
            
            if (folderId) {
              return {
                ...c,
                folders: c.folders.map((f) =>
                  f.id === folderId
                    ? { ...f, requests: [...f.requests, newRequest] }
                    : f
                ),
                updatedAt: Date.now(),
              };
            } else {
              return {
                ...c,
                requests: [...c.requests, newRequest],
                updatedAt: Date.now(),
              };
            }
          }),
        })),
      
      updateRequest: (collectionId, requestId, updates) =>
        set((state) => ({
          collections: state.collections.map((c) => {
            if (c.id !== collectionId) return c;
            
            return {
              ...c,
              requests: c.requests.map((r) =>
                r.id === requestId ? { ...r, ...updates } : r
              ),
              folders: c.folders.map((f) => ({
                ...f,
                requests: f.requests.map((r) =>
                  r.id === requestId ? { ...r, ...updates } : r
                ),
              })),
              updatedAt: Date.now(),
            };
          }),
        })),
      
      deleteRequest: (collectionId, requestId) =>
        set((state) => ({
          collections: state.collections.map((c) => {
            if (c.id !== collectionId) return c;
            
            return {
              ...c,
              requests: c.requests.filter((r) => r.id !== requestId),
              folders: c.folders.map((f) => ({
                ...f,
                requests: f.requests.filter((r) => r.id !== requestId),
              })),
              updatedAt: Date.now(),
            };
          }),
        })),
      
      getRequest: (collectionId, requestId) => {
        const collection = get().collections.find((c) => c.id === collectionId);
        if (!collection) return null;
        
        // Check collection requests
        const collectionRequest = collection.requests.find((r) => r.id === requestId);
        if (collectionRequest) return collectionRequest;
        
        // Check folder requests
        for (const folder of collection.folders) {
          const folderRequest = folder.requests.find((r) => r.id === requestId);
          if (folderRequest) return folderRequest;
        }
        
        return null;
      },
      
      findCollection: (id) => {
        return get().collections.find((c) => c.id === id) || null;
      },
    }),
    {
      name: STORAGE_KEYS.COLLECTIONS,
    }
  )
);
