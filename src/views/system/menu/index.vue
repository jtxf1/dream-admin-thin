<script setup lang="ts">
import { ref } from "vue";
import { useMenu } from "./utils/hook";
import { transformI18n } from "@/plugins/i18n";
import { PureTableBar } from "@/components/RePureTableBar";
import { ReSearchForm } from "@/components/ReSearchForm";
import { ReTableActions } from "@/components/ReTableActions";
import { ReTableOperation } from "@/components/ReTableOperation";
import type { SearchFormField } from "@/components/ReSearchForm/src/types";
import type { TableAction } from "@/components/ReTableActions/src/types";
import type { TableOperation } from "@/components/ReTableOperation/src/types";

defineOptions({
  name: "SystemMenu"
});

const formRef = ref();
const tableRef = ref();
const {
  form,
  loading,
  columns,
  dataList,
  onSearch,
  resetForm,
  openDialog,
  exportClick,
  handleDelete,
  handleSelectionChange
} = useMenu();

function onFullscreen() {
  // 重置表格高度
  tableRef.value.setAdaptive();
}

const searchFields: SearchFormField[] = [
  {
    label: "菜单名称：",
    prop: "title",
    type: "input",
    placeholder: "请输入菜单名称",
    clearable: true,
    width: "180px"
  },
  {
    label: "",
    prop: "createTime",
    type: "daterange"
  }
];

const tableActions: TableAction[] = [
  {
    label: "新增菜单",
    type: "primary",
    icon: "ri:add-circle-line",
    action: "add",
    disabled: () => false
  },
  {
    label: "导出数据",
    type: "info",
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
    label: "新增",
    type: "primary",
    icon: "ri:add-circle-line",
    action: "addChild",
    visible: row => row.menuType !== 3
  },
  {
    label: "删除",
    type: "danger",
    icon: "ep:delete",
    action: "delete",
    visible: () => true,
    confirm: true,
    confirmMessage: row =>
      `是否确认删除菜单名称为${transformI18n(row.title)}的这条数据${row?.children?.length > 0 ? "。注意下级菜单也会一并删除，请谨慎操作" : ""}`
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
      openDialog("修改", row);
      break;
    case "addChild":
      openDialog("新增", { parentId: row.id } as any);
      break;
    case "delete":
      handleDelete(row);
      break;
  }
};
</script>

<template>
  <div class="main">
    <ReSearchForm
      :fields="searchFields"
      :model="form"
      :loading="loading"
      @search="onSearch"
      @reset="resetForm(formRef)"
    />

    <PureTableBar
      title="菜单管理"
      :columns="columns"
      :isExpandAll="false"
      :tableRef="tableRef?.getTableRef()"
      @refresh="onSearch"
      @fullscreen="onFullscreen"
    >
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
          adaptive
          :adaptiveConfig="{ offsetBottom: 45 }"
          align-whole="center"
          row-key="id"
          showOverflowTooltip
          table-layout="auto"
          :loading="loading"
          :size="size"
          :data="dataList"
          :columns="dynamicColumns"
          :header-cell-style="{
            background: 'var(--el-fill-color-light)',
            color: 'var(--el-text-color-primary)'
          }"
          @selection-change="handleSelectionChange"
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
</template>

<style lang="scss" scoped>
/* 使用Tailwind工具类替代原有样式 */

/* .search-form 已通过class="search-form bg-bg_color w-full pl-8 pt-[12px] space-y-3 overflow-auto"实现 */
</style>
