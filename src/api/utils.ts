import { http } from "@/utils/http";
import type { PureHttpRequestConfig } from "@/utils/http/types";
import type { AxiosRequestConfig } from "axios";
import type { ApiAbstract, Page } from "@/utils/http/ApiAbstract";
import { downloadByData } from "@pureadmin/utils";
import type { PaginationProps } from "@pureadmin/table";

// 类型定义
export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export interface ApiError {
  code: number;
  message: string;
  details?: any;
}

export interface CrudOptions extends PureHttpRequestConfig {
  baseUrl?: string;
}

// 常量定义
export const pagination: PaginationProps = {
  total: 0,
  pageSize: 10,
  pageSizes: [10, 20, 50],
  currentPage: 1,
  background: true
};

// URL处理函数
export const baseUrlApi = (url: string) => `/api/${url}`;
export const baseUrlAuth = (url: string) => `/auth/${url}`;
export const baseUrlAvatar = (url: string) => `/avatar/${url}`;
export const baseUrlHello = (url: string) => `/hello/${removeUrlPrefix(url)}`;

/**
 * 去除url指定前缀
 * @param url 原始url
 * @returns 去除前缀后的url
 */
export const removeUrlPrefix = (url: string): string => {
  if (!url) return "";

  // 定义需要移除的前缀列表
  const prefixes = [
    "https://free.picui.cn/",
    "/avatar/https://free.picui.cn/",
    "https://www.helloimg.com/",
    "/D:/eladmin/",
    "D:/eladmin"
  ];

  // 遍历前缀列表，找到匹配的前缀并移除
  for (const prefix of prefixes) {
    if (url.startsWith(prefix)) {
      return url.slice(prefix.length);
    }
  }

  return url;
};

// 错误处理工具函数
const handleError = (error: any): never => {
  console.error("API请求失败:", error);
  // 可以在这里添加更多错误处理逻辑，如错误日志、错误通知等
  throw error;
};

/**
 * CRUD操作接口
 */
export interface ICrud {
  get<T, P>(
    url: string,
    params?: AxiosRequestConfig<P>,
    options?: CrudOptions
  ): Promise<ApiAbstract<Page<T>>>;
  post<T, P>(
    url: string,
    params?: AxiosRequestConfig<P>,
    options?: CrudOptions
  ): Promise<ApiAbstract<T>>;
  put<P, T>(
    url: string,
    params?: AxiosRequestConfig<P>,
    options?: CrudOptions
  ): Promise<ApiAbstract<T>>;
  delete<P = number[], T = string>(
    url: string,
    params?: AxiosRequestConfig<P>,
    options?: CrudOptions
  ): Promise<ApiAbstract<T>>;
  download(url: string, options?: CrudOptions): Promise<void>;
}

/**
 * HTTP客户端接口
 */
export interface HttpClient {
  get<T, P>(
    url: string,
    params?: AxiosRequestConfig<P>,
    config?: PureHttpRequestConfig
  ): Promise<T>;
  post<T, P>(
    url: string,
    params?: AxiosRequestConfig<P>,
    config?: PureHttpRequestConfig
  ): Promise<T>;
  put<T, P>(
    url: string,
    params?: AxiosRequestConfig<T>,
    config?: PureHttpRequestConfig
  ): Promise<P>;
  delete<T, P>(
    url: string,
    params?: AxiosRequestConfig<T>,
    config?: PureHttpRequestConfig
  ): Promise<P>;
}

/**
 * CRUD工具类
 */
export class Crud implements ICrud {
  private readonly httpClient: HttpClient;

  /**
   * 构造函数
   * @param httpClient HTTP客户端实例
   */
  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  /**
   * 构建请求URL
   * @param url 相对路径
   * @param options 配置选项
   * @returns 完整的请求URL
   */
  private buildUrl(url: string, options?: CrudOptions): string {
    if (options?.baseUrl) {
      return `${options.baseUrl}/${url}`;
    }
    return baseUrlApi(url);
  }

