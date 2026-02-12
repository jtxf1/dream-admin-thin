import { ref, readonly } from "vue";
// types/sse.ts
export interface SSEMessage {
  data: string;
  event?: string;
  id?: string;
}

export type SSEEventCallback = (message: SSEMessage) => void;

export interface SSEOptions extends RequestInit {
  onMessage?: SSEEventCallback; // 监听所有消息
  onError?: (error: any) => void;
  onOpen?: () => void;
  eventHandlers?: Record<string, SSEEventCallback>; // 按事件名区分
}

/**
 * 测试 SSE 客户端功能
 * 用于验证 SSE 连接和数据接收是否正常
 */
export function testSSEClient() {
  console.log("=== SSE 客户端测试开始 ===");

  const { connect, close, eventSource, readyState } = useEventSource();

  const receivedMessages = 0;
  const expectedMessages = 3;

  console.log("创建 SSE 实例成功");
  console.log("初始 readyState:", readyState.value);

  // 模拟 SSE 消息解析测试
  const testBuffer = `data: 第一条消息\n\ndata: 第二条消息\n\ndata: 第三条消息\n\n`;
  console.log("测试缓冲区内容:", JSON.stringify(testBuffer));

  // 手动测试消息解析逻辑
  function testParseBuffer(buffer: string) {
    console.log("=== 开始测试消息解析 ===");
    const lines = buffer.split("\n");
    let currentMessage: Partial<SSEMessage> = {};
    let messageCount = 0;

    for (const line of lines) {
      const trimmedLine = line.trim();

      if (line.startsWith("#")) {
        continue;
      }

      if (trimmedLine === "") {
        if (currentMessage.data !== undefined) {
          messageCount++;
          console.log(`解析到测试消息 ${messageCount}:`, currentMessage.data);
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

      if (field === "data") {
        currentMessage.data =
          (currentMessage.data || "") +
          (currentMessage.data ? "\n" : "") +
          value;
      }
    }

    console.log(`测试解析完成，共解析 ${messageCount} 条消息`);
    return messageCount;
  }

  // 运行解析测试
  const parsedCount = testParseBuffer(testBuffer);
  console.log(`解析测试结果: ${parsedCount} 条消息`);

  if (parsedCount === expectedMessages) {
    console.log("✅ 消息解析测试通过");
  } else {
    console.log("❌ 消息解析测试失败");
  }

  console.log("=== SSE 客户端测试结束 ===");
  return {
    connect,
    close,
    eventSource,
    readyState,
    receivedMessages
  };
}

export function useEventSource() {
  const eventSourceRef = ref<SSEMessage | null>(null);
  const readyState = ref<number>(0); // 0:CONNECTING, 1:OPEN, 2:CLOSED
  const error = ref<any>(null);

  let controller: AbortController | null = null;
  let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
  let buffer = ""; // 用于处理不完整的行

  const close = () => {
    reader?.cancel();
    controller?.abort();
    reader = null;
    controller = null;
    readyState.value = 2;
  };

  const connect = async (url: string, options: SSEOptions = {}) => {
    close(); // 先关闭已有连接

    controller = new AbortController();
    const { onMessage, onError, onOpen, eventHandlers, ...fetchOptions } =
      options;

    // 重置缓冲区
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

      console.log(`SSE 响应状态: ${response.status}`);
      console.log(
        `SSE 响应头 Content-Type: ${response.headers.get("Content-Type")}`
      );
      console.log(
        `SSE 响应头 Transfer-Encoding: ${response.headers.get("Transfer-Encoding")}`
      );
      console.log(
        `SSE 响应头 Connection: ${response.headers.get("Connection")}`
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
      let totalBytesReceived = 0;

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

    // 解析缓冲区中的 SSE 消息
    function parseSSEBuffer() {
      console.log(`SSE 开始解析缓冲区，长度: ${buffer.length}`);
      console.log(`SSE 缓冲区内容: ${JSON.stringify(buffer)}`);

      const lines = buffer.split("\n");
      console.log(`SSE 分割后行数: ${lines.length}`);

      buffer = lines.pop() || ""; // 最后一行可能不完整，保留到下一次
      console.log(`SSE 保留到缓冲区的内容: ${JSON.stringify(buffer)}`);

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

  return {
    eventSource: readonly(eventSourceRef),
    readyState: readonly(readyState),
    error: readonly(error),
    connect,
    close
  };
}
