<script setup lang="ts">
import { ExportProps, ExportEmits } from "./types";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";

const props = withDefaults(defineProps<ExportProps>(), {
  loading: false,
  formats: () => [
    { label: "Excel", value: "excel" },
    { label: "CSV", value: "csv" },
    { label: "PDF", value: "pdf" }
  ],
  errorHandlerConfig: () => ({})
});

const emit = defineEmits<ExportEmits>();

const handleExport = (format: string) => {
  emit("export", format);
};
</script>

<template>
  <el-dropdown trigger="click">
    <el-button
      type="info"
      :icon="useRenderIcon('solar:upload-bold')"
      :loading="loading"
    >
      导出数据
    </el-button>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item
          v-for="format in formats"
          :key="format.value"
          @click="handleExport(format.value)"
        >
          {{ format.label }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<style scoped lang="scss">
/* 使用Tailwind工具类替代原有样式 */

/* 按钮样式已通过Element Plus默认样式实现 */
</style>
