<template>
  <codemirror
    v-model="myCode"
    placeholder="Code goes here..."
    :style="{ height: '100%' }"
    :autofocus="true"
    :indent-with-tab="true"
    :tab-size="2"
    :extensions="extensions"
    @ready="handleReady"
    @update:value="handleValueUpdate"
  />
</template>

<script setup lang="ts">
import { shallowRef, ref, watch, computed } from "vue";
import { Codemirror } from "vue-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { java } from "@codemirror/lang-java";
import { xml } from "@codemirror/lang-xml";
import { html } from "@codemirror/lang-html";
import { oneDark } from "@codemirror/theme-one-dark";

/**
 * 代码编辑器组件
 * 基于 CodeMirror 实现的代码编辑功能，支持多种语言
 */
defineOptions({
  name: "Codemirror"
});

/**
 * 组件属性
 */
const props = defineProps({
  /**
   * 代码内容
   */
  code: {
    type: String,
    default: ""
  },
  /**
   * 代码类型
   * 支持的值：java, javascript, xml, html
   */
  type: {
    type: String,
    default: "java"
  }
});

/**
 * 组件事件
 */
const emit = defineEmits(["update:code", "update:type"]);

/**
 * 编辑器内容
 */
const myCode = ref(props.code);

/**
 * CodeMirror 编辑器视图实例
 */
const view = shallowRef();

/**
 * 根据代码类型获取对应的语言扩展
 * @param type - 代码类型
 * @returns 语言扩展
 */
const getLanguageExtension = (type: string) => {
  switch (type) {
    case "javascript":
      return javascript();
    case "xml":
      return xml();
    case "html":
      return html();
    default:
      return java();
  }
};

/**
 * 编辑器扩展配置
 * 使用 computed 计算属性，根据代码类型动态生成扩展配置
 */
const extensions = computed(() => {
  return [getLanguageExtension(props.type), oneDark];
});

/**
 * 监听代码类型变化，更新编辑器内容
 */
watch(
  () => props.code,
  newValue => {
    myCode.value = newValue;
  }
);

/**
 * 处理编辑器准备就绪事件
 * @param payload - 包含编辑器视图实例的负载
 */
const handleReady = (payload: any) => {
  if (payload && payload.view) {
    view.value = payload.view;
  }
};

/**
 * 处理编辑器内容更新事件
 * @param value - 更新后的编辑器内容
 */
const handleValueUpdate = (value: string) => {
  emit("update:code", value);
};

/**
 * 获取 CodeMirror 编辑器状态
 * @returns 编辑器状态信息，包含选择范围、光标位置等
 */
const getCodemirrorStates = () => {
  if (!view.value) {
    return null;
  }

  const state = view.value.state;
  if (!state) {
    return null;
  }

  const ranges = state.selection.ranges;
  const selected = ranges.reduce((r, range) => r + range.to - range.from, 0);
  const cursor = ranges[0].anchor;
  const length = state.doc.length;
  const lines = state.doc.lines;

  // 返回编辑器状态信息
  return {
    selected,
    cursor,
    length,
    lines,
    ranges
  };
};
</script>
