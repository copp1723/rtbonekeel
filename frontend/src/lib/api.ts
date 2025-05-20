import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for auth cookies
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Types
export interface ApiKey {
  id: string;
  service: string;
  keyName: string;
  keyValue: string;
  label?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  additionalData?: Record<string, any>;
}

export interface ApiKeyInput {
  service: string;
  keyName: string;
  keyValue: string;
  label?: string;
  additionalData?: Record<string, any>;
}

export interface TaskInput {
  taskType: string;
  taskText: string;
  platform?: string;
}

export interface Task {
  id: string;
  userId: string;
  taskType: string;
  taskText: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: {
    title?: string;
    description?: string;
    insights?: string[];
    actionItems?: string[];
    score?: number;
  };
  error?: string;
  createdAt: string;
  completedAt?: string;
}

// API Functions
export const apiKeysApi = {
  getAll: async (service?: string): Promise<ApiKey[]> => {
    const url = service ? `/api-keys?service=${service}` : '/api-keys';
    const { data } = await api.get(url);
    return data;
  },

  getById: async (id: string): Promise<ApiKey> => {
    const { data } = await api.get(`/api-keys/${id}`);
    return data;
  },

  create: async (apiKey: ApiKeyInput): Promise<ApiKey> => {
    const { data } = await api.post('/api-keys', apiKey);
    return data;
  },

  update: async (id: string, apiKey: Partial<ApiKeyInput>): Promise<ApiKey> => {
    const { data } = await api.put(`/api-keys/${id}`, apiKey);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api-keys/${id}`);
  },
};

export const tasksApi = {
  getAll: async (): Promise<Task[]> => {
    const { data } = await api.get('/tasks');
    return data;
  },

  getById: async (id: string): Promise<Task> => {
    const { data } = await api.get(`/tasks/${id}`);
    return data;
  },

  create: async (task: TaskInput): Promise<Task> => {
    const { data } = await api.post('/tasks', task);
    return data;
  },
};