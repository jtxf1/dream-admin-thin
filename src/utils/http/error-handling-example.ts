/**
 * HTTP错误处理示例
 * 展示如何使用新的错误处理机制
 */
import { http } from "./index";
import type { PureHttpError } from "./types.d";

/**
 * 基本错误处理示例
 * 演示默认的错误处理行为
 */
export const basicErrorHandlingExample = async () => {
  try {
    // 尝试访问一个不存在的接口
    const response = await http.get("/api/nonexistent-endpoint");
    console.log("Response:", response);
  } catch (error) {
    console.log("Caught error:", error);
    // 默认情况下，错误会被自动处理并显示错误提示
  }
};

/**
 * 自定义错误处理示例
 * 演示如何使用自定义错误处理函数
 */
export const customErrorHandlingExample = async () => {
  try {
    const response = await http.get(
      "/api/nonexistent-endpoint",
      {},
      {
        errorHandlerConfig: {
          // 自定义错误处理函数
          customHandler: (error: PureHttpError) => {
            console.log("Custom error handler:", error);
            // 这里可以添加自定义的错误处理逻辑
            // 例如：显示自定义错误提示、执行特定操作等
          },
          // 可选：是否显示默认错误提示
          showMessage: true
        }
      }
    );
    console.log("Response:", response);
  } catch (error) {
    console.log("Caught error:", error);
  }
};

/**
 * 禁用错误提示示例
 * 演示如何禁用默认的错误提示
 */
export const disableErrorMessageExample = async () => {
  try {
    const response = await http.get(
      "/api/nonexistent-endpoint",
      {},
      {
        errorHandlerConfig: {
          // 禁用默认错误提示
          showMessage: false
        }
      }
    );
    console.log("Response:", response);
  } catch (error) {
    console.log("Caught error:", error);
    // 这里可以添加自定义的错误处理逻辑
  }
};

/**
 * 业务错误处理示例
 * 演示如何处理包含业务错误码的响应
 */
export const businessErrorHandlingExample = async () => {
  try {
    // 假设这个接口会返回业务错误
    const response = await http.post("/api/business-error", {
      data: {
        // 错误的请求参数
        invalidParam: "value"
      }
    });
    console.log("Response:", response);
  } catch (error) {
    console.log("Caught error:", error);
    // 业务错误会被自动识别并显示业务错误消息
  }
};

/**
 * 网络错误处理示例
 * 演示如何处理网络错误
 */
export const networkErrorHandlingExample = async () => {
  try {
    // 假设网络连接已断开
    const response = await http.get("http://nonexistent-domain.com/api");
    console.log("Response:", response);
  } catch (error) {
    console.log("Caught error:", error);
    // 网络错误会被自动识别并显示网络错误提示
  }
};

/**
 * 认证错误处理示例
 * 演示如何处理认证错误（401）
 */
export const authErrorHandlingExample = async () => {
  try {
    // 假设token已过期
    const response = await http.get("/api/protected-resource");
    console.log("Response:", response);
  } catch (error) {
    console.log("Caught error:", error);
    // 认证错误会被自动处理，清除token并重定向到登录页
  }
};

/**
 * 权限错误处理示例
 * 演示如何处理权限错误（403）
 */
export const permissionErrorHandlingExample = async () => {
  try {
    // 尝试访问没有权限的资源
    const response = await http.get("/api/admin-only-resource");
    console.log("Response:", response);
  } catch (error) {
    console.log("Caught error:", error);
    // 权限错误会被自动处理，重定向到403页面
  }
};

/**
 * 服务器错误处理示例
 * 演示如何处理服务器内部错误（500+）
 */
export const serverErrorHandlingExample = async () => {
  try {
    // 假设服务器内部出错
    const response = await http.get("/api/server-error");
    console.log("Response:", response);
  } catch (error) {
    console.log("Caught error:", error);
    // 服务器错误会被自动处理，重定向到500页面
  }
};

/**
 * 运行所有示例
 */
export const runAllErrorHandlingExamples = async () => {
  console.log("=== 开始运行HTTP错误处理示例 ===");

  // 注意：这些示例可能会导致页面跳转或显示错误提示
  // 建议在开发环境中单独运行每个示例

  // 示例1：基本错误处理
  console.log("\n1. 基本错误处理示例");
  // await basicErrorHandlingExample();

  // 示例2：自定义错误处理
  console.log("\n2. 自定义错误处理示例");
  // await customErrorHandlingExample();

  // 示例3：禁用错误提示
  console.log("\n3. 禁用错误提示示例");
  // await disableErrorMessageExample();

  // 示例4：业务错误处理
  console.log("\n4. 业务错误处理示例");
  // await businessErrorHandlingExample();

  // 示例5：网络错误处理
  console.log("\n5. 网络错误处理示例");
  // await networkErrorHandlingExample();

  // 示例6：认证错误处理
  console.log("\n6. 认证错误处理示例");
  // await authErrorHandlingExample();

  // 示例7：权限错误处理
  console.log("\n7. 权限错误处理示例");
  // await permissionErrorHandlingExample();

  // 示例8：服务器错误处理
  console.log("\n8. 服务器错误处理示例");
  // await serverErrorHandlingExample();

  console.log("\n=== HTTP错误处理示例运行完成 ===");
};
