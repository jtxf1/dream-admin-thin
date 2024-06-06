<script setup lang="ts">
import { ref, reactive } from "vue";
import { useDept } from "./utils/hook";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import splitpane, { ContextProps } from "@/components/ReSplitPane";

import Delete from "@iconify-icons/ep/delete";
import EditPen from "@iconify-icons/ep/edit-pen";
import Refresh from "@iconify-icons/ep/refresh";
import AddFill from "@iconify-icons/ri/add-circle-line";
import Search from "@iconify-icons/ep/search";

defineOptions({
  // 定义组件的名称
  name: "Dept"
});
const formRef = ref();
const tableRef = ref();

const settingLR: ContextProps = reactive({
  minPercent: 20,
  defaultPercent: 40,
  split: "vertical"
});

const settingTB: ContextProps = reactive({
  minPercent: 20,
  defaultPercent: 40,
  split: "horizontal"
});
const {
  formQuery,
  loading,
  columns,
  dataList,
  multipleSelection,
  pagination,
  dictsDetails,
  onSearch,
  resetForm,
  openDialog,
  handleDelete,
  handleSizeChange,
  handleCurrentChange,
  handleSelectionChange,
  deleteAll,
  exportClick,
  handleRowClick,
  dataListDictDetail,
  paginationDictDetail,
  columnsDictDetail,
  onSearchDictDetail,
  handleSizeChange1,
  handleCurrentChange1,
  openDialog1,
  handleDelete1
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
      <el-form-item label="字典名称：" prop="blurry">
        <el-input
          v-model="formQuery.blurry"
          placeholder="请输入字典名称"
          clearable
          class="!w-[200px]"
        />
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

    <splitpane :splitSet="settingLR">
      <!-- #paneL 表示指定该组件为左侧面板 -->
      <template #paneL>
        <!-- 自定义左侧面板的内容 -->
        <el-scrollbar>
          <div class="dv-a">
            <PureTableBar
              title="字典列表"
              :columns="columns"
              @refresh="onSearch"
            >
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
              </template>
              <template v-slot="{ size, dynamicColumns }">
                <pure-table
                  ref="tableRef"
                  row-key="id"
                  align-whole="center"
                  table-layout="auto"
                  :loading="loading"
                  :size="size"
                  adaptive
                  stripe
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
                  @row-click="handleRowClick"
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
                      :title="`是否确认删除字典名称为${row.name}的这条数据`"
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
        </el-scrollbar>
      </template>
      <!-- #paneR 表示指定该组件为右侧面板 -->
      <template #paneR>
        <el-scrollbar
          ><div class="dv-b">
            <PureTableBar
              title="字典详情列表"
              :columns="columnsDictDetail"
              @refresh="onSearchDictDetail"
            >
              <template #buttons>
                <el-button
                  type="primary"
                  :icon="useRenderIcon(AddFill)"
                  @click="openDialog1()"
                >
                  新增
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
                  adaptive
                  stripe
                  :adaptiveConfig="{ offsetBottom: 108 }"
                  :data="dataListDictDetail"
                  :columns="dynamicColumns"
                  :pagination="paginationDictDetail"
                  :paginationSmall="size === 'small' ? true : false"
                  showOverflowTooltip
                  default-expand-all
                  :header-cell-style="{
                    background: 'var(--el-fill-color-light)',
                    color: 'var(--el-text-color-primary)'
                  }"
                  @page-size-change="handleSizeChange1"
                  @page-current-change="handleCurrentChange1"
                >
                  <template #operation="{ row }">
                    <el-button
                      class="reset-margin"
                      link
                      type="primary"
                      :size="size"
                      :icon="useRenderIcon(EditPen)"
                      @click="openDialog1('编辑', row)"
                    >
                      编辑
                    </el-button>
                    <el-popconfirm
                      :title="`是否确认删除字典详情名称为${row.label}的这条数据`"
                      @confirm="handleDelete1(row)"
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
          </div></el-scrollbar
        >
      </template>
    </splitpane>
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

.main {
  width: 100%;
  height: calc(110vh - 300px);
}
</style>
