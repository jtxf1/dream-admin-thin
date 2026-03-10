import {
  ErrorType,
  ErrorLevel,
  type StandardError,
  type ErrorHandlerConfig,
  type RequestContext
} from "./types";
import { ElMessage } from "element-plus";
import router from "@/router";
import { removeToken } from "@/utils/auth";
import { reportError } from "./monitor";

/**
 * 生成唯一错误ID
 */
function generateErrorId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * 识别错误类型
 */
export function identifyErrorType(error: any): ErrorType {
  // 检查是否为网络错误
  if (!error.response) {
    if (error.message?.includes("timeout")) {
      return ErrorType.NETWORK_TIMEOUT;
    }
    if (error.message?.includes("offline")) {
      return ErrorType.NETWORK_OFFLINE;
    }
    return ErrorType.NETWORK_ERROR;
  }

  const status = error.response.status;

  // 根据HTTP状态码判断错误类型
  switch (true) {
    case status === 401:
      return ErrorType.AUTH_ERROR;
    case status === 403:
      return ErrorType.PERMISSION_ERROR;
    case status === 404:
      return ErrorType.NOT_FOUND_ERROR;
    case status === 409:
      return ErrorType.RESOURCE_CONFLICT;
    case status === 429:
      return ErrorType.RESOURCE_EXHAUSTED;
    case status === 400:
      return ErrorType.VALIDATION_ERROR;
    case status >= 500:
      return ErrorType.SERVER_ERROR;
    case status >= 400:
      return ErrorType.CLIENT_ERROR;
    default:
      return ErrorType.UNKNOWN_ERROR;
  }
}

/**
 * 确定错误级别
 */
export function determineErrorLevel(errorType: ErrorType): ErrorLevel {
  switch (errorType) {
    case ErrorType.NETWORK_ERROR:
    case ErrorType.NETWORK_TIMEOUT:
    case ErrorType.NETWORK_OFFLINE:
    case ErrorType.AUTH_ERROR:
    case ErrorType.PERMISSION_ERROR:
    case ErrorType.SERVER_ERROR:
      return ErrorLevel.ERROR;
    case ErrorType.NOT_FOUND_ERROR:
    case ErrorType.RESOURCE_CONFLICT:
    case ErrorType.RESOURCE_EXHAUSTED:
    case ErrorType.VALIDATION_ERROR:
    case ErrorType.DATA_ERROR:
    case ErrorType.BUSINESS_ERROR:
      return ErrorLevel.WARNING;
    case ErrorType.CLIENT_ERROR:
      return ErrorLevel.INFO;
    case ErrorType.UNKNOWN_ERROR:
    case ErrorType.CANCEL_ERROR:
    case ErrorType.RUNTIME_ERROR:
      return ErrorLevel.DEBUG;
    default:
      return ErrorLevel.ERROR;
  }
}

/**
 * 构建标准化错误对象
 */
export function buildStandardError(
  error: any,
  context?: RequestContext,
  source: string = "unknown"
): StandardError {
  const errorType = identifyErrorType(error);
  const level = determineErrorLevel(errorType);

  let code = "UNKNOWN";
  let message = "未知错误";
  let businessData: any = null;

  // 处理业务错误
  if (error.response?.data) {
    const data = error.response.data;
    if (data.code) {
      code = data.code;
    }
    if (data.message) {
      message = data.message;
    } else if (data.error) {
      message = data.error;
    }
    businessData = data;
  } else if (error.message) {
    message = error.message;
  }

  return {
    id: generateErrorId(),
    type: errorType,
    code,
    message,
    level,
    timestamp: Date.now(),
    context,
    businessData,
    originalError: error,
    stack: error.stack,
    source
  };
}

/**
 * 记录错误日志
 */
