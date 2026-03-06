<script setup lang="ts">
import { TableOperationProps, TableOperationEmits } from "./types";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";

const props = withDefaults(defineProps<TableOperationProps>(), {
  size: "default"
});

const emit = defineEmits<TableOperationEmits>();

const handleOperation = (action: string, row: any) => {
  emit("operation", action, row);
};

const isVisible = (operation: any) => {
  if (typeof operation.visible === "function") {
    return operation.visible(props.row);
  }
  return true;
};

const getConfirmMessage = (operation: any) => {
  if (typeof operation.confirmMessage === "function") {
    return operation.confirmMessage(props.row);
  }
  return `是否确认执行${operation.label}操作？`;
};
</script>

<template>
  <div class="flex items-center">
    <template v-for="operation in operations" :key="operation.action">
      <el-button
        v-if="isVisible(operation) && !operation.confirm"
        class="reset-margin"
        link
        :type="operation.type"
        :size="size"
        :icon="operation.icon ? useRenderIcon(operation.icon) : undefined"
        @click="handleOperation(operation.action, row)"
      >
        {{ operation.label }}
      </el-button>
      <el-popconfirm
        v-else-if="isVisible(operation) && operation.confirm"
        :title="getConfirmMessage(operation)"
        @confirm="handleOperation(operation.action, row)"
      >
        <template #reference>
          <el-button
            class="reset-margin"
            link
            :type="operation.type"
            :size="size"
            :icon="operation.icon ? useRenderIcon(operation.icon) : undefined"
          >
            {{ operation.label }}
          </el-button>
        </template>
      </el-popconfirm>
    </template>
  </div>
</template>

<style scoped lang="scss">
/* 使用Tailwind工具类替代原有样式 */

.reset-margin {
  margin-right: 8px;
}
</style>
