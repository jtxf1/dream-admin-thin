<script setup lang="ts">
import { ref } from "vue";
import ReCol from "@/components/ReCol";
import { formRules } from "./utils/rule";
import { FormProps } from "./utils/types";
import { CRUD } from "@/api/utils";

/** 请求URL */
const crudURL = "serverDeploy";

const props = withDefaults(defineProps<FormProps>(), {
  formInline: () => ({
    id: 0,
    account: "",
    ip: "",
    name: "",
    password: "",
    port: 0
  })
});

const ruleFormRef = ref();
const newFormInline = ref(props.formInline);
/**
 * 加载数据
 */
async function testConnect() {
  await CRUD.get(crudURL, null).then(res => {});
}

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
    <el-row :gutter="20">
      <re-col :value="20" :xs="24" :sm="24">
        <el-form-item label="名称" prop="name">
          <el-input
            v-model="newFormInline.name"
            clearable
            placeholder="请输入名称"
          />
        </el-form-item>
      </re-col>
      <re-col :value="20" :xs="24" :sm="24">
        <el-form-item label="IP地址" prop="ip">
          <el-input
            v-model="newFormInline.ip"
            clearable
            placeholder="请输入IP地址"
          />
        </el-form-item>
      </re-col>
      <re-col :value="20" :xs="24" :sm="24">
        <el-form-item label="端口" prop="port">
          <el-input-number
            v-model="newFormInline.port"
            :min="0"
            :max="65535"
            clearable
            placeholder="请输入端口"
          />
        </el-form-item>
      </re-col>
      <re-col :value="20" :xs="24" :sm="24">
        <el-form-item label="账号" prop="account">
          <el-input
            v-model="newFormInline.account"
            clearable
            placeholder="请输入账号"
          />
        </el-form-item>
      </re-col>
      <re-col :value="20">
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="newFormInline.password"
            clearable
            show-password
            type="password"
            placeholder="请输入密码"
          />
        </el-form-item>
      </re-col>
    </el-row>
  </el-form>
</template>
