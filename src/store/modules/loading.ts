import { defineStore } from "pinia";

interface LoadingState {
  // 全局加载状态
  global: boolean;
  // 局部加载状态
  local: Record<string, boolean>;
  // 全屏加载状态
  fullscreen: boolean;
}

export const useLoadingStore = defineStore("loading", {
  state: (): LoadingState => ({
    global: false,
    local: {},
    fullscreen: false
  }),
  getters: {
    /**
     * 获取全局加载状态
     */
    isGlobalLoading: state => state.global,

    /**
     * 获取局部加载状态
     */
    isLocalLoading: state => (key: string) => state.local[key] || false,

    /**
     * 获取全屏加载状态
     */
    isFullscreenLoading: state => state.fullscreen
  },
  actions: {
    /**
     * 设置全局加载状态
     */
    setGlobalLoading(loading: boolean) {
      this.global = loading;
    },

    /**
     * 设置局部加载状态
     */
    setLocalLoading(key: string, loading: boolean) {
      this.local[key] = loading;
    },

    /**
     * 清除局部加载状态
     */
    clearLocalLoading(key: string) {
      delete this.local[key];
    },

    /**
     * 清除所有局部加载状态
     */
    clearAllLocalLoading() {
      this.local = {};
    },

    /**
     * 设置全屏加载状态
     */
    setFullscreenLoading(loading: boolean) {
      this.fullscreen = loading;
    }
  }
});
