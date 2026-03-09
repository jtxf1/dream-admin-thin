import { describe, it, expect } from "vitest";

// 模拟错误处理函数
function mockHandleError(error: any) {
  if (error.response) {
    // 服务器返回错误
    const status = error.response.status;
    if (status === 403) {
      return { type: "PERMISSION_ERROR", message: "权限不足" };
    } else if (status === 500) {
      return { type: "SERVER_ERROR", message: "服务器错误" };
    } else {
      return { type: "CLIENT_ERROR", message: "客户端错误" };
    }
  } else if (error.request) {
    // 网络错误
    return { type: "NETWORK_ERROR", message: "网络连接失败" };
  } else {
    // 其他错误
    return { type: "UNKNOWN_ERROR", message: "未知错误" };
  }
}

describe("错误处理测试", () => {
  it("应该处理网络请求失败的情况", () => {
    const error = new Error("Network Error");
    const result = mockHandleError(error);
    expect(result.type).toBe("UNKNOWN_ERROR");
    expect(result.message).toBe("未知错误");
  });

  it("应该处理服务器响应错误的情况", () => {
    const error = {
      response: {
        status: 500,
        data: { message: "Internal Server Error" }
      }
    };
    const result = mockHandleError(error);
    expect(result.type).toBe("SERVER_ERROR");
    expect(result.message).toBe("服务器错误");
  });

  it("应该处理权限不足错误的情况", () => {
    const error = {
      response: {
        status: 403,
        data: { message: "Permission Denied" }
      }
    };
    const result = mockHandleError(error);
    expect(result.type).toBe("PERMISSION_ERROR");
    expect(result.message).toBe("权限不足");
  });

  it("应该处理客户端错误的情况", () => {
    const error = {
      response: {
        status: 400,
        data: { message: "Bad Request" }
      }
    };
    const result = mockHandleError(error);
    expect(result.type).toBe("CLIENT_ERROR");
    expect(result.message).toBe("客户端错误");
  });

  it("应该处理请求已发出但没有收到响应的情况", () => {
    const error = {
      request: {}
    };
    const result = mockHandleError(error);
    expect(result.type).toBe("NETWORK_ERROR");
    expect(result.message).toBe("网络连接失败");
  });
});
