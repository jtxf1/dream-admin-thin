import { $t } from "@/plugins/i18n";
import { home } from "@/router/enums";

export default {
  path: "/system/user/info",
  meta: {
    icon: "homeFilled",
    title: $t("buttons.userInfo"),
    rank: home
  },
  children: [
    {
      path: "/system/user/info",
      name: "UserInfo",
      component: () => import("@/views/system/user/info.vue"),
      meta: {
        title: $t("buttons.userInfo"),
        showLink: false
      }
    }
  ]
} satisfies RouteConfigsTable;
