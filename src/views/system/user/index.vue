<script setup lang="ts">
import { ref } from "vue";
import { useUser } from "./utils/hook";
import { PureTableBar } from "@/components/RePureTableBar";
import { ReSearchForm } from "@/components/ReSearchForm";
import { ReTableActions } from "@/components/ReTableActions";
import { ReTableOperation } from "@/components/ReTableOperation";
import { ReDeptTree } from "@/components/ReDeptTree";
import type { SearchFormField } from "@/components/ReSearchForm/src/types";
import type { TableAction } from "@/components/ReTableActions/src/types";
import type { TableOperation } from "@/components/ReTableOperation/src/types";

defineOptions({
  name: "User"
});

const treeRef = ref();
const formRef = ref();
const tableRef = ref();

const {
  form,
  loading,
  columns,
  dataList,
  treeData,
  treeLoading,
  selectedNum,
  pagination,
  userEdit,
  onSearch,
  resetForm,
  onbatchDel,
  openDialog,
  onTreeSelect,
  handleDelete,
  handleUpload,
  handleReset,
  handleSizeChange,
  handleCurrentChange,
  handleSelectionChange,
  handleResetBatch,
  exportClick
} = useUser(tableRef);

const searchFields: SearchFormField[] = [
  {
    label: "用户名称：",
    prop: "blurry",
    type: "input",
    placeholder: "请输入用户名或邮箱",
    clearable: true,
    width: "160px"
  },
  {
    label: "",
    prop: "createTime",
    type: "daterange"
  },
  {
    label: "状态：",
    prop: "enabled",
    type: "select",
    placeholder: "请选择",
    clearable: true,
    width: "160px",
    options: [
      { label: "激活", value: "true" },
      { label: "锁定", value: "false" }
    ]
  }
];

const tableActions: TableAction[] = [
  {
    label: "新增用户",
    type: "success",
    icon: "ri:add-circle-line",
    action: "add",
    disabled: () => false
  },
  {
    label: "编辑用户",
    type: "primary",
    icon: "ep:edit-pen",
    action: "edit",
    disabled: count => count !== 1
  },
  {
    label: "删除用户",
    type: "danger",
    icon: "ep:delete",
    action: "delete",
    disabled: count => count <= 0
  },
  {
    label: "导出数据",
    type: "info",
    icon: "solar:upload-bold",
    action: "export",
    disabled: () => false
  },
  {
    label: "重置密码",
    type: "warning",
    icon: "ep:refresh",
    action: "resetBatch",
    disabled: count => count <= 0
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
    confirmMessage: row => `是否确认删除用户编号为${row.id}的这条数据`
  },
  {
    label: "上传头像",
    type: "info",
    icon: "ri:upload-line",
    action: "upload",
    visible: () => true
  },
  {
    label: "重置密码",
    type: "warning",
    icon: "ri:lock-password-line",
    action: "reset",
    visible: () => true
  }
];

const handleTableAction = (action: string) => {
  switch (action) {
    case "add":
      openDialog();
      break;
    case "edit":
      openDialog("编辑", userEdit.user);
      break;
    case "delete":
      onbatchDel();
      break;
    case "export":
      exportClick();
      break;
    case "resetBatch":
      handleResetBatch();
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
    case "upload":
      handleUpload(row);
      break;
    case "reset":
      handleReset(row);
      break;
  }
};

// 重置表单时清空部门树选中状态
const handleResetForm = formEl => {
  resetForm(formEl);
  // 清空ReDeptTree组件的选中状态
  treeRef.value?.onTreeReset(true);
};

// 搜索时获取部门树选中值作为搜索条件
const handleSearch = () => {
  // 调用ReDeptTree组件的testClick方法来获取选中的值
  treeRef.value?.testClick();
  onSearch();
};
</script>

<template>
  <div class="flex justify-between">
    <ReDeptTree
      ref="treeRef"
      class="min-w-[200px] mr-2"
      :visible="true"
      :treeData="treeData"
      :treeLoading="treeLoading"
      @tree-select="onTreeSelect"
    />
    <div class="w-[calc(100%-200px)]">
      <ReSearchForm
        :fields="searchFields"
        :model="form"
        :loading="loading"
        @search="handleSearch"
        @reset="handleResetForm(formRef)"
      />

      <PureTableBar title="用户管理" :columns="columns" @refresh="onSearch">
        <template #buttons>
          <ReTableActions
            :actions="tableActions"
            :selectedCount="selectedNum"
            :loading="loading"
            @action="handleTableAction"
          />
        </template>
        <template v-slot="{ size, dynamicColumns }">
          <pure-table
            ref="tableRef"
            row-key="id"
            adaptive
            stripe
            align-whole="center"
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
            @selection-change="handleSelectionChange"
            @page-size-change="handleSizeChange"
            @page-current-change="handleCurrentChange"
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
  </div>
</template>

<style scoped lang="scss">
/* 使用Tailwind工具类替代原有样式 */

/* .search-form 已通过class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px] space-y-3"实现 */
</style>
