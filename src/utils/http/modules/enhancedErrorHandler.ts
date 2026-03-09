import Axios from "axios";
import { type PureHttpError, ErrorType, type BusinessError } from "./types";
import router from "@/router";
import { removeToken } from "@/utils/auth";

/**
 * 扩展的错误类型枚举
 */
export enum EnhancedErrorType {
  // 网络相关错误
  NETWORK_ERROR = "NETWORK_ERROR",
  NETWORK_TIMEOUT = "NETWORK_TIMEOUT",
  NETWORK_OFFLINE = "NETWORK_OFFLINE",

  // 认证相关错误
  AUTH_ERROR = "AUTH_ERROR",
  TOKEN_EXPIRED = "TOKEN_EXPIRED",
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",

  // 权限相关错误
  PERMISSION_ERROR = "PERMISSION_ERROR",
  RESOURCE_FORBIDDEN = "RESOURCE_FORBIDDEN",

  // 资源相关错误
  NOT_FOUND_ERROR = "NOT_FOUND_ERROR",
  RESOURCE_DELETED = "RESOURCE_DELETED",

  // 服务器相关错误
  SERVER_ERROR = "SERVER_ERROR",
  DATABASE_ERROR = "DATABASE_ERROR",
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",

  // 客户端相关错误
  CLIENT_ERROR = "CLIENT_ERROR",
  INVALID_PARAMETERS = "INVALID_PARAMETERS",
  VALIDATION_ERROR = "VALIDATION_ERROR",

  // 业务相关错误
  BUSINESS_ERROR = "BUSINESS_ERROR",
  TRANSACTION_FAILED = "TRANSACTION_FAILED",
  QUOTA_EXCEEDED = "QUOTA_EXCEEDED",

  // 其他错误
  CANCEL_ERROR = "CANCEL_ERROR",
  UNKNOWN_ERROR = "UNKNOWN_ERROR"
}

/**
 * 错误处理配置接口
 */
export interface EnhancedErrorHandlerConfig {
  /** 是否显示错误消息 */
  showMessage?: boolean;
  /** 自定义错误处理函数 */
  customHandler?: (error: PureHttpError) => void;
  /** 是否启用错误重试 */
  enableRetry?: boolean;
  /** 重试次数 */
  retryCount?: number;
  /** 重试间隔（毫秒） */
  retryInterval?: number;
  /** 需要重试的错误类型 */
  retryableErrorTypes?: EnhancedErrorType[];
}

/**
 * 错误日志级别
 */
export enum LogLevel {
  DEBUG = "debug",
  INFO = "info",
  WARN = "warn",
  ERROR = "error"
}

/**
 * 识别增强的错误类型
 * @param error - HTTP错误对象
 * @returns 增强的错误类型
 */
export function identifyEnhancedErrorType(
  error: PureHttpError
): EnhancedErrorType {
  // 检查是否为取消请求
  if (Axios.isCancel(error)) {
    return EnhancedErrorType.CANCEL_ERROR;
  }

  // 检查是否为网络错误
  if (!error.response) {
    if (error.code === "ECONNABORTED") {
      return EnhancedErrorType.NETWORK_TIMEOUT;
    }
    if (navigator && !navigator.onLine) {
      return EnhancedErrorType.NETWORK_OFFLINE;
    }
    return EnhancedErrorType.NETWORK_ERROR;
  }

  const status = error.response.status;
  const data = error.response.data as any;

  // 根据HTTP状态码判断错误类型
  switch (status) {
    case 401:
      if (data?.code === "TOKEN_EXPIRED") {
        return EnhancedErrorType.TOKEN_EXPIRED;
      }
      if (data?.code === "INVALID_CREDENTIALS") {
        return EnhancedErrorType.INVALID_CREDENTIALS;
      }
      return EnhancedErrorType.AUTH_ERROR;
    case 403:
      if (data?.code === "RESOURCE_FORBIDDEN") {
        return EnhancedErrorType.RESOURCE_FORBIDDEN;
      }
      return EnhancedErrorType.PERMISSION_ERROR;
    case 404:
      if (data?.code === "RESOURCE_DELETED") {
        return EnhancedErrorType.RESOURCE_DELETED;
      }
      return EnhancedErrorType.NOT_FOUND_ERROR;
    case 400:
      if (data?.code === "VALIDATION_ERROR") {
        return EnhancedErrorType.VALIDATION_ERROR;
      }
      if (data?.code === "INVALID_PARAMETERS") {
        return EnhancedErrorType.INVALID_PARAMETERS;
      }
      return EnhancedErrorType.CLIENT_ERROR;
    case 429:
      return EnhancedErrorType.QUOTA_EXCEEDED;
    case 500:
      if (data?.code === "DATABASE_ERROR") {
        return EnhancedErrorType.DATABASE_ERROR;
      }
      return EnhancedErrorType.SERVER_ERROR;
    case 503:
      return EnhancedErrorType.SERVICE_UNAVAILABLE;
    default:
      // 检查业务错误码
      if (data?.code) {
        if (data?.code === "TRANSACTION_FAILED") {
          return EnhancedErrorType.TRANSACTION_FAILED;
        }
        if (data?.code === "QUOTA_EXCEEDED") {
          return EnhancedErrorType.QUOTA_EXCEEDED;
        }
        return EnhancedErrorType.BUSINESS_ERROR;
      }
      return EnhancedErrorType.UNKNOWN_ERROR;
  }
}

