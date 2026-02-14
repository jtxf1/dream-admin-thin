/**
 * HTTP请求相关类型定义
 */
import type {
  Method,
  AxiosError,
  AxiosResponse,
  AxiosRequestConfig
} from "axios";

/**
 * 登录结果类型
 */
export type resultType = {
  /**
   * 访问令牌
   */
  accessToken?: string;
};

/**
 * 请求方法类型
 * 从Axios的Method类型中提取常用的HTTP方法
 */
export type RequestMethods = Extract<
  Method,
  "get" | "post" | "put" | "delete" | "patch" | "option" | "head"
>;

/**
 * 错误类型枚举
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
  /** 业务逻辑错误 */
  BUSINESS_ERROR = "BUSINESS_ERROR",
  /** 取消请求错误 */
  CANCEL_ERROR = "CANCEL_ERROR"
}

/**
 * 业务错误码接口
 */
export interface BusinessErrorCode {
  /** 错误码 */
  code: string | number;
  /** 错误消息 */
  message: string;
}

/**
 * 增强的HTTP错误类型
 * 扩展AxiosError，添加错误类型和业务错误码
 */
export interface PureHttpError extends AxiosError {
  /**
   * 是否为取消请求
   */
  isCancelRequest?: boolean;
  /**
   * 错误类型
   */
  errorType?: ErrorType;
  /**
   * 业务错误码
   */
  businessError?: BusinessErrorCode;
  /**
   * 错误时间戳
   */
  timestamp?: number;
}

/**
 * 错误处理配置接口
 */
export interface ErrorHandlerConfig {
  /**
   * 是否显示错误提示
   */
  showMessage?: boolean;
  /**
   * 是否记录错误日志
   */
  logError?: boolean;
  /**
   * 自定义错误处理函数
   */
  customHandler?: (error: PureHttpError) => void;
}

/**
 * 增强的HTTP响应类型
 * 扩展AxiosResponse，使用增强的请求配置类型
 */
export interface PureHttpResponse extends AxiosResponse {
  /**
   * 请求配置
   */
  config: PureHttpRequestConfig;
}

/**
 * 增强的HTTP请求配置类型
 * 扩展AxiosRequestConfig，添加请求和响应回调
 */
export interface PureHttpRequestConfig extends AxiosRequestConfig {
  /**
   * 请求前回调函数
   * @param request - 请求配置
   */
  beforeRequestCallback?: (request: PureHttpRequestConfig) => void;

  /**
   * 响应前回调函数
   * @param response - 响应数据
   */
  beforeResponseCallback?: (response: PureHttpResponse) => void;

  /**
   * 错误处理配置
   */
  errorHandlerConfig?: ErrorHandlerConfig;
}

/**
 * HTTP请求工具类类型定义
 */
export default class PureHttp {
  /**
   * 通用请求方法
   * @template T - 响应数据类型
   * @param method - 请求方法
   * @param url - 请求URL
   * @param param - 请求参数
   * @param axiosConfig - 额外的请求配置
   * @returns 响应数据Promise
   */
  request<T>(
    method: RequestMethods,
    url: string,
    param?: AxiosRequestConfig,
    axiosConfig?: PureHttpRequestConfig
  ): Promise<T>;

  /**
   * POST请求方法
   * @template T - 响应数据类型
   * @template P - 请求参数类型
   * @param url - 请求URL
   * @param params - 请求参数
   * @param config - 额外的请求配置
   * @returns 响应数据Promise
   */
  post<T, P>(
    url: string,
    params?: AxiosRequestConfig<P>,
    config?: PureHttpRequestConfig
  ): Promise<T>;

  /**
   * GET请求方法
   * @template T - 响应数据类型
   * @template P - 请求参数类型
   * @param url - 请求URL
   * @param params - 请求参数
   * @param config - 额外的请求配置
   * @returns 响应数据Promise
   */
  get<T, P>(
    url: string,
    params?: AxiosRequestConfig<P>,
    config?: PureHttpRequestConfig
  ): Promise<T>;

  /**
   * PUT请求方法
   * @template T - 请求参数类型
   * @template P - 响应数据类型
   * @param url - 请求URL
   * @param params - 请求参数
   * @param config - 额外的请求配置
   * @returns 响应数据Promise
   */
  put<T, P>(
    url: string,
    params?: AxiosRequestConfig<T>,
    config?: PureHttpRequestConfig
  ): Promise<P>;

  /**
   * DELETE请求方法
   * @template T - 请求参数类型
   * @template P - 响应数据类型
   * @param url - 请求URL
   * @param params - 请求参数
   * @param config - 额外的请求配置
   * @returns 响应数据Promise
   */
  delete<T, P>(
    url: string,
    params?: AxiosRequestConfig<T>,
    config?: PureHttpRequestConfig
  ): Promise<P>;
}
