<script setup lang="ts">
import { ref } from "vue";
import { useRole } from "./utils/hook";
import { PureTableBar } from "@/components/RePureTableBar";
import { ReSearchForm } from "@/components/ReSearchForm";
import { ReTableActions } from "@/components/ReTableActions";
import { ReTableOperation } from "@/components/ReTableOperation";
import { ReDeptTree } from "@/components/ReDeptTree";
import * as Role from "@/api/system/role";
import { message } from "@/utils/message";
import type { SearchFormField } from "@/components/ReSearchForm/src/types";
import type { TableAction } from "@/components/ReTableActions/src/types";
import type { TableOperation } from "@/components/ReTableOperation/src/types";

defineOptions({
  name: "Role"
});

const exportClick = async () => {
  const response: Blob = await Role.download(null);
  const a = document.createElement("a");
  const url = window.URL.createObjectURL(response); // 创建媒体流 url ，详细了解可自己查 URL.createObjectURL（推荐 MDN ）

  a.href = url;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  a.parentNode.removeChild(a);
  window.URL.revokeObjectURL(url); // 删除创建的媒体流 url 对象
  message("导出成功", {
    type: "success"
  });
};
const formRef = ref();
const {
  form,
  loading,
  columns,
  dataList,
  pagination,
  treeData,
  treeLoading,
  currentRow,
  parentId,
  onTreeSelect,
  onSearch,
  resetForm,
  openDialog,
  handleDelete,
  handleSizeChange,
  handleCurrentChange,
  handleCurrentChange1
} = useRole();
const searchFields: SearchFormField[] = [
  {
    label: "角色名称：",
    prop: "blurry",
    type: "input",
    placeholder: "请输入角色名称",
    clearable: true,
    width: "200px"
  },
  {
    label: "",
    prop: "createTime",
    type: "daterange"
  }
];

const tableActions: TableAction[] = [
  {
    label: "新增角色",
    type: "primary",
    icon: "ri:add-circle-line",
    action: "add",
    disabled: () => false
  },
  {
    label: "导出数据",
    type: "success",
    icon: "solar:upload-bold",
    action: "export",
    disabled: () => false
  }
];

const rowOperations: TableOperation[] = [
  {
    label: "修改",
    type: "primary",
    icon: "ep:edit-pen",
    action: "edit",
    visible: () => true
  },
  {
    label: "删除",
    type: "danger",
    icon: "ep:delete",
    action: "delete",
    visible: () => true,
    confirm: true,
    confirmMessage: row => `是否确认删除角色名称为${row.name}的这条数据`
  }
];

const handleTableAction = (action: string) => {
  switch (action) {
    case "add":
      openDialog();
      break;
    case "export":
      exportClick();
      break;
  }
};

const handleRowOperation = (action: string, row: any) => {
  switch (action) {
    case "edit":
      openDialog("编辑", row);
      break;
    case "delete":
      handleDelete(row);
      break;
  }
};
</script>

<template>
  <div class="flex justify-between">
    <div class="w-[calc(90%-180px)]">
      <ReSearchForm
        :fields="searchFields"
        :model="form"
        :loading="loading"
        @search="onSearch"
        @reset="resetForm(formRef)"
      />

      <PureTableBar title="角色列表" :columns="columns" @refresh="onSearch">
        <template #buttons>
          <ReTableActions
            :actions="tableActions"
            :selectedCount="0"
            :loading="loading"
            @action="handleTableAction"
          />
        </template>
        <template v-slot="{ size, dynamicColumns }">
          <pure-table
            ref="tableRef"
            align-whole="center"
            showOverflowTooltip
            adaptive
            table-layout="auto"
            :loading="loading"
            :size="size"
            :data="dataList"
            :columns="dynamicColumns"
            :pagination="pagination"
            :paginationSmall="size === 'small' ? true : false"
            :header-cell-style="{
              background: 'var(--el-fill-color-light)',
              color: 'var(--el-text-color-primary)'
            }"
            highlight-current-row
            @selection-change="handleCurrentChange"
            @page-size-change="handleSizeChange"
            @page-current-change="handleCurrentChange"
            @current-change="handleCurrentChange1"
          >
            <template #operation="{ row }">
              <ReTableOperation
                :row="row"
                :size="size"
                :operations="rowOperations"
                @operation="handleRowOperation"
              />
            </template>
          </pure-table>
        </template>
      </PureTableBar>
    </div>
    <ReDeptTree
      v-model:currentRow="currentRow"
      v-model:deptId="parentId"
      class="w-[calc(25%-180px)]"
      :treeData="treeData"
      :treeLoading="treeLoading"
      @select="onTreeSelect"
    />
  </div>
</template>
