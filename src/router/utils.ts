import {
  type RouterHistory,
  type RouteRecordRaw,
  type RouteComponent,
  createWebHistory,
  createWebHashHistory,
  useRouter,
  useRoute
} from "vue-router";
import { router } from "./index";
import { isProxy, toRaw } from "vue";
import { useTimeoutFn } from "@vueuse/core";
import {
  isEmpty,
  isString,
  cloneDeep,
  isAllEmpty,
  intersection,
  storageLocal,
  isIncludeAllChildren
} from "@pureadmin/utils";
import { getConfig } from "@/config";
import { buildHierarchyTree } from "@/utils/tree";
import { userKey, type DataInfo } from "@/utils/auth";
import { type menuType, routerArrays } from "@/layout/types";
import { useMultiTagsStoreHook } from "@/store/modules/multiTags";
import { usePermissionStoreHook } from "@/store/modules/permission";
import { useUserStoreHook } from "@/store/modules/user";
const IFrame = () => import("@/layout/frame.vue");
// https://cn.vitejs.dev/guide/features.html#glob-import
const modulesRoutes = import.meta.glob("/src/views/**/*.{vue,tsx}");

// 路由缓存Map，用于存储路由信息，优化查找性能
const routeCache = new Map<string, RouteRecordRaw>();

/**
 * 路由缓存管理模块
 */
export const RouteCache = {
  /**
   * 获取缓存的路由信息
   * @param path 路由路径
   * @returns 路由信息或undefined
   */
  get(path: string): RouteRecordRaw | undefined {
    return routeCache.get(path);
  },

  /**
   * 设置路由缓存
   * @param path 路由路径
   * @param route 路由信息
   */
  set(path: string, route: RouteRecordRaw): void {
    routeCache.set(path, route);
  },

  /**
   * 清空路由缓存
   */
  clear(): void {
    routeCache.clear();
  },

  /**
   * 检查路由是否在缓存中
   * @param path 路由路径
   * @returns 是否在缓存中
   */
  has(path: string): boolean {
    return routeCache.has(path);
  }
};

// 动态路由
import { getAsyncRoutes } from "@/api/routes";
import * as Menu from "@/api/system/menu";

/**
 * 路由排序模块
 */
export const RouteSort = {
  /**
   * 处理路由排序等级
   * @param routeInfo 路由信息
   * @returns 是否需要自动设置rank
   */
  handRank(routeInfo: any) {
    const { name, path, parentId, meta } = routeInfo;
    return isAllEmpty(parentId)
      ? isAllEmpty(meta?.rank) ||
        (meta?.rank === 0 && name !== "Home" && path !== "/")
        ? true
        : false
      : false;
  },

  /**
   * 按照路由中meta下的rank等级升序来排序路由
   * @param arr 路由数组
   * @returns 排序后的路由数组
   */
  ascending(arr: any[]) {
    arr.forEach((v, index) => {
      // 当rank不存在时，根据顺序自动创建，首页路由永远在第一位
      if (RouteSort.handRank(v)) v.meta.rank = index + 2;
    });
    return arr.sort(
      (a: { meta: { rank: number } }, b: { meta: { rank: number } }) => {
        return a?.meta.rank - b?.meta.rank;
      }
    );
  }
};

/**
 * 路由过滤模块
 */
export const RouteFilter = {
  /**
   * 过滤meta中showLink为false的菜单
   * @param data 路由数据
   * @returns 过滤后的路由数据
   */
  filterTree(data: RouteComponent[]) {
    const newTree = cloneDeep(data).filter(
      (v: { meta: { showLink: boolean } }) => v.meta?.showLink !== false
    );
    newTree.forEach(
      (v: { children }) =>
        v.children && (v.children = RouteFilter.filterTree(v.children))
    );
    return newTree;
  },

  /**
   * 过滤children长度为0的的目录
   * @param data 路由数据
   * @returns 过滤后的路由数据
   */
  filterChildrenTree(data: RouteComponent[]) {
    const newTree = cloneDeep(data).filter(
      (v: any) => v?.children?.length !== 0
    );
    newTree.forEach(
      (v: { children }) =>
        v.children && (v.children = RouteFilter.filterTree(v.children))
    );
    return newTree;
  },

  /**
   * 从localStorage里取出当前登录用户的角色roles，过滤无权限的菜单
   * @param data 路由数据
   * @returns 过滤后的路由数据
   */
  filterNoPermissionTree<T extends RouteComponent>(data: T[]): T[] {
    const currentRoles =
      storageLocal().getItem<DataInfo<number>>(userKey)?.roles ?? [];
    const newTree = cloneDeep(data).filter((v: any) =>
      RouteUtil.isOneOfArray(v.meta?.roles, currentRoles)
    );
    newTree.forEach(
      (v: any) =>
        v.children &&
        (v.children = RouteFilter.filterNoPermissionTree(v.children))
    );
    return RouteFilter.filterChildrenTree(newTree);
  }
};

