/**
 * 性能监控工具
 * 提供页面性能指标的采集和分析功能
 */

// 性能指标类型定义
export interface PerformanceMetrics {
  /** 首次内容绘制 */
  fcp: number | null;
  /** 最大内容绘制 */
  lcp: number | null;
  /** 累积布局偏移 */
  cls: number | null;
  /** 首次输入延迟 */
  fid: number | null;
  /** 交互时间 */
  tti: number | null;
  /** 总加载时间 */
  loadTime: number | null;
  /** 导航时间 */
  navigationTime: number | null;
}

/**
 * 计算 TTI（Time to Interactive）
 * @returns TTI 值（毫秒）
 */
export function calculateTTI(): number | null {
  if (
    !("performance" in window) ||
    !("getEntriesByType" in window.performance)
  ) {
    return null;
  }

  try {
    // 获取所有性能条目
    const navigationEntries = performance.getEntriesByType("navigation");
    const paintEntries = performance.getEntriesByType("paint");
    const longTasks = performance.getEntriesByType("longtask") || [];

    if (navigationEntries.length === 0) {
      return null;
    }

    const navigationEntry = navigationEntries[0] as PerformanceNavigationTiming;
    const fcpEntry = paintEntries.find(
      entry => entry.name === "first-contentful-paint"
    );

    if (!fcpEntry) {
      return null;
    }

    const fcpTime = fcpEntry.startTime;
    const loadEventEnd = navigationEntry.loadEventEnd || performance.now();

    // 过滤出 FCP 之后的长任务
    const longTasksAfterFCP = longTasks.filter(
      task => task.startTime >= fcpTime && task.duration >= 50
    );

    // 按开始时间排序
    longTasksAfterFCP.sort((a, b) => a.startTime - b.startTime);

    // 查找 5 秒安静期
    let tti = fcpTime;
    const quietPeriodDuration = 5000; // 5 秒安静期

    if (longTasksAfterFCP.length === 0) {
      // 如果没有长任务，TTI 就是 FCP
      return Math.round(tti);
    }

    // 从最后一个长任务开始向前查找
    for (let i = longTasksAfterFCP.length - 1; i >= 0; i--) {
      const task = longTasksAfterFCP[i];
      const taskEnd = task.startTime + task.duration;

      // 检查从当前任务结束到下一个任务开始是否有 5 秒安静期
      if (i === longTasksAfterFCP.length - 1) {
        // 最后一个任务，检查到 loadEventEnd
        if (loadEventEnd - taskEnd >= quietPeriodDuration) {
          tti = taskEnd;
          break;
        }
      } else {
        // 中间任务，检查到下一个任务开始
        const nextTask = longTasksAfterFCP[i + 1];
        if (nextTask.startTime - taskEnd >= quietPeriodDuration) {
          tti = taskEnd;
          break;
        }
      }
    }

    // 如果没有找到 5 秒安静期，使用 loadEventEnd
    if (tti === fcpTime && longTasksAfterFCP.length > 0) {
      tti = loadEventEnd;
    }

    return Math.round(tti);
  } catch (error) {
    console.error("TTI 计算错误:", error);
    return null;
  }
}

/**
 * 收集性能指标
 * @returns 性能指标对象
 */
