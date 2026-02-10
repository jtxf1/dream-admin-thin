import { defineComponent, ref, onMounted, onBeforeUnmount } from "vue";
import { getToken, formatToken } from "@/utils/auth";
import { message } from "@/utils/message";

/**
 * SSE 消息订阅组件
 * 用于显示服务器发送事件（Server-Sent Events）的消息
 */
export default defineComponent({
  name: "SseViewer",
  setup() {
    /**
     * 消息列表
     */
    const messages = ref<string[]>([]);

    /**
     * EventSource 实例
     */
    let eventSource: EventSource | null = null;

    /**
     * 处理 SSE 消息事件
     * @param e - 消息事件
     */
    const handleMessageEvent = (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data); // 解析 JSON 数据
        messages.value.push(`[message] ${JSON.stringify(data)}`);
      } catch (error) {
        console.warn("解析 SSE 消息失败：", error);
        messages.value.push(`[raw] ${e.data}`);
      }
    };

    /**
     * 处理 SSE 错误事件
     * @param e - 错误事件
     */
    const handleErrorEvent = (e: Event) => {
      console.error("SSE 连接错误：", e);
      messages.value.push(`[error] 连接或消息错误: ${(e as any).type}`);
      message("SSE 连接失败", { type: "error" });

      // 关闭 EventSource 连接
      if (eventSource) {
        eventSource.close();
        eventSource = null;
      }
    };

    /**
     * 处理 SSE 心跳事件
     * @param e - 心跳事件
     */
    const handleHeartbeatEvent = (e: MessageEvent) => {
      messages.value.push(`[heartbeat] ${e.data}`);
    };

    /**
     * 连接 SSE 服务
     */
    const connectSse = () => {
      try {
        const tokenData = getToken();

        if (!tokenData?.accessToken) {
          console.error("获取 token 失败");
          message("获取认证信息失败", { type: "error" });
          messages.value.push("[error] 获取认证信息失败");
          return;
        }

        // 连接 SSE 服务端
        eventSource = new EventSource(
          "http://localhost:8888/auth/sse/objects?token=" +
            formatToken(tokenData.accessToken)
        );

        // 监听 message 事件
        eventSource.onmessage = handleMessageEvent;

        // 监听 error 事件
        eventSource.addEventListener("error", handleErrorEvent);

        // 监听 heartbeat 事件
        eventSource.addEventListener("heartbeat", handleHeartbeatEvent);

        console.log("SSE 连接已建立");
        messages.value.push("[info] SSE 连接已建立");
      } catch (error) {
        console.error("SSE 连接失败：", error);
        message("SSE 连接失败", { type: "error" });
        messages.value.push(`[error] 连接失败: ${(error as Error).message}`);
      }
    };

    // 组件挂载后连接 SSE
    onMounted(() => {
      connectSse();
    });

    // 组件卸载前清理资源
    onBeforeUnmount(() => {
      if (eventSource) {
        try {
          eventSource.close();
          eventSource = null;
          console.log("SSE 连接已关闭");
        } catch (error) {
          console.error("关闭 SSE 连接失败：", error);
        }
      }
    });

    return () => (
      <div class="sse-container p-4">
        <h2 class="text-lg font-bold mb-2">SSE 消息订阅</h2>
        <div class="messages-list">
          <ul class="space-y-1">
            {messages.value.map((msg, idx) => (
              <li key={idx} class="text-sm">
                {msg}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
});
