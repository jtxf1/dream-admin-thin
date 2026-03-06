import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getToken,
  setToken,
  removeToken,
  formatToken,
  hasPerms,
  putUserInfo,
  TokenKey,
  multipleTabsKey,
  userKey
} from "../../utils/auth";

// 模拟依赖
vi.mock("js-cookie", () => ({
  default: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn()
  }
}));

vi.mock("@/store/modules/user", () => ({
  useUserStoreHook: vi.fn(() => ({
    isRemembered: false,
    loginDay: 7,
    SET_AVATAR: vi.fn(),
    SET_USERNAME: vi.fn(),
    SET_NICKNAME: vi.fn(),
    SET_ROLES: vi.fn(),
    SET_PERMS: vi.fn(),
    permissions: []
  }))
}));

vi.mock("@pureadmin/utils", () => ({
  storageLocal: vi.fn(() => ({
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn()
  })),
  isString: vi.fn(val => typeof val === "string"),
  isIncludeAllChildren: vi.fn((arr1, arr2) =>
    arr1.every(item => arr2.includes(item))
  )
}));

import Cookies from "js-cookie";
import { useUserStoreHook } from "@/store/modules/user";
import { storageLocal, isIncludeAllChildren } from "@pureadmin/utils";

const mockCookies = Cookies as any;
const mockUseUserStoreHook = useUserStoreHook as any;
const mockStorageLocal = storageLocal as any;

