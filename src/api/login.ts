import { http } from "@/utils/http";
import { ApiAbstract } from "@/utils/http/ApiAbstract";
import { baseUrlAuth } from "./utils";
import Cookies from "js-cookie";

// 部门类型定义
export interface Dept {
  id: number;
  name: string;
  parentId: number;
  deptSort: number;
  enabled: boolean;
  createBy?: string;
  createTime?: Date;
  updateBy?: string;
  updateTime?: Date;
}

// 岗位类型定义
export interface Job {
  id: number;
  name: string;
  jobSort: number;
  enabled: boolean;
  createBy?: string;
  createTime?: Date;
  updateBy?: string;
  updateTime?: Date;
}

// 角色类型定义
export interface Role {
  id: number;
  name: string;
  roleKey: string;
  roleSort: number;
  enabled: boolean;
  createBy?: string;
  createTime?: Date;
  updateBy?: string;
  updateTime?: Date;
}

// 权限类型定义
export interface Authority {
  authority: string;
}

// 数据范围类型定义
export interface DataScope {
  scopeName: string;
  scopeType: string;
}

export class UserResult extends ApiAbstract {
  declare data: {
    img: string;
    uuid: string;
  };
}

export interface UserUser {
  avatarName?: string;
  avatarPath?: string;
  createTime?: Date;
  dept?: Dept;
  deptId?: number;
  email?: string;
  enabled?: boolean;
  gender?: string;
  id?: number;
  isAdmin?: boolean;
  jobs?: Job[];
  nickName?: string;
  password?: string;
  phone?: string;
  roles?: Role[];
  updateBy?: string;
  updateTime?: Date;
  username?: string;
}

export interface User {
  authorities?: Authority[];
  dataScopes?: DataScope[];
  roles?: Role[];
  user?: UserUser;
}

export class UserLogResult extends ApiAbstract {
  declare data: {
    token: string;
    user: User;
    username: string;
    roles: Array<string>;
  };
}

// 登录请求参数类型
export interface LoginRequest {
  username: string;
  password: string | false;
  code: string;
  uuid: string;
}

// 登录响应数据类型
export interface LoginResponse {
  token: string;
  user: User;
  username: string;
  roles: Array<string>;
}

// 用户信息响应数据类型
export interface UserInfoResponse {
  user: UserUser;
  roles: Role[];
  permissions: string[];
}

export class UserInfoResult extends ApiAbstract {
  declare data: UserInfoResponse;
}

/** 获取验证码 */
export const getCode = (): Promise<UserResult> => {
  return http.request<UserResult>("get", baseUrlAuth("code"));
};

/** 登录 */
export const login = (data?: LoginRequest): Promise<UserLogResult> => {
  return http.request<UserLogResult>("post", baseUrlAuth("login"), { data });
};

/** 获取用户信息 */
export const userInfo = (): Promise<UserInfoResult> => {
  const token = Cookies.get("token");
  return http.request<UserInfoResult>("get", baseUrlAuth("info"), null, {
    headers: {
      Authorization: token
    }
  });
};

/** 退出登录 */
export const logout = (): Promise<ApiAbstract> => {
  return http.request<ApiAbstract>("delete", baseUrlAuth("logout"));
};
