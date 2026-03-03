/**
 * 防抖函数类型
 */
export type DebounceFunction<T extends (...args: any[]) => any> = {
  (
    ...args: Parameters<T>
  ): ReturnType<T> extends Promise<infer R>
    ? Promise<R>
    : Promise<ReturnType<T>>;
  cancel: () => void;
};

/**
 * 防抖函数
 * @param func - 要执行的函数
 * @param wait - 等待时间（毫秒）
 * @returns 防抖处理后的函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number = 300
): DebounceFunction<T> {
  let timeout: NodeJS.Timeout | null = null;

  const debounced = (...args: Parameters<T>): any => {
    return new Promise((resolve, reject) => {
      if (timeout) {
        clearTimeout(timeout);
      }

      timeout = setTimeout(async () => {
        try {
          const result = await func(...args);
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          timeout = null;
        }
      }, wait);
    });
  };

  debounced.cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  return debounced as DebounceFunction<T>;
}
