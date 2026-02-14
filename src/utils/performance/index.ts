import { http } from "../http";
import type { PureHttpRequestConfig } from "../http/types";

/**
 * 性能指标类型
 */
export interface PerformanceMetric {
  /** 指标名称 */
  name: string;
  /** 指标值（毫秒） */
  value: number;
  /** 指标类型 */
  type: "navigation" | "resource" | "api" | "interaction" | "error";
  /** 发生时间 */
  timestamp: number;
  /** 额外信息 */
  extra?: Record<string, any>;
}

/**
 * 导航性能指标
 */
export interface NavigationMetrics {
  /** 首次内容绘制时间 */
  fcp: number;
  /** 最大内容绘制时间 */
  lcp: number;
  /** 累积布局偏移 */
  cls: number;
  /** 首次输入延迟 */
  fid: number;
  /** 首次可交互时间 */
  tti: number;
  /** 页面加载时间 */
  loadTime: number;
  /** 页面首次渲染时间 */
  renderTime: number;
}

/**
 * API请求性能指标
 */
export interface ApiMetrics {
  /** 请求URL */
  url: string;
  /** 请求方法 */
  method: string;
  /** 请求耗时 */
  duration: number;
  /** 状态码 */
  status: number;
  /** 是否成功 */
  success: boolean;
  /** 响应大小 */
  responseSize?: number;
}

/**
 * 扩展的性能条目类型
 */
interface ExtendedPerformanceEntry {
  startTime: number;
  duration: number;
  entryType: string;
  name: string;
  element?: { tagName: string };
  hadRecentInput?: boolean;
  value?: number;
  processingStart?: number;
  type?: string;
  initiatorType?: string;
  transferSize?: number;
  decodedBodySize?: number;
}

