// 定义WebSocket状态枚举（TS类型约束）
export enum WsStatus {
  CONNECTING = 0, // 连接中
  OPEN = 1, // 已连接
  CLOSING = 2, // 关闭中
  CLOSED = 3 // 已关闭
}

// 定义回调函数类型
type MessageCallback = (data: string) => void;
type ErrorCallback = (error: Event) => void;
type StatusChangeCallback = (status: WsStatus) => void;

/**
 * Vue3 + TS WebSocket 工具类
 * 适配服务端地址：ws://localhost:8080/ws/{userId}
 */
class WebSocketClient {
  private ws: WebSocket | null = null;
  private userId: string = "";
  // 重连相关配置
  private reconnectTimer: NodeJS.Timeout | null = null;
  private reconnectInterval: number = 3000; // 重连间隔3秒
  private maxReconnectTimes: number = 5; // 最大重连次数
  private reconnectCount: number = 0; // 当前重连次数

  // 回调函数
  private onMessage: MessageCallback | null = null;
  private onError: ErrorCallback | null = null;
  private onStatusChange: StatusChangeCallback | null = null;

  // Promise相关
  private connectPromiseResolve: ((value: WebSocketClient) => void) | null =
    null;
  private connectPromiseReject: ((reason: any) => void) | null = null;
  private messageListeners: Array<(data: string) => void> = [];

  /**
   * 初始化WebSocket连接
   * @param userId 用户ID
   * @param baseUrl 可选，自定义WS基础地址
   * @returns Promise<WebSocketClient> 连接成功后的客户端实例
   */
  connect(userId: string, baseUrl?: string): Promise<WebSocketClient> {
    return new Promise((resolve, reject) => {
      if (this.ws) {
        this.disconnect(); // 关闭已有连接
      }

      this.userId = userId;
      this.connectPromiseResolve = resolve;
      this.connectPromiseReject = reject;

      // 使用配置文件中的WebSocket地址或传入的baseUrl
      const wsBaseUrl =
        baseUrl || import.meta.env.VITE_APP_WS_API || "ws://localhost:8888";
      const fullUrl = `${wsBaseUrl}/ws/${userId}`;

      try {
        this.ws = new WebSocket(fullUrl);

        // 类型断言确保TS类型安全
        const ws = this.ws as WebSocket;

        // 连接成功
        ws.onopen = () => {
          console.log(`[WS] 用户${userId}连接成功`);
          this.reconnectCount = 0; // 重置重连次数
          this.notifyStatusChange(WsStatus.OPEN);
          if (this.connectPromiseResolve) {
            this.connectPromiseResolve(this);
          }
        };

        // 接收消息
        ws.onmessage = (event: MessageEvent) => {
          const data = event.data;
          if (this.onMessage) {
            this.onMessage(data);
          }
          // 通知所有消息监听器
          this.messageListeners.forEach(listener => listener(data));
        };

        // 连接错误
        ws.onerror = (error: Event) => {
          console.error(`[WS] 连接错误`, error);
          this.notifyStatusChange(WsStatus.CLOSED);
          if (this.onError) {
            this.onError(error);
          }
          if (this.connectPromiseReject) {
            this.connectPromiseReject(error);
          }
          this.tryReconnect(); // 尝试重连
        };

        // 连接关闭
        ws.onclose = () => {
          console.log(`[WS] 用户${userId}连接关闭`);
          this.notifyStatusChange(WsStatus.CLOSED);
          this.tryReconnect(); // 尝试重连
        };

        // 连接中状态
        this.notifyStatusChange(WsStatus.CONNECTING);
      } catch (error) {
        console.error(`[WS] 创建连接失败`, error);
        this.notifyStatusChange(WsStatus.CLOSED);
        if (this.connectPromiseReject) {
          this.connectPromiseReject(error);
        }
      }
    });
  }

  /**
   * 发送消息
   * @param message 要发送的消息内容
   * @returns Promise<boolean> 是否发送成功
   */
  send(message: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WsStatus.OPEN) {
        const error = new Error("[WS] 连接未建立，无法发送消息");
        console.error(error.message);
        reject(error);
        return;
      }
      try {
        this.ws.send(message);
        console.log(`[WS] 发送消息：${message}`);
        resolve(true);
      } catch (error) {
        console.error("[WS] 发送消息失败", error);
        reject(error);
      }
    });
  }

  /**
   * 等待接收下一条消息
   * @param timeout 可选，超时时间（毫秒）
   * @returns Promise<string> 接收到的消息
   */
  waitForMessage(timeout: number = 30000): Promise<string> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error("[WS] 等待消息超时"));
      }, timeout);

      const listener = (data: string) => {
        clearTimeout(timeoutId);
        this.messageListeners = this.messageListeners.filter(
          l => l !== listener
        );
        resolve(data);
      };

      this.messageListeners.push(listener);
    });
  }

  /**
   * 断开连接
   */
  disconnect(): void {
    // 清除重连定时器
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    // 关闭WS连接
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    // 重置Promise相关
    this.connectPromiseResolve = null;
    this.connectPromiseReject = null;
    this.messageListeners = [];
    this.notifyStatusChange(WsStatus.CLOSED);
  }

  /**
   * 尝试重连
   */
  private tryReconnect(): void {
    // 超过最大重连次数则停止
    if (this.reconnectCount >= this.maxReconnectTimes) {
      console.error(`[WS] 已尝试${this.maxReconnectTimes}次重连，停止重连`);
      return;
    }

    this.reconnectCount++;
    console.log(`[WS] 第${this.reconnectCount}次重连...`);

    this.reconnectTimer = setTimeout(() => {
      this.connect(this.userId).catch(error => {
        console.error(`[WS] 重连失败`, error);
      });
    }, this.reconnectInterval);
  }

  /**
   * 通知状态变化
   * @param status 当前WS状态
   */
  private notifyStatusChange(status: WsStatus): void {
    if (this.onStatusChange) {
      this.onStatusChange(status);
    }
  }

  // 注册消息接收回调
  onMessageCallback(callback: MessageCallback): void {
    this.onMessage = callback;
  }

  // 注册错误回调
  onErrorCallback(callback: ErrorCallback): void {
    this.onError = callback;
  }

  // 注册状态变化回调
  onStatusChangeCallback(callback: StatusChangeCallback): void {
    this.onStatusChange = callback;
  }

  /**
   * 获取当前连接状态
   * @returns WsStatus 当前状态
   */
  getStatus(): WsStatus {
    if (!this.ws) {
      return WsStatus.CLOSED;
    }
    return this.ws.readyState as WsStatus;
  }

  /**
   * 检查连接是否打开
   * @returns boolean 连接是否打开
   */
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WsStatus.OPEN;
  }
}

// 导出单例实例（全局复用）
export const wsClient = new WebSocketClient();
