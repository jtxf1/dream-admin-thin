import { defineComponent, ref, onMounted, onBeforeUnmount } from "vue";
import { getToken, formatToken } from "@/utils/auth";

export default defineComponent({
  name: "SseViewer",
  setup() {
    const messages = ref<string[]>([]);
    let eventSource: EventSource | null = null;

    onMounted(() => {
      const data = getToken();
      // 连接 SSE 服务端
      eventSource = new EventSource(
        "http://localhost:8888/auth/sse/objects?token=" +
          formatToken(data.accessToken)
      );

      // 默认的 message 事件
      eventSource.onmessage = (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data); // 如果后端传 JSON，就解析
          messages.value.push(`[message] ${data} (${data})`);
        } catch {
          messages.value.push(`[raw] ${e.data}`);
        }
      };

      // 如果服务端定义了 event: error
      eventSource.addEventListener("error", e => {
        eventSource.close();
        eventSource = null;
        messages.value.push("[error] 连接或消息错误", e.type);
      });

      // 自定义事件：比如 event: heartbeat
      eventSource.addEventListener("heartbeat", (e: MessageEvent) => {
        messages.value.push(`[heartbeat] ${e.data}`);
      });
    });

    onBeforeUnmount(() => {
      if (eventSource) {
        eventSource.close();
        eventSource = null;
      }
    });

    return () => (
      <div class="p-4">
        <h2 class="text-lg font-bold mb-2">SSE 消息订阅</h2>
        <ul class="space-y-1">
          {messages.value.map((msg, idx) => (
            <li key={idx} class="text-sm">
              {msg}
            </li>
          ))}
        </ul>
      </div>
    );
  }
});
