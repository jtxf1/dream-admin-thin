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
:deep(.el-collapse-item__header) {
  padding-left: 10px;
}

.card-header {
  display: flex;
  align-items: center;
}
</style>