export function logError(error: StandardError): void {
  const logData = {
    id: error.id,
    timestamp: new Date(error.timestamp).toISOString(),
    type: error.type,
    code: error.code,
    message: error.message,
    level: error.level,
    source: error.source,
    context: error.context,
    stack: error.stack
  };

  // 根据错误级别选择日志方法
  switch (error.level) {
    case ErrorLevel.DEBUG:
      if (import.meta.env.DEV) {
        console.debug("[DEBUG Error]:", logData);
      }
      break;
    case ErrorLevel.INFO:
      if (import.meta.env.DEV) {
        console.info("[INFO Error]:", logData);
      }
      break;
    case ErrorLevel.WARNING:
      console.warn("[WARNING Error]:", logData);
      break;
    case ErrorLevel.ERROR:
    case ErrorLevel.CRITICAL:
      console.error("[ERROR Error]:", logData);
      break;
  }

  // 上报错误
  reportError(error);
}

/**
 * 显示用户友好的错误提示
 */
export function showErrorMessage(error: StandardError): void {
  // 在生产环境下，避免显示敏感的错误信息
  let displayMessage = error.message;

  if (import.meta.env.PROD) {
    switch (error.type) {
      case ErrorType.SERVER_ERROR:
        displayMessage = "服务器内部错误，请稍后重试";
        break;
      case ErrorType.NETWORK_ERROR:
      case ErrorType.NETWORK_TIMEOUT:
      case ErrorType.NETWORK_OFFLINE:
        displayMessage = "网络连接失败，请检查网络设置";
        break;
      case ErrorType.AUTH_ERROR:
        displayMessage = "认证失败，请重新登录";
        break;
      case ErrorType.PERMISSION_ERROR:
        displayMessage = "权限不足，无法访问该资源";
        break;
      case ErrorType.NOT_FOUND_ERROR:
        displayMessage = "请求的资源不存在";
        break;
      case ErrorType.VALIDATION_ERROR:
        // 保留验证错误的具体信息
        break;
      default:
        displayMessage = "操作失败，请稍后重试";
    }
  }

  ElMessage.error({
    message: displayMessage,
    duration: 3000
  });
}

/**
 * 处理错误
 */
export function handleError(
  error: any,
  config: ErrorHandlerConfig = {},
  context?: RequestContext,
  source: string = "unknown"
): StandardError {
  // 构建标准化错误对象
  const standardError = buildStandardError(error, context, source);

  // 记录错误日志
  logError(standardError);

  // 根据配置决定是否显示错误消息
  if (config.showMessage !== false) {
    showErrorMessage(standardError);
  }

  // 根据错误类型执行不同的处理策略
  switch (standardError.type) {
    case ErrorType.AUTH_ERROR:
      // 认证错误，清除token并重定向到登录页
      removeToken();
      router.push({
        path: "/login",
        query: { redirect: router.currentRoute.value.fullPath }
      });
      break;
    case ErrorType.PERMISSION_ERROR:
      // 权限错误，重定向到403页面
      router.push("/403");
      break;
    case ErrorType.NOT_FOUND_ERROR:
      // 资源不存在错误，重定向到404页面
      router.push("/404");
      break;
    case ErrorType.SERVER_ERROR:
      // 服务器内部错误，重定向到500页面
      router.push("/500");
      break;
  }

  // 执行自定义错误处理函数
  if (config.customHandler) {
    config.customHandler(standardError);
  }

  return standardError;
}

/**
 * 捕获和处理全局错误
 */
export function setupGlobalErrorHandler(): void {
  // 捕获未处理的Promise拒绝
  window.addEventListener("unhandledrejection", event => {
    handleError(
      event.reason,
      { showMessage: true },
      undefined,
      "unhandledrejection"
    );
  });

  // 捕获全局错误
  window.addEventListener("error", event => {
    handleError(event.error, { showMessage: true }, undefined, "global-error");
  });
}

/**
 * 包装异步函数，自动处理错误
 */
export function withErrorHandling<T>(
  fn: () => Promise<T>,
  config: ErrorHandlerConfig = {},
  context?: RequestContext,
  source: string = "async-function"
): Promise<T | null> {
  return fn().catch(error => {
    handleError(error, config, context, source);
    return null;
  });
}

// 导出所有类型和函数
export * from "./types";
export * from "./monitor";

export default {
  handleError,
  setupGlobalErrorHandler,
  withErrorHandling,
  buildStandardError,
  identifyErrorType,
  determineErrorLevel,
  logError,
  showErrorMessage
};
