import { http } from "@/utils/http";
import { PageQuery, type ApiAbstract } from "@/utils/http/ApiAbstract";
import { baseUrlApi } from "../utils";
import type { Menu } from "./role";

export class Dept {
  createBy: string;
  createTime: Date;
  deptSort: number;
  enabled: boolean;
  hasChildren: boolean;
  children: Dept[];
  id: number;
  pid: number;
  status: number;
  label: string;
  leaf: boolean;
  name: string;
  subCount: number;
  updateBy: string;
  updateTime: Date;
  menus: Menu[];
}
export class DeptQueryCriteria extends PageQuery {
  name: string;
  enabled: boolean;
  pid: string | number;
  pidIsNull: boolean;
}

export const getDepts = (
  params: DeptQueryCriteria | Partial<DeptQueryCriteria>
) => {
  return http.request<ApiAbstract<Dept>>("get", baseUrlApi("dept"), {
    params
  });
};
export const getDeptTree = (
  params?: DeptQueryCriteria | Partial<DeptQueryCriteria>
) => {
  return http.request<ApiAbstract<Dept>>("get", baseUrlApi("dept/treeAll"), {
    params
  });
};

export const getDeptSuperior = (ids: number | number[]) => {
  const data = Array.isArray(ids) ? ids : [ids];
  return http.request<ApiAbstract<Dept>>("post", baseUrlApi("dept/superior"), {
    data
  });
};

export const add = (data: Partial<Dept>) => {
  return http.request<ApiAbstract<Dept>>("post", baseUrlApi("dept"), {
    data
  });
};

export const del = (ids: number[] | number) => {
  return http.request<ApiAbstract<unknown>>("delete", baseUrlApi("dept"), {
    data: Array.isArray(ids) ? ids : [ids]
  });
};
export const edit = (data: Partial<Dept>) => {
  return http.request<ApiAbstract<Dept>>("put", baseUrlApi("dept"), {
    data
  });
};
export const download = (data: Partial<DeptQueryCriteria>) => {
  return http.request<Blob>(
    "get",
    baseUrlApi("dept/download"),
    {
      data
    },
    { responseType: "blob" }
  );
};
