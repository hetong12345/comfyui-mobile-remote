// 提示词模板类型定义
export interface PromptTemplate {
  id: string;
  name: string;
  category: '人物' | '场景' | '创意';
  template: string;
  description: string;
  placeholders?: string[];
}

// 提示词模板数据
export const promptTemplates: PromptTemplate[] = [
  // 人物类模板
  {
    id: 'character-1',
    name: '古风人物',
    category: '人物',
    template: '{性别}，{年龄}，古风服饰，{场景}，细致的面部特征，流畅的线条，中国风，高清',
    description: '生成具有中国古典风格的人物图像',
    placeholders: ['性别', '年龄', '场景']
  },
  {
    id: 'character-2',
    name: '现代人物',
    category: '人物',
    template: '{性别}，{年龄}，现代都市风格，{职业}，自然光线，高清细节，写实风格',
    description: '生成现代都市风格的人物图像',
    placeholders: ['性别', '年龄', '职业']
  },
  {
    id: 'character-3',
    name: '动漫人物',
    category: '人物',
    template: '{性别}，{年龄}，动漫风格，{发型}，{服装}，明亮的色彩，精致的五官，二次元',
    description: '生成动漫风格的人物图像',
    placeholders: ['性别', '年龄', '发型', '服装']
  },
  {
    id: 'character-4',
    name: '科幻人物',
    category: '人物',
    template: '{性别}，{年龄}，未来科技感，{服装}，机械元素，赛博朋克，霓虹效果，高清',
    description: '生成具有未来科技感的人物图像',
    placeholders: ['性别', '年龄', '服装']
  },
  {
    id: 'character-5',
    name: '奇幻人物',
    category: '人物',
    template: '{性别}，{年龄}，奇幻生物，{特征}，魔法元素，神秘氛围，史诗感，高清',
    description: '生成奇幻风格的人物图像',
    placeholders: ['性别', '年龄', '特征']
  },
  {
    id: 'character-6',
    name: '儿童人物',
    category: '人物',
    template: '可爱的{性别}儿童，{年龄}岁，{表情}，{服装}，温馨场景，柔和色彩，治愈风格',
    description: '生成可爱的儿童图像',
    placeholders: ['性别', '年龄', '表情', '服装']
  },
  {
    id: 'character-7',
    name: '老人人物',
    category: '人物',
    template: '慈祥的{性别}老人，{年龄}岁，{表情}，{服装}，温暖光线，岁月痕迹，写实风格',
    description: '生成慈祥的老人图像',
    placeholders: ['性别', '年龄', '表情', '服装']
  },
  
  // 场景类模板
  {
    id: 'scene-1',
    name: '自然风景',
    category: '场景',
    template: '{场景类型}，{季节}，{时间}，{天气}，壮丽景观，细致纹理，高清，写实风格',
    description: '生成壮丽的自然风景图像',
    placeholders: ['场景类型', '季节', '时间', '天气']
  },
  {
    id: 'scene-2',
    name: '城市景观',
    category: '场景',
    template: '{城市类型}，{时间}，{天气}，繁华街道，建筑细节，光影效果，高清，现代感',
    description: '生成繁华的城市景观图像',
    placeholders: ['城市类型', '时间', '天气']
  },
  {
    id: 'scene-3',
    name: '室内场景',
    category: '场景',
    template: '{室内类型}，{风格}，{光线}，家具细节，温馨氛围，高清，写实风格',
    description: '生成温馨的室内场景图像',
    placeholders: ['室内类型', '风格', '光线']
  },
  {
    id: 'scene-4',
    name: '奇幻场景',
    category: '场景',
    template: '{奇幻环境}，魔法元素，神秘氛围，色彩绚丽，史诗感，高清，梦幻风格',
    description: '生成奇幻风格的场景图像',
    placeholders: ['奇幻环境']
  },
  
  // 创意类模板
  {
    id: 'creative-1',
    name: '抽象艺术',
    category: '创意',
    template: '抽象风格，{色彩}，{形状}，流动感，艺术气息，高清，现代艺术',
    description: '生成抽象艺术风格的图像',
    placeholders: ['色彩', '形状']
  },
  {
    id: 'creative-2',
    name: '概念设计',
    category: '创意',
    template: '{设计主题}，概念艺术，未来感，创新设计，细节丰富，高清，专业级',
    description: '生成专业级的概念设计图像',
    placeholders: ['设计主题']
  },
  {
    id: 'creative-3',
    name: '插画风格',
    category: '创意',
    template: '{插画类型}，{风格}，{主题}，线条流畅，色彩明快，高清，插画艺术',
    description: '生成插画风格的图像',
    placeholders: ['插画类型', '风格', '主题']
  }
];

// 按分类获取模板
export const getTemplatesByCategory = (category: PromptTemplate['category']): PromptTemplate[] => {
  return promptTemplates.filter(template => template.category === category);
};

// 获取所有分类
export const getCategories = (): PromptTemplate['category'][] => {
  return Array.from(new Set(promptTemplates.map(template => template.category))) as PromptTemplate['category'][];
};

// 获取模板详情
export const getTemplateById = (id: string): PromptTemplate | undefined => {
  return promptTemplates.find(template => template.id === id);
};
