<script setup lang="ts">
import { ref } from "vue";
import { DeptTreeProps, DeptTreeEmits } from "./types";

const props = withDefaults(defineProps<DeptTreeProps>(), {
  loading: false,
  defaultExpandedKeys: () => [],
  defaultCheckedKeys: () => [],
  checkStrictly: false,
  showCheckbox: false
});

const emit = defineEmits<DeptTreeEmits>();

const treeRef = ref();

const handleNodeClick = (node: any) => {
  emit("select", node, true);
};

const handleCheckChange = (
  checkedKeys: (string | number)[],
  checkedNodes: any[]
) => {
  emit("check", checkedKeys, checkedNodes);
};
</script>

<template>
  <el-tree
    ref="treeRef"
    :data="treeData"
    :loading="loading"
    :default-expanded-keys="defaultExpandedKeys"
    :default-checked-keys="defaultCheckedKeys"
    :check-strictly="checkStrictly"
    :show-checkbox="showCheckbox"
    node-key="id"
    default-expand-all
    @node-click="handleNodeClick"
    @check-change="handleCheckChange"
  />
</template>

<style scoped lang="scss">
/* 使用Tailwind工具类替代原有样式 */

/* 树组件样式已通过Element Plus默认样式实现 */
</style>
