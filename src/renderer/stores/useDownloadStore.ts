import { create } from 'zustand';
import { DownloadTask } from '../../shared/types';
import { api } from '../lib/ipc';

interface DownloadState {
  activeTasks: DownloadTask[];
  queue: DownloadTask[];
  
  // Computed
  activeCount: number;
  queuedCount: number;
  completedCount: number;
  
  // Actions
  addTask: (task: DownloadTask) => void;
  updateTask: (task: DownloadTask) => void;
  removeTask: (id: string) => void;
  cancelTask: (id: string) => Promise<void>;
  pauseTask: (id: string) => Promise<void>;
  resumeTask: (id: string) => Promise<void>;
  clearCompleted: () => void;
  fetchActiveTasks: () => Promise<void>;
  subscribeToEvents: () => void;
}

export const useDownloadStore = create<DownloadState>((set, get) => ({
  activeTasks: [],
  queue: [],
  
  get activeCount() {
    return get().activeTasks.filter(t => t.status === 'downloading' || t.status === 'converting' || t.status === 'merging').length;
  },
  
  get queuedCount() {
    return get().queue.length;
  },
  
  get completedCount() {
    return get().activeTasks.filter(t => t.status === 'done').length;
  },
  
  addTask: (task) => set((state) => {
    const exists = state.activeTasks.some(t => t.id === task.id);
    if (exists) {
      return { activeTasks: state.activeTasks.map(t => t.id === task.id ? task : t) };
    }
    return { activeTasks: [task, ...state.activeTasks] };
  }),
  
  updateTask: (updatedTask) => set((state) => {
    const exists = state.activeTasks.some(t => t.id === updatedTask.id);
    if (exists) {
      return {
        activeTasks: state.activeTasks.map(t => t.id === updatedTask.id ? updatedTask : t)
      };
    }
    return {
      activeTasks: [updatedTask, ...state.activeTasks]
    };
  }),
  
  removeTask: (id) => set((state) => ({
    activeTasks: state.activeTasks.filter(t => t.id !== id),
    queue: state.queue.filter(t => t.id !== id)
  })),
  
  cancelTask: async (id) => {
    await api.cancelDownload(id);
    set((state) => ({
      activeTasks: state.activeTasks.map(t => t.id === id ? { ...t, status: 'cancelled' } : t)
    }));
  },
  
  pauseTask: async (id) => {
    await api.pauseDownload(id);
    set((state) => ({
      activeTasks: state.activeTasks.map(t => t.id === id ? { ...t, status: 'paused' } : t)
    }));
  },
  
  resumeTask: async (id) => {
    await api.resumeDownload(id);
    set((state) => ({
      activeTasks: state.activeTasks.map(t => t.id === id ? { ...t, status: 'downloading' } : t)
    }));
  },
  
  clearCompleted: () => set((state) => ({
    activeTasks: state.activeTasks.filter(t => t.status !== 'done' && t.status !== 'error' && t.status !== 'cancelled')
  })),

  fetchActiveTasks: async () => {
    try {
      const tasks = await api.getActiveTasks();
      if (tasks && Array.isArray(tasks)) {
        set({ activeTasks: tasks });
      }
    } catch (e) {
      console.error('Failed to fetch active tasks:', e);
    }
  },
  
  subscribeToEvents: () => {
    get().fetchActiveTasks();

    api.onDownloadProgress((task) => {
      get().updateTask(task);
    });
    
    api.onDownloadComplete((task) => {
      get().updateTask({ ...task, status: 'done', progress: 100 });
    });
    
    api.onDownloadError(({ id, error }) => {
      const existing = get().activeTasks.find(t => t.id === id);
      if (existing) {
        get().updateTask({ ...existing, status: 'error', error });
      } else {
        get().fetchActiveTasks();
      }
    });
  }
}));
