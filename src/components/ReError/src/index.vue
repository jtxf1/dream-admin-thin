<template>
  <div v-if="visible" class="re-error">
    <div class="re-error__content">
      <div class="re-error__icon" :class="`re-error__icon--${type}`">
        <svg
          v-if="type === 'error'"
          width="48"
          height="48"
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="24" cy="24" r="20" stroke="#F56C6C" stroke-width="2" />
          <path
            d="M24 16V32"
            stroke="#F56C6C"
            stroke-width="2"
            stroke-linecap="round"
          />
          <path
            d="M24 24H24.01"
            stroke="#F56C6C"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
        <svg
          v-else-if="type === 'warning'"
          width="48"
          height="48"
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="24" cy="24" r="20" stroke="#E6A23C" stroke-width="2" />
          <path
            d="M24 16V32"
            stroke="#E6A23C"
            stroke-width="2"
            stroke-linecap="round"
          />
          <path
            d="M24 24H24.01"
            stroke="#E6A23C"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
        <svg
          v-else-if="type === 'info'"
          width="48"
          height="48"
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="24" cy="24" r="20" stroke="#409EFF" stroke-width="2" />
          <path
            d="M24 16V32"
            stroke="#409EFF"
            stroke-width="2"
            stroke-linecap="round"
          />
          <path
            d="M24 24H24.01"
            stroke="#409EFF"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
      </div>
      <div class="re-error__message">{{ message }}</div>
      <div class="re-error__actions">
        <el-button v-if="showRetry" type="primary" @click="$emit('retry')">
          {{ retryText }}
        </el-button>
        <el-button v-if="showClose" @click="$emit('close')">
          {{ closeText }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  /**
   * 是否显示
   */
  visible: {
    type: Boolean,
    default: false
  },
  /**
   * 错误类型：error | warning | info
   */
  type: {
    type: String,
    default: "error",
    validator: (value: string) => ["error", "warning", "info"].includes(value)
  },
  /**
   * 错误信息
   */
  message: {
    type: String,
    default: "加载失败，请稍后重试"
  },
  /**
   * 是否显示重试按钮
   */
  showRetry: {
    type: Boolean,
    default: true
  },
  /**
   * 重试按钮文本
   */
  retryText: {
    type: String,
    default: "重试"
  },
  /**
   * 是否显示关闭按钮
   */
  showClose: {
    type: Boolean,
    default: true
  },
  /**
   * 关闭按钮文本
   */
  closeText: {
    type: String,
    default: "关闭"
  }
});

defineEmits(["retry", "close"]);
</script>

<style scoped lang="scss">
.re-error {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 0;

  &__content {
    display: flex;
    flex-direction: column;
    gap: 16px;
    align-items: center;
    max-width: 400px;
    padding: 24px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);
  }

  &__icon {
    &--error {
      color: #f56c6c;
    }

    &--warning {
      color: #e6a23c;
    }

    &--info {
      color: #409eff;
    }
  }

  &__message {
    font-size: 16px;
    color: var(--el-text-color-primary);
    text-align: center;
  }

  &__actions {
    display: flex;
    gap: 12px;
    margin-top: 8px;
  }
}
</style>
