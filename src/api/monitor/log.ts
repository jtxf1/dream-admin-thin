import { http } from "@/utils/http";
import { PageQuery, type ApiAbstract } from "@/utils/http/ApiAbstract";
import { baseUrlApi } from "../utils";

export class Log {
  /**
   * ID
   */
  id?: number;

  /**
   * 操作用户
   */
  username?: string;

  /**
   * 描述
   */
  description?: string;

  /**
   * 方法名
   */
  method?: string;

  /**
   * 参数
   */
  params?: string;

  /**
   * 日志类型
   */
  logType?: string;

  /**
   * 请求ip
   */
  requestIp?: string;

  /**
   * 地址
   */
  address?: string;

  /**
   * 浏览器
   */
  browser?: string;

  /**
   * 请求耗时
   */
  time?: number;

  /**
   * 异常详细
   * 注意：TypeScript/JavaScript 中没有原生的 byte[] 类型。
   * 常见做法是使用 Uint8Array 或 string (Base64编码)。
   * 这里使用 Uint8Array 表示。
   */
  exceptionDetail?: Uint8Array;
}
export class LogQueryCriteria extends PageQuery {
  name: string;
}

export const get = (params: LogQueryCriteria | any) => {
  return http.request<ApiAbstract<Log>>("get", baseUrlApi("logs"), {
    params
  });
};
export const add = (data: Partial<Log>) => {
  return http.request<ApiAbstract<Log>>("post", baseUrlApi("logs"), {
    data
  });
};

export const del = (ids: number[] | any) => {
  return http.request("delete", baseUrlApi("dept"), {
    data: ids
  });
};
export const edit = (data: Partial<Log>) => {
  return http.request<ApiAbstract<Log>>("put", baseUrlApi("logs"), {
    data
  });
};
export const download = (data: Partial<LogQueryCriteria>) => {
  return http.request<Blob>(
    "get",
    baseUrlApi("logs/download"),
    {
      data
    },
    { responseType: "blob" }
  );
};
