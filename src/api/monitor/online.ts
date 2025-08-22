import { http } from "@/utils/http";
import { PageQuery, type ApiAbstract } from "@/utils/http/ApiAbstract";
import { baseUrlApi } from "../utils";

export class Online {
  userName: string;
  nickName: string;
  dept: string;
  browser: string;
  ip: string;
  address: string;
  key: string;
  loginTime: Date;
}
export class OnlineQueryCriteria extends PageQuery {
  blurry: string;
  logType: string;
}

export const get = (params: OnlineQueryCriteria | any) => {
  return http.request<ApiAbstract<Online>>("get", baseUrlApi("auth/online"), {
    params
  });
};
export const del = (ids: string[] | any) => {
  return http.request("delete", baseUrlApi("auth/online"), {
    data: ids
  });
};

export const download = (data: Partial<OnlineQueryCriteria> | any) => {
  return http.request<Blob>(
    "get",
    baseUrlApi("auth/online/download"),
    {
      data
    },
    { responseType: "blob" }
  );
};
