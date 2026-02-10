<script setup lang="ts">
import { ref } from "vue";
import { EditorUpload } from "./components";

/**
 * 编辑器页面组件
 * 使用 EditorUpload 组件并显示编辑器内容
 */
defineOptions({
  name: "Editor"
});

/**
 * 编辑器内容
 */
const editorContent = ref<string>("");

/**
 * 处理编辑器内容更新
 * @param content - 编辑器最新内容
 */
const handleContentUpdate = (content: string) => {
  try {
    editorContent.value = content;
    // 这里可以处理实时获取到的编辑器内容
    console.log("编辑器内容已更新：", content);
  } catch (error) {
    console.error("更新编辑器内容失败：", error);
  }
};
</script>

<template>
  <div class="editor-container">
    <h2 class="editor-title">富文本编辑器</h2>
    <EditorUpload @update:content="handleContentUpdate" />
    <div class="editor-content-preview">
      <h3>编辑器内容预览：</h3>
      <div class="content-display">{{ editorContent }}</div>
    </div>
  </div>
</template>

<style scoped>
.editor-container {
  max-width: 1200px;
  padding: 20px;
  margin: 0 auto;
}

.editor-title {
  margin-bottom: 20px;
  font-size: 24px;
  color: #333;
}

.editor-content-preview {
  padding: 20px;
  margin-top: 30px;
  background-color: #f9f9f9;
  border: 1px solid #eee;
  border-radius: 4px;
}

.editor-content-preview h3 {
  margin-bottom: 10px;
  font-size: 18px;
  color: #666;
}

.content-display {
  min-height: 100px;
  padding: 10px;
  word-break: break-all;
  white-space: pre-wrap;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
}
</style>
