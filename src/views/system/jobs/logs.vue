<script setup lang="ts">
import { ref } from "vue";
import { useDept } from "./utils/hookLogs";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import datePicker from "@/views/components/date-picker.vue";

import Refresh from "~icons/ep/refresh";
import Search from "~icons/ep/search";

defineOptions({
  // 定义组件的名称
  name: "JobsLogs"
});
const formRef = ref();
const tableRef = ref();
const {
  formQuery,
  loading,
  columns,
  dataList,
  pagination,
  /** 搜索 */
  onSearch,
  /** 分页大小 */
  handleSizeChange,
  /** 第几页 */
  handleCurrentChange,
  /** 导出 */
  exportClick
} = useDept();
</script>

<template>
  <div class="main">
    <el-form
      ref="formRef"
      :inline="true"
      :model="formQuery"
      class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px]"
    >
      <el-form-item label="任务名称：" prop="jobName">
        <el-input
          v-model="formQuery.jobName"
          placeholder="请输入任务名称"
          clearable
          class="!w-[200px]"
        />
      </el-form-item>
      <el-form-item label="创建日期：" prop="createTime">
        <datePicker v-model="formQuery.createTime" />
      </el-form-item>
      <el-form-item label="日志类型" prop="isSuccess">
        <el-select
          v-model="formQuery.isSuccess"
          placeholder="请选择"
          clearable
          class="!w-[150px]"
        >
          <el-option label="成功" value="true" />
          <el-option label="失败" value="false" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          :icon="useRenderIcon(Search)"
          :loading="loading"
          @click="onSearch"
        >
          搜索
        </el-button>
        <el-button :icon="useRenderIcon(Refresh)" @click="exportClick()">
          导出
        </el-button>
      </el-form-item>
    </el-form>
    <pure-table
      ref="tableRef"
      row-key="id"
      align-whole="center"
      table-layout="auto"
      :loading="loading"
      stripe
      adaptive
      :adaptiveConfig="{ offsetBottom: 108 }"
      :data="dataList"
      :columns="columns"
      :pagination="pagination"
      showOverflowTooltip
      default-expand-all
      :header-cell-style="{
        background: 'var(--el-fill-color-light)',
        color: 'var(--el-text-color-primary)'
      }"
      @page-size-change="handleSizeChange"
      @page-current-change="handleCurrentChange"
    />
  </div>
</template>

<style lang="scss" scoped>
:deep(.el-dropdown-menu__item i) {
  margin: 0;
}

.search-form {
  :deep(.el-form-item) {
    margin-bottom: 12px;
  }
}
</style>
