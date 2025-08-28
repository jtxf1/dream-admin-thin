<script setup lang="ts">
import dayjs from "dayjs";
import { ref, reactive, onMounted, onBeforeUnmount } from "vue";
import ReCol from "@/components/ReCol";
import { useDark } from "./utils";
import { ReNormalCountTo } from "@/components/ReCountTo";
import { lineChart, roundChart } from "./components/chart";
import { chartData } from "./data";
import Gauge from "../components/echarts/gauge.vue";
import Line from "../components/echarts/line.vue";
import { getToken, formatToken } from "@/utils/auth";
import { type Monitor } from "@/api/monitor/monitor";

defineOptions({
  name: "Welcome"
});

const { isDark } = useDark();
const monitorCPU = reactive<Monitor>({});

const cpuValue = ref(0);
const romValue = ref(0);
const swapValue = ref(0);

const cpuData = ref([0]);
const romData = ref([0]);
const xData = ref([dayjs().format("HH:mm:ss")]);

let eventSource: EventSource | null = null;

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
      const data: Monitor = JSON.parse(e.data) as Monitor; // 如果后端传 JSON，就解析
      monitorCPU.cpu = data.cpu;
      monitorCPU.sys = data.sys;
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
    console.log("[error] 连接或消息错误", e.type);
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
        v-for="(item, index) in chartData"
        :key="index"
        v-motion
        class="mb-[18px]"
        :value="6"
        :md="12"
        :sm="12"
        :xs="24"
        :initial="{
          opacity: 0,
          y: 100
        }"
        :enter="{
          opacity: 1,
          y: 0,
          transition: {
            delay: 80 * (index + 1)
          }
        }"
      >
        <el-card class="line-card" shadow="never">
          <div class="flex justify-between">
            <span class="text-md font-medium">
              {{ item.name }}
            </span>
            <div
              class="w-8 h-8 flex justify-center items-center rounded-md"
              :style="{
                backgroundColor: isDark ? 'transparent' : item.bgColor
              }"
            >
              <IconifyIconOffline
                :icon="item.icon"
                :color="item.color"
                width="18"
              />
            </div>
          </div>
          <div class="flex justify-between items-start mt-3">
            <div class="w-1/2">
              <ReNormalCountTo
                :duration="item.duration"
                :fontSize="'1.6em'"
                :startVal="100"
                :endVal="item.value"
              />
              <p class="font-medium text-green-500">{{ item.percent }}</p>
            </div>
            <lineChart
              v-if="item.data.length > 1"
              class="!w-1/2"
              :color="item.color"
              :data="item.data"
            />
            <roundChart v-else class="!w-1/2" />
          </div>
        </el-card>
      </re-col>

      <re-col
        v-motion
        class="mb-[18px]"
        :value="12"
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
        :value="12"
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
                <td style="width: 50%; padding: 8px; border: 1px solid #eee">
                  os
                </td>
                <!-- 第二个单元格：宽度50% -->
                <td
                  class="color-dark-light"
                  style="width: 50%; padding: 8px; border: 1px solid #eee"
                >
                  {{ monitorCPU?.sys?.os }}
                </td>
              </tr>
              <tr>
                <td style="width: 50%; padding: 8px; border: 1px solid #eee">
                  运行时间
                </td>
                <td style="width: 50%; padding: 8px; border: 1px solid #eee">
                  {{ monitorCPU?.sys?.day }}
                </td>
              </tr>
              <tr>
                <td style="width: 50%; padding: 8px; border: 1px solid #eee">
                  ip
                </td>
                <td style="width: 50%; padding: 8px; border: 1px solid #eee">
                  {{ monitorCPU?.sys?.ip }}
                </td>
              </tr>
              <tr>
                <td style="width: 50%; padding: 8px; border: 1px solid #eee">
                  cpu
                </td>
                <td style="width: 50%; padding: 8px; border: 1px solid #eee">
                  <pre>
                    {{ monitorCPU?.cpu?.name }}
                    {{ monitorCPU?.cpu?.core }}
                    {{ monitorCPU?.cpu?.logic }}
                    {{ monitorCPU?.cpu?.used }}
                    {{ monitorCPU?.cpu?.idle }}
                  </pre>
                </td>
              </tr>
              <tr>
                <td style="width: 50%; padding: 8px; border: 1px solid #eee">
                  内存
                </td>
                <td style="width: 50%; padding: 8px; border: 1px solid #eee">
                  总：{{ monitorCPU?.memory?.total }} 已用：{{
                    monitorCPU?.memory?.used
                  }}
                  剩余：{{ monitorCPU?.memory?.available }}
                </td>
              </tr>
              <tr>
                <td style="width: 50%; padding: 8px; border: 1px solid #eee">
                  硬盘
                </td>
                <td style="width: 50%; padding: 8px; border: 1px solid #eee">
                  总：{{ monitorCPU?.disk?.total }} 已用：{{
                    monitorCPU?.disk?.used
                  }}
                  剩余：{{ monitorCPU?.disk?.available }}
                </td>
              </tr>
              <tr>
                <td style="width: 50%; padding: 8px; border: 1px solid #eee">
                  显卡
                </td>
                <td style="width: 50%; padding: 8px; border: 1px solid #eee">
                  <pre>
                    {{ monitorCPU?.gpu?.name }}
                    {{ monitorCPU?.gpu?.vRam }}bit
                  </pre>
                </td>
              </tr>
              <tr>
                <td style="width: 50%; padding: 8px; border: 1px solid #eee">
                  交换区
                </td>
                <td style="width: 50%; padding: 8px; border: 1px solid #eee">
                  <pre>
                    总：{{ monitorCPU?.swap?.total }}
                    已用：{{ monitorCPU?.swap?.used }}
                    剩余{{ monitorCPU?.swap?.available }}
                  </pre>
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
