import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store';
import type { ResolutionPreset } from '../utils/resolutionPresets';
import { getResolutionCategories, getResolutionsByCategory } from '../utils/resolutionPresets';


interface SettingsScreenProps {
  onClose: () => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onClose }) => {
  const { 
    settings, 
    updateSettings
  } = useAppStore();

  // 更新API地址
  const handleApiUrlChange = (value: string) => {
    updateSettings({ ...settings, apiUrl: value });
  };





  // 更新主题模式
  const handleThemeChange = (value: 'dark' | 'light') => {
    updateSettings({ ...settings, theme: value });
    document.documentElement.classList.toggle('dark', value === 'dark');
  };

  // 更新震动提醒
  const handleVibrationToggle = (checked: boolean) => {
    updateSettings({ ...settings, enableVibration: checked });
  };

  // 更新自动保存
  const handleAutoSaveToggle = (checked: boolean) => {
    updateSettings({ ...settings, autoSave: checked });
  };



  // 更新Batch数量
  const handleBatchSizeChange = (value: number) => {
    updateSettings({ ...settings, batchSize: value });
  };

  // 更新宽度
  const handleWidthChange = (value: number) => {
    updateSettings({ ...settings, width: value });
  };

  // 更新高度
  const handleHeightChange = (value: number) => {
    updateSettings({ ...settings, height: value });
  };



  // 分辨率选择状态
  const [selectedResolutionCategory, setSelectedResolutionCategory] = useState<ResolutionPreset['category']>('正方形');
  const [customResolutionMode, setCustomResolutionMode] = useState(false);

  // 应用分辨率预设
  const applyResolutionPreset = (width: number, height: number) => {
    updateSettings({ ...settings, width, height });
    setCustomResolutionMode(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gray-950 z-50 overflow-y-auto"
    >
      {/* 顶部导航栏 */}
      <motion.div 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-10 bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900 shadow-lg px-4 py-3 flex items-center justify-between"
      >
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          设置
        </h2>
        <motion.button 
          whileHover={{ scale: 1.1, rotate: 15 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClose}
          className="p-2 text-gray-300 hover:text-white bg-white/10 backdrop-blur-sm rounded-full transition-all"
        >
          ✕
        </motion.button>
      </motion.div>

      <div className="p-6 space-y-6">
        {/* API配置 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6 shadow-lg"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
            API配置
          </h3>
          
          {/* API地址 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              后端API地址
            </label>
            <div className="relative">
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"
              />
              <input
                type="text"
                value={settings.apiUrl}
                onChange={(e) => handleApiUrlChange(e.target.value)}
                placeholder="https://your-comfyui-api.com"
                className="w-full px-4 py-3 bg-gray-800/70 backdrop-blur-sm text-white rounded-xl border border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 relative z-10"
                required
              />
            </div>
          </div>

          {/* 网络信息配置 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              网络信息配置
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div className="relative group">
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"
                />
                <label className="block text-xs font-medium text-gray-400 mb-2">
                  主机
                </label>
                <input
                  type="text"
                  value={settings.apiUrl ? (() => {
                    try {
                      return new URL(settings.apiUrl).hostname;
                    } catch {
                      return '';
                    }
                  })() : ''}
                  onChange={(e) => {
                    const currentUrl = settings.apiUrl;
                    try {
                      const port = currentUrl ? new URL(currentUrl).port || '8188' : '8188';
                      const protocol = currentUrl ? new URL(currentUrl).protocol : 'http:';
                      handleApiUrlChange(`${protocol}//${e.target.value}:${port}`);
                    } catch {
                      // 如果当前URL无效，使用默认值
                      handleApiUrlChange(`http://${e.target.value}:8188`);
                    }
                  }}
                  placeholder="localhost"
                  className="w-full px-4 py-3 bg-gray-800/70 backdrop-blur-sm text-white rounded-xl border border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 relative z-10"
                />
              </div>

              <div className="relative group">
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"
                />
                <label className="block text-xs font-medium text-gray-400 mb-2">
                  端口
                </label>
                <input
                  type="text"
                  value={settings.apiUrl ? (() => {
                    try {
                      return new URL(settings.apiUrl).port || '8188';
                    } catch {
                      return '8188';
                    }
                  })() : '8188'}
                  onChange={(e) => {
                    const currentUrl = settings.apiUrl;
                    try {
                      const hostname = currentUrl ? new URL(currentUrl).hostname : 'localhost';
                      const protocol = currentUrl ? new URL(currentUrl).protocol : 'http:';
                      handleApiUrlChange(`${protocol}//${hostname}:${e.target.value}`);
                    } catch {
                      // 如果当前URL无效，使用默认值
                      handleApiUrlChange(`http://localhost:${e.target.value}`);
                    }
                  }}
                  placeholder="8188"
                  className="w-full px-4 py-3 bg-gray-800/70 backdrop-blur-sm text-white rounded-xl border border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 relative z-10"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* 界面设置 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6 shadow-lg"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
            界面设置
          </h3>
          
          {/* 主题模式 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              主题模式
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  checked={settings.theme === 'dark'}
                  onChange={() => handleThemeChange('dark')}
                  className="text-indigo-600"
                />
                <div className="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-hover:text-indigo-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                  <span className="text-gray-300 group-hover:text-indigo-300 transition-colors">深色模式</span>
                </div>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  checked={settings.theme === 'light'}
                  onChange={() => handleThemeChange('light')}
                  className="text-indigo-600"
                />
                <div className="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-hover:text-indigo-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span className="text-gray-300 group-hover:text-indigo-300 transition-colors">浅色模式</span>
                </div>
              </label>
            </div>
          </div>

          {/* 震动提醒 */}
          <div className="mb-4">
            <label className="flex items-center justify-between cursor-pointer group">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-hover:text-indigo-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
                <span className="text-sm font-medium text-gray-300 group-hover:text-indigo-300 transition-colors">
                  生成完成后震动提醒
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.enableVibration}
                onChange={(e) => handleVibrationToggle(e.target.checked)}
                className="w-5 h-5 text-indigo-600 rounded-xl bg-gray-800/70 backdrop-blur-sm border border-gray-700/50 focus:ring-indigo-500 transition-all duration-300"
              />
            </label>
          </div>

          {/* 自动保存 */}
          <div>
            <label className="flex items-center justify-between cursor-pointer group">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-hover:text-indigo-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                <span className="text-sm font-medium text-gray-300 group-hover:text-indigo-300 transition-colors">
                  自动保存生成结果
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.autoSave}
                onChange={(e) => handleAutoSaveToggle(e.target.checked)}
                className="w-5 h-5 text-indigo-600 rounded-xl bg-gray-800/70 backdrop-blur-sm border border-gray-700/50 focus:ring-indigo-500 transition-all duration-300"
              />
            </label>
          </div>
        </motion.div>

        {/* 高级选项 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6 shadow-lg"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            高级选项
          </h3>
          
          {/* 分辨率设置 */}
          <div className="mb-8">
            <h4 className="text-sm font-medium text-gray-300 mb-3">
              图片分辨率设置
            </h4>
            
            {/* 分辨率分类标签 */}
            <div className="flex gap-3 overflow-x-auto pb-2 mb-4">
              {getResolutionCategories().map((category) => (
                <motion.button
                  key={category}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSelectedResolutionCategory(category as ResolutionPreset['category']);
                    setCustomResolutionMode(false);
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                    selectedResolutionCategory === category
                      ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-lg'
                      : 'bg-gray-800/70 text-gray-300 hover:bg-gray-700/70'
                  }`}
                >
                  {category}
                </motion.button>
              ))}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCustomResolutionMode(true)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                  customResolutionMode
                    ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-lg'
                    : 'bg-gray-800/70 text-gray-300 hover:bg-gray-700/70'
                }`}
              >
                自定义
              </motion.button>
            </div>

            {/* 预设分辨率列表 */}
            <AnimatePresence mode="wait">
              {!customResolutionMode ? (
                <motion.div
                  key="preset"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid grid-cols-2 gap-3 mb-4"
                >
                  {getResolutionsByCategory(selectedResolutionCategory).map((preset) => (
                    <motion.button
                      key={preset.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => applyResolutionPreset(preset.width, preset.height)}
                      className={`px-4 py-3 rounded-xl text-sm transition-all duration-300 border ${
                        settings.width === preset.width && settings.height === preset.height
                          ? 'border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/20'
                          : 'border-gray-700/50 bg-gray-800/70 hover:bg-gray-700/70 hover:border-gray-600'
                      }`}
                    >
                      <div className="font-medium text-white">{preset.name}</div>
                      <div className="text-xs text-gray-400">{preset.description}</div>
                    </motion.button>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="custom"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid grid-cols-2 gap-4 mb-4"
                >
                  {/* 自定义宽度 */}
                  <div className="relative group">
                    <label className="block text-xs font-medium text-gray-400 mb-2">
                      宽度 (px)
                    </label>
                    <input
                      type="number"
                      min="512"
                      max="4096"
                      step="64"
                      value={settings.width}
                      onChange={(e) => handleWidthChange(Number(e.target.value))}
                      className="w-full px-4 py-3 bg-gray-900/70 text-white rounded-lg border border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                  </div>
                  
                  {/* 自定义高度 */}
                  <div className="relative group">
                    <label className="block text-xs font-medium text-gray-400 mb-2">
                      高度 (px)
                    </label>
                    <input
                      type="number"
                      min="512"
                      max="4096"
                      step="64"
                      value={settings.height}
                      onChange={(e) => handleHeightChange(Number(e.target.value))}
                      className="w-full px-4 py-3 bg-gray-900/70 text-white rounded-lg border border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Batch数量 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              一次生成图片数量: {settings.batchSize}
            </label>
            <input
              type="range"
              min="1"
              max="4"
              value={settings.batchSize}
              onChange={(e) => handleBatchSizeChange(Number(e.target.value))}
              className="w-full h-3 bg-gray-800/70 backdrop-blur-sm rounded-full appearance-none cursor-pointer accent-indigo-600"
            />
          </div>



          {/* 调试模式 */}
          <div>
            <label className="flex items-center justify-between cursor-pointer group">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-hover:text-indigo-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span className="text-sm font-medium text-gray-300 group-hover:text-indigo-300 transition-colors">
                  调试模式 (显示API请求结果)
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.debugMode}
                onChange={(e) => updateSettings({ ...settings, debugMode: e.target.checked })}
                className="w-5 h-5 text-indigo-600 rounded-xl bg-gray-800/70 backdrop-blur-sm border border-gray-700/50 focus:ring-indigo-500 transition-all duration-300"
              />
            </label>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default SettingsScreen;