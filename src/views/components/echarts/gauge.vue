<script setup lang="ts">
import { ref, watch, computed, onMounted, onBeforeUnmount } from "vue";
import { useDark, useECharts } from "@pureadmin/utils";
import { getMonitor, type Monitor } from "@/api/monitor/monitor";
import { getToken, formatToken } from "@/utils/auth";

// --- 定义从父组件接收的 props ---
interface Props {
  cpuValue?: number; // 使用 ? 表示可选 prop
  romValue?: number; // 使用 ? 表示可选 prop
  swapValue?: number; // 使用 ? 表示可选 prop
}

let eventSource: EventSource | null = null;
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
let intervalId: number | null = null;
// --- 监听 gaugeData 变化 ---
watch(
  gaugeData,
  newGaugeData => {
    // 当 gaugeData 内部任何值改变时，调用 setOptions 更新图表
    setOptions({
      clear: false,
      series: [
        {
          data: newGaugeData
        }
      ]
    });
  },
  {
    deep: true // 必须启用深层监听
    // immediate: true // 如果需要初始化时也更新一次图表（虽然初始时数据可能还没变）
  }
);

// 组件挂载后启动定时器
onMounted(() => {
  const data = getToken();
  // 连接 SSE 服务端
  eventSource = new EventSource(
    "http://localhost:8888/auth/sse/objects?token=" +
      formatToken(data.accessToken)
  );

  // 默认的 message 事件
  eventSource.onmessage = (e: MessageEvent) => {
    try {
      const data: Monitor = JSON.parse(e.data); // 如果后端传 JSON，就解析
      gaugeData.value[0].value = Number(data?.cpu?.used);
      gaugeData.value[1].value = Number(
        data?.memory?.used.replace(/\s*GiB\s*$/, "")
      );
      gaugeData.value[2].value = Number(data?.swap?.usageRate);
    } catch {
      console.log(`[raw] ${e.data}`);
    }
  };

  // 如果服务端定义了 event: error
  eventSource.addEventListener("error", e => {
    eventSource.close();
    eventSource = null;
  });
  intervalId = window.setInterval(() => {
    /* getMonitor().then(response => {
      gaugeData.value[0].value = response?.data?.cpu?.used;
      gaugeData.value[1].value = response?.data?.memory?.used.replace(
        /\s*GiB\s*$/,
        ""
      );
      gaugeData.value[2].value = response?.data?.swap?.usageRate;
    }); */
  }, 10000);
});

// 组件卸载前清理定时器
onBeforeUnmount(() => {
  if (intervalId !== null) {
    clearInterval(intervalId);
  }
  if (eventSource) {
    eventSource.close();
    eventSource = null;
  }
});
</script>

<template>
  <div ref="chartRef" style="height: 55vh" />
</template>
