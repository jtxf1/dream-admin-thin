import { http } from "@/utils/http";
import type { PureHttpRequestConfig } from "@/utils/http/types";
import type { AxiosRequestConfig } from "axios";
import type { ApiAbstract, Page } from "@/utils/http/ApiAbstract";
import { downloadByData } from "@pureadmin/utils";
import type { PaginationProps } from "@pureadmin/table";

export const pagination: PaginationProps = {
  total: 0,
  pageSize: 10,
  pageSizes: [10, 20, 50],
  currentPage: 1,
  background: true
};
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

/** 单独抽离的CRUD工具函数 */
class crud {
  /**
   * 单独抽离的get工具函数
   * @param url 请求地址（相对路径）
   * @param params 请求参数
   * @param config 额外配置
   * @returns 返回包含分页数据的API响应
   * @example
   * // 获取用户列表
   * CRUD.get<User, { page: number, size: number }>('user/list', { params: { page: 1, size: 10 } })
   */
  public get<T, P>(
    url: string,
    params?: AxiosRequestConfig<P>,
    config?: PureHttpRequestConfig
  ): Promise<ApiAbstract<Page<T>>> {
    return http.get<ApiAbstract<Page<T>>, P>(baseUrlApi(url), params, config);
  }

  /**
   * 单独抽离的post工具函数
   * @param url 请求地址（相对路径）
   * @param params 请求参数
   * @param config 额外配置
   * @returns 返回API响应
   * @example
   * // 创建用户
   * CRUD.post<User, CreateUserDto>('user/create', { data: { name: 'John', age: 30 } })
   */
  public post<T, P>(
    url: string,
    params?: AxiosRequestConfig<P>,
    config?: PureHttpRequestConfig
  ): Promise<ApiAbstract<T>> {
    return http.post<ApiAbstract<T>, P>(baseUrlApi(url), params, config);
  }

  /**
   * 单独抽离的put工具函数
   * @param url 请求地址（相对路径）
   * @param params 请求参数
   * @param config 额外配置
   * @returns 返回API响应
   * @example
   * // 更新用户
   * CRUD.put<User, UpdateUserDto>('user/update/1', { data: { name: 'John Doe' } })
   */
  public put<T, P>(
    url: string,
    params?: AxiosRequestConfig<P>,
    config?: PureHttpRequestConfig
  ): Promise<ApiAbstract<T>> {
    return http.put<P, ApiAbstract<T>>(baseUrlApi(url), params, config);
  }

  /**
   * 单独抽离的delete工具函数
   * @param url 请求地址（相对路径）
   * @param params 请求参数（通常是ID数组）
   * @param config 额外配置
   * @returns 返回API响应
   * @example
   * // 删除用户
   * CRUD.delete('user/delete', { data: [1, 2, 3] })
   */
  public delete(
    url: string,
    params?: AxiosRequestConfig<number[]>,
    config?: PureHttpRequestConfig
  ): Promise<ApiAbstract<string>> {
    return http.delete<number[], ApiAbstract<string>>(
      baseUrlApi(url),
      params,
      config
    );
  }

  /**
   * 单独抽离的download工具函数
   * @param url 请求地址（相对路径）
   * @returns 返回Promise
   * @example
   * // 下载用户列表
   * CRUD.download('user/export')
   */
  public download(url: string): Promise<void> {
    return http
      .get<null, Blob>(baseUrlApi(url + "/download"), null, {
        responseType: "blob"
      })
      .then(res => {
        downloadByData(res, url + Date.now() + ".xls");
      })
      .catch(error => {
        console.error("下载失败:", error);
        throw error;
      });
  }
}

export const CRUD = new crud();
