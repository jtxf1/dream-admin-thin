import type { AxiosRequestConfig, AxiosError } from "axios";

/**
 * HTTP请求方法类型
 */
export type RequestMethods =
  | "get"
  | "post"
  | "put"
  | "delete"
  | "patch"
  | "head"
  | "options";

/**
 * HTTP错误类型枚举
 */
export enum ErrorType {
  /** 网络错误 */
  NETWORK_ERROR = "NETWORK_ERROR",
  /** 认证错误 */
  AUTH_ERROR = "AUTH_ERROR",
  /** 权限错误 */
  PERMISSION_ERROR = "PERMISSION_ERROR",
  /** 资源不存在错误 */
  NOT_FOUND_ERROR = "NOT_FOUND_ERROR",
  /** 服务器内部错误 */
  SERVER_ERROR = "SERVER_ERROR",
  /** 客户端错误 */
  CLIENT_ERROR = "CLIENT_ERROR",
  /** 业务错误 */
  BUSINESS_ERROR = "BUSINESS_ERROR",
  /** 取消请求错误 */
  CANCEL_ERROR = "CANCEL_ERROR"
}

/**
 * 业务错误码对象
 */
export interface BusinessError {
  code: string | number;
  message: string;
}

/**
 * 错误处理配置接口
 */
export interface ErrorHandlerConfig {
  /** 是否显示错误消息 */
  showMessage?: boolean;
  /** 自定义错误处理函数 */
  customHandler?: (error: PureHttpError) => void;
}

/**
 * 自定义HTTP错误对象
 */
export interface PureHttpError extends AxiosError {
  /** 错误类型 */
  errorType?: ErrorType;
  /** 业务错误码对象 */
  businessError?: BusinessError;
  /** 是否为取消请求 */
  isCancelRequest?: boolean;
  /** 错误时间戳 */
  timestamp?: number;
}

/**
 * 自定义HTTP响应对象
 */
export interface PureHttpResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: any;
  config: PureHttpRequestConfig;
  request?: any;
}

/**
 * 自定义HTTP请求配置对象
 */
export interface PureHttpRequestConfig extends AxiosRequestConfig {
  /** 请求前回调 */
  beforeRequestCallback?: (request: PureHttpRequestConfig) => void;
  /** 响应前回调 */
  beforeResponseCallback?: (response: PureHttpResponse) => void;
  /** 错误处理配置 */
  errorHandlerConfig?: ErrorHandlerConfig;
  /** 防抖配置 */
  debounce?: {
    /** 是否启用防抖 */
    enabled?: boolean;
    /** 防抖延迟时间（毫秒） */
    wait?: number;
    /** 是否合并相同参数的请求 */
    merge?: boolean;
  };
}
