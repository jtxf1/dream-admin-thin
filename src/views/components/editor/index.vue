<script setup lang="ts">
import { ref } from "vue";
import { EditorUpload } from "./components";

defineOptions({
  name: "Editor"
});

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
      <el-link
        class="mt-2"
        href="https://github.com/pure-admin/vue-pure-admin/blob/main/src/views/editor"
        target="_blank"
      >
        代码位置 src/views/editor
      </el-link>
    </template>
    <el-collapse v-model="activeNames" accordion>
      <el-collapse-item title="自定义图片上传" name="3">
        <EditorUpload v-if="activeNames === '3'" />
      </el-collapse-item>
    </el-collapse>
  </el-card>
</template>

<style lang="scss" scoped>
:deep(.el-collapse-item__header) {
  padding-left: 10px;
}
</style>
