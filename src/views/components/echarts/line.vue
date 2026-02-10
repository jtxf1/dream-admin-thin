<script setup lang="ts">
import dayjs from "dayjs";
import { ref, computed, watch } from "vue";
import { useDark, useECharts } from "@pureadmin/utils";

/**
 * 系统监控折线图组件
 * 显示 CPU 和内存使用情况的变化趋势
 */
defineOptions({
  name: "LineChart"
});

// --- 兼容dark主题 ---
const { isDark } = useDark();
const theme = computed(() => {
  return isDark.value ? "dark" : "default";
});

// --- 初始化ECharts ---
const chartRef = ref();
const { setOptions } = useECharts(chartRef, { theme });

// --- 定义props接收父组件传递的数据 ---
interface Props {
  /**
   * CPU使用数据数组
   */
  cpuData?: number[];
  /**
   * 内存使用数据数组
   */
  romData?: number[];
  /**
   * X轴时间数据数组
   */
  xData?: string[];
}

const props = withDefaults(defineProps<Props>(), {
  cpuData: () => [10],
  romData: () => [10],
  xData: () => [dayjs().format("HH:mm:ss")]
});

/**
 * 初始化图表配置
 */
const initChartOptions = () => {
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
      bottom: "3%",
      containLabel: true
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: props.xData
    },
    yAxis: {
      type: "value",
      name: "使用率 (%)"
    },
    series: [
      {
        name: "内存",
        type: "line",
        stack: "Total",
        data: props.romData,
        smooth: true,
        lineStyle: {
          width: 2
        }
      },
      {
        name: "CPU",
        data: props.cpuData,
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
};

// 初始化图表
initChartOptions();

// --- 监听数据变化 ---
watch(
  props,
  newProps => {
    // 当数据变化时，调用 setOptions 更新图表
    setOptions({
      clear: false,
      xAxis: {
        data: newProps.xData
      },
      series: [
        {
          data: newProps.romData
        },
        {
          data: newProps.cpuData
        }
      ]
    });
  },
  {
    deep: true // 必须启用深层监听
  }
);
</script>

<template>
  <div ref="chartRef" style="width: 100%; height: 35vh" />
</template>
