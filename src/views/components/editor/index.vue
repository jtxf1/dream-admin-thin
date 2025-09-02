<script setup lang="ts">
import { ref } from "vue";
import { EditorUpload } from "./components";

const editorContent = ref("");
const handleContentUpdate = content => {
  editorContent.value = content;
  // 这里可以处理实时获取到的编辑器内容
};
defineOptions({
  name: "Editor"
});
</script>

<template>
  <div>
    <EditorUpload @update:content="handleContentUpdate" />
    <div>编辑器内容：{{ editorContent }}</div>
  </div>
</template>
