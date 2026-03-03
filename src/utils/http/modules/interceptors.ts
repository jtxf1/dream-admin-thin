import type { AxiosInstance } from "axios";
import type {
  PureHttpRequestConfig,
  PureHttpResponse,
  PureHttpError
} from "@/utils/http/modules/types";
import NProgress from "../../progress";
import { getToken, formatToken } from "@/utils/auth";
import { message } from "@/utils/message";
import { handleError } from "./errorHandler";

/**
 * 请求白名单
 * 放置一些不需要`token`的接口
 * 通过设置请求白名单，防止`token`过期后再请求造成的死循环问题
 */
export const whiteList: string[] = [
  "/refresh-token",
  "/login",
  "/auth",
  "/auth/*",
  "/i/*"
];

/**
 * 检查URL是否在白名单中
 * @param url - 要检查的URL
 * @returns 是否在白名单中
 */
export function isInWhiteList(url: string): boolean {
  return whiteList.some(
    whiteUrl =>
      whiteUrl === url ||
      (whiteUrl.endsWith("*") &&
        url.startsWith(whiteUrl.replace("*", "")) &&
        url !== "/auth/logout")
  );
}

/**
 * 请求拦截器
 * 处理请求前的逻辑，如添加token、开启进度条等
 * @param instance - Axios实例
 */
export function setupRequestInterceptor(instance: AxiosInstance): void {
  instance.interceptors.request.use(
    async (config): Promise<any> => {
      // 开启进度条动画
      NProgress.start();

      // 删除请求头中的 cookie 属性
      if (config.headers && "cookie" in config.headers) {
        delete config.headers["cookie"];
      }

      // 优先判断post/get等方法是否传入回调，否则执行初始化设置等回调
      if (
        typeof (config as PureHttpRequestConfig).beforeRequestCallback ===
        "function"
      ) {
        (config as PureHttpRequestConfig).beforeRequestCallback(
          config as PureHttpRequestConfig
        );
        return config;
      }

      // 检查是否在白名单中，不在则添加token
      if (!isInWhiteList(config.url || "")) {
        const data = getToken();
        if (data && data.accessToken) {
          // 使用类型断言来处理headers类型问题
          (config.headers as any) = {
            ...config.headers,
            Authorization: formatToken(data.accessToken)
          };
        }
      }

      return config;
    },
    (error: any): Promise<any> => {
      // 关闭进度条
      NProgress.done();
      // 显示错误消息
      message("请求异常!", { type: "error" });
      return Promise.reject(error);
    }
  );
}

/**
 * 响应拦截器
 * 处理响应后逻辑，如关闭进度条、处理响应数据、统一错误处理等
 * @param instance - Axios实例
 */
export function setupResponseInterceptor(instance: AxiosInstance): void {
  instance.interceptors.response.use(
    (response: PureHttpResponse): any => {
      // 关闭进度条动画
      NProgress.done();

      // 优先判断post/get等方法是否传入回调，否则执行初始化设置等回调
      if (typeof response.config.beforeResponseCallback === "function") {
        response.config.beforeResponseCallback(response);
        return response.data;
      }

      return response.data;
    },
    (error: PureHttpError): Promise<PureHttpError> => {
      // 关闭进度条
      NProgress.done();

      // 处理错误
      const handledError = handleError(error);

      // 检查是否需要显示错误消息
      const showMessage =
        (error.config as any)?.errorHandlerConfig?.showMessage !== false;
      if (showMessage && !handledError.isCancelRequest) {
        const errorMessage = handledError.businessError?.message || "请求失败";
        message(errorMessage, { type: "error" });
      }

      // 检查是否有自定义错误处理函数
      if ((error.config as any)?.errorHandlerConfig?.customHandler) {
        (error.config as any).errorHandlerConfig.customHandler(handledError);
      }

      // 所有的响应异常 区分来源为取消请求/非取消请求
      return Promise.reject(handledError);
    }
  );
}
