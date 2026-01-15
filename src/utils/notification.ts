import { useAppStore } from '../store';

// 通知类型
export type NotificationType = 'info' | 'success' | 'error' | 'warning';

// 通知选项接口
export interface NotificationOptions {
  type?: NotificationType;
  duration?: number;
  showCloseButton?: boolean;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

// 显示通知
export const showNotification = (message: string, options: NotificationOptions = {}) => {
  const { type = 'info', duration = 3000, showCloseButton = true, position = 'top-right' } = options;
  
  // 创建通知元素
  const notification = document.createElement('div');
  
  // 根据类型设置样式类
  const typeClasses = {
    info: 'bg-blue-500',
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
  };
  
  // 根据位置设置样式类
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2',
  };
  
  // 设置基本样式
  notification.className = `${typeClasses[type]} text-white px-4 py-3 rounded-lg shadow-lg z-50 animate-fade-in-out ${positionClasses[position]} max-w-sm overflow-hidden transition-all duration-300`;
  
  // 创建内容容器
  const contentContainer = document.createElement('div');
  contentContainer.className = 'flex flex-col gap-1';
  
  // 创建标题
  const title = document.createElement('div');
  title.className = 'font-semibold text-sm';
  title.textContent = type.charAt(0).toUpperCase() + type.slice(1);
  contentContainer.appendChild(title);
  
  // 创建消息内容
  const content = document.createElement('div');
  content.className = 'text-sm whitespace-pre-wrap';
  content.textContent = message;
  contentContainer.appendChild(content);
  
  // 添加内容到通知
  notification.appendChild(contentContainer);
  
  // 如果需要关闭按钮
  if (showCloseButton) {
    const closeButton = document.createElement('button');
    closeButton.className = 'absolute top-2 right-2 text-white opacity-70 hover:opacity-100 transition-opacity';
    closeButton.textContent = '✕';
    closeButton.onclick = () => {
      notification.remove();
    };
    notification.appendChild(closeButton);
  }
  
  // 添加到文档
  document.body.appendChild(notification);
  
  // 设置自动移除
  setTimeout(() => {
    notification.remove();
  }, duration);
};

// 显示API请求结果通知（调试模式专用）
export const showApiDebugNotification = (apiUrl: string, endpoint: string, response: unknown, error?: Error) => {
  const { settings } = useAppStore.getState();
  
  // 只有在调试模式下才显示
  if (!settings.debugMode) return;
  
  // 构建完整URL
  const fullUrl = apiUrl + endpoint;
  
  // 构建消息内容
  let message = `API Request: ${fullUrl}\n`;
  
  if (error) {
    message += `Error: ${error.message}`;
    showNotification(message, { type: 'error', duration: 5000 });
  } else {
    // 尝试格式化JSON响应
    try {
      const formattedResponse = JSON.stringify(response, null, 2);
      message += `Response: ${formattedResponse}`;
      // 如果响应太长，截断显示
      if (message.length > 1000) {
        message = message.substring(0, 1000) + '... [Response truncated]';
      }
      showNotification(message, { type: 'info', duration: 10000 });
    } catch {
      message += `Response: ${String(response)}`;
      showNotification(message, { type: 'info', duration: 5000 });
    }
  }
};
