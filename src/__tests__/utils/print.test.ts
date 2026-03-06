import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import Print from "../../utils/print";

// 模拟 DOM 环境
const mockDocument = {
  querySelector: vi.fn(),
  querySelectorAll: vi.fn(),
  createElement: vi.fn(),
  body: {
    appendChild: vi.fn(element => element), // 返回添加的元素
    removeChild: vi.fn()
  }
};

// 保存原始的 document
const originalDocument = global.document;

describe("Print 工具函数测试", () => {
  beforeEach(() => {
    // 替换 document
    global.document = mockDocument as any;

    // 重置所有 mock
    vi.clearAllMocks();

    // 模拟 querySelector
    mockDocument.querySelector.mockImplementation(selector => {
      if (selector === "#test-dom") {
        return {
          outerHTML: '<div id="test-dom">Test Content</div>',
          nodeType: 1,
          nodeName: "DIV"
        };
      }
      return null;
    });

    // 模拟 querySelectorAll
    mockDocument.querySelectorAll.mockImplementation(selector => {
      if (selector === "style,link") {
        return [
          { outerHTML: "<style>body { margin: 0; }</style>" },
          { outerHTML: '<link rel="stylesheet" href="test.css">' }
        ];
      }
      if (selector === "input") {
        return [
          {
            type: "checkbox",
            checked: true,
            setAttribute: vi.fn(),
            removeAttribute: vi.fn()
          },
          { type: "text", value: "test value", setAttribute: vi.fn() }
        ];
      }
      if (selector === "select") {
        return [
          {
            type: "select-one",
            children: [
              {
                tagName: "OPTION",
                selected: true,
                setAttribute: vi.fn(),
                removeAttribute: vi.fn()
              },
              {
                tagName: "OPTION",
                selected: false,
                setAttribute: vi.fn(),
                removeAttribute: vi.fn()
              }
            ]
          }
        ];
      }
      if (selector === "textarea") {
        return [{ type: "textarea", value: "test text", innerHTML: "" }];
      }
      if (selector === "canvas") {
        return [
          {
            toDataURL: vi.fn().mockReturnValue("data:image/png;base64,test"),
            parentNode: {
              insertBefore: vi.fn()
            },
            nextElementSibling: null
          }
        ];
      }
      if (selector === ".isNeedRemove") {
        return [
          {
            parentNode: {
              removeChild: vi.fn()
            }
          }
        ];
      }
      return [];
    });

    // 模拟 createElement
    mockDocument.createElement.mockImplementation(tag => {
      if (tag === "iframe") {
        const iframe = {
          id: "",
          setAttribute: vi.fn(),
          onload: null,
          contentWindow: {
            focus: vi.fn(),
            print: vi.fn(),
            close: vi.fn(),
            document: {
              execCommand: vi.fn().mockReturnValue(false),
              open: vi.fn(),
              write: vi.fn(),
              close: vi.fn()
            }
          },
          contentDocument: {
            open: vi.fn(),
            write: vi.fn(),
            close: vi.fn()
          }
        };
        return iframe;
      }
      if (tag === "img") {
        return {
          src: "",
          setAttribute: vi.fn(),
          className: ""
        };
      }
      return {};
    });
  });

  afterEach(() => {
    // 恢复原始的 document
    global.document = originalDocument;
  });

  describe("Print 类", () => {
    it("应该正确初始化 Print 实例", () => {
      const printInstance = Print("#test-dom");
      expect(printInstance).toBeDefined();
    });

    it("应该通过字符串选择器获取 DOM 元素", () => {
      Print("#test-dom");
      expect(mockDocument.querySelector).toHaveBeenCalledWith("#test-dom");
    });

    it("应该通过 DOM 元素初始化", () => {
      const mockDom = {
        outerHTML: "<div>Test</div>",
        nodeType: 1,
        nodeName: "DIV"
      };
      const printInstance = Print(mockDom);
      // 验证是否正确处理了 DOM 元素
      expect(printInstance).toBeDefined();
    });

    it("应该通过 Vue 组件实例初始化", () => {
      const mockVueComponent = {
        $el: { outerHTML: "<div>Test</div>", nodeType: 1, nodeName: "DIV" }
      };
      const printInstance = Print(mockVueComponent);
      // 验证是否正确处理了 Vue 组件实例
      expect(printInstance).toBeDefined();
    });

    it("应该使用默认配置", () => {
      const printInstance = Print("#test-dom");
      expect(printInstance).toBeDefined();
    });

    it("应该使用自定义配置", () => {
      const customOptions = {
        styleStr: ".custom { color: red; }",
        printBeforeFn: vi.fn(),
        printDoneCallBack: vi.fn()
      };
      const printInstance = Print("#test-dom", customOptions);
      expect(printInstance).toBeDefined();
    });

    it("应该调用 setDomHeight 方法", () => {
      const customOptions = {
        setDomHeightArr: [".test-class"]
      };

      // 模拟 offsetHeight
      const mockDom = {
        outerHTML: "<div>Test</div>",
        nodeType: 1,
        nodeName: "DIV"
      };

      mockDocument.querySelectorAll.mockImplementation(selector => {
        if (selector === ".test-class") {
          return [
            {
              offsetHeight: 100,
              style: {} as any
            }
          ];
        }
        return [];
      });

      const printInstance = Print(mockDom, customOptions);
      expect(printInstance).toBeDefined();
    });
  });

  describe("extendOptions 方法", () => {
    it("应该扩展配置对象", () => {
      const printInstance = Print("#test-dom");
      const obj = { a: 1 };
      const obj2 = { b: 2, c: 3 };
      const result = printInstance.extendOptions(obj, obj2);
      expect(result).toEqual({ a: 1, b: 2, c: 3 });
    });
  });

  describe("getStyle 方法", () => {
    it("应该返回包含所有样式的字符串", () => {
      const printInstance = Print("#test-dom");
      const style = printInstance.getStyle();
      expect(style).toContain("<style>body { margin: 0; }</style>");
      expect(style).toContain('<link rel="stylesheet" href="test.css">');
      expect(style).toContain(".no-print{display:none;}");
    });
  });

  describe("setDomHeight 方法", () => {
    it("应该设置指定 DOM 元素的高度", () => {
      const printInstance = Print("#test-dom");
      const mockDom = {
        offsetHeight: 150,
        style: {} as any
      };

      mockDocument.querySelectorAll.mockReturnValue([mockDom]);

      printInstance.setDomHeight([".test-class"]);
      expect(mockDom.style.height).toBe("150px");
    });

    it("应该处理空数组", () => {
      const printInstance = Print("#test-dom");
      printInstance.setDomHeight([]);
      // 应该不会抛出错误
      expect(true).toBe(true);
    });
  });
});
