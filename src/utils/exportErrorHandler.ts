/**
 * 导出错误类型枚举
 */
export enum ExportErrorType {
  // 输入验证错误
  INVALID_INPUT = "INVALID_INPUT",
  MISSING_PARAMETERS = "MISSING_PARAMETERS",

  // 文件格式错误
  UNSUPPORTED_FORMAT = "UNSUPPORTED_FORMAT",
  INVALID_FORMAT = "INVALID_FORMAT",

  // 权限错误
  PERMISSION_DENIED = "PERMISSION_DENIED",
  ACCESS_DENIED = "ACCESS_DENIED",

  // 存储空间错误
  STORAGE_FULL = "STORAGE_FULL",
  DISK_QUOTA_EXCEEDED = "DISK_QUOTA_EXCEEDED",

  // 网络错误
  NETWORK_ERROR = "NETWORK_ERROR",
  NETWORK_TIMEOUT = "NETWORK_TIMEOUT",
  SERVER_UNAVAILABLE = "SERVER_UNAVAILABLE",

  // 数据处理错误
  DATA_PROCESSING_ERROR = "DATA_PROCESSING_ERROR",
  DATA_TOO_LARGE = "DATA_TOO_LARGE",
  INVALID_DATA = "INVALID_DATA",

  // 其他错误
  UNKNOWN_ERROR = "UNKNOWN_ERROR"
}

/**
 * 导出错误信息接口
 */
export interface ExportError {
  type: ExportErrorType;
  message: string;
  details?: string;
  timestamp: number;
  context?: Record<string, any>;
}

/**
 * 导出错误处理配置
 */
export interface ExportErrorHandlerConfig {
  /** 是否显示错误消息 */
  showMessage?: boolean;
  /** 自定义错误处理函数 */
  customHandler?: (error: ExportError) => void;
  /** 是否记录错误日志 */
  logError?: boolean;
}

/**
 * 获取错误提示信息
 * @param errorType - 错误类型
 * @param details - 错误详情
 * @returns 错误提示信息
 */
export function getExportErrorMessage(
  errorType: ExportErrorType,
  details?: string
): string {
  const messages: Record<ExportErrorType, string> = {
    [ExportErrorType.INVALID_INPUT]: "输入参数无效，请检查输入信息",
    [ExportErrorType.MISSING_PARAMETERS]: "缺少必要的参数",
    [ExportErrorType.UNSUPPORTED_FORMAT]: "不支持的文件格式",
    [ExportErrorType.INVALID_FORMAT]: "无效的文件格式",
    [ExportErrorType.PERMISSION_DENIED]: "没有导出权限",
    [ExportErrorType.ACCESS_DENIED]: "访问被拒绝",
    [ExportErrorType.STORAGE_FULL]: "存储空间不足",
    [ExportErrorType.DISK_QUOTA_EXCEEDED]: "磁盘配额已超出",
    [ExportErrorType.NETWORK_ERROR]: "网络连接失败",
    [ExportErrorType.NETWORK_TIMEOUT]: "网络请求超时",
    [ExportErrorType.SERVER_UNAVAILABLE]: "服务器暂时不可用",
    [ExportErrorType.DATA_PROCESSING_ERROR]: "数据处理失败",
    [ExportErrorType.DATA_TOO_LARGE]: "导出数据过大",
    [ExportErrorType.INVALID_DATA]: "无效的数据",
    [ExportErrorType.UNKNOWN_ERROR]: "导出失败，请稍后重试"
  };

  const message =
    messages[errorType] || messages[ExportErrorType.UNKNOWN_ERROR];
  return details ? `${message}：${details}` : message;
}

/**
 * 记录导出错误日志
 * @param error - 导出错误对象
 */
export function logExportError(error: ExportError): void {
  const errorInfo = {
    timestamp: new Date(error.timestamp).toISOString(),
    errorType: error.type,
    message: error.message,
    details: error.details,
    context: error.context
  };

  console.error("[Export Error]:", errorInfo);

  // 可以在这里添加错误日志上报逻辑
  // 例如：sendErrorLog(errorInfo);
}

/**
 * 处理导出错误
 * @param error - 原始错误对象
 * @param config - 错误处理配置
 * @param context - 错误上下文信息
 * @returns 处理后的导出错误对象
 */
