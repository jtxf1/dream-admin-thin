import { describe, it, expect, vi, beforeEach } from "vitest";
import { usePublicHooks } from "../../utils/theme";

// 模拟依赖
vi.mock("@pureadmin/utils", () => ({
  useDark: vi.fn(() => ({
    isDark: { value: false }
  }))
}));

import { useDark } from "@pureadmin/utils";

const mockUseDark = useDark as any;

describe("theme 工具函数测试", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("usePublicHooks 函数", () => {
    it("应该返回正确的对象结构", () => {
      const result = usePublicHooks();
      expect(result).toHaveProperty("isDark");
      expect(result).toHaveProperty("switchStyle");
      expect(result).toHaveProperty("tagStyle");
    });

    it("应该返回正确的 switchStyle", () => {
      const { switchStyle } = usePublicHooks();
      expect(switchStyle.value).toEqual({
        "--el-switch-on-color": "#6abe39",
        "--el-switch-off-color": "#e84749"
      });
    });

    it("应该在亮色模式下返回正确的 tagStyle", () => {
      mockUseDark.mockReturnValue({ isDark: { value: false } });
      const { tagStyle } = usePublicHooks();

      const enabledStyle = tagStyle.value(true);
      expect(enabledStyle).toEqual({
        "--el-tag-text-color": "#389e0d",
        "--el-tag-bg-color": "#f6ffed",
        "--el-tag-border-color": "#b7eb8f"
      });

      const disabledStyle = tagStyle.value(false);
      expect(disabledStyle).toEqual({
        "--el-tag-text-color": "#cf1322",
        "--el-tag-bg-color": "#fff1f0",
        "--el-tag-border-color": "#ffa39e"
      });
    });

    it("应该在暗色模式下返回正确的 tagStyle", () => {
      mockUseDark.mockReturnValue({ isDark: { value: true } });
      const { tagStyle } = usePublicHooks();

      const enabledStyle = tagStyle.value(true);
      expect(enabledStyle).toEqual({
        "--el-tag-text-color": "#6abe39",
        "--el-tag-bg-color": "#172412",
        "--el-tag-border-color": "#274a17"
      });

      const disabledStyle = tagStyle.value(false);
      expect(disabledStyle).toEqual({
        "--el-tag-text-color": "#e84749",
        "--el-tag-bg-color": "#2b1316",
        "--el-tag-border-color": "#58191c"
      });
    });
  });
});
