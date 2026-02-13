import { ref, readonly } from "vue";
import { useSSEStore } from "@/store/modules/sse";

/**
 * SSE 消息接口
 * 定义了从服务器接收的消息格式
 */
export interface SSEMessage {
  /** 消息数据内容 */
  data: string;
  /** 消息事件类型（可选） */
  event?: string;
  /** 消息ID（可选），用于重连时恢复 */
  id?: string;
}

/**
 * SSE 事件回调类型
 * 用于处理接收到的 SSE 消息
 */
export type SSEEventCallback = (message: SSEMessage) => void;

/**
 * SSE 配置选项
 * 扩展自 RequestInit 接口，添加了 SSE 特定的回调函数
 */
export interface SSEOptions extends RequestInit {
  /** 消息接收回调 */
  onMessage?: SSEEventCallback;
  /** 错误处理回调 */
  onError?: (error: any) => void;
  /** 连接建立回调 */
  onOpen?: () => void;
  /** 按事件名区分的回调函数 */
  eventHandlers?: Record<string, SSEEventCallback>;
}

/**
 * 创建 SSE 客户端实例
 * @returns SSE 客户端实例，包含连接管理和事件监听功能
 * @example
 * ```typescript
 * const { connect, close, eventSource, readyState } = useEventSource();
 *
 * // 连接到 SSE 服务器
 * await connect('/api/sse', {
 *   onMessage: (message) => console.log('收到消息:', message),
 *   onOpen: () => console.log('连接已打开'),
 *   onError: (error) => console.error('错误:', error)
 * });
 *
 * // 关闭连接
 * // close();
 * ```
 */
export function useEventSource() {
  /** 最新接收到的 SSE 消息 */
  const eventSourceRef = ref<SSEMessage | null>(null);

  /**
   * 连接状态
   * 0: CONNECTING - 正在连接
   * 1: OPEN - 连接已打开
   * 2: CLOSED - 连接已关闭
   */
  const readyState = ref<number>(0);

  /** 错误信息 */
  const error = ref<any>(null);

  /** 中止控制器，用于取消 SSE 连接 */
  let controller: AbortController | null = null;

  /** 读取器，用于读取响应流 */
  let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;

  /** 缓冲区，用于处理不完整的消息行 */
  let buffer = "";

  /**
   * 关闭 SSE 连接
   * 取消读取器，中止控制器，并重置状态
   */
  const close = () => {
    reader?.cancel();
    controller?.abort();
    reader = null;
    controller = null;
    readyState.value = 2;
  };

  /**
   * 连接到 SSE 服务器
   * @param url SSE 服务器地址
   * @param options SSE 配置选项
   * @returns Promise<void>
   * @throws 当连接失败或响应不符合 SSE 规范时抛出错误
   */
  const connect = async (url: string, options: SSEOptions = {}) => {
    close();

    controller = new AbortController();

    const { onMessage, onError, onOpen, eventHandlers, ...fetchOptions } =
      options;

    buffer = "";

    try {
      readyState.value = 0;

      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
        headers: {
          Accept: "text/event-stream",
          "Cache-Control": "no-cache",
          "Accept-Encoding": "identity",
          Connection: "keep-alive",
          ...fetchOptions.headers
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get("Content-Type");
      if (!contentType || !contentType.includes("text/event-stream")) {
        throw new Error(`非 SSE 响应，Content-Type: ${contentType}`);
      }

      if (!response.body) {
        throw new Error("Response body is null");
      }

      readyState.value = 1;
      onOpen?.();

      reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        try {
          const { done, value } = await reader.read();
          if (done) {
            if (buffer.length > 0) {
              parseSSEBuffer();
            }
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          parseSSEBuffer();
        } catch (readError) {
          if (readError.name !== "AbortError") {
            onError?.(readError);
          }
          break;
        }
      }
    } catch (err: any) {
      if (err.name === "AbortError") {
      } else {
        error.value = err;
        onError?.(err);
      }
    } finally {
      readyState.value = 2;
    }

    /**
     * 解析缓冲区中的 SSE 消息
     * 按照 SSE 规范解析消息流，处理消息边界和字段
     * @private
     */
    function parseSSEBuffer() {
      const sseStore = useSSEStore();

      const lines = buffer.split("\n");

      sseStore.updateBuffer(buffer);

      const parsedData = processBufferToJson(buffer, sseStore.removeChars);
      sseStore.updateSSEData(buffer, parsedData);

      buffer = lines.pop() || "";

      let currentMessage: Partial<SSEMessage> = {};

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        const trimmedLine = line.trim();

        if (line.startsWith("#")) {
          continue;
        }

        if (trimmedLine === "") {
          if (currentMessage.data !== undefined) {
            const message: SSEMessage = {
              data: currentMessage.data,
              event: currentMessage.event,
              id: currentMessage.id
            };

            eventSourceRef.value = message;
            onMessage?.(message);
            if (message.event && eventHandlers?.[message.event]) {
              eventHandlers[message.event](message);
            }
            currentMessage = {};
          }
          continue;
        }

        const colonIdx = line.indexOf(":");
        if (colonIdx === -1) {
          currentMessage.event = line;
          continue;
        }

        const field = line.slice(0, colonIdx);
        let value = line.slice(colonIdx + 1);
        if (value.startsWith(" ")) {
          value = value.slice(1);
        }

        switch (field) {
          case "data":
            currentMessage.data =
              (currentMessage.data || "") +
              (currentMessage.data ? "\n" : "") +
              value;
            break;
          case "event":
            currentMessage.event = value;
            break;
          case "id":
            currentMessage.id = value;
            break;
          case "retry":
            break;
          default:
            break;
        }
      }
    }
  };

  /**
   * 处理 Buffer 字符串：去除指定字符 → 按"data:分割 → 返回数组
   * @param buffer - 原始 Buffer 数据
   * @param removeChars - 需要去除的指定字符（数组形式，支持多个）
   * @returns 处理后的数组，包含分割后的数据片段
   */
  function processBufferToJson(
    bufferStr: string,
    removeChars: string[] = ["\n", "\r", " ", "\t"]
  ): unknown[] {
    try {
      removeChars.forEach(char => {
        const escapedChar = char.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        bufferStr = bufferStr.replace(new RegExp(escapedChar, "g"), "");
      });

      const splitArray = bufferStr
        .split('"data:"')
        .filter(item => item.trim() !== "");

      const resultArray = splitArray.map(item => {
        try {
          return JSON.parse(item);
        } catch {
          return item;
        }
      });

      return resultArray;
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : "未知错误";
      return [
        {
          success: false,
          error: `处理失败：${errMsg}`
        }
      ];
    }
  }

  /**
   * 返回 SSE 客户端实例
   * 包含状态管理和连接控制方法
   */
  return {
    /**
     * 最新接收到的 SSE 消息（只读）
     * 当接收到新消息时会自动更新
     */
    eventSource: readonly(eventSourceRef),

    /**
     * 连接状态（只读）
     * 0: CONNECTING - 正在连接
     * 1: OPEN - 连接已打开
     * 2: CLOSED - 连接已关闭
     */
    readyState: readonly(readyState),

    /**
     * 错误信息（只读）
     * 当发生错误时会自动更新
     */
    error: readonly(error),

    /**
     * 连接到 SSE 服务器的方法
     */
    connect,

    /**
     * 关闭 SSE 连接的方法
     */
    close
  };
}
