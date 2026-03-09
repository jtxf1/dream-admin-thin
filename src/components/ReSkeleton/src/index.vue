<template>
  <div v-if="loading" :class="['re-skeleton', `re-skeleton--${type}`]">
    <!-- 表格骨架屏 -->
    <div v-if="type === 'table'" class="re-skeleton__table">
      <div class="re-skeleton__table-header">
        <div
          v-for="i in columns"
          :key="i"
          class="re-skeleton__table-header-cell"
          :style="{ width: (columnWidths[i - 1] || '100px') as string }"
        >
          <div class="re-skeleton__block" />
        </div>
      </div>
      <div class="re-skeleton__table-body">
        <div v-for="i in rows" :key="i" class="re-skeleton__table-row">
          <div
            v-for="j in columns"
            :key="j"
            class="re-skeleton__table-cell"
            :style="{ width: (columnWidths[j - 1] || '100px') as string }"
          >
            <div class="re-skeleton__block" />
          </div>
        </div>
      </div>
    </div>

    <!-- 卡片骨架屏 -->
    <div v-else-if="type === 'card'" class="re-skeleton__card">
      <div class="re-skeleton__card-header">
        <div
          class="re-skeleton__block re-skeleton__block--circle"
          style="width: 48px; height: 48px"
        />
        <div class="re-skeleton__card-header-content">
          <div class="re-skeleton__block" style="width: 120px; height: 16px" />
          <div
            class="re-skeleton__block"
            style="width: 80px; height: 14px; margin-top: 8px"
          />
        </div>
      </div>
      <div class="re-skeleton__card-body">
        <div class="re-skeleton__block" style="width: 100%; height: 14px" />
        <div
          class="re-skeleton__block"
          style="width: 80%; height: 14px; margin-top: 8px"
        />
        <div
          class="re-skeleton__block"
          style="width: 60%; height: 14px; margin-top: 8px"
        />
      </div>
    </div>

    <!-- 列表骨架屏 -->
    <div v-else-if="type === 'list'" class="re-skeleton__list">
      <div v-for="i in rows" :key="i" class="re-skeleton__list-item">
        <div
          class="re-skeleton__block re-skeleton__block--circle"
          style="width: 40px; height: 40px"
        />
        <div class="re-skeleton__list-item-content">
          <div class="re-skeleton__block" style="width: 150px; height: 16px" />
          <div
            class="re-skeleton__block"
            style="width: 200px; height: 14px; margin-top: 8px"
          />
        </div>
      </div>
    </div>

    <!-- 自定义骨架屏 -->
    <div v-else-if="type === 'custom'" class="re-skeleton__custom">
      <slot />
    </div>
  </div>
  <slot v-else name="default" />
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
   * 骨架屏类型：table | card | list | custom
   */
  type: {
    type: String,
    default: "table",
    validator: (value: string) =>
      ["table", "card", "list", "custom"].includes(value)
  },
  /**
   * 表格/列表行数
   */
  rows: {
    type: Number,
    default: 5
  },
  /**
   * 表格列数
   */
  columns: {
    type: Number,
    default: 4
  },
  /**
   * 表格列宽数组
   */
  columnWidths: {
    type: Array,
    default: () => []
  }
});
</script>

<style scoped lang="scss">
.re-skeleton {
  &__block {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    border-radius: 4px;
    animation: shimmer 1.5s infinite;

    &--circle {
      border-radius: 50%;
    }
  }

  &__table {
    width: 100%;
    overflow: hidden;
    border: 1px solid #e0e0e0;
    border-radius: 4px;

    &-header {
      display: flex;
      background-color: #fafafa;
      border-bottom: 1px solid #e0e0e0;

      &-cell {
        padding: 12px;
        border-right: 1px solid #e0e0e0;

        &:last-child {
          border-right: none;
        }
      }
    }

    &-body {
      &-row {
        display: flex;
        border-bottom: 1px solid #e0e0e0;

        &:last-child {
          border-bottom: none;
        }
      }

      &-cell {
        padding: 12px;
        border-right: 1px solid #e0e0e0;

        &:last-child {
          border-right: none;
        }
      }
    }
  }

  &__card {
    width: 100%;
    padding: 16px;
    background-color: #fff;
    border: 1px solid #e0e0e0;
    border-radius: 4px;

    &-header {
      display: flex;
      gap: 12px;
      align-items: center;
      margin-bottom: 16px;

      &-content {
        flex: 1;
      }
    }
  }

  &__list {
    width: 100%;

    &-item {
      display: flex;
      gap: 12px;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #e0e0e0;

      &:last-child {
        border-bottom: none;
      }

      &-content {
        flex: 1;
      }
    }
  }

  &__custom {
    width: 100%;
  }
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }

  100% {
    background-position: 200% 0;
  }
}
</style>
