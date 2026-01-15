import axios from 'axios';
import { useAppStore } from '../store';
import type { ApiResponse } from '../types';
import { showApiDebugNotification } from './notification';

// 创建axios实例
const api = axios.create({
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 生成图像函数
export const generateImage = async (
  prompt: string,
  negativePrompt: string = '',
  onProgress?: (progress: number, statusText: string, currentStep?: number, totalSteps?: number) => void
): Promise<ApiResponse> => {
  const { settings, envConfig } = useAppStore.getState();
  
  if (!settings.apiUrl) {
    return {
      success: false,
      error: 'API URL not configured. Please set it in the settings.',
    };
  }
  
  // 如果没有提供负面提示词，使用环境变量中的默认值
  const finalNegativePrompt = negativePrompt || envConfig.defaultNegativePrompt;

  try {
    // 更新生成状态
    useAppStore.setState({
      generationStatus: {
        isGenerating: true,
        progress: 0,
        statusText: '正在排队...',
        queuePosition: null,
        currentStep: 0,
        totalSteps: 0,
      },
    });

    // 准备请求数据
    // 使用默认的ComfyUI工作流配置

      // 发送生成请求 - ComfyUI使用/prompt端点
    // 开发环境使用相对路径以便代理生效
    const apiUrl = import.meta.env.DEV ? '/prompt' : `${settings.apiUrl}/prompt`;
    
    // 使用用户提供的ComfyUI工作流JSON
    const comfyUiRequestData = {
      prompt: {
        "3": {
          "inputs": {
            "seed": Math.floor(Math.random() * 1000000000),
            "steps": 9,
            "cfg": 1,
            "sampler_name": "euler",
            "scheduler": "simple",
            "denoise": 1,
            "model": ["11", 0],
            "positive": ["6", 0],
            "negative": ["7", 0],
            "latent_image": ["13", 0]
          },
          "class_type": "KSampler",
          "_meta": {
            "title": "K采样器"
          }
        },
        "6": {
          "inputs": {
            "text": prompt,
            "clip": ["42", 1]
          },
          "class_type": "CLIPTextEncode",
          "_meta": {
            "title": "CLIP Text Encode (Positive Prompt)"
          }
        },
        "7": {
          "inputs": {
            "text": finalNegativePrompt,
            "clip": ["42", 1]
          },
          "class_type": "CLIPTextEncode",
          "_meta": {
            "title": "CLIP Text Encode (Negative Prompt)"
          }
        },
        "8": {
          "inputs": {
            "samples": ["3", 0],
            "vae": ["42", 2]
          },
          "class_type": "VAEDecode",
          "_meta": {
            "title": "VAE解码"
          }
        },
        "9": {
          "inputs": {
            "filename_prefix": "ComfyUI",
            "images": ["8", 0]
          },
          "class_type": "SaveImage",
          "_meta": {
            "title": "保存图片"
          }
        },
        "11": {
          "inputs": {
            "shift": 3,
            "model": [
              "42",
              0
            ]
          },
          "class_type": "ModelSamplingAuraFlow",
          "_meta": {
            "title": "采样算法（AuraFlow）"
          }
        },
        "13": {
          "inputs": {
            "width": settings.width,
            "height": settings.height,
            "batch_size": settings.batchSize
          },
          "class_type": "EmptySD3LatentImage",
          "_meta": {
            "title": "Empty SD3 Latent Image"
          }
        },
        "42": {
          "inputs": {
            "ckpt_name": "Z-image\\redcraftRedzimageUpdatedDEC03_redzimage15AIO.safetensors"
          },
          "class_type": "CheckpointLoaderSimple",
          "_meta": {
            "title": "加载检查点"
          }
        }
      }
    };

    const response = await api.post(apiUrl, comfyUiRequestData);
    // 显示调试通知
    showApiDebugNotification(apiUrl, '/prompt', response.data);

    // 处理ComfyUI的响应格式，转换为项目期望的ApiResponse类型
    if (response.status === 200 && response.data) {
      const promptId = response.data.prompt_id;
      // 从设置中获取API URL，用于构建图片查看链接
      const baseUrl = import.meta.env.DEV ? '' : settings.apiUrl;
      
      // ComfyUI返回的是{ prompt_id, number, node_errors }格式
      // 由于ComfyUI是异步生成图像，我们需要轮询获取结果
      await waitForGenerationComplete(promptId, settings.apiUrl, onProgress);

      // 尝试获取最新生成的图片信息
      let imageUrls: string[] = [];
      try {
        // 开发环境使用相对路径以便代理生效
        const historyUrl = import.meta.env.DEV ? `/history/${promptId}` : `${settings.apiUrl}/history/${promptId}`;
        console.log('尝试获取历史记录:', historyUrl);
        const historyResponse = await api.get(historyUrl);
        
        // 显示调试通知
        showApiDebugNotification(settings.apiUrl, `/history/${promptId}`, historyResponse.data);
        
        console.log('历史记录响应数据:', JSON.stringify(historyResponse.data, null, 2));
        
        // 根据官方示例，历史记录数据结构为 {prompt_id: {outputs: {...}}}
        const historyData = historyResponse.data;
        
        // 验证历史记录数据结构
        if (historyData) {
          console.log('historyData存在:', typeof historyData);
          console.log('promptId:', promptId);
          console.log('promptId是否在historyData中:', promptId in historyData);
          
          if (typeof historyData === 'object' && promptId in historyData) {
            const generationResult = historyData[promptId];
            console.log('generationResult:', JSON.stringify(generationResult, null, 2));
            
            if (generationResult.outputs) {
              console.log('找到outputs字段');
              // 查找包含图片输出的节点
              for (const nodeId in generationResult.outputs) {
                console.log('检查节点:', nodeId);
                const nodeOutput = generationResult.outputs[nodeId];
                
                if (nodeOutput.images && nodeOutput.images.length > 0) {
                  console.log('找到图片输出:', JSON.stringify(nodeOutput.images, null, 2));
                  
                  // 处理所有生成的图片
                  for (const image of nodeOutput.images) {
                    // 根据官方示例，每张图片包含filename、subfolder和type三个字段
                    const filename = image.filename;
                    const subfolder = image.subfolder || '';
                    const type = image.type || 'output';
                    
                    console.log('图片信息:', {
                      filename,
                      subfolder,
                      type
                    });
                    
                    // 构建完整的图片URL，与官方示例保持一致
                    const urlParams = new URLSearchParams({
                      filename,
                      subfolder,
                      type
                    });
                    
                    const imageUrl = `${baseUrl}/view?${urlParams.toString()}`;
                    imageUrls.push(imageUrl);
                    console.log('构建的图片URL:', imageUrl);
                  }
                  break;
                } else {
                  console.log('节点没有图片输出:', nodeId, nodeOutput);
                }
              }
            } else {
              console.log('历史记录中没有找到outputs字段');
            }
          } else {
            console.log('历史记录数据结构不符合预期:', historyData);
          }
        } else {
          console.log('历史记录数据为空');
        }
      } catch (historyError: unknown) {
        console.error('获取历史记录失败:', historyError);
        // 如果获取历史记录失败，使用/latest.png作为后备方案
        imageUrls = [`${baseUrl}/view?filename=latest.png&type=output`];
        console.log('使用后备方案:', imageUrls[0]);
      }
      
      // 如果仍然没有获取到图片URL，使用/latest.png作为后备方案
      if (imageUrls.length === 0) {
        console.log('未找到图片文件名，使用默认的/latest.png');
        imageUrls = [`${baseUrl}/view?filename=latest.png&type=output`];
      }
      
      console.log('最终使用的图片URLs:', imageUrls);
      
      // 生成完成后，构建返回结果
      const result = {
        success: true,
        data: {
          imageUrls,
          resolution: `${settings.width}x${settings.height}`,
          model: 'redzimage15AIO',
          duration: 10 // 实际项目中应该计算真实耗时
        }
      };

      return result;
    } else {
      // 如果请求失败，立即结束生成状态
      useAppStore.setState((state) => ({
        generationStatus: {
          ...state.generationStatus,
          isGenerating: false,
        },
      }));
      
      return {
        success: false,
        error: 'Failed to generate image: ' + (response.data?.node_errors || 'Unknown error')
      };
    }
  } catch (error) {
    console.error('Image generation failed:', error);
    
    // 如果发生错误，立即结束生成状态
    useAppStore.setState((state) => ({
      generationStatus: {
        ...state.generationStatus,
        isGenerating: false,
      },
    }));
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate image.',
    };
  }
};

// 等待生成完成并获取真实进度
const waitForGenerationComplete = async (
  promptId: string,
  apiUrl: string,
  onProgress?: (progress: number, statusText: string, currentStep?: number, totalSteps?: number) => void
): Promise<void> => {
  return new Promise((resolve) => {
    const maxAttempts = 300; // 5分钟超时
    const maxPreparationTime = 60000; // 准备状态最多等待60秒
    let attempts = 0;
    const taskStartTime = Date.now();
    let preparationStartTime: number | null = null; // 准备开始时间，用于防止卡在准备状态
    let consecutiveErrorCount = 0; // 连续错误计数，用于处理API调用失败

    const intervalId = setInterval(async () => {
      attempts++;
      
      // 超时保护
      if (attempts >= maxAttempts) {
        clearInterval(intervalId);
        useAppStore.setState((state) => ({
          generationStatus: {
            ...state.generationStatus,
            isGenerating: false,
            statusText: '生成超时',
          },
        }));
        resolve();
        return;
      }

      try {
        // 直接检查队列状态
        let queueResponse = null;
        try {
            // 开发环境使用相对路径以便代理生效
            const queueUrl = import.meta.env.DEV ? '/queue' : `${apiUrl}/queue`;
            queueResponse = await api.get(queueUrl);
            console.log('Queue Response:', queueResponse.data);
            
            // 显示调试通知
            showApiDebugNotification(apiUrl, '/queue', queueResponse.data);
            
            // 检查是否在运行队列中
            const isRunning = Array.isArray(queueResponse.data.queue_running) && queueResponse.data.queue_running.some((task: { prompt_id?: string }) => task.prompt_id === promptId);
            console.log(`Queue Running Check - promptId: ${promptId}, queue_running:`, queueResponse.data.queue_running);
            
            if (isRunning) {
              // 任务已经开始运行
              useAppStore.setState((state) => ({
                generationStatus: {
                  ...state.generationStatus,
                  statusText: '生成中...',
                  queuePosition: null,
                },
              }));
            } else {
              // 检查是否在等待队列中
              const queueIndex = Array.isArray(queueResponse.data.pending) ? queueResponse.data.pending.findIndex((task: { prompt_id?: string }) => task.prompt_id === promptId) : -1;
              console.log(`Queue Pending Check - promptId: ${promptId}, queueIndex: ${queueIndex}, pending:`, queueResponse.data.pending);
              
              if (queueIndex >= 0) {
                  // 在等待队列中
                  const queuePosition = queueIndex + 1;
                  
                  // 先更新队列位置
                  useAppStore.setState((state) => ({
                    generationStatus: {
                      ...state.generationStatus,
                      statusText: `排队中...`,
                      queuePosition,
                    },
                  }));
                  
                  // 检查是否队列等待超时
                  if (Date.now() - taskStartTime > 180000) { // 3分钟队列超时
                    console.log('队列等待超时，将在下次循环强制检查历史记录');
                    // 标记需要强制检查
                    preparationStartTime = null; // 触发超时检查
                    consecutiveErrorCount = 5; // 触发系统状态检查
                  }
              } else if ((Array.isArray(queueResponse.data.queue_running) && queueResponse.data.queue_running.length > 0) || (Array.isArray(queueResponse.data.pending) && queueResponse.data.pending.length > 0)) {
                console.log(`Task not in queues but other tasks running - promptId: ${promptId}, queue_running:`, queueResponse.data.queue_running?.length, 'pending:', queueResponse.data.pending?.length);
                
                // 不在队列中，但有其他任务在运行，可能正在启动
                useAppStore.setState((state) => ({
                  generationStatus: {
                    ...state.generationStatus,
                    statusText: '准备生成...',
                  },
                }));
                // 设置准备开始时间
                if (!preparationStartTime) {
                  preparationStartTime = Date.now();
                }
                
                // 检查准备状态是否超时
                if (preparationStartTime && Date.now() - preparationStartTime > maxPreparationTime) {
                  console.log('准备状态超时，重新检查任务状态');
                  preparationStartTime = null; // 重置准备时间
                  // 重置错误计数，以便继续检查队列
                  consecutiveErrorCount = 0;
                }
              } else {
                // 队列空了
                console.log(`Queue empty - promptId: ${promptId}, taskStartTime: ${taskStartTime}, elapsed: ${Date.now() - taskStartTime}`);
                
                // 如果已经过了一定时间，可能任务已经完成但队列还没更新
                if (Date.now() - taskStartTime > 3000) {
                  // 重置错误计数，以便继续检查队列
                  consecutiveErrorCount = 0;
                  
                  // 如果仍然没有历史记录，可能是任务已经完成但历史记录未保存
                  // 或者任务被取消了，直接结束
                  clearInterval(intervalId);
                  useAppStore.setState((state) => ({
                    generationStatus: {
                      ...state.generationStatus,
                      progress: 100,
                      statusText: '完成！',
                      isGenerating: false,
                    },
                  }));
                  onProgress?.(100, '完成！', 30, 30);
                  resolve();
                }
              }
            }
          } catch (queueError) {
            // 队列查询失败，检查是否有其他方式获取状态
            console.error('Error checking queue status:', queueError);
          }
        
        // 重置错误计数，因为这次检查成功
        consecutiveErrorCount = 0;
        
        // 4. 检查是否有任何任务在运行，如果有，假设我们的任务也在进行中
        // 这是一个容错机制，处理某些情况下队列和历史记录都不更新的问题
        if (attempts > 10) { // 等待更长时间后再进行容错检查，提高准确性
          try {
            // 开发环境使用相对路径以便代理生效
            const tasksUrl = import.meta.env.DEV ? '/queue' : `${apiUrl}/queue`;
            const tasksResponse = await api.get(tasksUrl);
            if ((Array.isArray(tasksResponse.data.queue_running) && tasksResponse.data.queue_running.length > 0) && 
                !(Array.isArray(tasksResponse.data.queue_running) && tasksResponse.data.queue_running.some((task: { prompt_id?: string }) => task.prompt_id === promptId)) &&
                !(Array.isArray(tasksResponse.data.pending) && tasksResponse.data.pending.some((task: { prompt_id?: string }) => task.prompt_id === promptId))) {
              // 有任务在运行，但我们的任务不在队列中，可能已经完成
              clearInterval(intervalId);
              useAppStore.setState((state) => ({
                generationStatus: {
                  ...state.generationStatus,
                  progress: 100,
                  statusText: '完成！',
                  isGenerating: false,
                },
              }));
              onProgress?.(100, '完成！', 30, 30);
              resolve();
            }
          } catch (tasksError) {
            console.error('Error checking tasks:', tasksError);
          }
        }
      } catch (error) {
        console.error('Error in waitForGenerationComplete main loop:', error);
        consecutiveErrorCount++;
        
        // 如果连续错误超过5次，可能API有问题或任务已完成
        if (consecutiveErrorCount > 5) {
          console.log('连续错误过多，任务可能已完成或API有问题');
          // 假设任务已完成
          clearInterval(intervalId);
          useAppStore.setState((state) => ({
            generationStatus: {
              ...state.generationStatus,
              progress: 100,
              statusText: '完成！',
              isGenerating: false,
            },
          }));
          onProgress?.(100, '完成！', 30, 30);
          resolve();
        }
      }
    }, 1500); // 1.5秒检查一次，减少API请求频率
  });
};



// 下载图像到本地
export const downloadImage = (imageUrl: string, fileName: string): void => {
  const link = document.createElement('a');
  link.href = imageUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};