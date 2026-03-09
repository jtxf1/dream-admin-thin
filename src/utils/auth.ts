import Cookies from "js-cookie";
import { useUserStoreHook } from "@/store/modules/user";
import { storageLocal, isString, isIncludeAllChildren } from "@pureadmin/utils";

export interface DataInfo<T> {
  /** token */
  accessToken: string;
  /** `accessToken`的过期时间（时间戳） */
  expires: T;
  /** 头像 */
  avatar?: string;
  /** 用户名 */
  username?: string;
  /** 昵称 */
  nickname?: string;
  /** 当前登录用户的角色 */
  roles?: Array<string>;
  /** 当前登录用户的按钮级别权限 */
  permissions?: Array<string>;
  /** 当前登陆用户的角色 */
  user?: any;
}

export const userKey = "user-info";
export const TokenKey = "authorized-token";
/**
 * 通过`multiple-tabs`是否在`cookie`中，判断用户是否已经登录系统，
 * 从而支持多标签页打开已经登录的系统后无需再登录。
 * 浏览器完全关闭后`multiple-tabs`将自动从`cookie`中销毁，
 * 再次打开浏览器需要重新登录系统
 * */
export const multipleTabsKey = "multiple-tabs";

/**
 * 简单的 token 加密函数
 * @param token - 原始 token
 * @returns 加密后的 token
 */
export function encryptToken(token: string): string {
  try {
    // 使用 btoa 进行简单的 Base64 编码
    return btoa(unescape(encodeURIComponent(token)));
  } catch (error) {
    console.error("Token 加密失败:", error);
    return token;
  }
}

/**
 * 简单的 token 解密函数
 * @param encryptedToken - 加密后的 token
 * @returns 解密后的 token
 */
export function decryptToken(encryptedToken: string): string {
  try {
    // 使用 atob 进行简单的 Base64 解码
    return decodeURIComponent(escape(atob(encryptedToken)));
  } catch (error) {
    console.error("Token 解密失败:", error);
    return encryptedToken;
  }
}

/** 获取`token` */
export function getToken(): DataInfo<number> {
  // 从 cookie 中获取 token
  const cookieToken = Cookies.get(TokenKey);
  if (cookieToken) {
    try {
      const parsedToken = JSON.parse(cookieToken);
      // 解密 token
      if (parsedToken.accessToken) {
        parsedToken.accessToken = decryptToken(parsedToken.accessToken);
      }
      return parsedToken;
    } catch (error) {
      console.error("Token 解析失败:", error);
      return storageLocal().getItem(userKey) || { accessToken: "", expires: 0 };
    }
  }
  // 如果 cookie 中没有，则从 localStorage 中获取
  return storageLocal().getItem(userKey) || { accessToken: "", expires: 0 };
}

/**
 * @description 设置`token`以及一些必要信息并采用无感刷新`token`方案
 * 无感刷新：后端返回`accessToken`（访问接口使用的`token`）、`refreshToken`（用于调用刷新`accessToken`的接口时所需的`token`，`refreshToken`的过期时间（比如30天）应大于`accessToken`的过期时间（比如2小时））、`expires`（`accessToken`的过期时间）
 * 将`accessToken`、`expires`、`refreshToken`这三条信息放在key值为authorized-token的cookie里（过期自动销毁）
 * 将`avatar`、`username`、`nickname`、`roles`、`permissions`、`refreshToken`、`expires`这七条信息放在key值为`user-info`的localStorage里（利用`multipleTabsKey`当浏览器完全关闭后自动销毁）
 */
export function setToken(data: DataInfo<Date>) {
  let expires = 0;
  const { accessToken } = data;
  const { isRemembered, loginDay } = useUserStoreHook();
  expires = new Date(data.expires).getTime(); // 如果后端直接设置时间戳，将此处代码改为expires = data.expires，然后把上面的DataInfo<Date>改成DataInfo<number>即可

  // 加密 token
  const encryptedToken = encryptToken(accessToken);
  const cookieString = JSON.stringify({ accessToken: encryptedToken, expires });

  // 使用 HttpOnly 和 Secure 选项存储 cookie
  const cookieOptions = {
    expires: expires > 0 ? (expires - Date.now()) / 86400000 : undefined,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // 生产环境使用 HTTPS
    sameSite: "strict" as const // 防止 CSRF 攻击
  };

  expires > 0
    ? Cookies.set(TokenKey, cookieString, cookieOptions)
    : Cookies.set(TokenKey, cookieString, cookieOptions);

  Cookies.set(
    multipleTabsKey,
    "true",
    isRemembered
      ? {
          expires: loginDay,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict"
        }
      : {
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict"
        }
  );

  function setUserKey({
    accessToken,
    user,
    avatar,
    username,
    nickname,
    roles,
    permissions
  }) {
    useUserStoreHook().SET_AVATAR(avatar);
    useUserStoreHook().SET_USERNAME(username);
    useUserStoreHook().SET_NICKNAME(nickname);
    useUserStoreHook().SET_ROLES(roles);
    useUserStoreHook().SET_PERMS(permissions);
    storageLocal().setItem(userKey, {
      accessToken, // 注意：localStorage 中存储的是原始 token
      expires,
      avatar,
      username,
      roles,
      permissions,
      user
    });
  }

  if (data.username && data.roles) {
    const { roles, user } = data;
    setUserKey({
      accessToken,
      user,
      avatar: user?.avatarPath ?? "",
      username: user?.username ?? "",
      nickname: user?.nickname ?? "",
      roles,
      permissions: data?.permissions ?? []
    });
  } else {
    const avatar =
      storageLocal().getItem<DataInfo<number>>(userKey)?.user?.avatarName ?? "";
    const user = storageLocal().getItem<DataInfo<number>>(userKey)?.user ?? "";
    const username =
      storageLocal().getItem<DataInfo<number>>(userKey)?.user?.username ?? "";
    const nickname =
      storageLocal().getItem<DataInfo<number>>(userKey)?.user?.nickname ?? "";
    const roles =
      storageLocal().getItem<DataInfo<number>>(userKey)?.roles ?? [];
    const permissions =
      storageLocal().getItem<DataInfo<number>>(userKey)?.permissions ?? [];
    setUserKey({
      accessToken,
      user,
      avatar,
      username,
      nickname,
      roles,
      permissions
    });
  }
}

/** 删除`token`以及key值为`user-info`的localStorage信息 */
export function removeToken() {
  Cookies.remove(TokenKey);
  Cookies.remove(multipleTabsKey);
  storageLocal().removeItem(userKey);
}

/** 格式化token（jwt格式） */
export const formatToken = (token: string): string => {
  return "Bearer " + token;
};

/** 是否有按钮级别的权限（根据登录接口返回的`permissions`字段进行判断）*/
export const hasPerms = (value: string | Array<string>): boolean => {
  if (!value) return false;
  const allPerms = "*:*:*";
  const { permissions } = useUserStoreHook();
  if (!permissions) return false;
  if (permissions.length === 1 && permissions[0] === allPerms) return true;
  const isAuths = isString(value)
    ? permissions.includes(value)
    : isIncludeAllChildren(value, permissions);
  return isAuths ? true : false;
};

/** 更新`user-info`的user信息 */
export function putUserInfo(user) {
  const userInfo: DataInfo<number> =
    storageLocal().getItem<DataInfo<number>>(userKey);
  userInfo.user = user;
  storageLocal().setItem(userKey, userInfo);
}
