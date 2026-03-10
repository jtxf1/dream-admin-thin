import type { AxiosInstance } from "axios";
import type {
  PureHttpRequestConfig,
  PureHttpResponse,
  PureHttpError
} from "@/utils/http/modules/types";
import NProgress from "../../progress";
import { getToken, formatToken } from "@/utils/auth";
import { handleError } from "@/utils/errorHandling";
import { Logger } from "./logger";

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
      // 记录错误日志
      Logger.error("请求拦截器错误", error);
      // 使用全局错误处理系统处理错误
      handleError(error, { showMessage: true }, undefined, "http-request");
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
    async (error: PureHttpError): Promise<PureHttpError> => {
      // 关闭进度条
      NProgress.done();

      // 构建请求上下文
      const context = {
        url: error.config?.url,
        method: error.config?.method,
        params: error.config?.params,
        headers: error.config?.headers,
        body: error.config?.data
      };

      // 处理错误
      const errorHandlerConfig =
        (error.config as any)?.errorHandlerConfig || {};
      handleError(error, errorHandlerConfig, context, "http-response");

      // 记录错误日志
      Logger.error("响应拦截器错误", error);

      // 所有的响应异常 区分来源为取消请求/非取消请求
      return Promise.reject(error);
    }
  );
}
