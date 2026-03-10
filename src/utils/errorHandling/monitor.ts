import type { StandardError, ErrorMonitorData } from "./types";

/**
 * 错误监控类
 */
export class ErrorMonitor {
  private static instance: ErrorMonitor;
  private errorData: Map<string, ErrorMonitorData> = new Map();
  private maxErrors: number = 1000;
  private flushInterval: number = 60000; // 60秒
  private flushTimer: number | null = null;

  /**
   * 获取单例实例
   */
  public static getInstance(): ErrorMonitor {
    if (!ErrorMonitor.instance) {
      ErrorMonitor.instance = new ErrorMonitor();
    }
    return ErrorMonitor.instance;
  }

  /**
   * 构造函数
   */
  private constructor() {
    this.startFlushTimer();
  }

  /**
   * 启动定期上报定时器
   */
  private startFlushTimer(): void {
    this.flushTimer = window.setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  /**
   * 记录错误
   */
  public recordError(error: StandardError): void {
    const key = `${error.type}:${error.code}`;
    const now = Date.now();

    if (this.errorData.has(key)) {
      const existingData = this.errorData.get(key)!;
      existingData.count += 1;
      existingData.lastOccurrence = now;
    } else {
      const newData: ErrorMonitorData = {
        type: error.type,
        code: error.code,
        count: 1,
        firstOccurrence: now,
        lastOccurrence: now
      };
      this.errorData.set(key, newData);
    }

    // 限制错误数据数量
    if (this.errorData.size > this.maxErrors) {
      this.trimErrorData();
    }
  }

  /**
   * 清理错误数据
   */
  private trimErrorData(): void {
    // 按错误发生时间排序，保留最近的错误
    const sortedErrors = Array.from(this.errorData.entries()).sort((a, b) => {
      return b[1].lastOccurrence - a[1].lastOccurrence;
    });

    // 只保留前maxErrors个错误
    const trimmedErrors = sortedErrors.slice(0, this.maxErrors);
    this.errorData.clear();
    trimmedErrors.forEach(([key, data]) => {
      this.errorData.set(key, data);
    });
  }

  /**
   * 上报错误数据
   */
  public flush(): void {
    if (this.errorData.size === 0) {
      return;
    }

    const errorData = Array.from(this.errorData.values());

    // 这里可以实现错误上报逻辑
    // 例如：发送到后端API
    console.log("上报错误数据:", errorData);

    // 清空已上报的数据
    this.errorData.clear();
  }

  /**
   * 获取错误统计数据
   */
  public getErrorStats(): ErrorMonitorData[] {
    return Array.from(this.errorData.values());
  }

  /**
   * 获取错误趋势数据
   */
  public getErrorTrends(): any {
    // 这里可以实现错误趋势分析逻辑
    // 例如：按时间分组统计错误数量
    return {
      trends: [],
      summary: {
        totalErrors: this.errorData.size,
        mostFrequentError: this.getMostFrequentError()
      }
    };
  }

  /**
   * 获取最频繁的错误
   */
  private getMostFrequentError(): ErrorMonitorData | null {
    if (this.errorData.size === 0) {
      return null;
    }

    let mostFrequent: ErrorMonitorData | null = null;
    let maxCount = 0;

    this.errorData.forEach(data => {
      if (data.count > maxCount) {
        maxCount = data.count;
        mostFrequent = data;
      }
    });

    return mostFrequent;
  }

  /**
   * 清理资源
   */
  public dispose(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    this.errorData.clear();
  }
}

/**
 * 错误上报函数
 */
export function reportError(error: StandardError): void {
  const monitor = ErrorMonitor.getInstance();
  monitor.recordError(error);
}

export default {
  ErrorMonitor,
  reportError
};
