import { getPluginsList } from "./build/plugins";
import { include, exclude } from "./build/optimize";
import { type UserConfigExport, type ConfigEnv, loadEnv } from "vite";
import {
  root,
  alias,
  wrapperEnv,
  pathResolve,
  __APP_INFO__
} from "./build/utils";

export default ({ mode }: ConfigEnv): UserConfigExport => {
  const {
    VITE_CDN,
    VITE_PORT,
    VITE_COMPRESSION,
    VITE_PUBLIC_PATH,
    VITE_APP_BASE_API,
    VITE_APP_WS_API
  } = wrapperEnv(loadEnv(mode, root));
  return {
    base: VITE_PUBLIC_PATH,
    root,
    resolve: {
      alias
    },
    // 服务端渲染
    server: {
      // 端口号
      port: VITE_PORT,
      host: "0.0.0.0",
      cors: true,
      // 本地跨域代理 https://cn.vitejs.dev/config/server-options.html#server-proxy
      proxy: {
        "/api": {
          // 这里填写后端地址
          target: VITE_APP_BASE_API + "api",
          changeOrigin: true,
          rewrite: path => path.replace(/^\/api/, "")
        },
        "/auth/sse": {
          // 这里填写后端地址
          target: VITE_APP_BASE_API + "auth/sse",
          changeOrigin: true,
          configure: proxy => {
            // 请求事件：禁用请求压缩
            proxy.on("proxyReq", proxyReq => {
              proxyReq.setHeader("Accept-Encoding", "identity"); // 禁用压缩
              proxyReq.setHeader("Cache-Control", "no-cache"); // 禁用缓存
            });
            // 响应事件：处理 SSE 响应
            proxy.on("proxyRes", (proxyRes, req, res) => {
              // 检查是否为 SSE 响应
              const contentType = proxyRes.headers["content-type"];
              if (contentType && contentType.includes("text/event-stream")) {
                // 禁用响应压缩，保留 SSE 原始响应头
                res.setHeader("Content-Encoding", "identity");
                res.setHeader("Cache-Control", "no-cache");
                res.setHeader("Connection", "keep-alive"); // 保持长连接
                res.setHeader("X-Accel-Buffering", "no"); // 禁用 Nginx 缓冲
              }
            });
          },
          rewrite: path => path.replace(/^\/auth\/sse/, "")
        },
        "/auth": {
          // 这里填写后端地址
          target: VITE_APP_BASE_API + "auth",
          changeOrigin: true,
          rewrite: path => path.replace(/^\/auth/, "")
        },
        "/avatar": {
          // 这里填写后端地址
          target: VITE_APP_BASE_API + "avatar",
          changeOrigin: true,
          rewrite: path => path.replace(/^\/avatar/, "")
        },
        "/file": {
          // 这里填写后端地址
          target: VITE_APP_BASE_API + "file",
          changeOrigin: true,
          rewrite: path => path.replace(/^\/file/, "")
        },
        "/ws": {
          // 这里填写后端地址
          target: VITE_APP_WS_API,
          changeOrigin: true,
          ws: true,
          rewrite: path => path.replace(/^\/ws/, "")
        },
        "/hello": {
          // 这里填写后端地址
          target: "https://free.picui.cn",
          changeOrigin: true,
          secure: false,
          rewrite: path => path.replace(/^\/hello/, "")
        }
      },
      // 预热文件以提前转换和缓存结果，降低启动期间的初始页面加载时长并防止转换瀑布
      warmup: {
        clientFiles: ["./index.html", "./src/{views,components}/*"]
      }
    },
    plugins: getPluginsList(VITE_CDN, VITE_COMPRESSION),
    // https://cn.vitejs.dev/config/dep-optimization-options.html#dep-optimization-options
    optimizeDeps: {
      include,
      exclude
    },
    build: {
      // https://cn.vitejs.dev/guide/build.html#browser-compatibility
      target: "es2015",
      sourcemap: false,
      // 消除打包大小超过500kb警告
      chunkSizeWarningLimit: 4000,
      rollupOptions: {
        input: {
          index: pathResolve("./index.html", import.meta.url)
        },
        // 静态资源分类打包
        output: {
          chunkFileNames: "static/js/[name]-[hash].js",
          entryFileNames: "static/js/[name]-[hash].js",
          assetFileNames: "static/[ext]/[name]-[hash].[ext]"
        }
      }
    },
    define: {
      __INTLIFY_PROD_DEVTOOLS__: false,
      __APP_INFO__: JSON.stringify(__APP_INFO__)
    }
  };
};
