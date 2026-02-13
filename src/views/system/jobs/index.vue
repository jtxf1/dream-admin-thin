<script setup lang="ts">
import { ref } from "vue";
import { useDept } from "./utils/hook";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import datePicker from "@/views/components/date-picker.vue";

import Delete from "~icons/ep/delete";
import EditPen from "~icons/ep/edit-pen";
import Refresh from "~icons/ep/refresh";
import AddFill from "~icons/ri/add-circle-line";
import Search from "~icons/ep/search";

defineOptions({
  // 定义组件的名称
  name: "Jobs"
});
const formRef = ref();
const tableRef = ref();
const {
  formQuery,
  loading,
  columns,
  dataList,
  multipleSelection,
  pagination,
  onSearch,
  resetForm,
  openDialog,
  handleDelete,
  handleSizeChange,
  handleCurrentChange,
  handleSelectionChange,
  deleteAll,
  exportClick,
  runTask,
  recoverTask,
  openLogsDialog
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
      <el-form-item>
        <el-button
          type="primary"
          :icon="useRenderIcon(Search)"
          :loading="loading"
          @click="onSearch"
        >
          搜索
        </el-button>
        <el-button :icon="useRenderIcon(Refresh)" @click="resetForm(formRef)">
          重置
        </el-button>
      </el-form-item>
    </el-form>

    <PureTableBar title="定时任务列表" :columns="columns" @refresh="onSearch">
      <template #buttons>
        <el-button
          type="primary"
          :icon="useRenderIcon(AddFill)"
          @click="openDialog()"
        >
          新增
        </el-button>
        <el-button
          type="success"
          :disabled="multipleSelection.length !== 1"
          :icon="useRenderIcon(EditPen)"
          @click="openDialog('编辑', multipleSelection[0])"
        >
          编辑
        </el-button>
        <el-button
          type="danger"
          :disabled="multipleSelection.length <= 0"
          :icon="useRenderIcon(Delete)"
          @click="deleteAll()"
        >
          删除
        </el-button>
        <el-button
          type="warning"
          :icon="useRenderIcon('solar:upload-bold')"
          @click="exportClick()"
        >
          导出
        </el-button>
        <el-button
          type="warning"
          :icon="useRenderIcon('ep:document')"
          @click="openLogsDialog()"
        >
          日志
        </el-button>
      </template>
      <template v-slot="{ size, dynamicColumns }">
        <pure-table
          ref="tableRef"
          row-key="id"
          align-whole="center"
          table-layout="auto"
          :loading="loading"
          :size="size"
          stripe
          adaptive
          :adaptiveConfig="{ offsetBottom: 108 }"
          :data="dataList"
          :columns="dynamicColumns"
          :pagination="pagination"
          :paginationSmall="size === 'small' ? true : false"
          showOverflowTooltip
          default-expand-all
          :header-cell-style="{
            background: 'var(--el-fill-color-light)',
            color: 'var(--el-text-color-primary)'
          }"
          @selection-change="handleSelectionChange"
          @page-size-change="handleSizeChange"
          @page-current-change="handleCurrentChange"
        >
          <template #operation="{ row }">
            <el-button
              class="reset-margin"
              link
              type="primary"
              :size="size"
              @click="openDialog('编辑', row)"
            >
              编辑
            </el-button>

            <el-button
              class="reset-margin"
              link
              type="primary"
              :size="size"
              @click="runTask(row.id)"
            >
              执行
            </el-button>
            <el-button
              class="reset-margin"
              link
              type="primary"
              :size="size"
              @click="recoverTask(row.id)"
            >
              恢复
            </el-button>
            <el-popconfirm
              :title="`是否确认删除定时任务名称为${row.jobName}的这条数据`"
              @confirm="handleDelete(row)"
            >
              <template #reference>
                <el-button
                  class="reset-margin"
                  link
                  type="primary"
                  :size="size"
                >
                  删除
                </el-button>
              </template>
            </el-popconfirm>
          </template>
        </pure-table>
      </template>
    </PureTableBar>
  </div>
</template>

<style lang="scss" scoped>
/* 使用Tailwind工具类替代原有样式 */

/* :deep(.el-dropdown-menu__item i) 已通过在i元素上添加class="m-0"实现 */

/* .search-form 已通过class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px] space-y-3"实现 */
</style>
