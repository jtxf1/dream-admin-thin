<script setup lang="ts">
import dayjs from "dayjs";
import { ref, computed, watch } from "vue";
import { useDark, useECharts } from "@pureadmin/utils";

// 兼容dark主题
const { isDark } = useDark();
let theme = computed(() => {
  return isDark.value ? "dark" : "default";
});

// 初始化ECharts
const chartRef = ref();
const { setOptions } = useECharts(chartRef, { theme });

// 定义props接收父组件传递的数据
const allData = defineProps({
  cpuData: {
    type: Array,
    required: false,
    default: () => [10]
  },
  romData: {
    type: Array,
    required: false,
    default: () => [10]
  },
  xData: {
    type: Array as () => string[],
    required: false,
    default: () => [dayjs().format("HH:mm:ss")]
  }
});
// 根据配置项渲染ECharts
setOptions({
  title: {
    text: "系统监控"
  },
  tooltip: {
    trigger: "axis",
    axisPointer: {
      type: "shadow"
    }
  },
  legend: {
    left: "3%",
    top: "3%",
    data: ["CPU", "ROM"]
  },
  grid: {
    left: "3%",
    right: "4%",
    bottom: "3%"
  },
  xAxis: {
    type: "category",
    boundaryGap: false,
    data: allData.xData
  },
  yAxis: {
    type: "value"
  },
  series: [
    {
      name: "ROM",
      type: "line",
      stack: "Total",
      data: allData.romData
    },
    {
      name: "CPU",
      data: allData.cpuData,
      type: "line",
      stack: "Total",
      symbol: "triangle",
      symbolSize: 20,
      lineStyle: {
        color: "#5470C6",
        width: 4,
        type: "dashed"
      },
      itemStyle: {
        borderWidth: 3,
        borderColor: "#EE6666",
        color: "yellow"
      }
    }
  ]
});
// --- 监听 gaugeData 变化 ---
watch(
  allData,
  newGaugeData => {
    // 当 gaugeData 内部任何值改变时，调用 setOptions 更新图表
    setOptions({
      clear: false,
      xAxis: {
        data: newGaugeData.xData
      },
      series: [
        {
          data: newGaugeData.romData
        },
        {
          data: newGaugeData.cpuData
        }
      ]
    });
  },
  {
    deep: true // 必须启用深层监听
    // immediate: true // 如果需要初始化时也更新一次图表（虽然初始时数据可能还没变）
  }
);
</script>

<template>
  <div ref="chartRef" style="width: 100%; height: 35vh" />
</template>
