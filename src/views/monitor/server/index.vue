<script setup lang="ts">
import dayjs from "dayjs";
import { ref, reactive, onMounted, onBeforeUnmount } from "vue";
import ReCol from "@/components/ReCol";
import Gauge from "../../components/echarts/gauge.vue";
import Line from "../../components/echarts/line.vue";
import { getToken, formatToken } from "@/utils/auth";
import { type Monitor } from "@/api/monitor/monitor";

defineOptions({
  name: "Server"
});

const monitorCPU = reactive<Monitor>({});

const cpuValue = ref(0);
const romValue = ref(0);
const swapValue = ref(0);

const cpuData = ref([0]);
const romData = ref([0]);
const xData = ref([dayjs().format("HH:mm:ss")]);
/**
 * 将 GPU VRAM 从 bit 转换为 GB (不保留小数)。
 * @param monitorData - 包含 GPU 信息的对象，可能为 null 或 undefined。
 * @returns 如果 vRam 存在且不为空，则返回以 GB 为单位的整数；否则返回空字符串。
 */
function convertVramBitToGB(vRam: number | null | any): string {
  if (vRam != null) {
    // 假设 0 也被视为空或无效
    // 1 GB = 8 * 1024 * 1024 * 1024 bits
    const bitsPerGB = 1024 * 1024 * 1024;
    // 转换为 GB 并去除小数部分
    const vRamInGB = Math.floor(vRam / bitsPerGB);
    return `${vRamInGB}`;
  }
  return "";
}
let eventSource: EventSource | null = null;

// 组件挂载后启动定时器
onMounted(() => {
  const data = getToken();
  // 连接 SSE 服务端
  eventSource = new EventSource(
    "http://localhost:8888/auth/sse/objects2?token=" +
      formatToken(data.accessToken)
  );

  // 默认的 message 事件
  eventSource.onmessage = (e: MessageEvent) => {
    console.log(`[raw] ${e}`);
    try {
      const data: Monitor = JSON.parse(e.data) as Monitor; // 如果后端传 JSON，就解析
      monitorCPU.cpu = data.cpu;
      monitorCPU.sys = data.sys;
      monitorCPU.memory = data.memory;
      monitorCPU.swap = data.swap;
      monitorCPU.disk = data.disk;
      monitorCPU.gpu = data.gpu;
      cpuValue.value = parseFloat(data?.cpu?.used) || 0;
      romValue.value =
        parseFloat(data?.memory?.used.replace(/\s*GiB\s*$/, "")) || 0;
      swapValue.value = parseFloat(data?.swap?.usageRate) || 0;

      xData.value.push(dayjs().format("HH:mm:ss"));
      romData.value.push(
        parseFloat(data?.memory?.used.replace(/\s*GiB\s*$/, "")) || 0
      );
      cpuData.value.push(parseFloat(data?.cpu?.used) || 0);
      if (xData.value.length > 10) {
        xData.value.shift();
        romData.value.shift();
        cpuData.value.shift();
      }
    } catch {
      console.log(`[raw] ${e.data}`);
    }
  };

  // 如果服务端定义了 event: error
  eventSource.addEventListener("error", e => {
    eventSource.close();
    eventSource = null;
  });
});

// 组件卸载前清理定时器
onBeforeUnmount(() => {
  if (eventSource) {
    eventSource.close();
    eventSource = null;
  }
});
</script>