/**
 * 处理业务错误码
 * @param error - HTTP错误对象
 * @returns 业务错误码对象
 */
export function handleEnhancedBusinessError(
  error: PureHttpError
): BusinessError | null {
  if (error.response?.data) {
    const data = error.response.data as any;
    if (data.code || data.message) {
      return {
        code: data.code || "UNKNOWN",
        message: data.message || data.msg || "业务处理失败"
      };
    }
  }
  return null;
}

/**
 * 记录错误日志
 * @param error - HTTP错误对象
 * @param level - 日志级别
 */
export function logEnhancedError(
  error: PureHttpError,
  level: LogLevel = LogLevel.ERROR
): void {
  const errorInfo = {
    timestamp: new Date().toISOString(),
    url: error.config?.url || "未知URL",
    method: error.config?.method || "未知方法",
    errorType: error.errorType,
    enhancedErrorType: error.enhancedErrorType,
    status: error.response?.status,
    businessError: error.businessError,
    message: error.message,
    stack: error.stack,
    requestData: error.config?.data,
    responseData: error.response?.data
  };

  // 根据日志级别打印不同详细程度的错误信息
  switch (level) {
    case LogLevel.DEBUG:
      if (import.meta.env.DEV) {
        console.debug("[HTTP Debug]:", errorInfo);
      }
      break;
    case LogLevel.INFO:
      if (import.meta.env.DEV) {
        console.info("[HTTP Info]:", errorInfo);
      }
      break;
    case LogLevel.WARN:
      console.warn("[HTTP Warning]:", errorInfo);
      break;
    case LogLevel.ERROR:
      console.error("[HTTP Error]:", errorInfo);
      break;
  }

  // 可以在这里添加错误日志上报逻辑
  // 例如：sendErrorLog(errorInfo);
}

/**
 * 获取错误提示信息
 * @param error - HTTP错误对象
 * @returns 错误提示信息
 */
export function getEnhancedErrorMessage(error: PureHttpError): string {
  // 优先使用业务错误消息
  if (error.businessError?.message) {
    return error.businessError.message;
  }

  // 根据增强错误类型返回默认错误消息
  const enhancedErrorType = error.enhancedErrorType as EnhancedErrorType;
  switch (enhancedErrorType) {
    // 网络相关错误
    case EnhancedErrorType.NETWORK_ERROR:
      return "网络连接失败，请检查网络设置";
    case EnhancedErrorType.NETWORK_TIMEOUT:
      return "网络请求超时，请稍后重试";
    case EnhancedErrorType.NETWORK_OFFLINE:
      return "您当前处于离线状态，请检查网络连接";

    // 认证相关错误
    case EnhancedErrorType.AUTH_ERROR:
      return "认证失败，请重新登录";
    case EnhancedErrorType.TOKEN_EXPIRED:
      return "登录已过期，请重新登录";
    case EnhancedErrorType.INVALID_CREDENTIALS:
      return "用户名或密码错误";

    // 权限相关错误
    case EnhancedErrorType.PERMISSION_ERROR:
      return "权限不足，无法访问该资源";
    case EnhancedErrorType.RESOURCE_FORBIDDEN:
      return "该资源禁止访问";

    // 资源相关错误
    case EnhancedErrorType.NOT_FOUND_ERROR:
      return "请求的资源不存在";
    case EnhancedErrorType.RESOURCE_DELETED:
      return "请求的资源已被删除";

    // 服务器相关错误
    case EnhancedErrorType.SERVER_ERROR:
      return "服务器内部错误，请稍后重试";
    case EnhancedErrorType.DATABASE_ERROR:
      return "数据库操作失败，请稍后重试";
    case EnhancedErrorType.SERVICE_UNAVAILABLE:
      return "服务暂时不可用，请稍后重试";

    // 客户端相关错误
    case EnhancedErrorType.CLIENT_ERROR:
      return "请求参数错误，请检查请求信息";
    case EnhancedErrorType.INVALID_PARAMETERS:
      return "参数格式错误，请检查输入";
    case EnhancedErrorType.VALIDATION_ERROR:
      return "数据验证失败，请检查输入";

    // 业务相关错误
    case EnhancedErrorType.BUSINESS_ERROR:
      return "业务处理失败";
    case EnhancedErrorType.TRANSACTION_FAILED:
      return "交易失败，请稍后重试";
    case EnhancedErrorType.QUOTA_EXCEEDED:
      return "请求次数超过限制，请稍后重试";

    // 其他错误
    case EnhancedErrorType.CANCEL_ERROR:
      return "请求已取消";
    default:
      return "请求失败，请稍后重试";
  }
}

