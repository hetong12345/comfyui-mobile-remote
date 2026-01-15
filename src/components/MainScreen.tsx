import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store';
import { generateImage } from '../utils/api';
import type { PromptTemplate } from '../utils/promptTemplates';
import { getCategories, getTemplatesByCategory } from '../utils/promptTemplates';

import HistoryScreen from './HistoryScreen';
import SettingsScreen from './SettingsScreen';
import ImageViewer from './ImageViewer';

const MainScreen: React.FC = () => {
  const {
    prompt,
    setPrompt,
    generatedImages,
    setGeneratedImages,
    generationResult,
    setGenerationResult,
    generationStatus,
    settings,
    addToHistory
  } = useAppStore();
  
  // 重置生成状态
  const resetGenerationStatus = () => {
    useAppStore.setState({
      generationStatus: {
        isGenerating: false,
        progress: 0,
        statusText: '',
        queuePosition: null,
        currentStep: 0,
        totalSteps: 0,
      },
    });
  };
  
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<PromptTemplate['category']>('人物');
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null);
  const [templateInputs, setTemplateInputs] = useState<Record<string, string>>({});
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // 预设提示词标签
  const presetPrompts = ['动漫女孩', '风景', '机甲', '科幻', '动物', '美食', '建筑', '抽象'];
  
  // 自动调整文本框高度
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setPrompt(value);
    
    // 自动调整高度
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };
  
  // 清空输入
  const handleClear = () => {
    setPrompt('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };
  
  // 选择预设提示词
  const handleSelectPreset = (preset: string) => {
    setPrompt(preset);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  // 打开模板选择器
  const openTemplateSelector = () => {
    setShowTemplateSelector(true);
    setSelectedCategory('人物');
    setSelectedTemplate(null);
    setTemplateInputs({});
  };

  // 应用模板
  const applyTemplate = () => {
    if (!selectedTemplate) return;
    
    let appliedPrompt = selectedTemplate.template;
    // 替换所有占位符
    selectedTemplate.placeholders?.forEach(placeholder => {
      const value = templateInputs[placeholder] || placeholder;
      appliedPrompt = appliedPrompt.replace(new RegExp(`\\{${placeholder}\\}`), value);
    });
    
    setPrompt(appliedPrompt);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
    
    setShowTemplateSelector(false);
  };

  // 渲染模板选择器
  const renderTemplateSelector = () => (
    <AnimatePresence>
      {showTemplateSelector && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-gray-950/95 backdrop-blur-sm z-50 overflow-y-auto"
        >
          <div className="p-6">
            {/* 顶部导航 */}
            <div className="flex items-center justify-between mb-6">
              <motion.h2 
                className="text-2xl font-bold text-white"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                选择提示词模板
              </motion.h2>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 15 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowTemplateSelector(false)}
                className="p-2 text-gray-300 hover:text-white bg-white/10 backdrop-blur-sm rounded-full transition-all"
              >
                ✕
              </motion.button>
            </div>

            {/* 分类选择 */}
            <motion.div 
              className="mb-6 flex gap-3 overflow-x-auto pb-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {getCategories().map((category) => (
                <motion.button
                  key={category}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSelectedCategory(category);
                    setSelectedTemplate(null);
                    setTemplateInputs({});
                  }}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-lg'
                      : 'bg-gray-800/70 text-gray-300 hover:bg-gray-700/70'
                  }`}
                >
                  {category}
                </motion.button>
              ))}
            </motion.div>

            {/* 模板列表 */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {getTemplatesByCategory(selectedCategory).map((template) => (
                <motion.div
                  key={template.id}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedTemplate(template);
                    // 初始化输入值
                    const initialInputs: Record<string, string> = {};
                    template.placeholders?.forEach(placeholder => {
                      initialInputs[placeholder] = '';
                    });
                    setTemplateInputs(initialInputs);
                  }}
                  className={`p-5 rounded-xl border transition-all duration-300 ${
                    selectedTemplate?.id === template.id
                      ? 'border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/20'
                      : 'border-gray-700/50 bg-gray-800/70 hover:bg-gray-700/70 hover:border-gray-600'
                  }`}
                >
                  <h3 className="text-lg font-semibold text-white mb-2">{template.name}</h3>
                  <p className="text-sm text-gray-400 mb-3">{template.description}</p>
                  <div className="text-xs text-gray-500 bg-gray-900/50 p-3 rounded-lg">
                    {template.template}
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* 模板编辑区 */}
            <AnimatePresence>
              {selectedTemplate && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-gray-800/70 border border-gray-700/50 rounded-xl p-5 mb-6 overflow-hidden"
                >
                  <h3 className="text-lg font-semibold text-white mb-4">编辑模板参数</h3>
                  <div className="space-y-4">
                    {selectedTemplate.placeholders?.map((placeholder) => (
                      <div key={placeholder}>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          {placeholder}
                        </label>
                        <input
                          type="text"
                          value={templateInputs[placeholder] || ''}
                          onChange={(e) => setTemplateInputs({
                            ...templateInputs,
                            [placeholder]: e.target.value
                          })}
                          placeholder={`输入${placeholder}...`}
                          className="w-full px-4 py-3 bg-gray-900/70 text-white rounded-lg border border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-300 mb-2">预览效果</h4>
                    <div className="p-4 bg-gray-900/70 rounded-lg border border-gray-700/50">
                      <p className="text-white">
                        {(() => {
                          let preview = selectedTemplate.template;
                          selectedTemplate.placeholders?.forEach(placeholder => {
                            const value = templateInputs[placeholder] || placeholder;
                            preview = preview.replace(new RegExp(`\\{${placeholder}\\}`), value);
                          });
                          return preview;
                        })()}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 应用按钮 */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={applyTemplate}
              disabled={!selectedTemplate}
              className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
                selectedTemplate
                  ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 shadow-lg'
                  : 'bg-gray-800/50 border border-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              应用模板
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
  
  // 生成图像
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      // 使用现代化的toast提示代替alert
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in-out';
      toast.textContent = '请输入提示词';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
      return;
    }
    
    try {
      resetGenerationStatus();
      
      const response = await generateImage(
        prompt
      );
      
      if (response.success && response.data?.imageUrls) {
        setGeneratedImages(response.data.imageUrls);
        setGenerationResult(response.data);
        
        // 保存到历史记录
        if (settings.autoSave) {
          addToHistory({
            prompt,
            imageUrls: response.data.imageUrls, // 保存所有图片
            timestamp: Date.now(),
            resolution: response.data.resolution || '512x512',
            model: response.data.model || 'Unknown',
            duration: response.data.duration || 0,
          });
        }
        
        // 震动提醒
        if (settings.enableVibration && navigator.vibrate) {
          navigator.vibrate([100, 50, 100]);
        }
      } else {
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in-out';
        toast.textContent = `生成失败: ${response.error}`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
      }
    } catch (error) {
      console.error('Generate error:', error);
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in-out';
      toast.textContent = '生成过程中发生错误';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    }
  };
  
  // 重新生成
  const handleRegenerate = () => {
    handleGenerate();
  };
  
  // 渲染顶部导航栏
  const renderHeader = () => (
    <motion.div 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900 shadow-lg"
    >
      <motion.h1 
        className="text-2xl font-bold text-white flex items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        AI 图像生成器
      </motion.h1>
      <div className="flex space-x-3">
        <motion.button 
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowHistory(true)}
          className="p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300"
          aria-label="历史记录"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </motion.button>
        <motion.button 
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowSettings(true)}
          className="p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300"
          aria-label="设置"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </motion.button>
      </div>
    </motion.div>
  );
  
  // 渲染输入区域
  const renderInputArea = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="p-6 space-y-5"
    >
      {/* 输入区域标题 */}
      <motion.h2 
        className="text-xl font-bold text-white flex items-center gap-2"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
        创意提示词
      </motion.h2>

      {/* 正面提示词 */}
      <div className="relative group">
        <motion.div 
          className={`absolute inset-0 rounded-2xl transition-all duration-300 ${isFocused ? 'bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 shadow-lg shadow-indigo-500/20' : 'bg-gray-900/50 backdrop-blur-sm'}`}
          animate={{ 
            boxShadow: isFocused ? '0 0 20px rgba(99, 102, 241, 0.3)' : 'none' 
          }}
        />
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={handleTextareaChange}
          placeholder="输入创意提示词...例如：一只可爱的猫咪，在阳光下，毛发蓬松，高清细节"
          className="w-full p-5 bg-transparent border border-gray-700/50 rounded-2xl text-white resize-none min-h-[150px] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 z-10 relative"
          maxLength={1000}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
              handleGenerate();
            }
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        
        {/* 字数统计 */}
        <div className="absolute bottom-4 right-4 text-xs text-gray-400 bg-gray-900/70 px-2 py-1 rounded-full backdrop-blur-sm transition-all duration-300">
          {prompt.length}/1000
        </div>
        
        {/* 清空按钮 */}
        {prompt && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.1, rotate: 15, backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
            whileTap={{ scale: 0.9 }}
            onClick={handleClear}
            className="absolute top-4 right-4 p-2 bg-white/10 backdrop-blur-sm rounded-full text-gray-300 hover:text-white transition-all duration-300"
            aria-label="清空"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </motion.button>
        )}
      </div>
      
      {/* 模板选择和预设提示词 */}
      <div className="space-y-4">
        {/* 模板选择按钮 */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          whileHover={{ scale: 1.02, y: -2, boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.3)' }}
          whileTap={{ scale: 0.98 }}
          onClick={openTemplateSelector}
          className="w-full py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <div className="flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            打开提示词模板
          </div>
        </motion.button>
        
        {/* 预设提示词标签 */}
        <div className="flex flex-wrap gap-2">
          {presetPrompts.map((preset, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.05 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSelectPreset(preset)}
              className="px-4 py-2 bg-white/5 backdrop-blur-sm hover:bg-white/10 text-sm text-gray-300 hover:text-white rounded-full border border-gray-700/50 hover:border-indigo-500/50 transition-all duration-300"
            >
              {preset}
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
  
  // 渲染生成按钮
  const renderGenerateButton = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="p-6"
    >
      <motion.button
        whileHover={{ scale: generationStatus.isGenerating || !prompt.trim() ? 1 : 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleGenerate}
        disabled={generationStatus.isGenerating || !prompt.trim()}
        className={`w-full py-5 rounded-2xl font-semibold text-lg transition-all duration-300 relative overflow-hidden ${
          generationStatus.isGenerating 
            ? 'bg-gray-800/50 border border-gray-700 cursor-not-allowed' 
            : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl hover:shadow-purple-500/30'
        }`}
      >
        {generationStatus.isGenerating ? (
          <div className="flex items-center justify-center space-x-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
            />
            <span>{generationStatus.statusText || '生成中...'}</span>
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>生成图像</span>
          </div>
        )}
        
        {/* 进度条 */}
        {generationStatus.isGenerating && generationStatus.progress > 0 && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${generationStatus.progress}%` }}
            className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 transition-all duration-500"
          />
        )}
      </motion.button>
      
      {/* 详细进度信息 */}
      {generationStatus.isGenerating && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 text-center"
        >
          <div className="flex items-center justify-center gap-2 text-sm text-gray-300">
            <span>{generationStatus.statusText || '处理中...'}</span>
            {generationStatus.currentStep > 0 && generationStatus.totalSteps > 0 && (
              <span className="bg-gray-800/70 px-3 py-1 rounded-full text-xs">
                步骤 {generationStatus.currentStep}/{generationStatus.totalSteps}
              </span>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
  
  // 渲染结果展示区域
  const renderResultArea = () => (
    <AnimatePresence>
      {(generatedImages.length > 0 || generationStatus.isGenerating) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.5, type: "spring", damping: 25, stiffness: 300 }}
          className="p-6"
        >
          <motion.div
            className="bg-gray-900/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-800/50 shadow-xl"
            whileHover={{ y: -5, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)' }}
            transition={{ duration: 0.3 }}
          >
            {/* 图片展示 */}
            <motion.div 
              className="relative bg-gradient-to-br from-gray-900 to-gray-800 cursor-pointer overflow-hidden"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              {generationStatus.isGenerating ? (
                <div className="w-full h-full flex items-center justify-center aspect-square">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-16 h-16 border-4 border-white border-t-transparent rounded-full"
                  />
                  <div className="ml-4 text-white text-lg">
                    <div>{generationStatus.statusText || '生成中...'}</div>
                    {generationStatus.currentStep > 0 && generationStatus.totalSteps > 0 && (
                      <div className="text-sm text-gray-400 mt-1">
                        步骤 {generationStatus.currentStep}/{generationStatus.totalSteps}
                      </div>
                    )}
                  </div>
                </div>
              ) : generatedImages.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
                  {generatedImages.map((image, index) => (
                    <motion.div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Generated Image ${index + 1}`}
                        className="w-full h-auto rounded-lg shadow-lg cursor-pointer hover:opacity-95 transition-opacity"
                        onClick={() => setShowImageViewer(true)}
                        onLoad={() => {
                          // 图片加载完成后显示
                          const imgElement = document.getElementById(`generated-image-${index}`);
                          if (imgElement) {
                            imgElement.style.opacity = '1';
                          }
                        }}
                        style={{ opacity: 0, transition: 'opacity 0.5s ease-in-out' }}
                        id={`generated-image-${index}`}
                      />
                      {/* 下载按钮 */}
                      <button
                        className="absolute bottom-3 right-3 bg-blue-600 text-white p-2 rounded-full shadow-md hover:bg-blue-700 transition-colors opacity-0 group-hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          const link = document.createElement('a');
                          link.href = image;
                          link.download = `generated-image-${Date.now()}-${index + 1}.png`;
                          link.click();
                        }}
                        aria-label="下载图片"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                          <polyline points="7 10 12 15 17 10"></polyline>
                          <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                      </button>
                      {/* 图片序号 */}
                      <div className="absolute top-3 left-3 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-sm">
                        {index + 1}/{generatedImages.length}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end justify-center">
                <span className="text-white font-medium mb-6 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">点击查看大图</span>
              </div>
            </motion.div>
            
            {/* 生成信息卡片 */}
            <div className="p-5 border-t border-gray-800/50">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-gray-400 text-xs mb-1">图片数量</div>
                  <div className="text-white font-medium">{generatedImages.length}</div>
                </div>
                <div className="text-center">
                  <div className="text-gray-400 text-xs mb-1">模型</div>
                  <div className="text-white font-medium">{generationResult?.model || '未知模型'}</div>
                </div>
                <div className="text-center">
                  <div className="text-gray-400 text-xs mb-1">耗时</div>
                  <div className="text-white font-medium">{generationResult?.duration || '0.0'}s</div>
                </div>
              </div>
            </div>
            
            {/* 操作按钮 */}
            <div className="p-5 flex gap-4 border-t border-gray-800/50">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleRegenerate}
                className="flex-1 py-4 bg-gray-800/70 hover:bg-gray-700/70 rounded-xl font-medium text-gray-200 border border-gray-700/50 hover:border-indigo-500/50 transition-all duration-300"
              >
                <div className="flex items-center justify-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  重新生成
                </div>
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowImageViewer(true)}
                className="flex-1 py-4 bg-gradient-to-r from-indigo-600/90 via-purple-600/90 to-pink-600/90 hover:from-indigo-700/90 hover:via-purple-700/90 hover:to-pink-700/90 rounded-xl font-medium text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center justify-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  查看详情
                </div>
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white overflow-x-hidden">
      {/* 背景装饰 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div 
          className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.7, 0.5]
          }}
          transition={{ 
            repeat: Infinity,
            duration: 8,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.7, 0.5]
          }}
          transition={{ 
            repeat: Infinity,
            duration: 10,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* 顶部标题栏 */}
      {renderHeader()}
      
      {/* 主内容区域 */}
      <div className="pb-20 relative z-10">
        {/* 输入区域 */}
        {renderInputArea()}
        
        {/* 生成按钮 */}
        {renderGenerateButton()}
        
        {/* 结果展示区域 */}
        {renderResultArea()}
      </div>

      {/* 历史记录模态框 */}
      {showHistory && (
        <HistoryScreen onClose={() => setShowHistory(false)} />
      )}

      {/* 设置面板模态框 */}
      {showSettings && (
        <SettingsScreen onClose={() => setShowSettings(false)} />
      )}

      {/* 图片查看模态框 */}
      {showImageViewer && generatedImages.length > 0 && (
        <ImageViewer 
          imageUrl={generatedImages[0]} 
          imageUrls={generatedImages} 
          onClose={() => setShowImageViewer(false)} 
        />
      )}

      {/* 模板选择器 */}
      {renderTemplateSelector()}
    </div>
  );
};

export default MainScreen;