export function handleExportError(
  error: any,
  config: ExportErrorHandlerConfig = {},
  context: Record<string, any> = {}
): ExportError {
  let errorType: ExportErrorType = ExportErrorType.UNKNOWN_ERROR;
  let errorMessage: string = "";
  let errorDetails: string = "";

  // 分析错误类型
  if (error.response) {
    // 服务器返回错误
    const status = error.response.status;
    const data = error.response.data;

    switch (status) {
      case 400:
        if (
          data?.code === "INVALID_INPUT" ||
          data?.code === "MISSING_PARAMETERS"
        ) {
          errorType =
            data.code === "INVALID_INPUT"
              ? ExportErrorType.INVALID_INPUT
              : ExportErrorType.MISSING_PARAMETERS;
        } else {
          errorType = ExportErrorType.INVALID_INPUT;
        }
        break;
      case 401:
      case 403:
        errorType = ExportErrorType.PERMISSION_DENIED;
        break;
      case 413:
        errorType = ExportErrorType.DATA_TOO_LARGE;
        break;
      case 500:
        if (
          data?.code === "STORAGE_FULL" ||
          data?.code === "DISK_QUOTA_EXCEEDED"
        ) {
          errorType =
            data.code === "STORAGE_FULL"
              ? ExportErrorType.STORAGE_FULL
              : ExportErrorType.DISK_QUOTA_EXCEEDED;
        } else if (data?.code === "DATA_PROCESSING_ERROR") {
          errorType = ExportErrorType.DATA_PROCESSING_ERROR;
        } else {
          errorType = ExportErrorType.DATA_PROCESSING_ERROR;
        }
        break;
      case 503:
        errorType = ExportErrorType.SERVER_UNAVAILABLE;
        break;
      default:
        errorType = ExportErrorType.UNKNOWN_ERROR;
    }

    errorDetails = data?.message || data?.msg || "";
  } else if (error.request) {
    // 请求已发出但没有收到响应
    if (error.code === "ECONNABORTED") {
      errorType = ExportErrorType.NETWORK_TIMEOUT;
    } else {
      errorType = ExportErrorType.NETWORK_ERROR;
    }
  } else if (error.name === "TypeError" || error.name === "Error") {
    // 客户端错误
    if (error.message.includes("format")) {
      errorType = ExportErrorType.INVALID_FORMAT;
    } else if (error.message.includes("permission")) {
      errorType = ExportErrorType.PERMISSION_DENIED;
    } else if (error.message.includes("storage")) {
      errorType = ExportErrorType.STORAGE_FULL;
    } else if (error.message.includes("data")) {
      errorType = ExportErrorType.INVALID_DATA;
    } else {
      errorType = ExportErrorType.DATA_PROCESSING_ERROR;
    }
    errorDetails = error.message;
  }

  // 生成错误消息
  errorMessage = getExportErrorMessage(errorType, errorDetails);

  // 构建导出错误对象
  const exportError: ExportError = {
    type: errorType,
    message: errorMessage,
    details: errorDetails,
    timestamp: Date.now(),
    context: {
      ...context,
      originalError: error.message || error.toString()
    }
  };

  // 记录错误日志
  if (config.logError !== false) {
    logExportError(exportError);
  }

  // 调用自定义错误处理函数
  if (config.customHandler) {
    config.customHandler(exportError);
  }

  return exportError;
}

/**
 * 验证导出参数
 * @param params - 导出参数
 * @param format - 导出格式
 * @returns 验证结果，包含是否有效和错误信息
 */
export function validateExportParams(
  params: any,
  format: string
): { valid: boolean; error?: ExportError } {
  // 验证格式
  const supportedFormats = ["excel", "csv", "pdf"];
  if (!supportedFormats.includes(format)) {
    return {
      valid: false,
      error: {
        type: ExportErrorType.UNSUPPORTED_FORMAT,
        message: getExportErrorMessage(
          ExportErrorType.UNSUPPORTED_FORMAT,
          format
        ),
        timestamp: Date.now()
      }
    };
  }

  // 验证参数
  if (params && typeof params !== "object") {
    return {
      valid: false,
      error: {
        type: ExportErrorType.INVALID_INPUT,
        message: getExportErrorMessage(ExportErrorType.INVALID_INPUT),
        timestamp: Date.now()
      }
    };
  }

  return { valid: true };
}