/**
 * 路由工具模块
 */
export const RouteUtil = {
  /**
   * 判断两个数组彼此是否存在相同值
   * @param a 数组a
   * @param b 数组b
   * @returns 是否存在相同值
   */
  isOneOfArray(a: Array<string>, b: Array<string>) {
    return Array.isArray(a) && Array.isArray(b)
      ? intersection(a, b).length > 0
        ? true
        : false
      : true;
  },

  /**
   * 通过指定 `key` 获取父级路径集合，默认 `key` 为 `path`
   * @param value 目标值
   * @param routes 路由数组
   * @param key 查找键
   * @returns 父级路径集合
   */
  getParentPaths<T extends RouteRecordRaw>(
    value: string,
    routes: T[],
    key = "path"
  ): string[] {
    // 深度遍历查找
    function dfs(routes: T[], value: string, parents: string[]): string[] {
      for (let i = 0; i < routes.length; i++) {
        const item = routes[i];
        // 返回父级path
        if (item[key] === value) return parents;
        // children不存在或为空则不递归
        if (!item.children || !item.children.length) continue;
        // 往下查找时将当前path入栈
        parents.push(item.path);

        if (dfs(item.children as T[], value, parents).length) return parents;
        // 深度遍历查找未找到时当前path 出栈
        parents.pop();
      }
      // 未找到时返回空数组
      return [];
    }

    return dfs(routes, value, []);
  },

  /**
   * 查找对应 `path` 的路由信息（使用缓存优化性能）
   * @param path 路由路径
   * @param routes 路由数组
   * @returns 路由信息或null
   */
  findRouteByPath<T extends RouteRecordRaw>(
    path: string,
    routes: T[]
  ): T | null {
    // 首先检查缓存中是否存在该路由
    if (RouteCache.has(path)) {
      return RouteCache.get(path) as T;
    }

    let res = routes.find(item => item.path == path);
    if (res) {
      const route = isProxy(res) ? toRaw(res) : res;
      // 将找到的路由存入缓存
      RouteCache.set(path, route);
      return route;
    } else {
      for (let i = 0; i < routes.length; i++) {
        if (
          routes[i].children instanceof Array &&
          routes[i].children.length > 0
        ) {
          res = RouteUtil.findRouteByPath(path, routes[i].children as T[]);
          if (res) {
            const route = isProxy(res) ? toRaw(res) : res;
            // 将找到的路由存入缓存
            RouteCache.set(path, route);
            return route;
          }
        }
      }
      return null;
    }
  }
};

function addPathMatch() {
  if (!router.hasRoute("pathMatch")) {
    router.addRoute({
      path: "/:pathMatch(.*)",
      name: "pathMatch",
      redirect: "/error/404"
    });
  }
}

/** 处理动态路由（后端返回的路由） */
function handleAsyncRoutes(routeList) {
  // 清空路由缓存，确保路由配置变化时正确更新缓存
  RouteCache.clear();

  if (routeList.length === 0) {
    usePermissionStoreHook().handleWholeMenus(routeList);
  } else {
    formatFlatteningRoutes(addAsyncRoutes(routeList)).map(
      (v: RouteRecordRaw) => {
        // 防止重复添加路由
        if (
          router.options.routes[0].children.some(value => value.path === v.path)
        ) {
          return;
        } else {
          // 切记将路由push到routes后还需要使用addRoute，这样路由才能正常跳转
          router.options.routes[0].children.push(v);
          // 最终路由进行升序
          RouteSort.ascending(router.options.routes[0].children);
          if (!router.hasRoute(v?.name)) router.addRoute(v);
          const flattenRouters: any = router
            .getRoutes()
            .find(n => n.path === "/");
          // 保持router.options.routes[0].children与path为"/"的children一致，防止数据不一致导致异常
          flattenRouters.children = router.options.routes[0].children;
          router.addRoute(flattenRouters);
        }
      }
    );
    usePermissionStoreHook().handleWholeMenus(routeList);
  }
  if (!useMultiTagsStoreHook().getMultiTagsCache) {
    useMultiTagsStoreHook().handleTags("equal", [
      ...routerArrays,
      ...usePermissionStoreHook().flatteningRoutes.filter(
        v => v?.meta?.fixedTag
      )
    ]);
  }
  addPathMatch();
}

