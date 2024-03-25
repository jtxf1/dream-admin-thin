<script setup lang="ts">
import { useRole, useDetail } from "./hook";
import { getColumns } from "@/api/generator/generator";
import { onMounted, ref } from "vue";

import Empty from "../empty.svg?component";

defineOptions({
  name: "TabQueryPreview"
});
const tableRef = ref();
const { initToDetail, getParameter } = useDetail();
initToDetail();
const { columns1, loading, dataList1, onAdd, onDel } = useRole();

onMounted(() => {
  getColumns(getParameter.id).then(data => {
    dataList1.value.push(...data.data.content);
  });
});
</script>

<template>
  <div class="flex">
    <!-- <div>{{ getParameter }}</div> -->
    <el-scrollbar height="540px">
      <code>
        <pre class="w-[400px]"> {{ dataList1 }}</pre>
      </code>
    </el-scrollbar>
    <!-- <pure-table
      title="部门列表"
      row-key="id"
      align-whole="center"
      :header-cell-style="{
        background: 'var(--el-fill-color-light)',
        color: 'var(--el-text-color-primary)'
      }"
      :data="dataList1"
      :columns="columns1"
    >
      <template #empty>
        <Empty fill="var(--el-svg-monochrome-grey)" class="m-auto" />
      </template>
    </pure-table> -->

    <PureTableBar
      title="字段配置："
      :columns="columns1"
      :tableRef="tableRef?.getTableRef()"
    >
      <template #add>
        <el-button type="primary"> 新增部门 </el-button>
      </template>
      <template>
        <pure-table
          ref="tableRef"
          adaptive
          :adaptiveConfig="{ offsetBottom: 32 }"
          align-whole="center"
          row-key="id"
          showOverflowTooltip
          table-layout="auto"
          default-expand-all
          :loading="loading"
          :columns="columns1"
          :data="dataList1"
          :header-cell-style="{
            background: 'var(--el-fill-color-light)',
            color: 'var(--el-text-color-primary)'
          }"
        >
          <template #empty>
            <Empty fill="var(--el-svg-monochrome-grey)" class="m-auto" />
          </template>
        </pure-table>
      </template>
    </PureTableBar>
  </div>
</template>

<style scoped>
:deep(.el-table__inner-wrapper::before) {
  height: 0;
}
</style>