/**
 * 性能监控类
 */
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetric[] = [];
  private navigationMetrics: NavigationMetrics = {
    fcp: 0,
    lcp: 0,
    cls: 0,
    fid: 0,
    tti: 0,
    loadTime: 0,
    renderTime: 0
  };
  private apiMetrics: ApiMetrics[] = [];
  private isInitialized = false;

  /**
   * 获取单例实例
   */
  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * 初始化性能监控
   */
  public init(): void {
    if (this.isInitialized) return;

    this.isInitialized = true;
    this.monitorNavigation();
    this.monitorResources();
    this.monitorApiRequests();
    this.monitorInteractions();
    this.monitorErrors();
  }

  /**
   * 监控导航性能
   */
  private monitorNavigation(): void {
    // 监听页面加载完成
    window.addEventListener("load", () => {
      this.calculateNavigationMetrics();
    });

    // 监听首次内容绘制
    new PerformanceObserver(entryList => {
      const entries = entryList.getEntriesByName(
        "first-contentful-paint"
      ) as ExtendedPerformanceEntry[];
      if (entries.length > 0) {
        this.navigationMetrics.fcp = entries[0].startTime;
        this.addMetric({
          name: "first-contentful-paint",
          value: entries[0].startTime,
          type: "navigation",
          timestamp: Date.now()
        });
      }
    }).observe({ type: "paint", buffered: true });

    // 监听最大内容绘制
    new PerformanceObserver(entryList => {
      const entries = entryList.getEntriesByName(
        "largest-contentful-paint"
      ) as ExtendedPerformanceEntry[];
      if (entries.length > 0) {
        this.navigationMetrics.lcp = entries[0].startTime;
        this.addMetric({
          name: "largest-contentful-paint",
          value: entries[0].startTime,
          type: "navigation",
          timestamp: Date.now(),
          extra: { element: entries[0].element?.tagName }
        });
      }
    }).observe({ type: "largest-contentful-paint", buffered: true });

    // 监听累积布局偏移
    let clsValue = 0;
    const clsEntries: ExtendedPerformanceEntry[] = [];

    new PerformanceObserver(entryList => {
      const entries = entryList.getEntries() as ExtendedPerformanceEntry[];
      entries.forEach(entry => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value || 0;
          clsEntries.push(entry);
          this.navigationMetrics.cls = clsValue;
          this.addMetric({
            name: "cumulative-layout-shift",
            value: clsValue,
            type: "navigation",
            timestamp: Date.now(),
            extra: { entryCount: clsEntries.length }
          });
        }
      });
    }).observe({ type: "layout-shift", buffered: true });

    // 监听首次输入延迟
    new PerformanceObserver(entryList => {
      const entries = entryList.getEntries() as ExtendedPerformanceEntry[];
      if (entries.length > 0) {
        this.navigationMetrics.fid =
          (entries[0].processingStart || entries[0].startTime) -
          entries[0].startTime;
        this.addMetric({
          name: "first-input-delay",
          value: this.navigationMetrics.fid,
          type: "navigation",
          timestamp: Date.now(),
          extra: { type: entries[0].type }
        });
      }
    }).observe({ type: "first-input", buffered: true });
  }

  /**
   * 监控资源加载性能
   */
  private monitorResources(): void {
    new PerformanceObserver(entryList => {
      const entries = entryList.getEntries() as ExtendedPerformanceEntry[];
      entries.forEach(entry => {
        if (entry.entryType === "resource") {
          this.addMetric({
            name: "resource-load",
            value: entry.duration,
            type: "resource",
            timestamp: Date.now(),
            extra: {
              url: entry.name,
              initiatorType: entry.initiatorType,
              transferSize: entry.transferSize,
              decodedBodySize: entry.decodedBodySize
            }
          });
        }
      });
    }).observe({ type: "resource", buffered: true });
  }

  /**
   * 监控API请求性能
   */
  private monitorApiRequests(): void {
    // 保存原始的请求方法
    const originalRequest = http.request.bind(http);

    // 重写请求方法，添加性能监控
    http.request = async function (
      method: string,
      url: string,
      param?: any,
      config?: PureHttpRequestConfig
    ) {
      const startTime = performance.now();
      const monitor = PerformanceMonitor.getInstance();

      try {
        const response = await originalRequest(method, url, param, config);
        const endTime = performance.now();
        const duration = endTime - startTime;

        const apiMetric: ApiMetrics = {
          url,
          method,
          duration,
          status: 200,
          success: true
        };

        monitor.apiMetrics.push(apiMetric);
        monitor.addMetric({
          name: "api-request",
          value: duration,
          type: "api",
          timestamp: Date.now(),
          extra: apiMetric
        });

        return response;
      } catch (error: any) {
        const endTime = performance.now();
        const duration = endTime - startTime;

        const apiMetric: ApiMetrics = {
          url,
          method,
          duration,
          status: error.response?.status || 0,
          success: false
        };

        monitor.apiMetrics.push(apiMetric);
        monitor.addMetric({
          name: "api-request-error",
          value: duration,
          type: "api",
          timestamp: Date.now(),
          extra: {
            ...apiMetric,
            error: error.message
          }
        });

        throw error;
      }
    };
  }

  /**
   * 监控用户交互性能
   */
  private monitorInteractions(): void {
    document.addEventListener("click", event => {
      const target = event.target as HTMLElement;
      if (
        target.tagName === "BUTTON" ||
        target.closest("button") ||
        target.tagName === "A" ||
        target.closest("a") ||
        target.tagName === "INPUT" ||
        target.closest("input")
      ) {
        const startTime = performance.now();

        // 模拟交互处理时间监控
        setTimeout(() => {
          const endTime = performance.now();
          this.addMetric({
            name: "user-interaction",
            value: endTime - startTime,
            type: "interaction",
            timestamp: Date.now(),
            extra: {
              element: target.tagName,
              text: target.textContent?.trim() || "",
              className: target.className
            }
          });
        }, 0);
      }
    });
  }

  /**
   * 监控错误
   */
  private monitorErrors(): void {
    // 监控JavaScript错误
    window.addEventListener("error", event => {
      this.addMetric({
        name: "javascript-error",
        value: 0,
        type: "error",
        timestamp: Date.now(),
        extra: {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          error: event.error?.stack
        }
      });
    });

    // 监控未捕获的Promise错误
    window.addEventListener("unhandledrejection", event => {
      this.addMetric({
        name: "promise-rejection",
        value: 0,
        type: "error",
        timestamp: Date.now(),
        extra: {
          reason: event.reason?.message || String(event.reason)
        }
      });
    });
  }

  /**
   * 计算导航性能指标
   */
  private calculateNavigationMetrics(): void {
    const navigationEntry = performance.getEntriesByType(
      "navigation"
    )[0] as any;
    if (navigationEntry) {
      this.navigationMetrics.loadTime =
        navigationEntry.loadEventEnd - navigationEntry.startTime;
      this.navigationMetrics.renderTime =
        navigationEntry.domContentLoadedEventEnd - navigationEntry.startTime;

      // 计算首次可交互时间（TTI）
      this.calculateTTI();
    }
  }

  /**
   * 计算首次可交互时间（TTI）
   */
  private calculateTTI(): void {
    // 简化的TTI计算方法
    const paintEntries = performance.getEntriesByType(
      "paint"
    ) as ExtendedPerformanceEntry[];
    const firstPaint = paintEntries.find(entry => entry.name === "first-paint");

    if (firstPaint) {
      // 假设TTI为首次绘制后1秒
      this.navigationMetrics.tti = firstPaint.startTime + 1000;
    }
  }

  /**
   * 添加性能指标
   */
  public addMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);

    // 当指标数量超过100时，清理旧的指标
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }

    // 可以在这里添加指标上报逻辑
    this.reportMetric(metric);
  }

  /**
   * 上报性能指标
   */
  private reportMetric(metric: PerformanceMetric): void {
    // 这里可以实现指标上报到后端的逻辑
    // 暂时只在控制台打印
    if (process.env.NODE_ENV === "development") {
      console.log("Performance Metric:", metric);
    }
  }

  /**
   * 获取所有性能指标
   */
  public getMetrics(): PerformanceMetric[] {
    return this.metrics;
  }

  /**
   * 获取导航性能指标
   */
  public getNavigationMetrics(): NavigationMetrics {
    return this.navigationMetrics;
  }

  /**
   * 获取API请求性能指标
   */
  public getApiMetrics(): ApiMetrics[] {
    return this.apiMetrics;
  }

  /**
   * 清空性能指标
   */
  public clearMetrics(): void {
    this.metrics = [];
    this.apiMetrics = [];
  }

  /**
   * 测量代码执行时间
   */
  public measure<T>(name: string, fn: () => T): T {
    const startTime = performance.now();
    const result = fn();
    const endTime = performance.now();
    const duration = endTime - startTime;

    this.addMetric({
      name,
      value: duration,
      type: "interaction",
      timestamp: Date.now()
    });

    return result;
  }
}

// 导出单例实例
export const performanceMonitor = PerformanceMonitor.getInstance();
