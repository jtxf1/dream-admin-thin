/**
 * HTTP请求工具类
 * 基于Axios的封装，提供统一的请求拦截、响应处理、错误处理等功能
 */
import Axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type CustomParamsSerializer
} from "axios";
import type {
  PureHttpError,
  RequestMethods,
  PureHttpResponse,
  PureHttpRequestConfig
} from "./types";
import { stringify } from "qs";
import NProgress from "../progress";
import { getToken, formatToken } from "@/utils/auth";
import { message } from "@/utils/message";

// 禁用跨域请求时携带凭证
Axios.defaults.withCredentials = false;

/**
 * 默认请求配置
 * 相关配置请参考：www.axios-js.com/zh-cn/docs/#axios-request-config-1
 */
const defaultConfig: AxiosRequestConfig = {
  // 请求超时时间
  timeout: 10000,
  withCredentials: false,
  headers: {
    Accept: "application/json, text/plain, */*",
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest"
  },
  // 数组格式参数序列化（https://github.com/axios/axios/issues/5142）
  paramsSerializer: {
    serialize: stringify as unknown as CustomParamsSerializer
  }
};

/**
 * HTTP请求核心类
 * 提供请求拦截、响应拦截、统一错误处理等功能
 */
class PureHttp {
  /**
   * 构造函数
   * 初始化请求拦截器和响应拦截器
   */
  constructor() {
    this.httpInterceptorsRequest();
    this.httpInterceptorsResponse();
  }

  /** 初始化配置对象 */
  private static initConfig: PureHttpRequestConfig = {};

  /** 保存当前`Axios`实例对象 */
  private static axiosInstance: AxiosInstance = Axios.create(defaultConfig);

  /**
   * 请求白名单
   * 放置一些不需要`token`的接口
   * 通过设置请求白名单，防止`token`过期后再请求造成的死循环问题
   */
  private static readonly whiteList: string[] = [
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
  private static isInWhiteList(url: string): boolean {
    return this.whiteList.some(
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
   */
  private httpInterceptorsRequest(): void {
    PureHttp.axiosInstance.interceptors.request.use(
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

        if (PureHttp.initConfig.beforeRequestCallback) {
          PureHttp.initConfig.beforeRequestCallback(
            config as PureHttpRequestConfig
          );
          return config;
        }

        // 检查是否在白名单中，不在则添加token
        if (!PureHttp.isInWhiteList(config.url || "")) {
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
   */
  private httpInterceptorsResponse(): void {
    const instance = PureHttp.axiosInstance;

    instance.interceptors.response.use(
      (response: PureHttpResponse): any => {
        const $config = response.config;
        // 关闭进度条动画
        NProgress.done();

        // 优先判断post/get等方法是否传入回调，否则执行初始化设置等回调
        if (typeof $config.beforeResponseCallback === "function") {
          $config.beforeResponseCallback(response);
          return response.data;
        }

        if (PureHttp.initConfig.beforeResponseCallback) {
          PureHttp.initConfig.beforeResponseCallback(response);
          return response.data;
        }

        return response.data;
      },
      (error: PureHttpError): Promise<PureHttpError> => {
        // 关闭进度条
        NProgress.done();

        // 处理错误消息
        const errorMessage =
          "服务异常!" + ((error.response?.data as any)?.message || "");
        message(errorMessage, { type: "error" });

        // 标记是否为取消请求
        error.isCancelRequest = Axios.isCancel(error);

        // 所有的响应异常 区分来源为取消请求/非取消请求
        return Promise.reject(error);
      }
    );
  }

  /**
   * 通用请求工具函数
   * @template T - 响应数据类型
   * @param method - 请求方法
   * @param url - 请求URL
   * @param param - 请求参数
   * @param axiosConfig - 额外的Axios配置
   * @returns 响应数据Promise
   */
  public request<T>(
    method: RequestMethods,
    url: string,
    param?: AxiosRequestConfig,
    axiosConfig?: PureHttpRequestConfig
  ): Promise<T> {
    const config: PureHttpRequestConfig = {
      method,
      url,
      ...param,
      ...axiosConfig
    };

    // 直接返回axios实例的请求结果，避免不必要的Promise包装
    // 由于响应拦截器会返回response.data，所以实际返回类型是T
    return PureHttp.axiosInstance.request(config) as unknown as Promise<T>;
  }

  /**
   * 单独抽离的`post`工具函数
   * @template T - 响应数据类型
   * @template P - 请求参数类型
   * @param url - 请求URL
   * @param params - 请求参数
   * @param config - 额外的Axios配置
   * @returns 响应数据Promise
   */
  public post<T, P>(
    url: string,
    params?: AxiosRequestConfig<P>,
    config?: PureHttpRequestConfig
  ): Promise<T> {
    return this.request<T>("post", url, params, config);
  }

  /**
   * 单独抽离的`get`工具函数
   * @template T - 响应数据类型
   * @template P - 请求参数类型
   * @param url - 请求URL
   * @param params - 请求参数
   * @param config - 额外的Axios配置
   * @returns 响应数据Promise
   */
  public get<T, P>(
    url: string,
    params?: AxiosRequestConfig<P>,
    config?: PureHttpRequestConfig
  ): Promise<T> {
    return this.request<T>("get", url, params, config);
  }

  /**
   * 单独抽离的`put`工具函数
   * @template T - 请求参数类型
   * @template P - 响应数据类型
   * @param url - 请求URL
   * @param params - 请求参数
   * @param config - 额外的Axios配置
   * @returns 响应数据Promise
   */
  public put<T, P>(
    url: string,
    params?: AxiosRequestConfig<T>,
    config?: PureHttpRequestConfig
  ): Promise<P> {
    return this.request<P>("put", url, params, config);
  }

  /**
   * 单独抽离的`delete`工具函数
   * @template T - 请求参数类型
   * @template P - 响应数据类型
   * @param url - 请求URL
   * @param params - 请求参数
   * @param config - 额外的Axios配置
   * @returns 响应数据Promise
   */
  public delete<T, P>(
    url: string,
    params?: AxiosRequestConfig<T>,
    config?: PureHttpRequestConfig
  ): Promise<P> {
    return this.request<P>("delete", url, params, config);
  }
}

/**
 * HTTP请求实例
 * 全局使用的HTTP请求工具
 */
export const http = new PureHttp();
