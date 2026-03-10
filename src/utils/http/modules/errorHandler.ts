import type { PureHttpError } from "./types";
import { handleError } from "@/utils/errorHandling";

/**
 * 处理HTTP错误
 * @param error - HTTP错误对象
 * @returns 处理后的错误对象
 */
export function handleHttpError(error: PureHttpError): PureHttpError {
  // 构建请求上下文
  const context = {
    url: error.config?.url,
    method: error.config?.method,
    params: error.config?.params,
    headers: error.config?.headers,
    body: error.config?.data
  };

  // 使用全局错误处理系统处理错误
  handleError(error, { showMessage: true }, context, "http-request");

  return error;
}

export default {
  handleHttpError
};
