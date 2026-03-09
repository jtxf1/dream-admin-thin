import { useLoadingStore } from "@/store/modules/loading";

/**
 * 处理异步操作的加载状态
 * @param fn 异步函数
 * @param options 配置选项
 * @returns 异步函数的返回值
 */
export async function withLoading<T>(
  fn: () => Promise<T>,
  options: {
    // 加载类型：global | local | fullscreen
    type?: "global" | "local" | "fullscreen";
    // 局部加载的key
    key?: string;
    // 加载文本
    text?: string;
    // 错误处理函数
    onError?: (error: any) => void;
  } = {}
): Promise<T> {
  const { type = "global", key } = options;
  const loadingStore = useLoadingStore();

  try {
    // 设置加载状态
    if (type === "global") {
      loadingStore.setGlobalLoading(true);
    } else if (type === "local" && key) {
      loadingStore.setLocalLoading(key, true);
    } else if (type === "fullscreen") {
      loadingStore.setFullscreenLoading(true);
    }

    // 执行异步函数
    const result = await fn();

    // 清除加载状态
    if (type === "global") {
      loadingStore.setGlobalLoading(false);
    } else if (type === "local" && key) {
      loadingStore.clearLocalLoading(key);
    } else if (type === "fullscreen") {
      loadingStore.setFullscreenLoading(false);
    }

    return result;
  } catch (error) {
    // 清除加载状态
    if (type === "global") {
      loadingStore.setGlobalLoading(false);
    } else if (type === "local" && key) {
      loadingStore.clearLocalLoading(key);
    } else if (type === "fullscreen") {
      loadingStore.setFullscreenLoading(false);
    }

    // 处理错误
    if (options.onError) {
      options.onError(error);
    }

    throw error;
  }
}

/**
 * 处理API请求的加载状态
 * @param fn API请求函数
 * @param options 配置选项
 * @returns API请求的返回值
 */
export async function withApiLoading<T>(
  fn: () => Promise<T>,
  options: {
    // 加载类型：global | local | fullscreen
    type?: "global" | "local" | "fullscreen";
    // 局部加载的key
    key?: string;
    // 加载文本
    text?: string;
    // 错误处理函数
    onError?: (error: any) => void;
  } = {}
): Promise<T> {
  return withLoading(fn, {
    ...options,
    onError: error => {
      console.error("API请求失败:", error);
      if (options.onError) {
        options.onError(error);
      }
    }
  });
}
