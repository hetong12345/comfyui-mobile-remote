// 历史记录条目类型
export interface HistoryItem {
  id: string;
  prompt: string;
  imageUrls: string[];
  timestamp: number;
  resolution: string;
  model: string;
  duration: number;
}

// 设置类型
export interface Settings {
  apiUrl: string;
  theme: 'dark' | 'light';
  enableVibration: boolean;
  autoSave: boolean;
  batchSize: number;
  apiJsonFile: string | null; // API JSON配置文件内容
  apiJsonFileName: string | null; // API JSON配置文件名
  width: number;
  height: number;
  debugMode: boolean; // 调试模式开关
}

// 生成状态类型
export interface GenerationStatus {
  isGenerating: boolean;
  progress: number;
  statusText: string;
  queuePosition: number | null;
  currentStep: number;
  totalSteps: number;
}

// API响应类型
export interface ApiResponse {
  success: boolean;
  data?: {
    imageUrls: string[];
    resolution: string;
    model: string;
    duration: number;
  };
  error?: string;
}
