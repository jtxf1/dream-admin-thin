<template>
  <div
    v-if="loading"
    :class="[
      're-loading',
      `re-loading--${type}`,
      { 're-loading--fullscreen': fullscreen }
    ]"
  >
    <!-- 全屏加载 -->
    <div v-if="fullscreen" class="re-loading__fullscreen">
      <div class="re-loading__content">
        <div
          class="re-loading__spinner"
          :class="`re-loading__spinner--${spinnerType}`"
        >
          <div v-if="spinnerType === 'circle'" class="re-loading__circle" />
          <div v-else-if="spinnerType === 'dots'" class="re-loading__dots">
            <div class="re-loading__dot" />
            <div class="re-loading__dot" />
            <div class="re-loading__dot" />
          </div>
          <div v-else-if="spinnerType === 'bars'" class="re-loading__bars">
            <div class="re-loading__bar" />
            <div class="re-loading__bar" />
            <div class="re-loading__bar" />
          </div>
        </div>
        <div v-if="text" class="re-loading__text">{{ text }}</div>
      </div>
    </div>

    <!-- 局部加载 -->
    <div v-else class="re-loading__local">
      <div
        class="re-loading__spinner"
        :class="`re-loading__spinner--${spinnerType}`"
      >
        <div v-if="spinnerType === 'circle'" class="re-loading__circle" />
        <div v-else-if="spinnerType === 'dots'" class="re-loading__dots">
          <div class="re-loading__dot" />
          <div class="re-loading__dot" />
          <div class="re-loading__dot" />
        </div>
        <div v-else-if="spinnerType === 'bars'" class="re-loading__bars">
          <div class="re-loading__bar" />
          <div class="re-loading__bar" />
          <div class="re-loading__bar" />
        </div>
      </div>
      <div v-if="text" class="re-loading__text">{{ text }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  /**
   * 加载状态
   */
  loading: {
    type: Boolean,
    default: false
  },
  /**
   * 加载类型：fullscreen | local
   */
  type: {
    type: String,
    default: "local",
    validator: (value: string) => ["fullscreen", "local"].includes(value)
  },
  /**
   * 加载动画类型：circle | dots | bars
   */
  spinnerType: {
    type: String,
    default: "circle",
    validator: (value: string) => ["circle", "dots", "bars"].includes(value)
  },
  /**
   * 加载文本
   */
  text: {
    type: String,
    default: ""
  },
  /**
   * 是否全屏
   */
  fullscreen: {
    type: Boolean,
    default: false
  }
});
</script>

<style scoped lang="scss">
.re-loading {
  &--fullscreen {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgb(255 255 255 / 80%);
    backdrop-filter: blur(2px);

    .re-loading__content {
      display: flex;
      flex-direction: column;
      gap: 12px;
      align-items: center;
    }
  }

  &--local {
    display: inline-flex;
    gap: 8px;
    align-items: center;
  }

  &__spinner {
    &--circle {
      .re-loading__circle {
        width: 24px;
        height: 24px;
        border: 2px solid #e0e0e0;
        border-top: 2px solid var(--el-color-primary);
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
    }

    &--dots {
      display: flex;
      gap: 4px;

      .re-loading__dot {
        width: 8px;
        height: 8px;
        background-color: var(--el-color-primary);
        border-radius: 50%;
        animation: bounce 1.4s ease-in-out infinite both;

        &:nth-child(1) {
          animation-delay: -0.32s;
        }

        &:nth-child(2) {
          animation-delay: -0.16s;
        }
      }
    }

    &--bars {
      display: flex;
      gap: 4px;

      .re-loading__bar {
        width: 4px;
        height: 20px;
        background-color: var(--el-color-primary);
        border-radius: 2px;
        animation: stretch 1.2s ease-in-out infinite;

        &:nth-child(1) {
          animation-delay: -1.2s;
        }

        &:nth-child(2) {
          animation-delay: -1.1s;
        }

        &:nth-child(3) {
          animation-delay: -1s;
        }
      }
    }
  }

  &__text {
    font-size: 14px;
    color: var(--el-text-color-primary);
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

@keyframes bounce {
  0%,
  80%,
  100% {
    transform: scale(0);
  }

  40% {
    transform: scale(1);
  }
}

@keyframes stretch {
  0%,
  40%,
  100% {
    transform: scaleY(0.4);
  }

  20% {
    transform: scaleY(1);
  }
}
</style>
