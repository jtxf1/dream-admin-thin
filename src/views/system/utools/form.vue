<script setup lang="ts">
import { ref } from "vue";
import ReCol from "@/components/ReCol";
import { formRules } from "./utils/rule";
import { FormProps } from "./utils/types";

const props = withDefaults(defineProps<FormProps>(), {
  formInline: () => ({
    id: 0,
    storageId: 0,
    realName: "",
    name: "",
    suffix: "",
    path: "",
    type: "",
    size: ""
  })
});

const ruleFormRef = ref();
const newFormInline = ref(props.formInline);

function getRef() {
  return ruleFormRef.value;
}
defineExpose({ getRef });
</script>

<template>
  <el-form
    ref="ruleFormRef"
    :model="newFormInline"
    :rules="formRules"
    label-width="82px"
  >
    <el-row :gutter="30">
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="ID" prop="storageId">
          <el-input
            v-model="newFormInline.storageId"
            clearable
            placeholder="请输入ID"
          />
        </el-form-item>
      </re-col>
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="文件真实的名称" prop="realName">
          <el-input
            v-model="newFormInline.realName"
            clearable
            placeholder="请输入文件真实的名称"
          />
        </el-form-item>
      </re-col>
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="文件名" prop="name">
          <el-input
            v-model="newFormInline.name"
            clearable
            placeholder="请输入文件名"
          />
        </el-form-item>
      </re-col>
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="后缀" prop="suffix">
          <el-input
            v-model="newFormInline.suffix"
            clearable
            placeholder="请输入后缀"
          />
        </el-form-item>
      </re-col>
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="路径" prop="path">
          <el-input
            v-model="newFormInline.path"
            clearable
            placeholder="请输入路径"
          />
        </el-form-item>
      </re-col>
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="类型" prop="type">
          <el-input
            v-model="newFormInline.type"
            clearable
            placeholder="请输入类型"
          />
        </el-form-item>
      </re-col>
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="大小" prop="size">
          <el-input
            v-model="newFormInline.size"
            clearable
            placeholder="请输入大小"
          />
        </el-form-item>
      </re-col>
    </el-row>
  </el-form>
</template>