/**
 * 检查错误是否可重试
 * @param error - HTTP错误对象
 * @param retryableErrorTypes - 可重试的错误类型
 * @returns 是否可重试
 */
export function isRetryableError(
  error: PureHttpError,
  retryableErrorTypes?: EnhancedErrorType[]
): boolean {
  const defaultRetryableTypes = [
    EnhancedErrorType.NETWORK_ERROR,
    EnhancedErrorType.NETWORK_TIMEOUT,
    EnhancedErrorType.SERVER_ERROR,
    EnhancedErrorType.DATABASE_ERROR,
    EnhancedErrorType.SERVICE_UNAVAILABLE
  ];

  const types = retryableErrorTypes || defaultRetryableTypes;
  return types.includes(error.enhancedErrorType as EnhancedErrorType);
}

/**
 * 执行错误重试
 * @param error - HTTP错误对象
 * @param config - 错误处理配置
 * @returns Promise
 */
export function retryRequest(
  error: PureHttpError,
  config: EnhancedErrorHandlerConfig
): Promise<any> {
  const { retryCount = 3, retryInterval = 1000 } = config;

  return new Promise((resolve, reject) => {
    let attempts = 0;

    const attemptRetry = () => {
      attempts++;
      if (attempts > retryCount) {
        reject(error);
        return;
      }

      setTimeout(() => {
        Axios(error.config)
          .then(resolve)
          .catch(retryError => {
            // 检查重试后的错误是否仍然可重试
            if (isRetryableError(retryError, config.retryableErrorTypes)) {
              attemptRetry();
            } else {
              reject(retryError);
            }
          });
      }, retryInterval * attempts); // 指数退避策略
    };

    attemptRetry();
  });
}

/**
 * 处理错误
 * @param error - HTTP错误对象
 * @param config - 错误处理配置
 * @returns 处理后的错误对象
 */
export async function handleEnhancedError(
  error: PureHttpError,
  config: EnhancedErrorHandlerConfig = {}
): Promise<PureHttpError> {
  // 标记是否为取消请求
  error.isCancelRequest = Axios.isCancel(error);

  // 识别基础错误类型
  error.errorType = identifyErrorType(error);

  // 识别增强错误类型
  error.enhancedErrorType = identifyEnhancedErrorType(error);

  // 处理业务错误码
  const businessError = handleEnhancedBusinessError(error);
  if (businessError) {
    error.businessError = businessError;
  }

  // 添加错误时间戳
  error.timestamp = Date.now();

  // 记录错误日志
  logEnhancedError(error);

  // 检查是否需要重试
  if (
    config.enableRetry &&
    isRetryableError(error, config.retryableErrorTypes)
  ) {
    try {
      return await retryRequest(error, config);
    } catch (retryError) {
      // 重试失败，继续处理原始错误
      error = retryError as PureHttpError;
    }
  }

  // 根据错误类型执行不同的处理策略
  switch (error.enhancedErrorType) {
    case EnhancedErrorType.AUTH_ERROR:
    case EnhancedErrorType.TOKEN_EXPIRED:
      // 认证错误，清除token并重定向到登录页
      removeToken();
      router.push({
        path: "/login",
        query: { redirect: router.currentRoute.value.fullPath }
      });
      break;
    case EnhancedErrorType.PERMISSION_ERROR:
    case EnhancedErrorType.RESOURCE_FORBIDDEN:
      // 权限错误，重定向到403页面
      router.push("/error/403");
      break;
    case EnhancedErrorType.NOT_FOUND_ERROR:
    case EnhancedErrorType.RESOURCE_DELETED:
      // 资源不存在错误，重定向到404页面
      router.push("/error/404");
      break;
    case EnhancedErrorType.SERVER_ERROR:
    case EnhancedErrorType.DATABASE_ERROR:
    case EnhancedErrorType.SERVICE_UNAVAILABLE:
      // 服务器内部错误，重定向到500页面
      router.push("/error/500");
      break;
  }

  return error;
}

/**
 * 识别基础错误类型（保持向后兼容）
 * @param error - HTTP错误对象
 * @returns 基础错误类型
 */
function identifyErrorType(error: PureHttpError): ErrorType {
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