describe("auth 工具函数测试", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("getToken 函数", () => {
    it("应该从 Cookies 获取 token", () => {
      const mockToken = { accessToken: "test-token", expires: 1234567890 };
      mockCookies.get.mockReturnValue(JSON.stringify(mockToken));
      const result = getToken();
      expect(mockCookies.get).toHaveBeenCalledWith(TokenKey);
      expect(result).toEqual(mockToken);
    });

    it("应该从 localStorage 获取 token 当 Cookies 中不存在时", () => {
      const mockToken = { accessToken: "test-token", expires: 1234567890 };
      mockCookies.get.mockReturnValue(null);
      const mockStorage = { getItem: vi.fn().mockReturnValue(mockToken) };
      mockStorageLocal.mockReturnValue(mockStorage);
      const result = getToken();
      expect(mockStorage.getItem).toHaveBeenCalledWith(userKey);
      expect(result).toEqual(mockToken);
    });
  });

  describe("setToken 函数", () => {
    it("应该设置 token 到 Cookies 和 localStorage", () => {
      const mockData = {
        accessToken: "test-token",
        expires: new Date("2024-12-31"),
        username: "test-user",
        roles: ["admin"],
        user: {
          avatarPath: "test-avatar",
          username: "test-user",
          nickname: "Test User"
        }
      };

      const mockStorage = {
        getItem: vi.fn().mockReturnValue(null),
        setItem: vi.fn()
      };
      mockStorageLocal.mockReturnValue(mockStorage);

      const mockStore = {
        isRemembered: false,
        loginDay: 7,
        SET_AVATAR: vi.fn(),
        SET_USERNAME: vi.fn(),
        SET_NICKNAME: vi.fn(),
        SET_ROLES: vi.fn(),
        SET_PERMS: vi.fn()
      };
      mockUseUserStoreHook.mockReturnValue(mockStore);

      setToken(mockData);

      expect(mockCookies.set).toHaveBeenCalledWith(
        TokenKey,
        expect.any(String),
        expect.any(Object)
      );
      expect(mockCookies.set).toHaveBeenCalledWith(multipleTabsKey, "true", {});
      expect(mockStorage.setItem).toHaveBeenCalledWith(
        userKey,
        expect.any(Object)
      );
    });

    it("应该在没有 username 和 roles 时从 localStorage 获取用户信息", () => {
      const mockData = {
        accessToken: "test-token",
        expires: new Date("2024-12-31")
      };

      const mockUserInfo = {
        user: {
          avatarName: "test-avatar",
          username: "test-user",
          nickname: "Test User"
        },
        roles: ["admin"],
        permissions: ["test:perm"]
      };

      const mockStorage = {
        getItem: vi.fn().mockReturnValue(mockUserInfo),
        setItem: vi.fn()
      };
      mockStorageLocal.mockReturnValue(mockStorage);

      const mockStore = {
        isRemembered: false,
        loginDay: 7,
        SET_AVATAR: vi.fn(),
        SET_USERNAME: vi.fn(),
        SET_NICKNAME: vi.fn(),
        SET_ROLES: vi.fn(),
        SET_PERMS: vi.fn()
      };
      mockUseUserStoreHook.mockReturnValue(mockStore);

      setToken(mockData);

      expect(mockStorage.getItem).toHaveBeenCalledWith(userKey);
      expect(mockStorage.setItem).toHaveBeenCalledWith(
        userKey,
        expect.any(Object)
      );
    });
  });

  describe("removeToken 函数", () => {
    it("应该删除 token 和相关信息", () => {
      const mockStorage = { removeItem: vi.fn() };
      mockStorageLocal.mockReturnValue(mockStorage);

      removeToken();

      expect(mockCookies.remove).toHaveBeenCalledWith(TokenKey);
      expect(mockCookies.remove).toHaveBeenCalledWith(multipleTabsKey);
      expect(mockStorage.removeItem).toHaveBeenCalledWith(userKey);
    });
  });

  describe("formatToken 函数", () => {
    it("应该格式化 token 为 Bearer 格式", () => {
      const token = "test-token";
      const result = formatToken(token);
      expect(result).toBe("Bearer test-token");
    });
  });

  describe("hasPerms 函数", () => {
    it("应该返回 false 当没有权限值时", () => {
      const result = hasPerms("");
      expect(result).toBe(false);
    });

    it("应该返回 true 当用户有所有权限时", () => {
      const mockStore = {
        permissions: ["*:*:*"]
      };
      mockUseUserStoreHook.mockReturnValue(mockStore);

      const result = hasPerms("test:perm");
      expect(result).toBe(true);
    });

    it("应该检查字符串权限", () => {
      const mockStore = {
        permissions: ["test:perm"]
      };
      mockUseUserStoreHook.mockReturnValue(mockStore);

      const result = hasPerms("test:perm");
      expect(result).toBe(true);
    });

    it("应该检查数组权限", () => {
      const mockStore = {
        permissions: ["test:perm1", "test:perm2"]
      };
      mockUseUserStoreHook.mockReturnValue(mockStore);

      (isIncludeAllChildren as any).mockReturnValue(true);

      const result = hasPerms(["test:perm1", "test:perm2"]);
      expect(isIncludeAllChildren).toHaveBeenCalledWith(
        ["test:perm1", "test:perm2"],
        ["test:perm1", "test:perm2"]
      );
      expect(result).toBe(true);
    });

    it("应该返回 false 当用户没有权限时", () => {
      const mockStore = {
        permissions: ["other:perm"]
      };
      mockUseUserStoreHook.mockReturnValue(mockStore);

      const result = hasPerms("test:perm");
      expect(result).toBe(false);
    });
  });

  describe("putUserInfo 函数", () => {
    it("应该更新用户信息", () => {
      const mockUserInfo = {
        accessToken: "test-token",
        expires: 1234567890,
        user: { id: 1, name: "Old User" }
      };

      const newUser = { id: 1, name: "New User" };

      const mockStorage = {
        getItem: vi.fn().mockReturnValue(mockUserInfo),
        setItem: vi.fn()
      };
      mockStorageLocal.mockReturnValue(mockStorage);

      putUserInfo(newUser);

      expect(mockStorage.getItem).toHaveBeenCalledWith(userKey);
      expect(mockStorage.setItem).toHaveBeenCalledWith(userKey, {
        ...mockUserInfo,
        user: newUser
      });
    });
  });
});
