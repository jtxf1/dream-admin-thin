<script setup lang="ts">
import { useGenerator, useDetail } from "./hook";
import {
  getColumns,
  generateConfig,
  pugGenerateConfig,
  generate
} from "@/api/generator/generator";
import { onMounted, ref, reactive } from "vue";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import ReCol from "@/components/ReCol";
import { FormItemProps } from "./types";
import { formRules } from "./rule";
import { message } from "@/utils/message";

import Empty from "../empty.svg?component";
import Refresh from "~icons/ep/refresh";
import Select from "~icons/ep/select";
import Finished from "~icons/ep/finished";

defineOptions({
  name: "TabQueryPreview"
});

const tableRef = ref();
const ruleFormRef = ref();
const { initToDetail, getParameter } = useDetail();
const props = reactive<FormItemProps>({
  author: "",
  pack: "",
  moduleName: "",
  path: "",
  apiAlias: getParameter.apiName,
  apiPath: "",
  prefix: "",
  cover: false,
  apiCover: true,
  webCover: true
});

initToDetail();
const { columns1, dataList1, syncCode, saveCode } = useGenerator();

function getRef() {
  return ruleFormRef.value;
}
async function onSearch() {
  await getColumns(getParameter.id).then(data => {
    dataList1.value = data.data;
  });
  generateConfig<FormItemProps>(getParameter.id).then(data => {
    if (data?.data?.id === 0) {
      data.data.id = null;
    }
    Object.assign(props, data.data);
  });
}

async function putConfig() {
  await pugGenerateConfig(props).then(data => {
    message("保存成功", {
      type: "success"
    });
    generateConfig<FormItemProps>(getParameter.id).then(data => {
      Object.assign(props, data.data);
    });
  });
}

async function generateCode() {
  await getColumns(getParameter.id).then(data => {
    generate(getParameter.id).then(data => {
      message("保存&生成成功", {
        type: "success"
      });
    });
  });
}
onMounted(() => {
  onSearch();
});
defineExpose({ getRef });
</script>

<template>
  <el-row :gutter="15">
    <el-col style="margin-bottom: 10px">
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
          <el-button
            type="warning"
            :icon="useRenderIcon(Finished)"
            @click="generateCode"
          >
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
            maxHeight="600px"
          >
            <template #empty>
              <Empty fill="var(--el-svg-monochrome-grey)" class="m-auto" />
            </template>
          </pure-table>
        </template>
      </PureTableBar>
    </el-col>
    <el-col>
      <el-card>
        <template #header>
          <el-row :gutter="24">
            <el-col :span="2">生成配置</el-col>
            <el-col :span="2" :offset="20">
              <el-button
                type="primary"
                :icon="useRenderIcon(Select)"
                @click="putConfig"
              >
                保存
              </el-button></el-col
            >
          </el-row>
        </template>
        <p>
          <el-form
            ref="ruleFormRef"
            label-width="82px"
            :model="props"
            :rules="formRules"
          >
            <el-row :gutter="22">
              <re-col :value="10" :xs="20" :sm="20">
                <el-form-item label="作者名称" prop="author">
                  <el-input
                    v-model="props.author"
                    clearable
                    placeholder="请输入作者名称"
                  />
                </el-form-item>
              </re-col>
              <re-col :value="10" :xs="14" :sm="14" class="spenFone">
                类上面的作者名称
              </re-col>
              <re-col :value="10" :xs="20" :sm="20">
                <el-form-item label="模块名称" prop="moduleName">
                  <el-input
                    v-model="props.moduleName"
                    clearable
                    placeholder="请输入模块名称"
                  />
                </el-form-item>
              </re-col>
              <re-col :value="10" :xs="14" :sm="14" class="spenFone">
                模块的名称，请选择项目中已存在的模块
              </re-col>
              <re-col :value="10" :xs="20" :sm="20">
                <el-form-item label="至于包下" prop="pack">
                  <el-input
                    v-model="props.pack"
                    clearable
                    placeholder="请输入包名"
                  />
                </el-form-item>
              </re-col>
              <re-col :value="10" :xs="14" :sm="14" class="spenFone">
                项目包的名称，生成的代码放到哪个包里面
              </re-col>
              <re-col :value="10" :xs="20" :sm="20">
                <el-form-item label="接口名称" prop="apiAlias">
                  <el-input
                    v-model="props.apiAlias"
                    clearable
                    placeholder="请输入接口名称"
                  />
                </el-form-item>
              </re-col>
              <re-col :value="10" :xs="14" :sm="14" class="spenFone">
                接口的名称，用于控制器与接口文档中
              </re-col>
              <re-col :value="10" :xs="20" :sm="20">
                <el-form-item label="前端路径" prop="path">
                  <el-input
                    v-model="props.path"
                    clearable
                    placeholder="请输入前端路径"
                  />
                </el-form-item>
              </re-col>
              <re-col :value="10" :xs="14" :sm="14" class="spenFone">
                输入views文件夹下的目录，不存在即创建
              </re-col>
              <re-col :value="10" :xs="20" :sm="20">
                <el-form-item label="接口目录" prop="apiPath">
                  <el-input
                    v-model="props.apiPath"
                    clearable
                    placeholder="请输入接口目录"
                  />
                </el-form-item>
              </re-col>
              <re-col :value="10" :xs="14" :sm="14" class="spenFone">
                Api存放路径[src/api]，为空则自动生成路径
              </re-col>
              <re-col :value="10" :xs="20" :sm="20">
                <el-form-item label="去表前缀" prop="prefix">
                  <el-input
                    v-model="props.prefix"
                    clearable
                    placeholder="请输入去表前缀"
                  />
                </el-form-item>
              </re-col>
              <re-col :value="10" :xs="14" :sm="14" class="spenFone">
                默认不去除表前缀，可自定义
              </re-col>
              <re-col :value="10" :xs="20" :sm="20">
                <el-form-item label="是否覆盖" prop="cover">
                  <el-radio-group
                    v-model="props.cover"
                    size="small"
                    style="width: 40%"
                  >
                    <el-radio-button label="是" value="true" />
                    <el-radio-button label="否" value="false" />
                  </el-radio-group>
                </el-form-item>
              </re-col>
              <re-col :value="10" :xs="14" :sm="14" class="spenFone">
                谨防误操作，请慎重选择
              </re-col>
              <re-col :value="10" :xs="20" :sm="20">
                <el-form-item label="前端代码" prop="webCover">
                  <el-radio-group
                    v-model="props.webCover"
                    size="small"
                    style="width: 40%"
                  >
                    <el-radio-button label="是" :value="true" />
                    <el-radio-button label="否" :value="false" />
                  </el-radio-group>
                </el-form-item>
              </re-col>
              <re-col :value="10" :xs="14" :sm="14" class="spenFone">
                谨防误操作，请慎重选择
              </re-col>
              <re-col :value="10" :xs="20" :sm="20">
                <el-form-item label="后端代码" prop="apiCover">
                  <el-radio-group
                    v-model="props.apiCover"
                    size="small"
                    style="width: 40%"
                  >
                    <el-radio-button label="是" :value="true" />
                    <el-radio-button label="否" :value="false" />
                  </el-radio-group>
                </el-form-item>
              </re-col>
              <re-col :value="10" :xs="14" :sm="14" class="spenFone">
                谨防误操作，请慎重选择
              </re-col>
            </el-row>
          </el-form>
        </p>
      </el-card>
    </el-col>
  </el-row>
</template>

<style scoped>
:deep(.el-table__inner-wrapper::before) {
  height: 0;
}

.spenFone {
  margin-left: 10px;
  color: #c0c0c0;
}
</style>
