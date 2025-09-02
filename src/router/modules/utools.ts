import { $t } from "@/plugins/i18n";
import { menuoverflow } from "@/router/enums";

export default {
  path: "/utools",
  redirect: "/utools/403",
  meta: {
    icon: "ep:tools",
    showLink: true,
    title: $t("menus.webUtools"),
    rank: menuoverflow
  },
  children: [
    {
      path: "/editor1/index",
      name: "editor1",
      component: () => import("@/views/components/editor/index.vue"),
      meta: {
        title: $t("menus.editor")
      }
    },
    {
      path: "/formUpload",
      name: "FormUpload",
      component: () => import("@/views/maint/database/upload.vue"),
      meta: {
        title: $t("menus.formUpload")
      }
    },
    {
      path: "/line",
      name: "LineViewer",
      component: () => import("@/views/components/echarts/line.vue"),
      meta: {
        title: $t("menus.line")
      }
    },
    {
      path: "/sse",
      name: "SseViewer",
      component: () => import("@/views/components/sse"),
      meta: {
        title: $t("menus.sse")
      }
    },
    {
      path: "/editorCode/index",
      name: "editorCode",
      component: () => import("@/views/editor/index.vue"),
      meta: {
        title: $t("menus.editorCode")
      }
    },
    {
      path: "/components/echarts/gauge",
      name: "gauge",
      component: () => import("@/views/components/echarts/gauge.vue"),
      meta: {
        title: $t("menus.gauge")
      }
    },
    {
      path: "/error/403",
      name: "403",
      component: () => import("@/views/error/403.vue"),
      meta: {
        title: $t("menus.pureFourZeroOne")
      }
    },
    {
      path: "/error/404",
      name: "404",
      component: () => import("@/views/error/404.vue"),
      meta: {
        title: $t("menus.pureFourZeroFour")
      }
    },
    {
      path: "/error/500",
      name: "500",
      component: () => import("@/views/error/500.vue"),
      meta: {
        title: $t("menus.pureFive")
      }
    }
  ]
} satisfies RouteConfigsTable;