/** 初始化路由（`new Promise` 写法防止在异步请求中造成无限循环）*/
function initRouter() {
  if (getConfig()?.CachingAsyncRoutes) {
    // 开启动态路由缓存本地localStorage
    /* const key = "async-routes";
    const asyncRouteList = storageLocal().getItem(key) as any;
    if (asyncRouteList && asyncRouteList?.length > 0) {
      return new Promise(resolve => {
        handleAsyncRoutes(asyncRouteList);
        resolve(router);
      });
    } else {
      return new Promise(resolve => {
        Menu.menusBuild()
          .then(re => {
            handleAsyncRoutes(cloneDeep(re.data));
            storageLocal().setItem(key, re.data);
          })
          .finally(() => {
            resolve(router);
          });
      });
    } */
    return new Promise(resolve => {
      Menu.menusBuild()
        .then(re => {
          handleAsyncRoutes(cloneDeep(re.data));
        })
        .catch(() => {
          useUserStoreHook().logOut();
        })
        .finally(() => {
          resolve(router);
        });
    });
  } else {
    return new Promise(resolve => {
      getAsyncRoutes().then(({ data }) => {
        handleAsyncRoutes(cloneDeep(data));
        resolve(router);
      });
    });
  }
}

/**
 * 将多级嵌套路由处理成一维数组
 * @param routesList 传入路由
 * @returns 返回处理后的一维路由
 */
function formatFlatteningRoutes<T extends RouteRecordRaw>(
  routesList: T[]
): T[] {
  if (routesList.length === 0) return routesList;

  // 使用递归和reduce方法扁平化路由，避免频繁的数组拼接操作
  const flattenRoutes = (routes: T[]): T[] => {
    return routes.reduce((acc, route) => {
      acc.push(route);
      if (route.children && route.children.length > 0) {
        acc.push(...flattenRoutes(route.children as T[]));
      }
      return acc;
    }, [] as T[]);
  };

  return flattenRoutes(buildHierarchyTree(routesList));
}

/**
 * 一维数组处理成多级嵌套数组（三级及以上的路由全部拍成二级，keep-alive 只支持到二级缓存）
 * https://github.com/pure-admin/vue-pure-admin/issues/67
 * @param routesList 处理后的一维路由菜单数组
 * @returns 返回将一维数组重新处理成规定路由的格式
 */
function formatTwoStageRoutes<T extends RouteRecordRaw>(routesList: T[]): T[] {
  if (routesList.length === 0) return routesList;
  const newRoutesList: T[] = [];
  routesList.forEach((v: T) => {
    if (v.path === "/") {
      newRoutesList.push({
        component: v.component,
        name: v.name,
        path: v.path,
        redirect: v.redirect,
        meta: v.meta,
        children: []
      } as T);
    } else {
      newRoutesList[0]?.children?.push({ ...v });
    }
  });
  return newRoutesList;
}

/** 处理缓存路由（添加、删除、刷新） */
function handleAliveRoute({ name }: ToRouteType, mode?: string) {
  switch (mode) {
    case "add":
      usePermissionStoreHook().cacheOperate({
        mode: "add",
        name
      });
      break;
    case "delete":
      usePermissionStoreHook().cacheOperate({
        mode: "delete",
        name
      });
      break;
    case "refresh":
      usePermissionStoreHook().cacheOperate({
        mode: "refresh",
        name
      });
      break;
    default:
      usePermissionStoreHook().cacheOperate({
        mode: "delete",
        name
      });
      useTimeoutFn(() => {
        usePermissionStoreHook().cacheOperate({
          mode: "add",
          name
        });
      }, 100);
  }
}

