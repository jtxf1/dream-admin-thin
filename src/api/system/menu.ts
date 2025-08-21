import { http } from "@/utils/http";
import { PageQuery, type ApiAbstract } from "@/utils/http/ApiAbstract";
import { baseUrlApi } from "../utils";

export class Menu {
  id: number;

  children: Menu[];

  type: number;

  permission: string;

  title: string;

  menuSort: number;

  path: string;

  component: string;

  pid: number;

  subCount: number;

  iframe: number;

  cache: boolean;

  hidden: boolean;

  componentName: string;

  icon: string;
}
export class MenuQueryCriteria extends PageQuery {
  blurry?: string;
  pid?: number;
  title?: string;
}
export const menuTree = (ids: number[]) => {
  return http.request<ApiAbstract<Menu>>("get", baseUrlApi("menus/tree"), {
    data: ids
  });
};

export const menusBuild = () => {
  return http.request<ApiAbstract<Menu>>("get", baseUrlApi("menus/build"));
};

export const get = (params: number | any) => {
  return http.request<ApiAbstract<Menu>>("get", baseUrlApi("menus"), {
    params
  });
};

export const add = (data: Partial<Menu>) => {
  return http.request("post", baseUrlApi("menus"), {
    data
  });
};

export const del = (ids: number[] | any) => {
  return http.request("delete", baseUrlApi("menus"), {
    data: ids
  });
};
export const edit = (data: Partial<Menu>) => {
  return http.request<ApiAbstract<Menu>>("put", baseUrlApi("menus"), {
    data
  });
};
export const download = (data: Partial<MenuQueryCriteria | any>) => {
  return http.request<Blob>(
    "get",
    baseUrlApi("menus/download"),
    {
      data
    },
    { responseType: "blob" }
  );
};
