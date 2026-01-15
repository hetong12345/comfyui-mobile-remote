import React, { useState } from 'react';
import { useAppStore } from '../store';
import { exportHistoryAsJson } from '../utils/storage';
import { motion, AnimatePresence } from 'framer-motion';
import type { HistoryItem as HistoryItemType } from '../types';

interface HistoryScreenProps {
  onClose: () => void;
}

const HistoryScreen: React.FC<HistoryScreenProps> = ({ onClose }) => {
  const { history, setPrompt, removeFromHistory } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  // 过滤历史记录
  const filteredHistory = React.useMemo(() => {
    if (searchQuery.trim() === '') {
      return history;
    }

    const query = searchQuery.toLowerCase();
    return history.filter((item: HistoryItemType) => 
      item.prompt.toLowerCase().includes(query) ||
      item.model?.toLowerCase().includes(query)
    );
  }, [history, searchQuery]);

  // 重新生成
  const handleRegenerate = (item: HistoryItemType) => {
    setPrompt(item.prompt);
    onClose();
  };

  // 删除历史记录
  const handleDelete = (id: string) => {
    removeFromHistory(id);
  };

  // 导出JSON
  const handleExportJSON = () => {
    exportHistoryAsJson();
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gray-950 z-50 overflow-y-auto"
    >
      {/* 顶部导航栏 */}
      <div className="sticky top-0 z-10 bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">历史记录</h2>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleExportJSON}
            className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            导出JSON
          </button>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-full transition-colors"
          >
            ✕
          </button>
        </div>
      </div>

      {/* 搜索框 */}
      <div className="p-4 bg-gray-900">
        <input
          type="text"
          placeholder="搜索提示词或模型..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* 历史记录列表 */}
      <div className="p-4">
        <AnimatePresence>
          {filteredHistory.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>暂无历史记录</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredHistory.map((item: HistoryItemType) => (
                <HistoryItem 
                  key={item.id}
                  item={item}
                  onRegenerate={handleRegenerate}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

interface HistoryItemProps {
  item: HistoryItemType;
  onRegenerate: (item: HistoryItemType) => void;
  onDelete: (id: string) => void;
}

const HistoryItem: React.FC<HistoryItemProps> = ({ item, onRegenerate, onDelete }) => {
  

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 group"
    >
      {/* 缩略图 */}
      <div className="relative aspect-square overflow-hidden bg-gray-800">
        {item.imageUrls && item.imageUrls[0] && (
          <img
            src={item.imageUrls[0]}
            alt={item.prompt}
            className="w-full h-full object-cover"
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzMzMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNjY2Ij48cGF0aCBkPSJNMCAwaDEwMHYxMDBIMHoiIGZpbGw9Im5vbmUiLz48L3RleHQ+PC9zdmc+';
            }}
          />
        )}
      </div>

      {/* 内容 */}
      <div className="p-3">
        {/* 提示词摘要 */}
        <p className="text-sm text-gray-300 line-clamp-2 mb-2">
          {item.prompt}
        </p>

        {/* 时间和模型 */}
        <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
          <span>{new Date(item.timestamp).toLocaleString()}</span>
          {item.model && (
            <span className="bg-gray-800 px-2 py-0.5 rounded-full">{item.model}</span>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onRegenerate(item)}
            className="flex-1 px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            aria-label="重新生成"
          >
            生成
          </button>

          <button
            onClick={() => onDelete(item.id)}
            className="px-2 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
            aria-label="删除"
          >
            删除
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default HistoryScreen;
