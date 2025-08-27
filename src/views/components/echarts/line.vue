<script setup lang="ts">
import dayjs from "dayjs";
import { ref, reactive, computed, watch, onMounted, onUnmounted } from "vue";
import { useDark, useECharts } from "@pureadmin/utils";

// 兼容dark主题
const { isDark } = useDark();
let theme = computed(() => {
  return isDark.value ? "dark" : "default";
});

// 初始化ECharts
const chartRef = ref();
const { setOptions } = useECharts(chartRef, { theme });

const allData = reactive({
  cpuData: [0],
  romData: [0],
  xData: [dayjs().format("HH:mm:ss")]
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
// 记录定时器ID
let timerId: number | null = null;
// 组件挂载完成后创建定时器（每3秒执行一次）
onMounted(() => {
  timerId = window.setInterval(() => {
    allData.xData.push(dayjs().format("HH:mm:ss"));
    allData.romData.push(Math.floor(Math.random() * 100));
    allData.cpuData.push(Math.floor(Math.random() * 100));
    if (allData.xData.length > 10) {
      allData.xData.shift();
      allData.romData.shift();
      allData.cpuData.shift();
    }
  }, 3000);
});
// 组件销毁时清除定时器
onUnmounted(() => {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
});
</script>

<template>
  <div ref="chartRef" style="width: 100%; height: 35vh" />
</template>