  /**
   * 获取请求配置
   * @param options 配置选项
   * @returns 请求配置
   */
  private getRequestConfig(options?: CrudOptions): PureHttpRequestConfig {
    return { ...options };
  }

  /**
   * 执行请求并处理错误
   * @param request 请求函数
   * @returns 请求结果
   */
  private async executeRequest<T>(request: () => Promise<T>): Promise<T> {
    try {
      return await request();
    } catch (error) {
      return handleError(error);
    }
  }

  /**
   * GET请求
   * @param url 请求地址（相对路径）
   * @param params 请求参数
   * @param options 配置选项
   * @returns 返回包含分页数据的API响应
   * @example
   * // 获取用户列表
   * CRUD.get<User, { page: number, size: number }>('user/list', { params: { page: 1, size: 10 } })
   */
  public get<T, P>(
    url: string,
    params?: AxiosRequestConfig<P>,
    options?: CrudOptions
  ): Promise<ApiAbstract<Page<T>>> {
    const requestUrl = this.buildUrl(url, options);
    const config = this.getRequestConfig(options);

    return this.executeRequest(() =>
      this.httpClient.get<ApiAbstract<Page<T>>, P>(requestUrl, params, config)
    );
  }

  /**
   * POST请求
   * @param url 请求地址（相对路径）
   * @param params 请求参数
   * @param options 配置选项
   * @returns 返回API响应
   * @example
   * // 创建用户
   * CRUD.post<User, CreateUserDto>('user/create', { data: { name: 'John', age: 30 } })
   */
  public post<T, P>(
    url: string,
    params?: AxiosRequestConfig<P>,
    options?: CrudOptions
  ): Promise<ApiAbstract<T>> {
    const requestUrl = this.buildUrl(url, options);
    const config = this.getRequestConfig(options);

    return this.executeRequest(() =>
      this.httpClient.post<ApiAbstract<T>, P>(requestUrl, params, config)
    );
  }

  /**
   * PUT请求
   * @param url 请求地址（相对路径）
   * @param params 请求参数
   * @param options 配置选项
   * @returns 返回API响应
   * @example
   * // 更新用户
   * CRUD.put<UpdateUserDto, User>('user/update/1', { data: { name: 'John Doe' } })
   */
  public put<P, T>(
    url: string,
    params?: AxiosRequestConfig<P>,
    options?: CrudOptions
  ): Promise<ApiAbstract<T>> {
    const requestUrl = this.buildUrl(url, options);
    const config = this.getRequestConfig(options);

    return this.executeRequest(() =>
      this.httpClient.put<P, ApiAbstract<T>>(requestUrl, params, config)
    );
  }

  /**
   * DELETE请求
   * @param url 请求地址（相对路径）
   * @param params 请求参数
   * @param options 配置选项
   * @returns 返回API响应
   * @example
   * // 删除用户
   * CRUD.delete<number[], string>('user/delete', { data: [1, 2, 3] })
   */
  public delete<P = number[], T = string>(
    url: string,
    params?: AxiosRequestConfig<P>,
    options?: CrudOptions
  ): Promise<ApiAbstract<T>> {
    const requestUrl = this.buildUrl(url, options);
    const config = this.getRequestConfig(options);

    return this.executeRequest(() =>
      this.httpClient.delete<P, ApiAbstract<T>>(requestUrl, params, config)
    );
  }

  /**
   * 下载文件
   * @param url 请求地址（相对路径）
   * @param options 配置选项
   * @returns 返回Promise
   * @example
   * // 下载用户列表
   * CRUD.download('user/export')
   */
  public async download(url: string, options?: CrudOptions): Promise<void> {
    const requestUrl = this.buildUrl(url + "/download", options);
    const config = this.getRequestConfig({ ...options, responseType: "blob" });

    const blob = await this.executeRequest(() =>
      this.httpClient.get<Blob, null>(requestUrl, null, config)
    );

    downloadByData(blob, url + Date.now() + ".xls");
  }
}

// 默认导出实例
export const CRUD = new Crud(http);
