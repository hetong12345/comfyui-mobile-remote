import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { downloadImage } from '../utils/api';

interface ImageViewerProps {
  imageUrl: string;
  imageUrls?: string[];
  onClose: () => void;
}

const ImageViewer: React.FC<ImageViewerProps> = ({ imageUrl, imageUrls = [], onClose }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [showOptions, setShowOptions] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // 获取当前图片
  const currentImageUrl = imageUrls[currentIndex] || imageUrl;

  // 隐藏选项栏（用于全屏查看）
  const toggleOptions = () => {
    setShowOptions(!showOptions);
  };

  // 下载图片
  const handleDownload = async () => {
    try {
      setIsSaving(true);
      const fileName = imageUrls.length > 1 
        ? `ai-generated-image-${Date.now()}-${currentIndex + 1}.png` 
        : `ai-generated-image-${Date.now()}.png`;
      await downloadImage(currentImageUrl, fileName);
    } catch (error) {
      console.error('下载图片失败:', error);
      alert('下载失败，请重试');
    } finally {
      setIsSaving(false);
    }
  };

  // 分享图片
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'AI生成图像',
          text: '使用AI生成的图像',
          url: currentImageUrl,
        });
      } else {
        // 降级方案：复制链接
        await navigator.clipboard.writeText(currentImageUrl);
        alert('图片链接已复制到剪贴板');
      }
    } catch (error) {
      console.error('分享失败:', error);
      alert('分享失败，请重试');
    }
  };
  
  // 切换到上一张图片
  const handlePrevImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? imageUrls.length - 1 : prevIndex - 1));
  };
  
  // 切换到下一张图片
  const handleNextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex === imageUrls.length - 1 ? 0 : prevIndex + 1));
  };

  // 点击外部关闭
  const handleOutsideClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black z-50 flex flex-col"
      onClick={handleOutsideClick}
    >
      {/* 顶部选项栏 */}
      {showOptions && (
        <motion.div
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          exit={{ y: -100 }}
          className="sticky top-0 z-10 bg-black bg-opacity-70 backdrop-blur-md flex items-center justify-between px-4 py-3"
        >
          <button
            onClick={onClose}
            className="text-white p-2 rounded-full hover:bg-white hover:bg-opacity-10 transition-colors"
          >
            ✕
          </button>
          <h3 className="text-white font-medium">图片查看</h3>
          <div className="w-8"></div> {/* 占位，保持标题居中 */}
        </motion.div>
      )}

      {/* 图片查看区域 */}
      <div className="flex-1 relative overflow-hidden">
        <TransformWrapper
          initialScale={1}
          minScale={0.5}
          maxScale={5}
          centerOnInit
        >
          {({ zoomIn, zoomOut, resetTransform }) => (
            <>
              <TransformComponent>
        <div className="w-full h-full">
          <img
            src={currentImageUrl}
            alt={`Generated image ${currentIndex + 1}`}
            className="w-full h-full object-contain cursor-pointer"
            onClick={toggleOptions}
          />
        </div>
      </TransformComponent>

              {/* 图片数量显示 */}
              {showOptions && imageUrls.length > 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-1 rounded-full text-sm"
                >
                  {currentIndex + 1}/{imageUrls.length}
                </motion.div>
              )}
              
              {/* 缩放控制按钮 */}
              {showOptions && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex gap-2"
                >
                  <button
                    onClick={() => zoomOut()}
                    className="bg-white bg-opacity-80 rounded-full p-2 shadow-lg hover:bg-opacity-100 transition-colors"
                    aria-label="缩小"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </button>
                  <button
                    onClick={() => resetTransform()}
                    className="bg-white bg-opacity-80 rounded-full p-2 shadow-lg hover:bg-opacity-100 transition-colors"
                    aria-label="重置缩放"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                  <button
                    onClick={() => zoomIn()}
                    className="bg-white bg-opacity-80 rounded-full p-2 shadow-lg hover:bg-opacity-100 transition-colors"
                    aria-label="放大"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                </motion.div>
              )}
              
              {/* 图片切换按钮 */}
              {showOptions && imageUrls.length > 1 && (
                <>
                  <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 hover:bg-opacity-80 rounded-full p-3 shadow-lg transition-colors"
                    onClick={handlePrevImage}
                    aria-label="上一张"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </motion.button>
                  <motion.button
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 hover:bg-opacity-80 rounded-full p-3 shadow-lg transition-colors"
                    onClick={handleNextImage}
                    aria-label="下一张"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </motion.button>
                </>
              )}
            </>
          )}
        </TransformWrapper>
      </div>

      {/* 底部操作栏 */}
      {showOptions && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          className="sticky bottom-0 z-10 bg-black bg-opacity-70 backdrop-blur-md flex justify-around p-4"
        >
          <button
            onClick={handleDownload}
            disabled={isSaving}
            className="flex flex-col items-center gap-1 text-white opacity-80 hover:opacity-100 transition-opacity"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span className="text-xs">下载</span>
          </button>

          <button
            onClick={handleShare}
            disabled={isSaving}
            className="flex flex-col items-center gap-1 text-white opacity-80 hover:opacity-100 transition-opacity"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            <span className="text-xs">分享</span>
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ImageViewer;