import { http } from "@/utils/http";
import type { PureHttpRequestConfig } from "@/utils/http/types";
import type { AxiosRequestConfig } from "axios";
import type { ApiAbstract, Page } from "@/utils/http/ApiAbstract";
import { downloadByData } from "@pureadmin/utils";

export const baseUrlApi = (url: string) => `/api/${url}`;
export const baseUrlAuth = (url: string) => `/auth/${url}`;
export const baseUrlAvatar = (url: string) => `/avatar/${url}`;
export const baseUrlHello = (url: string) => `/hello/${removeUrlPrefix(url)}`;

/**
 * 去除url指定前缀
 * @param url 原始url
 * @param prefix 要去除的前缀
 * @returns 去除前缀后的url
 */
export const removeUrlPrefix = (url: string): string => {
  if (!url) return "";
  if (url.startsWith("https://free.picui.cn/")) {
    return url.slice("https://free.picui.cn/".length);
  }
  if (url.startsWith("/avatar/https://free.picui.cn/")) {
    return url.slice("/avatar/https://free.picui.cn/".length);
  }
  if (url.startsWith("https://www.helloimg.com/")) {
    return url.slice("https://www.helloimg.com/".length);
  }
  if (url.startsWith("/D:/eladmin/")) {
    return url.slice("/D:/eladmin/".length);
  }
  if (url.startsWith("D:/eladmin")) {
    return url.slice("D:/eladmin".length);
  }
  return url;
};

/** 单独抽离的CRUD工具函数 */
class crud {
  /** 单独抽离的get工具函数 */
  public get<T, P>(
    url: string,
    params?: AxiosRequestConfig<P>,
    config?: PureHttpRequestConfig
  ): Promise<ApiAbstract<Page<T>>> {
    return http.get<ApiAbstract<Page<T>>, P>(baseUrlApi(url), params, config);
  }

  /** 单独抽离的post工具函数 */
  public post<T, P>(
    url: string,
    params?: AxiosRequestConfig<P>,
    config?: PureHttpRequestConfig
  ): Promise<ApiAbstract<T>> {
    return http.post<ApiAbstract<T>, P>(baseUrlApi(url), params, config);
  }

  /** 单独抽离的put工具函数 */
  public put<T, P>(
    url: string,
    params?: AxiosRequestConfig<T>,
    config?: PureHttpRequestConfig
  ): Promise<ApiAbstract<P>> {
    return http.put<T, ApiAbstract<P>>(baseUrlApi(url), params, config);
  }

  /** 单独抽离的delete工具函数 */
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

  /** 单独抽离的delete工具函数 */
  public download(url: string) {
    http
      .get<null, Blob>(baseUrlApi(url + "/download"), null, {
        responseType: "blob"
      })
      .then(res => {
        downloadByData(res, url + Date.now() + ".xls");
        // const response: Blob = res;
        // const a = document.createElement("a");
        // const url = window.URL.createObjectURL(response); // 创建媒体流 url ，详细了解可自己查 URL.createObjectURL（推荐 MDN ）

        // a.href = url;
        // a.style.display = "none";
        // document.body.appendChild(a);
        // a.click();
        // a.parentNode.removeChild(a);
        // window.URL.revokeObjectURL(url);
      });
  }
}

export const CRUD = new crud();
