<script setup lang="ts">
import { ref } from "vue";
import tree from "./tree.vue";
import { useUser } from "./utils/hook";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import datePicker from "@/views/components/date-picker.vue";

import Upload from "~icons/ri/upload-line";
import Password from "~icons/ri/lock-password-line";
import More from "~icons/ep/more-filled";
import Delete from "~icons/ep/delete";
import EditPen from "~icons/ep/edit-pen";
import Refresh from "~icons/ep/refresh";
import AddFill from "~icons/ri/add-circle-line";
import Search from "~icons/ep/search";

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
  buttonClass,
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
</script>

<template>
  <div class="flex justify-between">
    <tree
      ref="treeRef"
      class="min-w-[200px] mr-2"
      :treeData="treeData"
      :treeLoading="treeLoading"
      @tree-select="onTreeSelect"
    />
    <div class="w-[calc(100%-200px)]">
      <el-form
        ref="formRef"
        :inline="true"
        :model="form"
        class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px]"
      >
        <el-form-item label="用户名称：" prop="blurry">
          <el-input
            v-model="form.blurry"
            placeholder="请输入用户名或邮箱"
            clearable
            class="!w-[160px]"
          />
        </el-form-item>
        <el-form-item label="" prop="createTime">
          <datePicker v-model="form.createTime" />
        </el-form-item>
        <el-form-item label="状态：" prop="enabled">
          <el-select
            v-model="form.enabled"
            placeholder="请选择"
            clearable
            class="!w-[160px]"
          >
            <el-option label="激活" value="true" />
            <el-option label="锁定" value="false" />
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
          <el-button :icon="useRenderIcon(Refresh)" @click="resetForm(formRef)">
            重置
          </el-button>
        </el-form-item>
      </el-form>

      <PureTableBar title="用户管理" :columns="columns" @refresh="onSearch">
        <template #buttons>
          <el-button
            type="success"
            :icon="useRenderIcon(AddFill)"
            @click="openDialog()"
          >
            新增用户
          </el-button>
          <el-button
            type="primary"
            :disabled="selectedNum !== 1"
            :icon="useRenderIcon(AddFill)"
            @click="openDialog('编辑', userEdit.user)"
          >
            编辑用户
          </el-button>
          <el-button
            type="danger"
            :disabled="selectedNum <= 0"
            :icon="useRenderIcon(Delete)"
            @click="onbatchDel()"
          >
            删除用户
          </el-button>
          <el-button
            type="info"
            :icon="useRenderIcon('solar:upload-bold')"
            @click="exportClick()"
          >
            导出数据
          </el-button>
          <el-button
            type="warning"
            :disabled="selectedNum <= 0"
            :icon="useRenderIcon(Refresh)"
            @click="handleResetBatch()"
          >
            重置密码
          </el-button>
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
                :title="`是否确认删除用户编号为${row.id}的这条数据`"
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
              <el-dropdown>
                <el-button
                  class="ml-3 mt-[2px]"
                  link
                  type="primary"
                  :size="size"
                  :icon="useRenderIcon(More)"
                />
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item>
                      <el-button
                        :class="buttonClass"
                        link
                        type="primary"
                        :size="size"
                        :icon="useRenderIcon(Upload)"
                        @click="handleUpload(row)"
                      >
                        上传头像
                      </el-button>
                    </el-dropdown-item>
                    <el-dropdown-item>
                      <el-button
                        :class="buttonClass"
                        link
                        type="primary"
                        :size="size"
                        :icon="useRenderIcon(Password)"
                        @click="handleReset(row)"
                      >
                        重置密码
                      </el-button>
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
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
