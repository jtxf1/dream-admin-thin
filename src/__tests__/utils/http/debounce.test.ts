import { describe, it, expect, afterEach, vi } from "vitest";
import { debounce } from "@/utils/http/modules/debounce";

// 直接测试防抖函数，避免加载整个应用的依赖

describe("HTTP防抖功能测试", () => {
  afterEach(() => {
    vi.clearAllTimers();
  });

  it("正常防抖功能测试", async () => {
    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 100);

    debouncedFn();
    debouncedFn();
    debouncedFn();

    expect(mockFn).not.toHaveBeenCalled();

    await new Promise(resolve => setTimeout(resolve, 150));

    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it("防抖函数返回Promise测试", async () => {
    const mockFn = vi.fn(() => Promise.resolve("success"));
    const debouncedFn = debounce(mockFn, 50);

    const promise = debouncedFn();
    expect(mockFn).not.toHaveBeenCalled();

    const result = await promise;
    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(result).toBe("success");
  });

  it("防抖函数错误处理测试", async () => {
    const errorMessage = "Test error";
    const mockFn = vi.fn(() => Promise.reject(new Error(errorMessage)));
    const debouncedFn = debounce(mockFn, 50);

    const promise = debouncedFn();
    expect(mockFn).not.toHaveBeenCalled();

    await expect(promise).rejects.toThrow(errorMessage);
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it("防抖函数取消测试", async () => {
    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 100);

    debouncedFn();
    debouncedFn.cancel();

    await new Promise(resolve => setTimeout(resolve, 150));

    expect(mockFn).not.toHaveBeenCalled();
  });

  it("频繁触发场景测试", async () => {
    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 100);

    // 快速连续触发
    for (let i = 0; i < 10; i++) {
      debouncedFn();
    }

    expect(mockFn).not.toHaveBeenCalled();

    await new Promise(resolve => setTimeout(resolve, 150));

    // 只应该被调用一次
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it("不同延迟时间测试", async () => {
    const mockFn1 = vi.fn();
    const mockFn2 = vi.fn();

    const debouncedFn1 = debounce(mockFn1, 50);
    const debouncedFn2 = debounce(mockFn2, 150);

    debouncedFn1();
    debouncedFn2();

    // 等待50ms，第一个应该被调用，第二个不应该
    await new Promise(resolve => setTimeout(resolve, 70));
    expect(mockFn1).toHaveBeenCalledTimes(1);
    expect(mockFn2).not.toHaveBeenCalled();

    // 等待到150ms，第二个应该被调用
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(mockFn2).toHaveBeenCalledTimes(1);
  });
});
