<script setup lang="ts">
import { ref, watch, computed, onMounted, onBeforeUnmount } from "vue";
import { useDark, useECharts } from "@pureadmin/utils";
import type { Monitor } from "@/api/monitor/monitor";
import { getToken, formatToken } from "@/utils/auth";
import { message } from "@/utils/message";

/**
 * 系统监控仪表盘组件
 * 显示 CPU、内存和交换空间的使用情况
 */
defineOptions({
  name: "GaugeChart"
});

// --- 定义从父组件接收的 props ---
interface Props {
  /**
   * CPU使用值
   */
  cpuValue?: number;
  /**
   * 内存使用值
   */
  romValue?: number;
  /**
   * 交换空间使用值
   */
  swapValue?: number;
}

/**
 * EventSource实例
 */
let eventSource: EventSource | null = null;

// 使用 withDefaults 为可选 prop 设置默认值
const props = withDefaults(defineProps<Props>(), {
  cpuValue: 0,
  romValue: 50,
  swapValue: 90
});

// --- 兼容dark主题 ---
const { isDark } = useDark();
const theme = computed(() => {
  return isDark.value ? "dark" : "default";
});

// --- 初始化ECharts ---
const chartRef = ref();
const { setOptions } = useECharts(chartRef, { theme });

/**
 * 仪表盘数据
 */
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
    name: "内存",
    title: {
      offsetCenter: ["0%", "80%"]
    },
    detail: {
      offsetCenter: ["0%", "95%"]
    }
  },
  {
    value: props.swapValue,
    name: "交换空间",
    title: {
      offsetCenter: ["40%", "80%"]
    },
    detail: {
      offsetCenter: ["40%", "95%"]
    }
  }
]);

/**
 * 初始化图表配置
 */
const initChartOptions = () => {
  setOptions({
    tooltip: {
      formatter: "{a} <br/>{b} : {c}%"
    },
    series: [
      {
        name: "系统监控",
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
};

// 初始化图表
initChartOptions();

/**
 * 定时器ID
 */
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
  }
);

/**
 * 处理 EventSource 消息
 * @param e - 消息事件
 */
const handleSseMessage = (e: MessageEvent) => {
  try {
    const data: Monitor = JSON.parse(e.data); // 解析后端传的 JSON

    // 更新 CPU 使用值
    if (data?.cpu?.used !== undefined) {
      gaugeData.value[0].value = Number(data.cpu.used);
    }

    // 更新内存使用值
    if (data?.memory?.used !== undefined) {
      gaugeData.value[1].value = Number(
        data.memory.used.replace(/\s*GiB\s*$/, "")
      );
    }

    // 更新交换空间使用值
    if (data?.swap?.usageRate !== undefined) {
      gaugeData.value[2].value = Number(data.swap.usageRate);
    }
  } catch (error) {
    console.warn("解析 SSE 数据失败:", error);
    console.log(`[raw] ${e.data}`);
  }
};

/**
 * 处理 EventSource 错误
 * @param e - 错误事件
 */
const handleSseError = (e: Event) => {
  console.error("SSE 连接错误:", e);
  message("监控数据连接失败", { type: "error" });

  // 关闭 EventSource 连接
  if (eventSource) {
    eventSource.close();
    eventSource = null;
  }
};

/**
 * 连接 SSE 服务
 */
const connectSse = () => {
  try {
    const tokenData = getToken();
    if (!tokenData?.accessToken) {
      console.error("获取 token 失败");
      message("获取认证信息失败", { type: "error" });
      return;
    }

    // 连接 SSE 服务端
    eventSource = new EventSource(
      "http://localhost:8888/auth/sse/objects?token=" +
        formatToken(tokenData.accessToken)
    );

    // 监听 message 事件
    eventSource.onmessage = handleSseMessage;

    // 监听 error 事件
    eventSource.addEventListener("error", handleSseError);
  } catch (error) {
    console.error("SSE 连接失败:", error);
    message("监控数据连接失败", { type: "error" });
  }
};

// 组件挂载后连接 SSE
onMounted(() => {
  connectSse();

  // 备用定时器（当前已注释）
  intervalId = window.setInterval(() => {
    /* getMonitor().then(response => {
      gaugeData.value[0].value = response?.data?.cpu?.used;
      gaugeData.value[1].value = response?.data?.memory?.used.replace(
        /\s*GiB\s*$/, ""
      );
      gaugeData.value[2].value = response?.data?.swap?.usageRate;
    }); */
  }, 10000);
});

// 组件卸载前清理资源
onBeforeUnmount(() => {
  // 清理定时器
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }

  // 关闭 EventSource 连接
  if (eventSource) {
    eventSource.close();
    eventSource = null;
  }
});
</script>

<template>
  <div ref="chartRef" style="height: 55vh" />
</template>
