import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { message, closeAllMessage } from "../../utils/message";

// 模拟依赖
vi.mock("@pureadmin/utils", () => ({
  isFunction: vi.fn(val => typeof val === "function")
}));

vi.mock("element-plus", () => {
  const mockElMessage = vi.fn(() => ({
    close: vi.fn()
  }));
  (mockElMessage as any).closeAll = vi.fn();
  return {
    ElMessage: mockElMessage
  };
});

import { isFunction } from "@pureadmin/utils";
import { ElMessage } from "element-plus";

const mockIsFunction = isFunction as any;
const mockElMessage = ElMessage as any;

// 模拟 document 对象
const mockDocument = {
  body: {} as HTMLElement
};

// 保存原始的 document
const originalDocument = global.document;

describe("message 工具函数测试", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // 重置 ElMessage 的 mock
    mockElMessage.mockClear();
    // 替换 document
    global.document = mockDocument as any;
  });

  afterEach(() => {
    // 恢复原始的 document
    global.document = originalDocument;
  });

  describe("message 函数", () => {
    it("应该在没有参数时使用默认配置", () => {
      const testMessage = "Test message";
      message(testMessage);
      expect(mockElMessage).toHaveBeenCalledWith({
        message: testMessage,
        customClass: "pure-message"
      });
    });

    it("应该使用提供的参数", () => {
      const testMessage = "Test message";
      const params = {
        type: "success" as const,
        plain: true,
        duration: 5000,
        showClose: true,
        offset: 32,
        grouping: true,
        repeatNum: 2
      };
      message(testMessage, params);
      expect(mockElMessage).toHaveBeenCalledWith({
        message: testMessage,
        icon: undefined,
        type: "success",
        plain: true,
        dangerouslyUseHTMLString: false,
        duration: 5000,
        showClose: true,
        offset: 32,
        appendTo: document.body,
        grouping: true,
        repeatNum: 2,
        customClass: "pure-message",
        onClose: expect.any(Function)
      });
    });

    it("应该使用 el 风格的 customClass", () => {
      const testMessage = "Test message";
      const params = {
        customClass: "el" as const
      };
      message(testMessage, params);
      expect(mockElMessage).toHaveBeenCalledWith({
        message: testMessage,
        icon: undefined,
        type: "info",
        plain: false,
        dangerouslyUseHTMLString: false,
        duration: 2000,
        showClose: false,
        offset: 16,
        appendTo: document.body,
        grouping: false,
        repeatNum: 1,
        customClass: "",
        onClose: expect.any(Function)
      });
    });

    it("应该调用 onClose 回调函数", () => {
      const testMessage = "Test message";
      const mockOnClose = vi.fn();
      const params = {
        onClose: mockOnClose
      };

      mockIsFunction.mockReturnValue(true);

      message(testMessage, params);

      // 获取传递给 ElMessage 的 onClose 函数并调用它
      const callArgs = mockElMessage.mock.calls[0][0];
      callArgs.onClose();

      expect(mockOnClose).toHaveBeenCalled();
    });

    it("应该在 onClose 不是函数时不调用", () => {
      const testMessage = "Test message";
      const params = {
        onClose: null
      };

      mockIsFunction.mockReturnValue(false);

      message(testMessage, params);

      // 获取传递给 ElMessage 的 onClose 函数并调用它
      const callArgs = mockElMessage.mock.calls[0][0];
      callArgs.onClose();

      // 验证没有调用任何函数
      expect(mockIsFunction).toHaveBeenCalledWith(null);
    });
  });

  describe("closeAllMessage 函数", () => {
    it("应该调用 ElMessage.closeAll", () => {
      closeAllMessage();
      expect(mockElMessage.closeAll).toHaveBeenCalled();
    });
  });
});
