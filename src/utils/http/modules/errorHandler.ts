import Axios from "axios";
import { type PureHttpError, ErrorType, type BusinessError } from "./types";
import router from "@/router";
import { removeToken } from "@/utils/auth";

/**
 * 识别错误类型
 * @param error - HTTP错误对象
 * @returns 错误类型
 */
export function identifyErrorType(error: PureHttpError): ErrorType {
  // 检查是否为取消请求
  if (Axios.isCancel(error)) {
    return ErrorType.CANCEL_ERROR;
  }

  // 检查是否为网络错误
  if (!error.response) {
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
    case status >= 500:
      return ErrorType.SERVER_ERROR;
    case status >= 400:
      return ErrorType.CLIENT_ERROR;
    default:
      return ErrorType.CLIENT_ERROR;
  }
}

/**
 * 处理业务错误码
 * @param error - HTTP错误对象
 * @returns 业务错误码对象
 */
export function handleBusinessError(
  error: PureHttpError
): BusinessError | null {
  if (error.response?.data) {
    const data = error.response.data as any;
    if (data.code || data.message) {
      return {
        code: data.code || "UNKNOWN",
        message: data.message || "业务处理失败"
      };
    }
  }
  return null;
}

/**
 * 记录错误日志
 * @param error - HTTP错误对象
 */
export function logError(error: PureHttpError): void {
  const errorInfo = {
    timestamp: new Date().toISOString(),
    url: error.config?.url || "未知URL",
    method: error.config?.method || "未知方法",
    errorType: error.errorType,
    status: error.response?.status,
    businessError: error.businessError,
    message: error.message,
    stack: error.stack
  };

  // 在开发环境下打印详细错误信息
  if (import.meta.env.DEV) {
    console.error("[HTTP Error]:", errorInfo);
  }

  // 可以在这里添加错误日志上报逻辑
  // 例如：sendErrorLog(errorInfo);
}

/**
 * 获取错误提示信息
 * @param error - HTTP错误对象
 * @returns 错误提示信息
 */
export function getErrorMessage(error: PureHttpError): string {
  // 优先使用业务错误消息
  if (error.businessError?.message) {
    return error.businessError.message;
  }

  // 根据错误类型返回默认错误消息
  switch (error.errorType) {
    case ErrorType.NETWORK_ERROR:
      return "网络连接失败，请检查网络设置";
    case ErrorType.AUTH_ERROR:
      return "认证失败，请重新登录";
    case ErrorType.PERMISSION_ERROR:
      return "权限不足，无法访问该资源";
    case ErrorType.NOT_FOUND_ERROR:
      return "请求的资源不存在";
    case ErrorType.SERVER_ERROR:
      return "服务器内部错误，请稍后重试";
    case ErrorType.CLIENT_ERROR:
      return "请求参数错误，请检查请求信息";
    case ErrorType.CANCEL_ERROR:
      return "请求已取消";
    default:
      return "请求失败，请稍后重试";
  }
}

/**
 * 处理错误
 * @param error - HTTP错误对象
 * @returns 处理后的错误对象
 */
export function handleError(error: PureHttpError): PureHttpError {
  // 标记是否为取消请求
  error.isCancelRequest = Axios.isCancel(error);

  // 识别错误类型
  error.errorType = identifyErrorType(error);

  // 处理业务错误码
  const businessError = handleBusinessError(error);
  if (businessError) {
    error.businessError = businessError;
    error.errorType = ErrorType.BUSINESS_ERROR;
  }

  // 添加错误时间戳
  error.timestamp = Date.now();

  // 记录错误日志
  logError(error);

  // 根据错误类型执行不同的处理策略
  switch (error.errorType) {
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

  return error;
}
