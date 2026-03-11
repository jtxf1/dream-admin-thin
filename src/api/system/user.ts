import { http } from "@/utils/http";
import {
  type ApiAbstract,
  PageQuery,
  VersionEntity
} from "@/utils/http/ApiAbstract";
import { baseUrlApi } from "../utils";
import type { Role } from "./role";
import type { Dept } from "./dept";
import { encrypt } from "@/utils/rsaEncrypt";

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

// 用户类型定义
export class User extends VersionEntity {
  id: number;
  /**
   * 用户角色
   */
  roles: Role[];
  /**
   * 用户岗位
   */
  jobs: Job[];
  /**
   * 用户部门
   */
  dept: Dept;
  /**
   * 用户名称
   */
  username: string;
  /**
   * 用户昵称
   */
  nickName: string;
  /**
   * 邮箱
   */
  email: string;
  /**
   * 电话号码
   */
  phone: string;
  /**
   * 用户性别
   */
  gender: string;
  /**
   * 头像真实名称
   */
  avatarName: string;
  /**
   * 头像存储的路径
   */
  avatarPath: string;
  /**
   * 密码
   */
  password: string;
  /**
   * 是否启用
   */
  enabled: boolean;
  /**
   * 是否为admin账号
   */
  isAdmin: boolean;
  /**
   * 最后修改密码的时间
   */
  pwdResetTime: Date;
}

// 用户查询条件类型
export class UserQueryCriteria extends PageQuery {
  name: string;
  deptId: number;
  deptIds: number[];
  enabled: boolean;
  blurry: string;
}

// 更新头像参数类型
export interface UpdateAvatarParams {
  id: number;
  avatar: string;
  key: string;
}

// 更新密码参数类型
export interface UpdatePassParams {
  oldPass: string;
  newPass: string;
}

// 更新邮箱参数类型
export interface UpdateEmailParams {
  pass: string;
  email: string;
  code: string;
}

// 日志查询参数类型
export interface LogQueryParams {
  page: number;
  size: number;
  sort?: string;
}

// 获取用户列表
export const get = (
  params: number | Partial<UserQueryCriteria>
): Promise<ApiAbstract<User>> => {
  return http.request<ApiAbstract<User>>("get", baseUrlApi("users"), {
    params
  });
};

// 添加用户
export const add = (data: Partial<User>): Promise<ApiAbstract<User>> => {
  return http.request<ApiAbstract<User>>("post", baseUrlApi("users"), {
    data
  });
};

// 删除用户
export const del = (ids: number[] | number): Promise<ApiAbstract<unknown>> => {
  return http.request<ApiAbstract<unknown>>("delete", baseUrlApi("users"), {
    data: Array.isArray(ids) ? ids : [ids]
  });
};

// 编辑用户
export const edit = (data: Partial<User>): Promise<ApiAbstract<User>> => {
  return http.request<ApiAbstract<User>>("put", baseUrlApi("users"), {
    data
  });
};

// 下载用户数据
export const download = (data: Partial<UserQueryCriteria>): Promise<Blob> => {
  return http.request<Blob>(
    "get",
    baseUrlApi("users/download"),
    {
      data
    },
    { responseType: "blob" }
  );
};

// 更新用户头像
export const updateAvatarByid = (
  params: UpdateAvatarParams
): Promise<ApiAbstract<unknown>> => {
  const { id, avatar, key } = params;
  return http.request<ApiAbstract<unknown>>(
    "post",
    baseUrlApi(`users/updateAvatar2/${id}`),
    {
      data: { avatar, key }
    }
  );
};

// 更新密码
export function updatePass(
  params: UpdatePassParams
): Promise<ApiAbstract<unknown>> {
  const { oldPass, newPass } = params;
  const data = {
    oldPass: encrypt(oldPass),
    newPass: encrypt(newPass)
  };
  return http.request<ApiAbstract<unknown>>(
    "post",
    baseUrlApi("users/updatePass"),
    {
      data
    }
  );
}

// 重置邮箱
export function resetEmail(email: string): Promise<ApiAbstract<unknown>> {
  return http.request<ApiAbstract<unknown>>(
    "post",
    baseUrlApi("code/resetEmail?email=" + email)
  );
}

// 更新邮箱
export function updateEmail(
  form: UpdateEmailParams
): Promise<ApiAbstract<unknown>> {
  const data = {
    password: encrypt(form.pass),
    email: form.email
  };
  return http.request<ApiAbstract<unknown>>(
    "post",
    baseUrlApi("users/updateEmail/" + form.code),
    {
      data
    }
  );
}

// 编辑用户中心信息
export function editUser(data: Partial<User>): Promise<ApiAbstract<User>> {
  return http.request<ApiAbstract<User>>("put", baseUrlApi("users/center"), {
    data
  });
}

// 获取用户日志
export function getLog<T>(params: LogQueryParams): Promise<ApiAbstract<T>> {
  return http.request<ApiAbstract<T>>("get", baseUrlApi("logs/user"), {
    params: {
      ...params,
      sort: params.sort || "id,desc"
    }
  });
}

// 重置密码
export function resetPwd(
  ids: number[] | number
): Promise<ApiAbstract<unknown>> {
  return http.request<ApiAbstract<unknown>>(
    "put",
    baseUrlApi("users/resetPwd"),
    {
      data: Array.isArray(ids) ? ids : [ids]
    }
  );
}
