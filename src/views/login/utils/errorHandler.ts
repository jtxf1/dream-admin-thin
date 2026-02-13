import { message } from "@/utils/message";
import { $t, transformI18n } from "@/plugins/i18n";

export enum ErrorType {
  VALIDATION = "validation",
  NETWORK = "network",
  AUTHENTICATION = "authentication",
  UNKNOWN = "unknown"
}

export interface ErrorInfo {
  type: ErrorType;
  message: string;
  originalError?: any;
  code?: string;
}

const errorMessages: Record<ErrorType, string> = {
  [ErrorType.VALIDATION]: "login.validationError",
  [ErrorType.NETWORK]: "login.networkError",
  [ErrorType.AUTHENTICATION]: "login.authenticationError",
  [ErrorType.UNKNOWN]: "login.unknownError"
};

export const handleError = (error: any): ErrorInfo => {
  let errorInfo: ErrorInfo;

  // 分类错误
  if (error?.message?.includes("validation")) {
    errorInfo = {
      type: ErrorType.VALIDATION,
      message: error.message,
      originalError: error
    };
  } else if (
    error?.code === "ECONNABORTED" ||
    error?.message?.includes("network")
  ) {
    errorInfo = {
      type: ErrorType.NETWORK,
      message: transformI18n($t(errorMessages[ErrorType.NETWORK])),
      originalError: error,
      code: error.code
    };
  } else if (
    error?.message?.includes("auth") ||
    error?.message?.includes("token")
  ) {
    errorInfo = {
      type: ErrorType.AUTHENTICATION,
      message: transformI18n($t(errorMessages[ErrorType.AUTHENTICATION])),
      originalError: error
    };
  } else {
    errorInfo = {
      type: ErrorType.UNKNOWN,
      message:
        error?.message || transformI18n($t(errorMessages[ErrorType.UNKNOWN])),
      originalError: error
    };
  }

  // 记录错误日志
  logError(errorInfo);

  // 显示用户友好提示
  showErrorMessage(errorInfo);

  return errorInfo;
};

const logError = (errorInfo: ErrorInfo) => {
  console.error(
    `[Login Error] ${errorInfo.type}: ${errorInfo.message}`,
    errorInfo.originalError
  );
  // 这里可以添加更复杂的日志记录逻辑，如发送到服务器
};

const showErrorMessage = (errorInfo: ErrorInfo) => {
  if (errorInfo.type !== ErrorType.VALIDATION) {
    message(errorInfo.message, { type: "error" });
  }
};

export const handleSuccess = (messageKey: string) => {
  message(transformI18n($t(messageKey)), { type: "success" });
};
