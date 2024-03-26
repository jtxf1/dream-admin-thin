<script setup lang="ts">
import { useRole, useDetail } from "./hook";
import { getColumns } from "@/api/generator/generator";
import { onMounted, ref } from "vue";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";

import Empty from "../empty.svg?component";
import Refresh from "@iconify-icons/ep/refresh";
import Select from "@iconify-icons/ep/select";
import Finished from "@iconify-icons/ep/finished";

defineOptions({
  name: "TabQueryPreview"
});
const tableRef = ref();
const { initToDetail, getParameter } = useDetail();
initToDetail();
const { columns1, dataList1, syncCode, saveCode } = useRole();

async function onSearch() {
  await getColumns(getParameter.id).then(data => {
    dataList1.value.push(...data.data.content);
  });
}

onMounted(() => {
  onSearch();
});
</script>

<template>
  <div class="flex">
    <div class="w-[100%]">
      <PureTableBar
        :title="'字段配置：' + getParameter.id"
        :columns="columns1"
        :tableRef="tableRef?.getTableRef()"
        :loadingBool="true"
      >
        <template #buttons>
          <el-button
            type="info"
            :icon="useRenderIcon(Refresh)"
            @click="syncCode([getParameter.id.toString()])"
          >
            同步
          </el-button>
          <el-button
            type="primary"
            :icon="useRenderIcon(Select)"
            @click="saveCode"
          >
            保存
          </el-button>
          <el-button type="warning" :icon="useRenderIcon(Finished)">
            保存&生成
          </el-button>
        </template>
        <template v-slot="{ dynamicColumns }">
          <pure-table
            ref="tableRef"
            adaptive
            stripe
            :adaptiveConfig="{ offsetBottom: 32 }"
            align-whole="center"
            showOverflowTooltip
            table-layout="auto"
            :default-expand-all="false"
            :selectOnIndeterminate="false"
            :flexible="false"
            :columns="dynamicColumns"
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
  </div>
</template>

<style scoped>
:deep(.el-table__inner-wrapper::before) {
  height: 0;
}
</style>
