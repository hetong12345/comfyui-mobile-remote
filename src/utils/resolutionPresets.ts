// 分辨率预设类型定义
export interface ResolutionPreset {
  id: string;
  name: string;
  category: '正方形' | '竖屏' | '横屏' | '特殊比例';
  width: number;
  height: number;
  description: string;
}

// 分辨率预设数据
export const resolutionPresets: ResolutionPreset[] = [
  // 正方形分辨率
  {
    id: 'square-1',
    name: '512x512',
    category: '正方形',
    width: 512,
    height: 512,
    description: '基础正方形分辨率'
  },
  {
    id: 'square-2',
    name: '768x768',
    category: '正方形',
    width: 768,
    height: 768,
    description: '中等正方形分辨率'
  },
  {
    id: 'square-3',
    name: '1024x1024',
    category: '正方形',
    width: 1024,
    height: 1024,
    description: '高清正方形分辨率'
  },
  {
    id: 'square-4',
    name: '1280x1280',
    category: '正方形',
    width: 1280,
    height: 1280,
    description: '超清正方形分辨率'
  },
  
  // 竖屏分辨率
  {
    id: 'portrait-1',
    name: '512x768',
    category: '竖屏',
    width: 512,
    height: 768,
    description: '手机竖屏分辨率'
  },
  {
    id: 'portrait-2',
    name: '768x1024',
    category: '竖屏',
    width: 768,
    height: 1024,
    description: '平板竖屏分辨率'
  },
  {
    id: 'portrait-3',
    name: '1024x1536',
    category: '竖屏',
    width: 1024,
    height: 1536,
    description: '高清竖屏分辨率'
  },
  {
    id: 'portrait-4',
    name: '1440x2160',
    category: '竖屏',
    width: 1440,
    height: 2160,
    description: '4K竖屏分辨率'
  },
  
  // 横屏分辨率
  {
    id: 'landscape-1',
    name: '768x512',
    category: '横屏',
    width: 768,
    height: 512,
    description: '手机横屏分辨率'
  },
  {
    id: 'landscape-2',
    name: '1024x768',
    category: '横屏',
    width: 1024,
    height: 768,
    description: '平板横屏分辨率'
  },
  {
    id: 'landscape-3',
    name: '1280x720',
    category: '横屏',
    width: 1280,
    height: 720,
    description: '高清横屏分辨率'
  },
  {
    id: 'landscape-4',
    name: '1920x1080',
    category: '横屏',
    width: 1920,
    height: 1080,
    description: '全高清分辨率'
  },
  {
    id: 'landscape-5',
    name: '2560x1440',
    category: '横屏',
    width: 2560,
    height: 1440,
    description: '2K分辨率'
  },
  {
    id: 'landscape-6',
    name: '3840x2160',
    category: '横屏',
    width: 3840,
    height: 2160,
    description: '4K分辨率'
  },
  
  // 特殊比例分辨率
  {
    id: 'special-1',
    name: '3440x1440',
    category: '特殊比例',
    width: 3440,
    height: 1440,
    description: '21:9超宽屏分辨率'
  },
  {
    id: 'special-2',
    name: '1920x1280',
    category: '特殊比例',
    width: 1920,
    height: 1280,
    description: '3:2比例分辨率'
  },
  {
    id: 'special-3',
    name: '1024x768',
    category: '特殊比例',
    width: 1024,
    height: 768,
    description: '4:3比例分辨率'
  }
];

// 按分类获取分辨率预设
export const getResolutionsByCategory = (category: ResolutionPreset['category']): ResolutionPreset[] => {
  return resolutionPresets.filter(preset => preset.category === category);
};

// 获取所有分辨率分类
export const getResolutionCategories = (): string[] => {
  return Array.from(new Set(resolutionPresets.map(preset => preset.category)));
};

// 获取分辨率预设详情
export const getResolutionById = (id: string): ResolutionPreset | undefined => {
  return resolutionPresets.find(preset => preset.id === id);
};
