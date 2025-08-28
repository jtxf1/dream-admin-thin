<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { useDark, useECharts } from "@pureadmin/utils";

// --- 定义从父组件接收的 props ---
interface Props {
  cpuValue?: number; // 使用 ? 表示可选 prop
  romValue?: number; // 使用 ? 表示可选 prop
  swapValue?: number; // 使用 ? 表示可选 prop
}

// 使用 withDefaults 为可选 prop 设置默认值
const props = withDefaults(defineProps<Props>(), {
  cpuValue: 0,
  romValue: 50,
  swapValue: 90
});
// --- End of props definition ---
// 兼容dark主题
const { isDark } = useDark();
let theme = computed(() => {
  return isDark.value ? "dark" : "default";
});

// 初始化ECharts
const chartRef = ref();
const { setOptions } = useECharts(chartRef, { theme });
const gaugeData = ref([
  {
    value: props.cpuValue,
    name: "CPU",
    title: {
      offsetCenter: ["-40%", "80%"]
    },
    detail: {
      offsetCenter: ["-40%", "95%"]
    }
  },
  {
    value: props.romValue,
    name: "ROM",
    title: {
      offsetCenter: ["0%", "80%"]
    },
    detail: {
      offsetCenter: ["0%", "95%"]
    }
  },
  {
    value: props.swapValue,
    name: "swap",
    title: {
      offsetCenter: ["40%", "80%"]
    },
    detail: {
      offsetCenter: ["40%", "95%"]
    }
  }
]);

// 根据配置项渲染ECharts
setOptions({
  tooltip: {
    formatter: "{a} <br/>{b} : {c}%"
  },
  series: [
    {
      name: "Pressure",
      type: "gauge",
      title: {
        fontSize: 14
      },
      detail: {
        width: 40,
        height: 14,
        fontSize: 14,
        color: "#fff",
        backgroundColor: "inherit",
        borderRadius: 3,
        formatter: "{value}%"
      },
      anchor: {
        show: true,
        showAbove: true,
        size: 18,
        itemStyle: {
          color: "#FAC858"
        }
      },
      pointer: {
        icon: "path://M2.9,0.7L2.9,0.7c1.4,0,2.6,1.2,2.6,2.6v115c0,1.4-1.2,2.6-2.6,2.6l0,0c-1.4,0-2.6-1.2-2.6-2.6V3.3C0.3,1.9,1.4,0.7,2.9,0.7z",
        width: 8,
        length: "80%",
        offsetCenter: [0, "8%"]
      },

      progress: {
        show: true,
        overlap: true,
        roundCap: true
      },
      axisLine: {
        roundCap: true
      },
      data: gaugeData.value
    }
  ]
});
// --- 监听 gaugeData 变化 ---
watch(
  props,
  newGaugeData => {
    gaugeData.value[0].value = parseFloat(newGaugeData.cpuValue) || 0;
    gaugeData.value[1].value = parseFloat(newGaugeData.romValue) || 0;
    gaugeData.value[2].value = parseFloat(newGaugeData.swapValue) || 0;
    // 当 gaugeData 内部任何值改变时，调用 setOptions 更新图表
    setOptions({
      clear: false,
      series: [
        {
          data: gaugeData
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
  <div ref="chartRef" style="height: 53vh" />
</template>
