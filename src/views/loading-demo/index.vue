<template>
  <div class="loading-demo">
    <el-card class="mb-4">
      <template #header>
        <div class="flex justify-between items-center">
          <span>加载状态演示</span>
          <el-button type="primary" @click="reset">重置</el-button>
        </div>
      </template>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- 全局加载 -->
        <div class="p-4 border rounded-lg">
          <h3 class="text-lg font-semibold mb-2">全局加载</h3>
          <el-button type="primary" @click="testGlobalLoading"
            >测试全局加载</el-button
          >
        </div>

        <!-- 局部加载 -->
        <div class="p-4 border rounded-lg">
          <h3 class="text-lg font-semibold mb-2">局部加载</h3>
          <div class="flex items-center gap-2">
            <ReLoading :loading="isLocalLoading" text="加载中..." />
            <el-button type="success" @click="testLocalLoading"
              >测试局部加载</el-button
            >
          </div>
        </div>

        <!-- 全屏加载 -->
        <div class="p-4 border rounded-lg">
          <h3 class="text-lg font-semibold mb-2">全屏加载</h3>
          <el-button type="warning" @click="testFullscreenLoading"
            >测试全屏加载</el-button
          >
        </div>

        <!-- 骨架屏 -->
        <div class="p-4 border rounded-lg">
          <h3 class="text-lg font-semibold mb-2">骨架屏</h3>
          <div class="flex items-center gap-2 mb-4">
            <el-button type="info" @click="testSkeleton">测试骨架屏</el-button>
            <el-select v-model="skeletonType" placeholder="选择骨架屏类型">
              <el-option label="表格" value="table" />
              <el-option label="卡片" value="card" />
              <el-option label="列表" value="list" />
            </el-select>
          </div>
          <div v-if="showSkeleton">
            <ReSkeleton :type="skeletonType" :rows="5" :columns="4" />
          </div>
          <div v-else class="p-4 bg-gray-50 rounded">
            <p>骨架屏加载完成后显示的内容</p>
          </div>
        </div>

        <!-- 错误提示 -->
        <div class="p-4 border rounded-lg">
          <h3 class="text-lg font-semibold mb-2">错误提示</h3>
          <el-button type="danger" @click="testError">测试错误提示</el-button>
          <ReError
            :visible="showError"
            :message="errorMessage"
            @retry="handleRetry"
            @close="showError = false"
          />
        </div>

        <!-- API请求加载 -->
        <div class="p-4 border rounded-lg">
          <h3 class="text-lg font-semibold mb-2">API请求加载</h3>
          <el-button type="primary" @click="testApiLoading"
            >测试API请求加载</el-button
          >
          <div v-if="apiData" class="mt-4 p-4 bg-gray-50 rounded">
            <p>API请求结果: {{ apiData }}</p>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useLoadingStore } from "@/store/modules/loading";
import ReLoading from "@/components/ReLoading/src/index.vue";
import ReSkeleton from "@/components/ReSkeleton/src/index.vue";
import ReError from "@/components/ReError/src/index.vue";
import { withLoading, withApiLoading } from "@/utils/loading";

const loadingStore = useLoadingStore();

// 局部加载状态
const isLocalLoading = computed(() =>
  loadingStore.isLocalLoading("test-local")
);

// 骨架屏状态
const showSkeleton = ref(false);
const skeletonType = ref("table");

// 错误提示状态
const showError = ref(false);
const errorMessage = ref("加载失败，请稍后重试");

// API请求状态
const apiData = ref<any>(null);

// 测试全局加载
const testGlobalLoading = async () => {
  await withLoading(async () => {
    // 模拟异步操作
    await new Promise(resolve => setTimeout(resolve, 2000));
  });
};

// 测试局部加载
const testLocalLoading = async () => {
  await withLoading(
    async () => {
      // 模拟异步操作
      await new Promise(resolve => setTimeout(resolve, 2000));
    },
    {
      type: "local",
      key: "test-local"
    }
  );
};

// 测试全屏加载
const testFullscreenLoading = async () => {
  await withLoading(
    async () => {
      // 模拟异步操作
      await new Promise(resolve => setTimeout(resolve, 2000));
    },
    {
      type: "fullscreen"
    }
  );
};

// 测试骨架屏
const testSkeleton = async () => {
  showSkeleton.value = true;
  // 模拟异步操作
  await new Promise(resolve => setTimeout(resolve, 3000));
  showSkeleton.value = false;
};

// 测试错误提示
const testError = () => {
  showError.value = true;
};

// 处理重试
const handleRetry = () => {
  showError.value = false;
  // 模拟重试操作
  testGlobalLoading();
};

// 测试API请求加载
const testApiLoading = async () => {
  try {
    const data = await withApiLoading(async () => {
      // 模拟API请求
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { message: "API请求成功" };
    });
    apiData.value = data;
  } catch (error) {
    console.error("API请求失败:", error);
  }
};

// 重置
const reset = () => {
  showSkeleton.value = false;
  showError.value = false;
  apiData.value = null;
  loadingStore.clearAllLocalLoading();
  loadingStore.setGlobalLoading(false);
  loadingStore.setFullscreenLoading(false);
};
</script>

<style scoped lang="scss">
.loading-demo {
  padding: 20px;
}
</style>
