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

// 部门类型定义
export interface Dept {
  id: number | string;
}

// 角色类型定义
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
  depts: Dept[];
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

// 角色查询条件类型
export class RoleQueryCriteria extends PageQuery {
  blurry: string;
  declare createTime: Date[];
}

// 菜单编辑参数类型
export interface EditMenuParams {
  id: number;
  menus: Menu[];
}

// 级别响应类型
export interface LevelResponse {
  level: number;
}

// 获取所有角色
export const getAll = (data: Partial<RoleQueryCriteria>): Promise<Role[]> => {
  return http.request<Role[]>("get", baseUrlApi("roles/all"), {
    data
  });
};

// 获取角色列表
export const get = (
  params?: number | Partial<RoleQueryCriteria>
): Promise<ApiAbstract<Role>> => {
  return http.request<ApiAbstract<Role>>("get", baseUrlApi("roles"), {
    params
  });
};

// 获取角色级别
export const getLevel = (): Promise<ApiAbstract<LevelResponse>> => {
  return http.request<ApiAbstract<LevelResponse>>(
    "get",
    baseUrlApi("roles/level")
  );
};

// 编辑角色菜单
export const editMenu = (
  data: EditMenuParams
): Promise<ApiAbstract<unknown>> => {
  return http.request<ApiAbstract<unknown>>("put", baseUrlApi("roles/menu"), {
    data
  });
};

// 添加角色
export const add = (data: Partial<Role>): Promise<ApiAbstract<Role>> => {
  return http.request<ApiAbstract<Role>>("post", baseUrlApi("roles"), {
    data
  });
};

// 删除角色
export const del = (ids: number[] | number): Promise<ApiAbstract<unknown>> => {
  return http.request<ApiAbstract<unknown>>("delete", baseUrlApi("roles"), {
    data: Array.isArray(ids) ? ids : [ids]
  });
};

// 编辑角色
export const edit = (data: Partial<Role>): Promise<ApiAbstract<Role>> => {
  return http.request<ApiAbstract<Role>>("put", baseUrlApi("roles"), {
    data
  });
};

// 设置角色菜单
export const menus = (data: EditMenuParams): Promise<ApiAbstract<unknown>> => {
  return http.request<ApiAbstract<unknown>>("put", baseUrlApi("roles/menu"), {
    data
  });
};

// 下载角色数据
export const download = (data: Partial<RoleQueryCriteria>): Promise<Blob> => {
  return http.request<Blob>(
    "get",
    baseUrlApi("roles/download"),
    {
      data
    },
    { responseType: "blob" }
  );
};