/** 过滤后端传来的动态路由 重新生成规范路由 */
function addAsyncRoutes<T extends RouteRecordRaw>(
  arrRoutes: Array<T>
): Array<T> {
  if (!arrRoutes || !arrRoutes.length) return arrRoutes;
  const modulesRoutesKeys = Object.keys(modulesRoutes);
  arrRoutes.forEach((v: T) => {
    // 将backstage属性加入meta，标识此路由为后端返回路由
    v.meta = v.meta || { title: "" };
    v.meta.backstage = true;
    // 父级的redirect属性取值：如果子级存在且父级的redirect属性不存在，默认取第一个子级的path；如果子级存在且父级的redirect属性存在，取存在的redirect属性，会覆盖默认值
    if (v?.children && v.children.length && !v.redirect)
      v.redirect = v.children[0].path;
    // 父级的name属性取值：如果子级存在且父级的name属性不存在，默认取第一个子级的name；如果子级存在且父级的name属性存在，取存在的name属性，会覆盖默认值（注意：测试中发现父级的name不能和子级name重复，如果重复会造成重定向无效（跳转404），所以这里给父级的name起名的时候后面会自动加上`Parent`，避免重复）
    if (v?.children && v.children.length && !v.name)
      v.name = ((v.children[0].name as string) + "Parent") as any;
    if (v.meta?.frameSrc) {
      v.component = IFrame;
    } else {
      // 对后端传component组件路径和不传做兼容（如果后端传component组件路径，那么path可以随便写，如果不传，component组件路径会跟path保持一致）
      const targetKey = v?.component
        ? modulesRoutesKeys.find(ev => ev.includes(v.component as any))
        : modulesRoutesKeys.find(ev => ev.includes(v.path));
      v.component = targetKey ? modulesRoutes[targetKey] : undefined;
    }
    if (v?.children && v.children.length) {
      addAsyncRoutes(v.children as Array<T>);
    }
  });
  return arrRoutes;
}

/** 获取路由历史模式 https://next.router.vuejs.org/zh/guide/essentials/history-mode.html */
function getHistoryMode(routerHistory): RouterHistory {
  // len为1 代表只有历史模式 为2 代表历史模式中存在base参数 https://next.router.vuejs.org/zh/api/#%E5%8F%82%E6%95%B0-1
  const historyMode = routerHistory.split(",");
  const leftMode = historyMode[0];
  const rightMode = historyMode[1];
  // no param
  if (historyMode.length === 1) {
    if (leftMode === "hash") {
      return createWebHashHistory("");
    } else if (leftMode === "h5") {
      return createWebHistory("");
    }
  } //has param
  else if (historyMode.length === 2) {
    if (leftMode === "hash") {
      return createWebHashHistory(rightMode);
    } else if (leftMode === "h5") {
      return createWebHistory(rightMode);
    }
  }
}

/** 获取当前页面按钮级别的权限 */
function getAuths(): Array<string> {
  return router.currentRoute.value.meta.auths as Array<string>;
}

/** 是否有按钮级别的权限（根据路由`meta`中的`auths`字段进行判断）*/
function hasAuth(value: string | Array<string>): boolean {
  if (!value) return false;
  /** 从当前路由的`meta`字段里获取按钮级别的所有自定义`code`值 */
  const metaAuths = getAuths();
  if (!metaAuths) return false;
  const isAuths = isString(value)
    ? metaAuths.includes(value)
    : isIncludeAllChildren(value, metaAuths);
  return isAuths ? true : false;
}

function handleTopMenu(route) {
  if (route?.children && route.children.length > 1) {
    if (route.redirect) {
      return route.children.filter(cur => cur.path === route.redirect)[0];
    } else {
      return route.children[0];
    }
  } else {
    return route;
  }
}

/** 获取所有菜单中的第一个菜单（顶级菜单）*/
function getTopMenu(tag = false): menuType {
  const topMenu = handleTopMenu(
    usePermissionStoreHook().wholeMenus[0]?.children[0]
  );
  tag && useMultiTagsStoreHook().handleTags("push", topMenu);
  return topMenu;
}

function useDetail() {
  const route = useRoute();
  const router = useRouter();
  const getParameter = isEmpty(route.params) ? route.query : route.params;

  return { getParameter, router };
}

export {
  hasAuth,
  getAuths,
  initRouter,
  getTopMenu,
  addPathMatch,
  getHistoryMode,
  addAsyncRoutes,
  handleAliveRoute,
  formatTwoStageRoutes,
  formatFlatteningRoutes,
  useDetail
};

// 保持向后兼容的导出
export const ascending = RouteSort.ascending;
export const filterTree = RouteFilter.filterTree;
export const isOneOfArray = RouteUtil.isOneOfArray;
export const getParentPaths = RouteUtil.getParentPaths;
export const findRouteByPath = RouteUtil.findRouteByPath;
export const filterNoPermissionTree = RouteFilter.filterNoPermissionTree;
