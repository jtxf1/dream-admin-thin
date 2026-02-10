<script setup lang="ts">
import { ref, computed } from "vue";

/**
 * 日期选择器组件
 * 支持日期时间范围选择，包含快捷选项
 */
defineOptions({
  name: "DatePicker"
});

/**
 * 组件属性
 */
const props = defineProps({
  /**
   * 创建时间
   */
  createTime: {
    type: String,
    default: ""
  }
});

/**
 * 组件事件
 */
const emit = defineEmits(["update:createTime"]);

/**
 * 日期时间范围
 */
const createTime = ref(props.createTime);

/**
 * 计算一天的毫秒数
 */
const ONE_DAY = 24 * 60 * 60 * 1000;

/**
 * 快捷选项配置
 */
const shortcuts = computed(() => [
  {
    text: "最近1周",
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 7 * ONE_DAY);
      return [start, end];
    }
  },
  {
    text: "最近1个月",
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 30 * ONE_DAY);
      return [start, end];
    }
  },
  {
    text: "最近3个月",
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 90 * ONE_DAY);
      return [start, end];
    }
  }
]);

/**
 * 处理日期时间范围变化
 * @param value - 选中的日期时间范围
 */
const handleDateChange = (value: string) => {
  createTime.value = value;
  emit("update:createTime", value);
};
</script>

<template>
  <el-date-picker
    v-model="createTime"
    type="datetimerange"
    :shortcuts="shortcuts"
    range-separator="-"
    start-placeholder="开始时间"
    end-placeholder="结束时间"
    value-format="YYYY-MM-DD h:m:s"
    @update:model-value="handleDateChange"
  />
</template>
