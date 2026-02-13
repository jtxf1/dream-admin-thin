import { defineStore } from "pinia";

/**
 * SSE 数据接口
 * 定义了处理后的 SSE 数据格式
 */
export interface SSEData {
  /** 原始数据 */
  rawData: string;
  /** 解析后的数据数组 */
  parsedData: unknown[];
  /** 更新时间 */
  timestamp: number;
}

/**
 * SSE Store
 * 用于管理 SSE 数据状态
 */
export const useSSEStore = defineStore("sse", {
  state: () => ({
    /** SSE 缓冲区数据 */
    buffer: "",
    /** 处理后的 SSE 数据 */
    sseData: null as SSEData | null,
    /** 去除的字符列表 */
    removeChars: ["\n", "\r", '"\\n\\n"'] as string[],
    /** 是否正在连接 */
    isConnected: false
  }),

  getters: {
    /** 获取最新的解析数据 */
    latestParsedData: state => state.sseData?.parsedData || [],
    /** 获取原始数据 */
    latestRawData: state => state.sseData?.rawData || "",
    /** 最后更新时间 */
    lastUpdateTime: state => state.sseData?.timestamp || 0
  },

  actions: {
    /**
     * 更新缓冲区数据
     * @param buffer - 新的缓冲区数据
     */
    updateBuffer(buffer: string) {
      this.buffer = buffer;
    },

    /**
     * 更新 SSE 数据
     * @param rawData - 原始数据
     * @param parsedData - 解析后的数据
     */
    updateSSEData(rawData: string, parsedData: unknown[]) {
      this.sseData = {
        rawData,
        parsedData,
        timestamp: Date.now()
      };
    },

    /**
     * 设置连接状态
     * @param connected - 是否已连接
     */
    setConnectionStatus(connected: boolean) {
      this.isConnected = connected;
    },

    /**
     * 更新去除字符列表
     * @param chars - 新的字符列表
     */
    updateRemoveChars(chars: string[]) {
      this.removeChars = chars;
    },

    /**
     * 清空 SSE 数据
     */
    clearSSEData() {
      this.sseData = null;
      this.buffer = "";
    }
  }
});
