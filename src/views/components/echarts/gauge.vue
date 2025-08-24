<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import { useDark, useECharts } from "@pureadmin/utils";
import type { EChartsOption } from "echarts";

// 兼容dark主题
const { isDark } = useDark();
let theme = computed(() => {
  return isDark.value ? "dark" : "default";
});

// 初始化ECharts
const chartRef = ref();
const { setOptions } = useECharts(chartRef, { theme });

// 定义响应式数据
const cpuValue = ref(50);
const cpuName = ref("CPU");

// 创建一个响应式的配置对象
const chartOptions = computed<EChartsOption>(() => ({
  tooltip: {
    formatter: "{a} <br/>{b} : {c}%"
  },
  series: [
    {
      name: "Pressure",
      type: "gauge",
      detail: {
        formatter: "{value}"
      },
      data: [
        {
          value: cpuValue.value,
          name: cpuName.value
        }
      ]
    }
  ]
}));

// 监听配置变化并更新图表
watch(
  chartOptions,
  newOptions => {
    setOptions(newOptions);
  },
  { immediate: true }
);

let intervalId: number | null = null;

// 组件挂载后启动定时器
onMounted(() => {
  intervalId = window.setInterval(() => {
    // 生成1到100之间的随机整数
    cpuValue.value = Math.floor(Math.random() * 100) + 1;
  }, 2000);
});

// 组件卸载前清理定时器
onBeforeUnmount(() => {
  if (intervalId !== null) {
    clearInterval(intervalId);
  }
});
</script>

<template>
  <div ref="chartRef" style="width: 100%; height: 70vh" />
</template>
