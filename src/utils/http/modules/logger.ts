/**
 * 日志级别枚举
 */
export enum LogLevel {
  DEBUG = "debug",
  INFO = "info",
  WARN = "warn",
  ERROR = "error"
}

/**
 * 日志配置接口
 */
export interface LoggerConfig {
  /** 日志级别 */
  level: LogLevel;
  /** 是否在开发环境下启用 */
  devOnly: boolean;
  /** 是否启用控制台输出 */
  console: boolean;
  /** 是否启用日志上报 */
  report: boolean;
}

/**
 * 日志工具类
 */
export class Logger {
  /** 默认配置 */
  private static readonly defaultConfig: LoggerConfig = {
    level: LogLevel.INFO,
    devOnly: true,
    console: true,
    report: false
  };

  /** 当前配置 */
  private static config: LoggerConfig = Logger.defaultConfig;

  /**
   * 设置日志配置
   * @param config - 日志配置
   */
  public static setConfig(config: Partial<LoggerConfig>): void {
    Logger.config = {
      ...Logger.defaultConfig,
      ...config
    };
  }

  /**
   * 获取当前日志配置
   * @returns 日志配置
   */
  public static getConfig(): LoggerConfig {
    return Logger.config;
  }

  /**
   * 检查日志级别是否启用
   * @param level - 日志级别
   * @returns 是否启用
   */
  private static shouldLog(level: LogLevel): boolean {
    // 如果是开发环境专用且不是开发环境，则不记录
    if (Logger.config.devOnly && import.meta.env.PROD) {
      return false;
    }

    // 检查日志级别
    const levels = [
      LogLevel.DEBUG,
      LogLevel.INFO,
      LogLevel.WARN,
      LogLevel.ERROR
    ];
    const currentLevelIndex = levels.indexOf(Logger.config.level);
    const targetLevelIndex = levels.indexOf(level);

    return targetLevelIndex >= currentLevelIndex;
  }

  /**
   * 记录日志
   * @param level - 日志级别
   * @param message - 日志消息
   * @param data - 附加数据
   */
  private static log(level: LogLevel, message: string, data?: any): void {
    if (!Logger.shouldLog(level) || !Logger.config.console) {
      return;
    }

    const timestamp = new Date().toISOString();
    const logMessage = `[HTTP ${level.toUpperCase()}] ${timestamp} - ${message}`;

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(logMessage, data);
        break;
      case LogLevel.INFO:
        console.info(logMessage, data);
        break;
      case LogLevel.WARN:
        console.warn(logMessage, data);
        break;
      case LogLevel.ERROR:
        console.error(logMessage, data);
        break;
    }

    // 可以在这里添加日志上报逻辑
    if (Logger.config.report) {
      Logger.reportLog(level, message, data);
    }
  }

  /**
   * 上报日志
   * @param _level - 日志级别
   * @param _message - 日志消息
   * @param _data - 附加数据
   */
  private static reportLog(
    _level: LogLevel,
    _message: string,
    _data?: any
  ): void {
    // 这里可以实现日志上报逻辑，例如发送到监控系统
    // 示例：sendLogToMonitoringSystem({ level: _level, message: _message, data: _data, timestamp: new Date().toISOString() });
  }

  /**
   * 记录调试日志
   * @param message - 日志消息
   * @param data - 附加数据
   */
  public static debug(message: string, data?: any): void {
    Logger.log(LogLevel.DEBUG, message, data);
  }

  /**
   * 记录信息日志
   * @param message - 日志消息
   * @param data - 附加数据
   */
  public static info(message: string, data?: any): void {
    Logger.log(LogLevel.INFO, message, data);
  }

  /**
   * 记录警告日志
   * @param message - 日志消息
   * @param data - 附加数据
   */
  public static warn(message: string, data?: any): void {
    Logger.log(LogLevel.WARN, message, data);
  }

  /**
   * 记录错误日志
   * @param message - 日志消息
   * @param data - 附加数据
   */
  public static error(message: string, data?: any): void {
    Logger.log(LogLevel.ERROR, message, data);
  }

  /**
   * 记录请求发起日志
   * @param method - 请求方法
   * @param url - 请求URL
   * @param config - 请求配置
   */
  public static logRequest(method: string, url: string, config: any): void {
    Logger.info(`请求发起: ${method} ${url}`, {
      headers: config.headers,
      params: config.params,
      data: config.data,
      debounce: config.debounce
    });
  }

  /**
   * 记录请求响应日志
   * @param method - 请求方法
   * @param url - 请求URL
   * @param status - 状态码
   * @param data - 响应数据
   * @param duration - 响应时间
   */
  public static logResponse(
    method: string,
    url: string,
    status: number,
    data: any,
    duration: number
  ): void {
    Logger.info(`请求响应: ${method} ${url} ${status} (${duration}ms)`, data);
  }

  /**
   * 记录请求错误日志
   * @param method - 请求方法
   * @param url - 请求URL
   * @param error - 错误信息
   */
  public static logError(method: string, url: string, error: any): void {
    Logger.error(`请求错误: ${method} ${url}`, {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      config: error.config
    });
  }

  /**
   * 记录防抖相关日志
   * @param message - 日志消息
   * @param data - 附加数据
   */
  public static logDebounce(message: string, data?: any): void {
    Logger.debug(`防抖处理: ${message}`, data);
  }
}
