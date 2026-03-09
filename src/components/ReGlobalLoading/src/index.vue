<template>
  <ReLoading
    :loading="isGlobalLoading"
    type="fullscreen"
    :text="loadingText"
    :spinnerType="spinnerType"
  />
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useLoadingStore } from "@/store/modules/loading";
import ReLoading from "@/components/ReLoading/src/index.vue";

const loadingStore = useLoadingStore();

const isGlobalLoading = computed(() => loadingStore.isGlobalLoading);

// 可以根据需要从配置或store中获取
const loadingText = "加载中...";
const spinnerType = "circle";
</script>
