import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { addPreventDefault } from "../../utils/preventDefault";

// 模拟依赖
vi.mock("@vueuse/core", () => ({
  useEventListener: vi.fn()
}));

import { useEventListener } from "@vueuse/core";

const mockUseEventListener = useEventListener as any;

// 模拟 window 对象
const mockWindow = {
  document: {
    addEventListener: vi.fn(),
    removeEventListener: vi.fn()
  }
};

// 保存原始的 window
const originalWindow = global.window;

describe("preventDefault 工具函数测试", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // 替换 window
    global.window = mockWindow as any;
  });

  afterEach(() => {
    // 恢复原始的 window
    global.window = originalWindow;
  });

  describe("addPreventDefault 函数", () => {
    it("应该添加所有事件监听器", () => {
      addPreventDefault();

      // 验证 useEventListener 被调用了 4 次
      expect(mockUseEventListener).toHaveBeenCalledTimes(4);

      // 验证阻止 F12 事件
      expect(mockUseEventListener).toHaveBeenCalledWith(
        window.document,
        "keydown",
        expect.any(Function)
      );

      // 验证阻止右键菜单
      expect(mockUseEventListener).toHaveBeenCalledWith(
        window.document,
        "contextmenu",
        expect.any(Function)
      );

      // 验证阻止元素选中
      expect(mockUseEventListener).toHaveBeenCalledWith(
        window.document,
        "selectstart",
        expect.any(Function)
      );

      // 验证阻止图片拖动
      expect(mockUseEventListener).toHaveBeenCalledWith(
        window.document,
        "dragstart",
        expect.any(Function)
      );
    });

    it("应该正确阻止 F12 事件", () => {
      addPreventDefault();

      // 获取 keydown 事件的回调函数
      const keydownCall = mockUseEventListener.mock.calls.find(
        call => call[1] === "keydown"
      );
      const keydownCallback = keydownCall[2];

      // 测试 F12 键
      const mockEventF12 = { key: "F12", preventDefault: vi.fn() };
      keydownCallback(mockEventF12);
      expect(mockEventF12.preventDefault).toHaveBeenCalled();

      // 测试其他键
      const mockEventOther = { key: "Enter", preventDefault: vi.fn() };
      keydownCallback(mockEventOther);
      expect(mockEventOther.preventDefault).not.toHaveBeenCalled();
    });

    it("应该正确阻止右键菜单", () => {
      addPreventDefault();

      // 获取 contextmenu 事件的回调函数
      const contextmenuCall = mockUseEventListener.mock.calls.find(
        call => call[1] === "contextmenu"
      );
      const contextmenuCallback = contextmenuCall[2];

      // 测试右键菜单事件
      const mockEvent = { preventDefault: vi.fn() };
      contextmenuCallback(mockEvent);
      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it("应该正确阻止元素选中", () => {
      addPreventDefault();

      // 获取 selectstart 事件的回调函数
      const selectstartCall = mockUseEventListener.mock.calls.find(
        call => call[1] === "selectstart"
      );
      const selectstartCallback = selectstartCall[2];

      // 测试 selectstart 事件
      const mockEvent = { preventDefault: vi.fn() };
      selectstartCallback(mockEvent);
      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it("应该正确阻止图片拖动", () => {
      addPreventDefault();

      // 获取 dragstart 事件的回调函数
      const dragstartCall = mockUseEventListener.mock.calls.find(
        call => call[1] === "dragstart"
      );
      const dragstartCallback = dragstartCall[2];

      // 测试图片元素
      const mockImgEvent = {
        target: { tagName: "IMG" },
        preventDefault: vi.fn()
      };
      dragstartCallback(mockImgEvent);
      expect(mockImgEvent.preventDefault).toHaveBeenCalled();

      // 测试非图片元素
      const mockNonImgEvent = {
        target: { tagName: "DIV" },
        preventDefault: vi.fn()
      };
      dragstartCallback(mockNonImgEvent);
      expect(mockNonImgEvent.preventDefault).not.toHaveBeenCalled();
    });
  });
});
