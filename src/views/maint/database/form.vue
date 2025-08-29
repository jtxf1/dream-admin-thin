<script setup lang="ts">
import { ref } from "vue";
import ReCol from "@/components/ReCol";
import { formRules } from "./utils/rule";
import { FormProps } from "./utils/types";

const props = withDefaults(defineProps<FormProps>(), {
  formInline: () => ({
    name: "",
    jdbcUrl: "",
    userName: "",
    pwd: ""
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
        <el-form-item label="名称" prop="name">
          <el-input
            v-model="newFormInline.name"
            clearable
            placeholder="请输入名称"
          />
        </el-form-item>
      </re-col>
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="jdbc连接" prop="jdbcUrl">
          <el-input
            v-model="newFormInline.jdbcUrl"
            clearable
            placeholder="请输入jdbc连接"
          />
        </el-form-item>
      </re-col>
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="账号" prop="userName">
          <el-input
            v-model="newFormInline.userName"
            clearable
            placeholder="请输入账号"
          />
        </el-form-item>
      </re-col>
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="密码" prop="pwd">
          <el-input
            v-model="newFormInline.pwd"
            clearable
            show-password
            type="password"
            placeholder="请输入密码"
        /></el-form-item>
      </re-col>
    </el-row>
  </el-form>
</template>
