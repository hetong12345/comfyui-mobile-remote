// 导出历史记录为JSON（从localStorage获取）
export const exportHistoryAsJson = (): string => {
  try {
    const storedHistory = localStorage.getItem('history');
    const items = storedHistory ? JSON.parse(storedHistory) : [];
    return JSON.stringify(items, null, 2);
  } catch (error) {
    console.error('Failed to export history as JSON:', error);
    throw error;
  }
};

// 保存设置到本地存储
export const saveSettings = <T>(key: string, settings: T): void => {
  localStorage.setItem(key, JSON.stringify(settings));
};

// 从本地存储加载设置
export const loadSettings = <T>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (error) {
    console.error('Failed to load settings:', error);
    return defaultValue;
  }
};

