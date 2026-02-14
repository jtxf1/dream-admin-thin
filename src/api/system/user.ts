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
export class UserQueryCriteria extends PageQuery {
  name: string;
  deptId: number;
  deptIds: number[];
  enabled: boolean;
  blurry: string;
}

export const get = (params: number | Partial<UserQueryCriteria>) => {
  return http.request<ApiAbstract<User>>("get", baseUrlApi("users"), {
    params
  });
};

export const add = (data: Partial<User>) => {
  return http.request<ApiAbstract<User>>("post", baseUrlApi("users"), {
    data
  });
};

export const del = (ids: number[] | number) => {
  return http.request<ApiAbstract<unknown>>("delete", baseUrlApi("users"), {
    data: Array.isArray(ids) ? ids : [ids]
  });
};
export const edit = (data: Partial<User>) => {
  return http.request<ApiAbstract<User>>("put", baseUrlApi("users"), {
    data
  });
};
export const download = (data: Partial<UserQueryCriteria>) => {
  return http.request<Blob>(
    "get",
    baseUrlApi("users/download"),
    {
      data
    },
    { responseType: "blob" }
  );
};

export const updateAvatarByid = ({
  id,
  avatar,
  key
}: {
  id: number;
  avatar: string;
  key: string;
}) => {
  return http.request("post", baseUrlApi(`users/updateAvatar2/${id}`), {
    data: { avatar, key }
  });
};

export function updatePass({
  oldPass,
  newPass
}: {
  oldPass: string;
  newPass: string;
}) {
  const data = {
    oldPass: encrypt(oldPass),
    newPass: encrypt(newPass)
  };
  return http.request("post", baseUrlApi("users/updatePass"), {
    data
  });
}

export function resetEmail(email: string) {
  return http.request<ApiAbstract<unknown>>(
    "post",
    baseUrlApi("code/resetEmail?email=" + email)
  );
}

export function updateEmail(form: {
  pass: string;
  email: string;
  code: string;
}) {
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
export function editUser(data: Partial<User>) {
  return http.request<ApiAbstract<User>>("put", baseUrlApi("users/center"), {
    data
  });
}

export function getLog<T>(page: number, size: number) {
  return http.request<ApiAbstract<T>>("get", baseUrlApi("logs/user"), {
    params: {
      page: page,
      size: size,
      sort: "id,desc"
    }
  });
}

export function resetPwd(ids: number[] | number) {
  return http.request<ApiAbstract<unknown>>(
    "put",
    baseUrlApi("users/resetPwd"),
    {
      data: Array.isArray(ids) ? ids : [ids]
    }
  );
}
