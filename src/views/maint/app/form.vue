<script setup lang="ts">
import { ref } from "vue";
import ReCol from "@/components/ReCol";
import { formRules } from "./utils/rule";
import { FormProps } from "./utils/types";

const props = withDefaults(defineProps<FormProps>(), {
  formInline: () => ({
    id: 0,
    name: "",
    uploadPath: "",
    deployPath: "",
    backupPath: "",
    port: 0,
    startScript: "",
    deployScript: ""
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
      <re-col :value="20" :xs="24" :sm="24">
        <el-form-item label="应用名称" prop="name">
          <el-input
            v-model="newFormInline.name"
            clearable
            placeholder="请输入应用名称"
          />
        </el-form-item>
      </re-col>
      <re-col :value="10" :xs="24" :sm="24">
        <el-form-item label="应用端口" prop="port">
          <el-input-number
            v-model="newFormInline.port"
            clearable
            placeholder="请输入应用端口"
          />
        </el-form-item>
      </re-col>
      <re-col :value="20" :xs="24" :sm="24">
        <el-form-item label="上传目录" prop="uploadPath">
          <el-input
            v-model="newFormInline.uploadPath"
            clearable
            placeholder="请输入上传目录"
          />
        </el-form-item>
      </re-col>
      <re-col :value="20" :xs="24" :sm="24">
        <el-form-item label="部署路径" prop="deployPath">
          <el-input
            v-model="newFormInline.deployPath"
            clearable
            placeholder="请输入部署路径"
          />
        </el-form-item>
      </re-col>
      <re-col :value="20" :xs="24" :sm="24">
        <el-form-item label="备份路径" prop="backupPath">
          <el-input
            v-model="newFormInline.backupPath"
            clearable
            placeholder="请输入备份路径"
          />
        </el-form-item>
      </re-col>
      <re-col :value="20" :xs="24" :sm="24">
        <el-form-item label="启动脚本" prop="startScript">
          <el-input
            v-model="newFormInline.startScript"
            clearable
            placeholder="请输入启动脚本"
          />
        </el-form-item>
      </re-col>
      <re-col :value="20" :xs="24" :sm="24">
        <el-form-item label="部署脚本" prop="deployScript">
          <el-input
            v-model="newFormInline.deployScript"
            clearable
            placeholder="请输入部署脚本"
          />
        </el-form-item>
      </re-col>
    </el-row>
  </el-form>
</template>
