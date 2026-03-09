<template>
  <el-config-provider :locale="currentLocale">
    <router-view />
    <ReDialog />
    <ReGlobalLoading />
  </el-config-provider>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { ElConfigProvider } from "element-plus";
import { ReDialog } from "@/components/ReDialog";
import ReGlobalLoading from "@/components/ReGlobalLoading/src/index.vue";
import en from "element-plus/es/locale/lang/en";
import zhCn from "element-plus/es/locale/lang/zh-cn";

export default defineComponent({
  name: "app",
  components: {
    [ElConfigProvider.name]: ElConfigProvider,
    ReDialog,
    ReGlobalLoading
  },
  computed: {
    currentLocale() {
      return this.$storage.locale?.locale === "zh" ? zhCn : en;
    }
  }
});
</script>
