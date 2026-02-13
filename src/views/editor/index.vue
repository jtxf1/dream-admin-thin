<script setup lang="ts">
import { ref } from "vue";
import { Code } from "./components";

/**
 * 编辑器页面组件
 * 展示代码编辑器组件的使用示例
 */
defineOptions({
  name: "Editor"
});

/**
 * 当前激活的折叠面板名称
 */
const activeNames = ref("1");
</script>

<template>
  <el-card shadow="never">
    <template #header>
      <div class="card-header">
        <span class="font-medium">
          编辑器组件，采用开源的
          <el-link
            href="https://www.wangeditor.com"
            target="_blank"
            style="margin: 0 4px 5px; font-size: 16px"
          >
            Wangeditor
          </el-link>
        </span>
      </div>
    </template>
    <el-collapse v-model="activeNames" accordion>
      <el-collapse-item title="基础用法" name="1">
        <Code />
      </el-collapse-item>
    </el-collapse>
  </el-card>
</template>

<style lang="scss" scoped>
/* 使用Tailwind工具类替代原有样式 */

/* :deep(.el-collapse-item__header) 已通过在el-collapse-item组件上添加class="pl-2.5"实现 */

/* .card-header 已通过class="flex items-center"实现 */
</style>
