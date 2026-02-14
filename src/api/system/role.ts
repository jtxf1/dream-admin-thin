import { http } from "@/utils/http";
import { type ApiAbstract, PageQuery } from "@/utils/http/ApiAbstract";
import { baseUrlApi } from "../utils";
import type { User } from "./user";

// 菜单类型定义
export interface Menu {
  id: number;
  name: string;
  path: string;
  component?: string;
  icon?: string;
  sort?: number;
  parentId?: number;
  children?: Menu[];
}

export class Role {
  id: number;
  /**
   * 用户
   */
  users: User[];
  /**
   * 菜单
   */
  menus: Menu[];
  /**
   * 部门
   */
  depts: Array<{ id: number | string }>;
  /**
   * 名称
   */
  name: string;
  /**
   * 数据权限，全部 、 本级 、 自定义
   */
  dataScope: string;
  /**
   * 级别，数值越小，级别越大
   */
  level: number;
  /**
   * 描述
   */
  description: string;
}
export class RoleQueryCriteria extends PageQuery {
  blurry: string;
  declare createTime: Date[];
}
export const getAll = (data: Partial<RoleQueryCriteria>) => {
  return http.request<Role[]>("get", baseUrlApi("roles/all"), {
    data
  });
};

export const get = (params?: number | Partial<RoleQueryCriteria>) => {
  return http.request<ApiAbstract<Role>>("get", baseUrlApi("roles"), {
    params
  });
};

export const getLevel = () => {
  return http.request<ApiAbstract<{ level: number }>>(
    "get",
    baseUrlApi("roles/level")
  );
};

export const editMenu = (data: { id: number; menus: Menu[] }) => {
  return http.request<ApiAbstract<unknown>>("put", baseUrlApi("roles/menu"), {
    data
  });
};
export const add = (data: Partial<Role>) => {
  return http.request<ApiAbstract<Role>>("post", baseUrlApi("roles"), {
    data
  });
};

export const del = (ids: number[] | number) => {
  return http.request<ApiAbstract<unknown>>("delete", baseUrlApi("roles"), {
    data: Array.isArray(ids) ? ids : [ids]
  });
};
export const edit = (data: Partial<Role>) => {
  return http.request<ApiAbstract<Role>>("put", baseUrlApi("roles"), {
    data
  });
};
export const menus = (data: { id: number; menus: Menu[] }) => {
  return http.request<ApiAbstract<unknown>>("put", baseUrlApi("roles/menu"), {
    data
  });
};
export const download = (data: Partial<RoleQueryCriteria>) => {
  return http.request<Blob>(
    "get",
    baseUrlApi("roles/download"),
    {
      data
    },
    { responseType: "blob" }
  );
};