export function collectPerformanceMetrics(): PerformanceMetrics {
  const metrics: PerformanceMetrics = {
    fcp: null,
    lcp: null,
    cls: null,
    fid: null,
    tti: null,
    loadTime: null,
    navigationTime: null
  };

  if (!("performance" in window)) {
    return metrics;
  }

  try {
    // 计算 TTI
    metrics.tti = calculateTTI();

    // 获取导航时间
    const navigationEntries = performance.getEntriesByType("navigation");
    if (navigationEntries.length > 0) {
      const navEntry = navigationEntries[0] as PerformanceNavigationTiming;
      metrics.navigationTime = Math.round(navEntry.duration);
      metrics.loadTime = navEntry.loadEventEnd
        ? Math.round(navEntry.loadEventEnd - navEntry.startTime)
        : null;
    }

    // 获取绘制指标
    const paintEntries = performance.getEntriesByType("paint");
    paintEntries.forEach(entry => {
      if (entry.name === "first-contentful-paint") {
        metrics.fcp = Math.round(entry.startTime);
      }
    });

    // 尝试获取 LCP
    if ("getEntriesByType" in performance) {
      const lcpEntries = performance.getEntriesByType(
        "largest-contentful-paint"
      );
      if (lcpEntries.length > 0) {
        const lcpEntry = lcpEntries[lcpEntries.length - 1] as any;
        metrics.lcp = Math.round(lcpEntry.startTime);
      }
    }

    // 注：CLS 和 FID 需要使用 PerformanceObserver 监听
    // 这里仅作为示例，实际实现需要在页面加载过程中监听
  } catch (error) {
    console.error("性能指标收集错误:", error);
  }

  return metrics;
}

/**
 * 监听性能指标
 * @param callback 回调函数，接收性能指标
 */
export function observePerformanceMetrics(
  callback: (metrics: PerformanceMetrics) => void
): void {
  // 初始收集
  const initialMetrics = collectPerformanceMetrics();
  callback(initialMetrics);

  // 监听 LCP
  if ("PerformanceObserver" in window) {
    try {
      const lcpObserver = new PerformanceObserver(entries => {
        const lcpEntry = entries.getEntries()[entries.getEntries().length - 1];
        const metrics = collectPerformanceMetrics();
        metrics.lcp = Math.round(lcpEntry.startTime);
        callback(metrics);
      });
      lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });
    } catch (error) {
      console.error("LCP 监听错误:", error);
    }

    // 监听 CLS
    try {
      let cls = 0;
      const clsObserver = new PerformanceObserver(entries => {
        entries.getEntries().forEach(entry => {
          const layoutShiftEntry = entry as any;
          if (!layoutShiftEntry.hadRecentInput) {
            cls += layoutShiftEntry.value;
            const metrics = collectPerformanceMetrics();
            metrics.cls = parseFloat(cls.toFixed(4));
            callback(metrics);
          }
        });
      });
      clsObserver.observe({ type: "layout-shift", buffered: true });
    } catch (error) {
      console.error("CLS 监听错误:", error);
    }

    // 监听 FID
    try {
      const fidObserver = new PerformanceObserver(entries => {
        const fidEntry = entries.getEntries()[0] as any;
        const metrics = collectPerformanceMetrics();
        metrics.fid = Math.round(fidEntry.processingStart - fidEntry.startTime);
        callback(metrics);
      });
      fidObserver.observe({ type: "first-input", buffered: true });
    } catch (error) {
      console.error("FID 监听错误:", error);
    }
  }

  // 页面加载完成后再次收集
  if (document.readyState === "loading") {
    window.addEventListener("load", () => {
      setTimeout(() => {
        const finalMetrics = collectPerformanceMetrics();
        callback(finalMetrics);
      }, 1000);
    });
  } else {
    setTimeout(() => {
      const finalMetrics = collectPerformanceMetrics();
      callback(finalMetrics);
    }, 1000);
  }
}

/**
 * 上报性能指标
 * @param metrics 性能指标
 */
export function reportPerformanceMetrics(metrics: PerformanceMetrics): void {
  // 这里可以实现实际的上报逻辑
  // 例如发送到监控服务器或日志系统
  console.log("性能指标上报:", metrics);

  // 示例：通过 API 上报
  // fetch('/api/performance/report', {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json'
  //   },
  //   body: JSON.stringify(metrics)
  // }).catch(error => {
  //   console.error('性能指标上报失败:', error);
  // });
}

/**
 * 初始化性能监控
 */
export function initPerformanceMonitoring(): void {
  console.log("性能监控初始化");

  observePerformanceMetrics(metrics => {
    console.log("收集到性能指标:", metrics);
    // 上报性能指标
    reportPerformanceMetrics(metrics);
  });
}
