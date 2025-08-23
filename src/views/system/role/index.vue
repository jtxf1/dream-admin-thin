<script setup lang="ts">
import { ref } from "vue";
import { useRole } from "./utils/hook";
import tree from "./tree.vue";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import * as Role from "@/api/system/role";
import { message } from "@/utils/message";
import datePicker from "@/views/components/date-picker.vue";

// import Database from "~icons/ri/database-2-line";
// import More from "~icons/ep/more-filled";
import Delete from "~icons/ep/delete";
import EditPen from "~icons/ep/edit-pen";
import Refresh from "~icons/ep/refresh";
import AddFill from "~icons/ri/add-circle-line";
import Search from "~icons/ep/search";

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
const tableRef = ref();
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
  // buttonClass,
  onTreeSelect,
  // buttonClass,
  onSearch,
  resetForm,
  openDialog,
  handleDelete,
  // handleDatabase,
  handleSizeChange,
  handleCurrentChange,
  handleCurrentChange1
} = useRole();
</script>

<template>
  <div class="flex justify-between">
    <div class="w-[calc(90%-180px)]">
      <el-form
        ref="formRef"
        :inline="true"
        :model="form"
        class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px]"
      >
        <el-form-item label="角色名称：" prop="blurry">
          <el-input
            v-model="form.blurry"
            placeholder="请输入角色名称"
            clearable
            class="!w-[200px]"
          />
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

      <PureTableBar title="角色列表" :columns="columns" @refresh="onSearch">
        <template #buttons>
          <el-button
            type="primary"
            :icon="useRenderIcon(AddFill)"
            @click="openDialog()"
          >
            新增角色
          </el-button>
          <el-button
            type="success"
            :icon="useRenderIcon('solar:upload-bold')"
            @click="exportClick()"
          >
            导出数据
          </el-button>
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
              <el-button
                class="reset-margin"
                link
                type="primary"
                :size="size"
                :icon="useRenderIcon(EditPen)"
                @click="openDialog('编辑', row)"
              >
                修改
              </el-button>
              <el-popconfirm
                :title="`是否确认删除角色名称为${row.name}的这条数据`"
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
    <tree
      v-model:currentRow="currentRow"
      v-model:deptId="parentId"
      class="w-[calc(25%-180px)]"
      :treeData="treeData"
      :treeLoading="treeLoading"
      @tree-select="onTreeSelect"
    />
  </div>
</template>

<style scoped lang="scss">
:deep(.el-dropdown-menu__item i) {
  margin: 0;
}

.search-form {
  :deep(.el-form-item) {
    margin-bottom: 12px;
  }
}
</style>
