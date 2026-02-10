<script setup lang="ts">
import { onBeforeUnmount, ref, shallowRef, watch } from "vue";
import "@wangeditor/editor/dist/css/style.css";
import { Editor, Toolbar } from "@wangeditor/editor-for-vue";
import type { IDomEditor } from "@wangeditor/editor";

/**
 * 图片上传编辑器组件
 * 基于 WangEditor 实现的富文本编辑器，支持图片上传功能
 */
defineOptions({
  name: "EditorUpload"
});

// --- 定义事件 ---
const emit = defineEmits<{
  (e: "update:content", value: string): void;
}>();

// --- 编辑器配置 ---
const mode = "default";

// --- 编辑器实例，必须用 shallowRef ---
const editorRef = shallowRef<IDomEditor | null>(null);

// --- 内容 HTML ---
const valueHtml = ref<string>(
  "<p>仅提供代码参考，暂不可上传图片，可根据实际业务改写</p>"
);

/**
 * 工具栏配置
 */
const toolbarConfig = {
  excludeKeys: "fullScreen"
};

/**
 * 编辑器配置
 */
const editorConfig = {
  placeholder: "请输入内容...",
  MENU_CONF: {
    // 更多详细配置看 https://www.wangeditor.com/v5/menu-config.html#%E4%B8%8A%E4%BC%A0%E5%9B%BE%E7%89%87
    uploadImage: {
      // 服务端上传地址，根据实际业务改写
      server: "",
      // form-data 的 fieldName，根据实际业务改写
      fieldName: "file",
      // 选择文件时的类型限制，根据实际业务改写
      allowedFileTypes: ["image/png", "image/jpg", "image/jpeg"],
      // 自定义插入图片
      customInsert(res: any, insertFn: (url: string) => void) {
        try {
          // res.data.url是后端返回的图片地址，根据实际业务改写
          if (res?.data?.url) {
            // 模拟网络延迟
            setTimeout(() => {
              // insertFn插入图片进编辑器
              insertFn(res.data.url);
            }, 2000);
          } else {
            console.error("图片上传失败：后端未返回图片地址");
          }
        } catch (error) {
          console.error("插入图片失败：", error);
        }
      }
    }
  }
};

/**
 * 处理编辑器创建完成事件
 * @param editor - 编辑器实例
 */
const handleCreated = (editor: IDomEditor) => {
  // 记录 editor 实例，重要！
  editorRef.value = editor;
};

// --- 监听编辑器内容变化，实时传递给父组件 ---
watch(
  valueHtml,
  (newValue: string) => {
    // 触发自定义事件，将最新内容传递给父组件
    emit("update:content", newValue);
  },
  { immediate: true }
); // immediate: true 表示初始化时就触发一次

// --- 组件销毁时，也及时销毁编辑器 ---
onBeforeUnmount(() => {
  const editor = editorRef.value;
  if (editor) {
    try {
      editor.destroy();
      editorRef.value = null;
    } catch (error) {
      console.error("销毁编辑器失败：", error);
    }
  }
});
</script>

<template>
  <div class="wangeditor">
    <Toolbar
      :editor="editorRef"
      :defaultConfig="toolbarConfig"
      :mode="mode"
      style="border-bottom: 1px solid #ccc"
    />
    <Editor
      v-model="valueHtml"
      :defaultConfig="editorConfig"
      :mode="mode"
      style="height: 500px; overflow-y: hidden"
      @onCreated="handleCreated"
    />
  </div>
</template>

<style scoped>
.wangeditor {
  overflow: hidden;
  border: 1px solid #ccc;
  border-radius: 4px;
}
</style>
