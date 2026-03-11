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
import { Logger } from "./modules/logger";

// 禁用跨域请求时携带凭证
Axios.defaults.withCredentials = false;

/**
 * 防抖配置类型
 */
export interface DebounceConfig {
  wait: number;
  enabled: boolean;
  merge: boolean;
}

/**
 * 防抖延迟配置类型
 */
export interface DebounceWaitConfig {
  [key: string]: number;
  get: number;
  post: number;
  put: number;
  delete: number;
  patch: number;
  head: number;
  options: number;
}

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
    serialize: (params: Record<string, any>) => {
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
  /** 保存当前`Axios`实例对象 */
  private static axiosInstance: AxiosInstance = Axios.create(defaultConfig);

  /** 防抖请求映射表 */
  private static debounceMap: Map<
    string,
    DebounceFunction<() => Promise<any>>
  > = new Map();

  /** 进行中的请求映射表（用于请求合并） */
  private static pendingRequests: Map<string, Promise<any>> = new Map();

  /** 全局防抖开关 */
  private static globalDebounceEnabled = true;

  /** 防抖默认配置 */
  private static readonly defaultDebounceConfig: DebounceConfig = {
    wait: 500,
    enabled: true,
    merge: true
  };

  /** 防抖延迟配置（根据请求类型） */
  private static readonly debounceWaitConfig: DebounceWaitConfig = {
    get: 500,
    post: 800,
    put: 800,
    delete: 800,
    patch: 800,
    head: 500,
    options: 500
  };

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
    const debounceConfig: DebounceConfig = {
      ...PureHttp.defaultDebounceConfig,
      ...config.debounce,
      wait: config.debounce?.wait || PureHttp.debounceWaitConfig[method] || 500
    };

    // 生成请求唯一键
    const requestKey = PureHttp.generateRequestKey(method, url, param);

    // 日志记录
    Logger.logRequest(method, url, config);

    // 如果启用防抖（同时考虑全局开关）
    if (debounceConfig.enabled && PureHttp.globalDebounceEnabled) {
      // 检查是否有进行中的相同请求（用于请求合并）
      if (debounceConfig.merge && PureHttp.pendingRequests.has(requestKey)) {
        Logger.logDebounce(`合并相同请求 ${requestKey}`);
        return PureHttp.pendingRequests.get(requestKey) as Promise<T>;
      }

      // 取消之前的相同请求
      PureHttp.cancelPreviousRequest(requestKey);

      // 创建并执行防抖请求
      const resultPromise = PureHttp.createDebouncedRequest<T>(
        requestKey,
        config,
        debounceConfig
      );

      // 如果启用请求合并，保存到进行中请求映射表
      if (debounceConfig.merge) {
        PureHttp.pendingRequests.set(requestKey, resultPromise);
      }

      return resultPromise;
    }

    // 直接执行请求，不使用防抖
    const startTime = performance.now();
    const requestPromise = PureHttp.axiosInstance.request<any, any>(
      config
    ) as unknown as Promise<T>;

    requestPromise
      .then(() => {
        const duration = performance.now() - startTime;
        Logger.info(`请求完成 ${method} ${url} (${duration}ms)`);
      })
      .catch(error => {
        Logger.logError(method, url, error);
      });

    Logger.info(`直接执行请求 ${method} ${url}`);
    return requestPromise;
  }

  /**
   * 取消之前的相同请求
   * @param requestKey - 请求唯一键
   */
  private static cancelPreviousRequest(requestKey: string): void {
    if (PureHttp.debounceMap.has(requestKey)) {
      const existingDebounce = PureHttp.debounceMap.get(requestKey);
      if (existingDebounce) {
        existingDebounce.cancel();
        Logger.logDebounce(`取消之前的防抖请求 ${requestKey}`);
      }
    }
  }

  /**
   * 创建防抖请求
   * @template T - 响应数据类型
   * @param requestKey - 请求唯一键
   * @param config - 请求配置
   * @param debounceConfig - 防抖配置
   * @returns 响应数据Promise
   */
  private static createDebouncedRequest<T>(
    requestKey: string,
    config: PureHttpRequestConfig,
    debounceConfig: DebounceConfig
  ): Promise<T> {
    // 创建新的防抖函数
    const debouncedRequest = debounce((): Promise<T> => {
      const startTime = performance.now();
      // 执行实际请求
      const requestPromise = PureHttp.axiosInstance.request<any, any>(
        config
      ) as unknown as Promise<T>;

      // 请求完成后处理
      requestPromise
        .then(() => {
          const duration = performance.now() - startTime;
          Logger.info(
            `请求完成 ${config.method} ${config.url} (${duration}ms)`
          );
        })
        .catch(error => {
          Logger.logError(config.method as string, config.url as string, error);
        })
        .finally(() => {
          PureHttp.debounceMap.delete(requestKey);
          if (debounceConfig.merge) {
            PureHttp.pendingRequests.delete(requestKey);
          }
          Logger.debug(`请求完成，清理映射表 ${requestKey}`);
        });

      return requestPromise;
    }, debounceConfig.wait);

    // 保存到映射表
    PureHttp.debounceMap.set(requestKey, debouncedRequest);

    // 执行防抖请求
    return debouncedRequest();
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
    Logger.info(`全局防抖开关已${enabled ? "启用" : "禁用"}`);
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
    Logger.info("已清除所有防抖请求");
  }
}

/**
 * HTTP请求实例
 * 全局使用的HTTP请求工具
 */
export const http = new PureHttp();
