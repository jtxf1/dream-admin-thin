<script setup lang="ts">
import { FormDialogProps, FormDialogEmits } from "./types";

const props = withDefaults(defineProps<FormDialogProps>(), {
  loading: false,
  width: "500px",
  appendToBody: false,
  destroyOnClose: false
});

const emit = defineEmits<FormDialogEmits>();

const handleSave = () => {
  emit("save");
};

const handleCancel = () => {
  emit("cancel");
  emit("update:visible", false);
};

const handleClose = () => {
  emit("update:visible", false);
};
</script>

<template>
  <el-dialog
    :model-value="visible"
    :title="title"
    :width="width"
    :append-to-body="appendToBody"
    :destroy-on-close="destroyOnClose"
    @update:model-value="val => emit('update:visible', val)"
    @close="handleClose"
  >
    <slot />
    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSave">
        保存
      </el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
/* 使用Tailwind工具类替代原有样式 */

/* 对话框样式已通过Element Plus默认样式实现 */
</style>
