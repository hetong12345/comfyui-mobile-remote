import { create } from 'zustand';
import type { HistoryItem, Settings, GenerationStatus, ApiResponse } from '../types';

// 从环境变量读取配置
const envConfig = {
  apiUrl: import.meta.env.VITE_API_BASE_URL || '',
  apiTimeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
  maxPromptLength: Number(import.meta.env.VITE_MAX_PROMPT_LENGTH) || 1000,
  defaultBatchSize: Number(import.meta.env.VITE_DEFAULT_BATCH_SIZE) || 1,
  defaultTheme: (import.meta.env.VITE_DEFAULT_THEME as 'light' | 'dark') || 'dark',
  showSamplePrompts: import.meta.env.VITE_SHOW_SAMPLE_PROMPTS === 'true',
  simulateApi: import.meta.env.VITE_SIMULATE_API === 'true',
  enableDebug: import.meta.env.VITE_ENABLE_DEBUG === 'true',
  defaultWidth: Number(import.meta.env.VITE_DEFAULT_WIDTH) || 1088,
  defaultHeight: Number(import.meta.env.VITE_DEFAULT_HEIGHT) || 1920,
  defaultNegativePrompt: import.meta.env.VITE_DEFAULT_NEGATIVE_PROMPT || '',
};

interface AppState {
  // 主界面状态
  prompt: string;
  setPrompt: (prompt: string) => void;
  generatedImages: string[];
  setGeneratedImages: (images: string[]) => void;
  generationResult: ApiResponse['data'] | null;
  setGenerationResult: (result: ApiResponse['data'] | null) => void;
  generationStatus: GenerationStatus;
  setGenerationStatus: (status: Partial<GenerationStatus>) => void;
  resetGenerationStatus: () => void;

  // 历史记录
  history: HistoryItem[];
  addToHistory: (item: Omit<HistoryItem, 'id'>) => void;
  removeFromHistory: (id: string) => void;
  clearHistory: () => void;

  // 设置
  settings: Settings;
  updateSettings: (settings: Partial<Settings>) => void;
  resetSettings: () => void;
  
  // 环境配置
  envConfig: typeof envConfig;
}

// 默认设置
const defaultSettings: Settings = {
  apiUrl: envConfig.apiUrl,
  theme: envConfig.defaultTheme,
  enableVibration: true,
  autoSave: true,
  batchSize: envConfig.defaultBatchSize,
  apiJsonFile: null,
  apiJsonFileName: null,
  width: envConfig.defaultWidth,
  height: envConfig.defaultHeight,
  debugMode: false,
};

// 默认生成状态
const defaultGenerationStatus: GenerationStatus = {
  isGenerating: false,
  progress: 0,
  statusText: '',
  queuePosition: null,
  currentStep: 0,
  totalSteps: 0,
};

export const useAppStore = create<AppState>((set) => ({
  // 主界面状态
  prompt: '',
  setPrompt: (prompt) => set({ prompt }),
  generatedImages: [],
  setGeneratedImages: (images) => set({ generatedImages: images }),
  generationResult: null,
  setGenerationResult: (result) => set({ generationResult: result }),
  generationStatus: defaultGenerationStatus,
  setGenerationStatus: (status) => set((state) => ({
    generationStatus: { ...state.generationStatus, ...status },
  })),
  resetGenerationStatus: () => set({ generationStatus: defaultGenerationStatus, generationResult: null }),
  
  // 环境配置
  envConfig,

  // 历史记录
  history: [],
  addToHistory: (item) => set((state) => {
    const newItem: HistoryItem = {
      ...item,
      id: Date.now().toString(),
    };
    // 限制历史记录最多50条
    const updatedHistory = [newItem, ...state.history].slice(0, 50);
    // 保存到本地存储
    localStorage.setItem('history', JSON.stringify(updatedHistory));
    return { history: updatedHistory };
  }),
  removeFromHistory: (id) => set((state) => {
    const updatedHistory = state.history.filter((item) => item.id !== id);
    localStorage.setItem('history', JSON.stringify(updatedHistory));
    return { history: updatedHistory };
  }),
  clearHistory: () => {
    localStorage.removeItem('history');
    set({ history: [] });
  },

  // 设置
  settings: defaultSettings,
  updateSettings: (newSettings) => set((state) => {
    const updatedSettings = { ...state.settings, ...newSettings };
    localStorage.setItem('settings', JSON.stringify(updatedSettings));
    return { settings: updatedSettings };
  }),
  resetSettings: () => {
    localStorage.removeItem('settings');
    set({ settings: defaultSettings });
  },
}));

// 从本地存储加载历史记录和设置
const loadStoredData = () => {
  const storedHistory = localStorage.getItem('history');
  const storedSettings = localStorage.getItem('settings');

  if (storedHistory) {
    try {
      const history = JSON.parse(storedHistory);
      useAppStore.setState({ history });
    } catch (error) {
      console.error('Failed to parse stored history:', error);
    }
  }

  if (storedSettings) {
    try {
      const stored = JSON.parse(storedSettings);
      // 使用环境变量的默认值来覆盖本地存储中的设置
      const settings = {
        ...stored,
        width: envConfig.defaultWidth,
        height: envConfig.defaultHeight
      };
      useAppStore.setState({ settings });
    } catch (error) {
      console.error('Failed to parse stored settings:', error);
    }
  } else {
    // 如果没有本地存储，使用默认设置
    useAppStore.setState({ settings: defaultSettings });
  }
};

// 加载存储的数据
loadStoredData();