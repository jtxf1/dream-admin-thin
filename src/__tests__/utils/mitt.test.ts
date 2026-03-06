import { describe, it, expect, vi, beforeEach } from "vitest";
import { emitter } from "../../utils/mitt";

describe("mitt 事件发射器测试", () => {
  beforeEach(() => {
    // 清除所有事件监听器
    emitter.all.clear();
  });

  it("应该正确创建事件发射器实例", () => {
    expect(emitter).toBeDefined();
    expect(typeof emitter.on).toBe("function");
    expect(typeof emitter.emit).toBe("function");
    expect(typeof emitter.off).toBe("function");
  });

  it("应该能够监听和触发事件", () => {
    const mockCallback = vi.fn();

    // 监听事件
    emitter.on("openPanel", mockCallback);

    // 触发事件
    const testData = "test-panel";
    emitter.emit("openPanel", testData);

    // 验证回调被调用
    expect(mockCallback).toHaveBeenCalledWith(testData);
  });

  it("应该能够移除事件监听器", () => {
    const mockCallback = vi.fn();

    // 监听事件
    emitter.on("openPanel", mockCallback);

    // 移除监听器
    emitter.off("openPanel", mockCallback);

    // 触发事件
    emitter.emit("openPanel", "test-panel");

    // 验证回调未被调用
    expect(mockCallback).not.toHaveBeenCalled();
  });

  it("应该能够处理不同类型的事件", () => {
    const openPanelCallback = vi.fn();
    const logoChangeCallback = vi.fn();

    // 监听不同事件
    emitter.on("openPanel", openPanelCallback);
    emitter.on("logoChange", logoChangeCallback);

    // 触发不同事件
    emitter.emit("openPanel", "test-panel");
    emitter.emit("logoChange", true);

    // 验证回调被正确调用
    expect(openPanelCallback).toHaveBeenCalledWith("test-panel");
    expect(logoChangeCallback).toHaveBeenCalledWith(true);
  });

  it("应该能够处理多个监听器", () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();

    // 添加多个监听器
    emitter.on("openPanel", callback1);
    emitter.on("openPanel", callback2);

    // 触发事件
    emitter.emit("openPanel", "test-panel");

    // 验证所有回调都被调用
    expect(callback1).toHaveBeenCalledWith("test-panel");
    expect(callback2).toHaveBeenCalledWith("test-panel");
  });
});
