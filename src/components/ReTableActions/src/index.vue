<script setup lang="ts">
import { TableActionsProps, TableActionsEmits } from "./types";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";

const props = withDefaults(defineProps<TableActionsProps>(), {
  loading: false
});

const emit = defineEmits<TableActionsEmits>();

const handleAction = (action: string) => {
  emit("action", action);
};

const isDisabled = (action: any) => {
  if (typeof action.disabled === "function") {
    return action.disabled(props.selectedCount);
  }
  return false;
};
</script>

<template>
  <div class="flex mr-4 space-x-2">
    <el-button
      v-for="action in actions"
      :key="action.action"
      :type="action.type"
      :icon="action.icon ? useRenderIcon(action.icon) : undefined"
      :disabled="isDisabled(action)"
      :loading="loading"
      size="small"
      @click="handleAction(action.action)"
    >
      {{ action.label }}
    </el-button>
  </div>
</template>

<style scoped lang="scss">
/* 使用Tailwind工具类替代原有样式 */

/* 按钮样式已通过Element Plus默认样式实现 */
</style>
