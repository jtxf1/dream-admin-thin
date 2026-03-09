/**
 * HTTP请求工具类
 * 基于Axios的封装，提供统一的请求拦截、响应处理、错误处理等功能
 */
import Axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";
import type {
  PureHttpRequestConfig,
  RequestMethods
} from "@/utils/http/modules/types";
import { debounce, type DebounceFunction } from "./modules/debounce";
import {
  setupRequestInterceptor,
  setupResponseInterceptor
} from "./modules/interceptors";

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
    serialize: (params: any) => {
      const arr: string[] = [];
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          arr.push(
            `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
          );
        }
      });
      return arr.join("&");
    }
  }
};

/**
 * HTTP请求核心类
 * 提供请求拦截、响应拦截、统一错误处理等功能
 */
class PureHttp {
  /** 初始化配置对象 */
  private static initConfig: PureHttpRequestConfig = {};

  /** 保存当前`Axios`实例对象 */
  private static axiosInstance: AxiosInstance = Axios.create(defaultConfig);

  /** 防抖请求映射表 */
  private static debounceMap: Map<string, DebounceFunction<any>> = new Map();

  /** 全局防抖开关 */
  private static globalDebounceEnabled = true;

  /** 防抖默认配置 */
  private static readonly defaultDebounceConfig = {
    wait: 500, // 默认防抖延迟时间（查询接口）
    enabled: true, // 默认启用防抖
    merge: true // 默认合并相同请求
  };

  /** 防抖延迟配置（根据请求类型） */
  private static readonly debounceWaitConfig = {
    get: 500, // 查询接口
    post: 800, // 数据提交接口
    put: 800, // 数据更新接口
    delete: 800, // 数据删除接口
    patch: 800,
    head: 500,
    options: 500
  };

  /** 进行中的请求映射表（用于请求合并） */
  private static pendingRequests: Map<string, Promise<any>> = new Map();

  /**
   * 构造函数
   * 初始化请求拦截器和响应拦截器
   */
  constructor() {
    this.setupInterceptors();
  }

  /**
   * 设置拦截器
   */
  private setupInterceptors(): void {
    setupRequestInterceptor(PureHttp.axiosInstance);
    setupResponseInterceptor(PureHttp.axiosInstance);
  }

  /**
   * 生成请求唯一键
   * @param method - 请求方法
   * @param url - 请求URL
   * @param param - 请求参数
   * @returns 请求唯一键
   */
  private static generateRequestKey(
    method: RequestMethods,
    url: string,
    param?: AxiosRequestConfig
  ): string {
    const paramsStr = param ? JSON.stringify(param) : "";
    return `${method}:${url}:${paramsStr}`;
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

    // 获取防抖配置
    const debounceConfig = {
      ...PureHttp.defaultDebounceConfig,
      ...config.debounce,
      wait: config.debounce?.wait || PureHttp.debounceWaitConfig[method] || 500
    };

    // 生成请求唯一键
    const requestKey = PureHttp.generateRequestKey(method, url, param);

    // 日志记录
    console.log(`[HTTP] 请求 ${method} ${url}，防抖配置:`, debounceConfig);

    // 如果启用防抖（同时考虑全局开关）
    if (debounceConfig.enabled && PureHttp.globalDebounceEnabled) {
      // 检查是否有进行中的相同请求（用于请求合并）
      if (debounceConfig.merge && PureHttp.pendingRequests.has(requestKey)) {
        console.log(`[HTTP] 合并相同请求 ${requestKey}`);
        return PureHttp.pendingRequests.get(requestKey) as Promise<T>;
      }

      // 如果已有相同请求的防抖函数，取消之前的
      if (PureHttp.debounceMap.has(requestKey)) {
        const existingDebounce = PureHttp.debounceMap.get(requestKey);
        if (existingDebounce) {
          existingDebounce.cancel();
          console.log(`[HTTP] 取消之前的防抖请求 ${requestKey}`);
        }
      }

      // 创建新的防抖函数
      const debouncedRequest = debounce((): Promise<T> => {
        // 执行实际请求
        const requestPromise = PureHttp.axiosInstance.request(
          config
        ) as unknown as Promise<T>;

        // 请求完成后清理
        requestPromise.finally(() => {
          PureHttp.debounceMap.delete(requestKey);
          if (debounceConfig.merge) {
            PureHttp.pendingRequests.delete(requestKey);
          }
          console.log(`[HTTP] 请求完成，清理映射表 ${requestKey}`);
        });

        return requestPromise;
      }, debounceConfig.wait);

      // 保存到映射表
      PureHttp.debounceMap.set(requestKey, debouncedRequest);

      // 执行防抖请求
      const resultPromise = debouncedRequest();

      // 如果启用请求合并，保存到进行中请求映射表
      if (debounceConfig.merge) {
        PureHttp.pendingRequests.set(requestKey, resultPromise);
      }

      return resultPromise;
    }

    // 直接执行请求，不使用防抖
    const requestPromise = PureHttp.axiosInstance.request(
      config
    ) as unknown as Promise<T>;

    // 记录非防抖请求
    console.log(`[HTTP] 直接执行请求 ${method} ${url}`);

    return requestPromise;
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

  /**
   * 设置全局防抖开关
   * @param enabled - 是否启用防抖
   */
  public static setGlobalDebounceEnabled(enabled: boolean): void {
    PureHttp.globalDebounceEnabled = enabled;
    console.log(`[HTTP] 全局防抖开关已${enabled ? "启用" : "禁用"}`);
  }

  /**
   * 获取全局防抖开关状态
   * @returns 当前全局防抖开关状态
   */
  public static getGlobalDebounceEnabled(): boolean {
    return PureHttp.globalDebounceEnabled;
  }

  /**
   * 清除所有防抖请求
   */
  public static clearDebounceRequests(): void {
    PureHttp.debounceMap.forEach(debounceFn => {
      debounceFn.cancel();
    });
    PureHttp.debounceMap.clear();
    PureHttp.pendingRequests.clear();
    console.log("[HTTP] 已清除所有防抖请求");
  }
}

/**
 * HTTP请求实例
 * 全局使用的HTTP请求工具
 */
export const http = new PureHttp();
