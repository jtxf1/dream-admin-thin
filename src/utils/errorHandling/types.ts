/**
 * 错误级别枚举
 */
export enum ErrorLevel {
  /** 调试级别 */
  DEBUG = "DEBUG",
  /** 信息级别 */
  INFO = "INFO",
  /** 警告级别 */
  WARNING = "WARNING",
  /** 错误级别 */
  ERROR = "ERROR",
  /** 严重错误级别 */
  CRITICAL = "CRITICAL"
}

/**
 * 错误类型枚举
 */
export enum ErrorType {
  // 网络相关错误
  NETWORK_ERROR = "NETWORK_ERROR",
  NETWORK_TIMEOUT = "NETWORK_TIMEOUT",
  NETWORK_OFFLINE = "NETWORK_OFFLINE",

  // 认证和权限错误
  AUTH_ERROR = "AUTH_ERROR",
  PERMISSION_ERROR = "PERMISSION_ERROR",

  // 资源相关错误
  NOT_FOUND_ERROR = "NOT_FOUND_ERROR",
  RESOURCE_CONFLICT = "RESOURCE_CONFLICT",
  RESOURCE_EXHAUSTED = "RESOURCE_EXHAUSTED",

  // 数据相关错误
  VALIDATION_ERROR = "VALIDATION_ERROR",
  DATA_ERROR = "DATA_ERROR",

  // 业务逻辑错误
  BUSINESS_ERROR = "BUSINESS_ERROR",

  // 系统错误
  SERVER_ERROR = "SERVER_ERROR",
  CLIENT_ERROR = "CLIENT_ERROR",

  // 其他错误
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
  CANCEL_ERROR = "CANCEL_ERROR",
  RUNTIME_ERROR = "RUNTIME_ERROR"
}

/**
 * 请求上下文接口
 */
export interface RequestContext {
  url?: string;
  method?: string;
  params?: any;
  headers?: any;
  body?: any;
}

/**
 * 标准化错误结构接口
 */
export interface StandardError {
  /** 错误ID */
  id: string;
  /** 错误类型 */
  type: ErrorType;
  /** 错误代码 */
  code: string | number;
  /** 错误消息 */
  message: string;
  /** 错误级别 */
  level: ErrorLevel;
  /** 发生时间 */
  timestamp: number;
  /** 请求上下文 */
  context?: RequestContext;
  /** 业务错误数据 */
  businessData?: any;
  /** 原始错误 */
  originalError?: any;
  /** 堆栈跟踪 */
  stack?: string;
  /** 错误来源 */
  source?: string;
}

/**
 * 错误处理配置接口
 */
export interface ErrorHandlerConfig {
  /** 是否显示错误消息 */
  showMessage?: boolean;
  /** 是否上报错误 */
  reportError?: boolean;
  /** 自定义错误处理函数 */
  customHandler?: (error: StandardError) => void;
  /** 错误级别阈值 */
  levelThreshold?: ErrorLevel;
}

/**
 * 错误监控数据接口
 */
export interface ErrorMonitorData {
  /** 错误类型 */
  type: ErrorType;
  /** 错误代码 */
  code: string | number;
  /** 发生次数 */
  count: number;
  /** 首次发生时间 */
  firstOccurrence: number;
  /** 最近发生时间 */
  lastOccurrence: number;
  /** 影响用户数 */
  affectedUsers?: number;
}
