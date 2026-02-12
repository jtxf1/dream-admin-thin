import { ref, readonly } from "vue";

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
    // 取消读取器，释放资源
    reader?.cancel();
    // 中止控制器，停止网络请求
    controller?.abort();
    // 重置引用
    reader = null;
    controller = null;
    // 更新连接状态为已关闭
    readyState.value = 2;
  };

  let totalBytesReceived = 0;

  /**
   * 连接到 SSE 服务器
   * @param url SSE 服务器地址
   * @param options SSE 配置选项
   * @returns Promise<void>
   * @throws 当连接失败或响应不符合 SSE 规范时抛出错误
   */
  const connect = async (url: string, options: SSEOptions = {}) => {
    // 先关闭已有连接，确保资源释放
    close();

    // 创建新的中止控制器
    controller = new AbortController();

    // 提取 SSE 特定的回调函数，剩余的作为 fetch 选项
    const { onMessage, onError, onOpen, eventHandlers, ...fetchOptions } =
      options;

    // 重置缓冲区，准备接收新数据
    buffer = "";

    try {
      readyState.value = 0;
      console.log(`SSE 开始连接到: ${url}`);

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

      console.log(
        `SSE 响应状态: ${response.status} , SSE 响应头 Content-Type: ${response.headers.get("Content-Type")} ,SSE 响应头 Transfer-Encoding: ${response.headers.get("Transfer-Encoding")} , SSE 响应头 Connection: ${response.headers.get("Connection")}`
      );

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

      console.log("SSE 连接成功，开始接收数据");

      readyState.value = 1;
      onOpen?.();

      reader = response.body.getReader();
      const decoder = new TextDecoder();

      // 循环读取流
      while (true) {
        try {
          const { done, value } = await reader.read();
          if (done) {
            console.log("SSE 连接已关闭");
            // 处理缓冲区中剩余的数据
            if (buffer.length > 0) {
              console.log(`SSE 处理剩余缓冲区数据: ${buffer.length} 字符`);
              parseSSEBuffer();
            }
            break;
          }

          totalBytesReceived += value.length;
          console.log(
            `SSE 接收到数据: ${value.length} 字节，累计: ${totalBytesReceived} 字节`
          );

          buffer += decoder.decode(value, { stream: true });
          console.log(`SSE 缓冲区内容: ${JSON.stringify(buffer)}`);
          parseSSEBuffer();
        } catch (readError) {
          console.error("SSE 数据读取错误:", readError);
          if (readError.name !== "AbortError") {
            onError?.(readError);
          }
          break;
        }
      }
    } catch (err: any) {
      if (err.name === "AbortError") {
        // 主动中止，不触发错误回调
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
      // 按换行符分割缓冲区内容
      const lines = buffer.split("\n");
      console.log(
        `SSE 开始解析缓冲区，长度: ${buffer.length}  ,SSE 分割后行数: ${lines.length}`
      );
      //console.log(`SSE 缓冲区内容: ${buffer}`);

      console.log(
        `SSE 格式化内容: ${processBufferToJson(buffer, ["\n", "\r", '"\\n\\n"'])}`
      );

      // 弹出最后一行，因为可能不完整，保留到下一次解析
      buffer = lines.pop() || ""; // 最后一行可能不完整，保留到下一次

      let currentMessage: Partial<SSEMessage> = {};
      let messageCount = 0;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        console.log(`SSE 处理第 ${i + 1} 行: ${JSON.stringify(line)}`);

        const trimmedLine = line.trim();

        // 跳过注释行
        if (line.startsWith("#")) {
          console.log(`SSE 跳过注释行: ${line}`);
          continue;
        }

        // 空行表示消息结束
        if (trimmedLine === "") {
          console.log(`SSE 遇到消息结束标记`);
          if (currentMessage.data !== undefined) {
            // 确保消息对象完整
            const message: SSEMessage = {
              data: currentMessage.data,
              event: currentMessage.event,
              id: currentMessage.id
            };

            messageCount++;
            console.log(`SSE 解析到消息 ${messageCount}:`, message);

            // 触发事件
            eventSourceRef.value = message;
            console.log(`SSE 触发 onMessage 回调`);
            onMessage?.(message);
            if (message.event && eventHandlers?.[message.event]) {
              console.log(`SSE 触发事件 ${message.event} 回调`);
              eventHandlers[message.event](message);
            }
            currentMessage = {};
          }
          continue;
        }

        const colonIdx = line.indexOf(":");
        if (colonIdx === -1) {
          // 处理没有冒号的行（可能是事件名）
          console.log(`SSE 处理无冒号行作为事件名: ${line}`);
          currentMessage.event = line;
          continue;
        }

        const field = line.slice(0, colonIdx);
        let value = line.slice(colonIdx + 1);
        if (value.startsWith(" ")) {
          value = value.slice(1); // 去掉开头的空格
          console.log(`SSE 去掉值开头空格: ${value}`);
        }

        console.log(`SSE 解析字段: ${field} = ${JSON.stringify(value)}`);

        switch (field) {
          case "data":
            currentMessage.data =
              (currentMessage.data || "") +
              (currentMessage.data ? "\n" : "") +
              value;
            console.log(
              `SSE 更新 data 字段: ${JSON.stringify(currentMessage.data)}`
            );
            break;
          case "event":
            currentMessage.event = value;
            console.log(`SSE 更新 event 字段: ${value}`);
            break;
          case "id":
            currentMessage.id = value;
            console.log(`SSE 更新 id 字段: ${value}`);
            break;
          case "retry":
            // 可解析 retry 字段，这里暂不处理
            console.log(`SSE 忽略 retry 字段: ${value}`);
            break;
          default:
            // 忽略其他字段
            console.log(`SSE 忽略未知字段: ${field}`);
            break;
        }
      }

      console.log(`SSE 解析完成，共解析 ${messageCount} 条消息`);
    }
  };

  /**
   * 处理 Buffer 字符串：去除指定字符 → 按"data:分割 → 格式化为JSON
   * @param buffer - 原始 Buffer 数据
   * @param removeChars - 需要去除的指定字符（数组形式，支持多个）
   * @returns 格式化后的 JSON 字符串 | 错误信息
   */
  function processBufferToJson(
    bufferStr: string,
    removeChars: string[] = ["\n", "\r", " ", "\t"] // 默认去除换行、回车、空格、制表符
  ): string {
    try {
      // 步骤2：去除指定字符（循环替换所有需要移除的字符）
      removeChars.forEach(char => {
        // 转义特殊字符（比如 $、^、* 等），避免正则匹配异常
        const escapedChar = char.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        bufferStr = bufferStr.replace(new RegExp(escapedChar, "g"), "");
      });

      // 步骤3：按 "\"data:" 分割成数组（注意转义双引号）
      // 过滤空字符串，避免数组包含无效元素
      const splitArray = bufferStr
        .split('"data:"')
        .filter(item => item.trim() !== "");

      // 步骤4：格式化数组为 JSON（带缩进，可读性更高）
      const jsonResult = JSON.stringify(splitArray, null, 2);

      return jsonResult;
    } catch (error) {
      // 异常处理：捕获分割/JSON 格式化错误
      const errMsg = error instanceof Error ? error.message : "未知错误";
      return JSON.stringify(
        {
          success: false,
          error: `处理失败：${errMsg}`
        },
        null,
        2
      );
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
