import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Environment, EnvironmentVariable } from '@/types';
import { STORAGE_KEYS } from '@/lib/constants';
import { nanoid } from 'nanoid';

interface EnvironmentsState {
  environments: Environment[];
  activeEnvironmentId: string | null;
  
  // Environment Actions
  addEnvironment: (name: string) => string;
  updateEnvironment: (id: string, updates: Partial<Environment>) => void;
  deleteEnvironment: (id: string) => void;
  setActiveEnvironment: (id: string | null) => void;
  getActiveEnvironment: () => Environment | null;
  
  // Variable Actions
  addVariable: (environmentId: string, key: string, value: string, type?: 'default' | 'secret') => void;
  updateVariable: (environmentId: string, variableId: string, updates: Partial<EnvironmentVariable>) => void;
  deleteVariable: (environmentId: string, variableId: string) => void;
  
  // Utility
  getActiveVariables: () => Record<string, string>;
}

const defaultEnvironment: Environment = {
  id: 'default-env',
  name: 'Development',
  isActive: true,
  variables: [
    {
      id: nanoid(),
      key: 'baseUrl',
      value: 'https://api.example.com',
      enabled: true,
      type: 'default',
    },
    {
      id: nanoid(),
      key: 'apiKey',
      value: 'your-api-key-here',
      enabled: true,
      type: 'secret',
    },
    {
      id: nanoid(),
      key: 'version',
      value: 'v1',
      enabled: true,
      type: 'default',
    },
  ],
};

export const useEnvironmentsStore = create<EnvironmentsState>()(
  persist(
    (set, get) => ({
      environments: [defaultEnvironment],
      activeEnvironmentId: 'default-env',
      
      addEnvironment: (name) => {
        const id = nanoid();
        set((state) => ({
          environments: [
            ...state.environments,
            {
              id,
              name,
              variables: [],
              isActive: false,
            },
          ],
        }));
        return id;
      },
      
      updateEnvironment: (id, updates) =>
        set((state) => ({
          environments: state.environments.map((env) =>
            env.id === id ? { ...env, ...updates } : env
          ),
        })),
      
      deleteEnvironment: (id) =>
        set((state) => ({
          environments: state.environments.filter((env) => env.id !== id),
          activeEnvironmentId: state.activeEnvironmentId === id ? null : state.activeEnvironmentId,
        })),
      
      setActiveEnvironment: (id) =>
        set((state) => ({
          activeEnvironmentId: id,
          environments: state.environments.map((env) => ({
            ...env,
            isActive: env.id === id,
          })),
        })),
      
      getActiveEnvironment: () => {
        const state = get();
        if (!state.activeEnvironmentId) return null;
        return state.environments.find((env) => env.id === state.activeEnvironmentId) || null;
      },
      
      addVariable: (environmentId, key, value, type = 'default') =>
        set((state) => ({
          environments: state.environments.map((env) => {
            if (env.id !== environmentId) return env;
            
            return {
              ...env,
              variables: [
                ...env.variables,
                {
                  id: nanoid(),
                  key,
                  value,
                  enabled: true,
                  type,
                },
              ],
            };
          }),
        })),
      
      updateVariable: (environmentId, variableId, updates) =>
        set((state) => ({
          environments: state.environments.map((env) => {
            if (env.id !== environmentId) return env;
            
            return {
              ...env,
              variables: env.variables.map((v) =>
                v.id === variableId ? { ...v, ...updates } : v
              ),
            };
          }),
        })),
      
      deleteVariable: (environmentId, variableId) =>
        set((state) => ({
          environments: state.environments.map((env) => {
            if (env.id !== environmentId) return env;
            
            return {
              ...env,
              variables: env.variables.filter((v) => v.id !== variableId),
            };
          }),
        })),
      
      getActiveVariables: () => {
        const activeEnv = get().getActiveEnvironment();
        if (!activeEnv) return {};
        
        const variables: Record<string, string> = {};
        activeEnv.variables
          .filter((v) => v.enabled)
          .forEach((v) => {
            variables[v.key] = v.value;
          });
        
        return variables;
      },
    }),
    {
      name: STORAGE_KEYS.ENVIRONMENTS,
    }
  )
);
