<template>
  <el-form-item
    :prop="prop"
    :label="label"
    :rules="rules"
    :error="error"
    :validate-event="validateEvent"
    :size="size"
    :required="required"
    :for="forId"
    :show-message="showMessage"
    :inline-message="inlineMessage"
    :aria-label="ariaLabel"
    :class="[`re-form-item`, { 're-form-item--error': error }]"
  >
    <template #default>
      <slot />
    </template>
    <template #label>
      <slot name="label">{{ label }}</slot>
    </template>
    <template #error>
      <div v-if="error" class="re-form-item__error" :aria-live="'polite'">
        <el-icon class="re-form-item__error-icon"><WarningFilled /></el-icon>
        <span class="re-form-item__error-message">{{ error }}</span>
      </div>
    </template>
  </el-form-item>
</template>

<script setup lang="ts">
import { WarningFilled } from "@element-plus/icons-vue";
import { ElFormItem } from "element-plus";
import type { PropType } from "vue";

defineProps({
  /**
   * 表单字段名
   */
  prop: {
    type: String,
    default: ""
  },
  /**
   * 标签文本
   */
  label: {
    type: String,
    default: ""
  },
  /**
   * 验证规则
   */
  rules: {
    type: [Object, Array],
    default: () => []
  },
  /**
   * 错误信息
   */
  error: {
    type: String,
    default: ""
  },
  /**
   * 是否触发验证事件
   */
  validateEvent: {
    type: Boolean,
    default: true
  },
  /**
   * 表单大小
   */
  size: {
    type: String as PropType<"large" | "default" | "small">,
    default: "default"
  },
  /**
   * 是否必填
   */
  required: {
    type: Boolean,
    default: false
  },
  /**
   * 关联的输入框id
   */
  forId: {
    type: String,
    default: ""
  },
  /**
   * 是否显示错误信息
   */
  showMessage: {
    type: Boolean,
    default: true
  },
  /**
   * 是否在行内显示错误信息
   */
  inlineMessage: {
    type: Boolean,
    default: false
  },
  /**
   * 无障碍标签
   */
  ariaLabel: {
    type: String,
    default: ""
  }
});
</script>

<style scoped lang="scss">
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式设计 */
@media (width <= 768px) {
  .re-form-item {
    &__error {
      padding: 3px 0;
      font-size: 11px;
    }
  }
}

.re-form-item {
  position: relative;

  &--error {
    .el-input__wrapper {
      box-shadow: 0 0 0 1px var(--el-color-danger) inset !important;
    }

    .el-textarea__wrapper {
      box-shadow: 0 0 0 1px var(--el-color-danger) inset !important;
    }
  }

  &__error {
    display: flex;
    gap: 4px;
    align-items: center;
    padding: 4px 0;
    font-size: 12px;
    line-height: 1.2;
    color: var(--el-color-danger);
    animation: fade-in 0.3s ease;

    &-icon {
      flex-shrink: 0;
      font-size: 12px;
    }

    &-message {
      flex: 1;
      word-break: normal;
    }
  }
}
</style>