<template>
  <div>
    <el-row :gutter="24" justify="space-around">
      <re-col
        v-motion
        class="mb-[18px]"
        :value="14"
        :xs="24"
        :initial="{
          opacity: 0,
          y: 100
        }"
        :enter="{
          opacity: 1,
          y: 0,
          transition: {
            delay: 400
          }
        }"
      >
        <el-card class="bar-card" shadow="never">
          <div class="flex justify-between">
            <span class="text-md font-medium">系统监控</span>
          </div>
          <Gauge
            :cpu-value="cpuValue"
            :rom-value="romValue"
            :swap-value="swapValue"
          />
        </el-card>
      </re-col>

      <re-col
        v-motion
        class="mb-[18px]"
        :value="8"
        :xs="24"
        :initial="{
          opacity: 0,
          y: 100
        }"
        :enter="{
          opacity: 1,
          y: 0,
          transition: {
            delay: 480
          }
        }"
      >
        <el-card shadow="never">
          <div class="flex justify-between">
            <span class="text-md font-medium">系统配置</span>
          </div>

          <table
            class="demo-typo-size"
            style="width: 100%; table-layout: fixed; border-collapse: collapse"
          >
            <tbody>
              <tr>
                <!-- 第一个单元格：宽度50% -->
                <td style="width: 10%; padding: 8px; border: 1px solid #eee">
                  os
                </td>
                <!-- 第二个单元格：宽度50% -->
                <td
                  class="color-dark-light"
                  style="width: 50%; padding: 8px; border: 1px solid #eee"
                >
                  <pre>{{ monitorCPU?.sys?.os }}<br/>运行:{{ monitorCPU?.sys?.day }}<br/>ip:{{ monitorCPU?.sys?.ip }}</pre>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #eee">cpu</td>
                <td style="padding: 8px; border: 1px solid #eee">
                  <pre>{{ monitorCPU?.cpu?.name }}<br/>{{ monitorCPU?.cpu?.core }}<br/>{{ monitorCPU?.cpu?.logic }}<br/>{{ monitorCPU?.cpu?.used }}/{{ monitorCPU?.cpu?.idle }}
                  </pre>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #eee">内存</td>
                <td style="padding: 8px; border: 1px solid #eee">
                  {{ monitorCPU?.memory?.used }}/{{ monitorCPU?.memory?.total
                  }}<br />剩余：{{ monitorCPU?.memory?.available }}
                </td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #eee">硬盘</td>
                <td style="padding: 8px; border: 1px solid #eee">
                  {{ monitorCPU?.disk?.used }}/{{ monitorCPU?.disk?.total
                  }}<br />剩余：{{ monitorCPU?.disk?.available }}
                </td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #eee">显卡</td>
                <td style="padding: 8px; border: 1px solid #eee">
                  <pre>{{ monitorCPU?.gpu?.name }} <br/>{{ convertVramBitToGB(monitorCPU?.gpu?.vRam) }}GB
                  </pre>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #eee">交换区</td>
                <td style="padding: 8px; border: 1px solid #eee">
                  <pre>{{ monitorCPU?.swap?.used }}/{{ monitorCPU?.swap?.total }}<br/>剩余{{ monitorCPU?.swap?.available }}</pre>
                </td>
              </tr>
            </tbody>
          </table>
        </el-card>
      </re-col>

      <re-col
        v-motion
        class="mb-[18px]"
        :value="24"
        :xs="24"
        :initial="{
          opacity: 0,
          y: 100
        }"
        :enter="{
          opacity: 1,
          y: 0,
          transition: {
            delay: 560
          }
        }"
      >
        <el-card shadow="never" class="h-[480px]">
          <div class="flex justify-between">
            <span class="text-md font-medium">数据统计</span>
          </div>
          <div class="flex justify-between items-start mt-3">
            <Line :cpu-data="cpuData" :rom-data="romData" :x-data="xData" />
          </div>
        </el-card>
      </re-col>
    </el-row>
  </div>
</template>

<style lang="scss" scoped>
:deep(.el-card) {
  --el-card-border-color: none;

  /* 解决概率进度条宽度 */
  .el-progress--line {
    width: 85%;
  }

  /* 解决概率进度条字体大小 */
  .el-progress-bar__innerText {
    font-size: 15px;
  }

  /* 隐藏 el-scrollbar 滚动条 */
  .el-scrollbar__bar {
    display: none;
  }

  /* el-timeline 每一项上下、左右边距 */
  .el-timeline-item {
    margin: 0 6px;
  }
}

.main-content {
  margin: 20px 20px 0 !important;
}
</style>
