import { http } from "@/utils/http";
import type { ApiAbstract } from "@/utils/http/ApiAbstract";
import { baseUrlApi } from "../utils";

export class Generator {
  name: string;
  content: string;
}
export const get = (tableName, type) => {
  return http.request<ApiAbstract<Generator>>(
    "post",
    baseUrlApi("generator/") + tableName + "/" + type
  );
};
export const put = generators => {
  return http.request<ApiAbstract<Generator>>("put", baseUrlApi("generator"), {
    data: generators
  });
};
export const generate = tableName => {
  return http.request<ApiAbstract<Generator>>(
    "post",
    baseUrlApi("generator/") + tableName + "/0"
  );
};

export const download = (name: String) => {
  return http.request<Blob>(
    "post",
    baseUrlApi("generator/" + name + "/2"),
    {},
    { responseType: "blob" }
  );
};

export function sync(tables) {
  return http.request<Blob>("post", baseUrlApi("generator/sync"), {
    data: tables
  });
}

export const getColumns = tableName => {
  return http.request<ApiAbstract<Generator>>(
    "get",
    baseUrlApi("generator/columns"),
    { params: { tableName } }
  );
};

export const generateConfig = <T>(tableName: string | any) => {
  return http.request<ApiAbstract<T>>(
    "get",
    baseUrlApi("genConfig/") + tableName
  );
};

export const pugGenerateConfig = <T>(data: T) => {
  return http.request<ApiAbstract<T>>("put", baseUrlApi("genConfig"), { data });
};
