<script setup lang="ts">
import { ref } from "vue";
import { useDept } from "./utils/hook";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import datePicker from "@/views/components/date-picker.vue";
import * as Dept from "@/api/system/dept";

import Delete from "~icons/ep/delete";
import EditPen from "~icons/ep/edit-pen";
import Refresh from "~icons/ep/refresh";
import AddFill from "~icons/ri/add-circle-line";
import Search from "~icons/ep/search";
import { message } from "@/utils/message";
import { ElMessageBox } from "element-plus";

defineOptions({
  name: "Dept"
});

const handleSelectionChange = val => {
  multipleSelection.value = val;
  if (val != null && val.length > 0) {
    value2.value = false;
  } else {
    value2.value = true;
  }
};

async function deleteAll() {
  ElMessageBox.confirm(
    `确认要<strong>删除所选的</strong><strong style='color:var(--el-color-primary)'>${multipleSelection.value.length}</strong>个部门吗?`,
    "系统提示",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
      dangerouslyUseHTMLString: true,
      draggable: true
    }
  )
    .then(() => {
      Dept.del(multipleSelection.value.map(dept => dept.id));
      message("已删除所选的部门", {
        type: "success"
      });
      onSearch();
    })
    .catch(() => {
      onSearch();
    });
}
const exportClick = async () => {
  const response: Blob = await Dept.download(null);
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
const tableRef = ref();
const value2 = ref(true);
const {
  form,
  loading,
  columns,
  dataList,
  multipleSelection,
  onSearch,
  resetForm,
  openDialog,
  handleDelete
} = useDept(formRef, tableRef);

const load = (row: any, treeNode: unknown, resolve: (date: any) => void) => {
  setTimeout(() => {
    resolve(row?.children ?? []);
  }, 100);
};
</script>

<template>
  <div class="main">
    <el-form
      ref="formRef"
      :inline="true"
      :model="form"
      class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px]"
    >
      <el-form-item label="部门名称：" prop="name">
        <el-input
          v-model="form.name"
          placeholder="请输入部门名称"
          clearable
          class="!w-[200px]"
        />
      </el-form-item>
      <el-form-item label="状态：" prop="status">
        <el-select
          v-model="form.enabled"
          placeholder="请选择状态"
          clearable
          class="!w-[180px]"
        >
          <el-option label="启用" :value="true" />
          <el-option label="停用" :value="false" />
        </el-select>
      </el-form-item>
      <el-form-item label="" prop="createTime">
        <datePicker v-model="form.createTime" />
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

    <PureTableBar title="部门列表" @refresh="onSearch">
      <template #buttons>
        <el-button
          type="primary"
          :icon="useRenderIcon(AddFill)"
          @click="openDialog()"
        >
          新增部门
        </el-button>
        <el-button
          type="danger"
          :disabled="value2"
          :icon="useRenderIcon(Delete)"
          @click="deleteAll()"
        >
          删除部门
        </el-button>
        <el-button
          type="success"
          :icon="useRenderIcon('solar:upload-bold')"
          @click="exportClick()"
        >
          导出数据
        </el-button>
      </template>
      <template v-slot="{ size }">
        <pure-table
          :ref="tableRef"
          adaptive
          align-whole="center"
          row-key="id"
          showOverflowTooltip
          table-layout="auto"
          :loading="loading"
          :size="size"
          lazy
          :load="load"
          :columns="columns"
          :data="dataList"
          :header-cell-style="{
            background: 'var(--el-fill-color-light)',
            color: 'var(--el-text-color-primary)'
          }"
          @selection-change="handleSelectionChange"
        >
          <template #operation="{ row }">
            <el-button
              class="reset-margin"
              link
              type="primary"
              :size="size"
              :icon="useRenderIcon(EditPen)"
              @click="openDialog('编辑', row)"
            >
              编辑
            </el-button>
            <el-popconfirm
              :title="`是否确认删除部门名称为${row.name}的这条数据`"
              @confirm="handleDelete(row)"
            >
              <template #reference>
                <el-button
                  class="reset-margin"
                  link
                  type="primary"
                  :size="size"
                  :icon="useRenderIcon(Delete)"
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
.search-form {
  :deep(.el-form-item) {
    margin-bottom: 12px;
  }
}
</style>
