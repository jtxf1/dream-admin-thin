<script setup lang="ts">
import { BatchActionsProps, BatchActionsEmits } from "./types";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";

const props = defineProps<BatchActionsProps>();
const emit = defineEmits<BatchActionsEmits>();

const handleBatchAction = (action: string) => {
  emit("batchAction", action);
};

const isDisabled = (action: any) => {
  if (typeof action.disabled === "function") {
    return action.disabled(props.selectedCount);
  }
  return false;
};

const getConfirmMessage = (action: any) => {
  if (typeof action.confirmMessage === "function") {
    return action.confirmMessage(props.selectedCount);
  }
  return `是否确认执行${action.label}操作？`;
};
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <template v-for="action in actions" :key="action.action">
      <el-button
        v-if="!action.confirm"
        :type="action.type"
        :icon="action.icon ? useRenderIcon(action.icon) : undefined"
        :disabled="isDisabled(action)"
        @click="handleBatchAction(action.action)"
      >
        {{ action.label }}
      </el-button>
      <el-popconfirm
        v-else
        :title="getConfirmMessage(action)"
        @confirm="handleBatchAction(action.action)"
      >
        <template #reference>
          <el-button
            :type="action.type"
            :icon="action.icon ? useRenderIcon(action.icon) : undefined"
            :disabled="isDisabled(action)"
          >
            {{ action.label }}
          </el-button>
        </template>
      </el-popconfirm>
    </template>
  </div>
</template>

<style scoped lang="scss">
/* 使用Tailwind工具类替代原有样式 */

/* 按钮样式已通过Element Plus默认样式实现 */
</style>
