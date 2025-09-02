<script setup lang="ts">
import { ref } from "vue";
import ReCol from "@/components/ReCol";
import { message } from "@/utils/message";
import { CRUD } from "@/api/utils";
import { formRules } from "./utils/rule";
import { FormProps } from "./utils/types";

const props = withDefaults(defineProps<FormProps>(), {
  formInline: () => ({
    id: 0,
    fromUser: ""
  })
});

const ruleFormRef = ref();
const newFormInline = ref(props.formInline);

const submitForm = formEl => {
  formEl.validate(valid => {
    if (valid) {
      CRUD.put("email", {
        data: newFormInline.value
      })
        .then(success => {
          if (success) {
            message("提交成功", { type: "success" });
          } else {
            message("提交失败");
          }
        })
        .catch(error => {
          message(`提交异常 ${error}`, { type: "error" });
        });
    } else {
      return false;
    }
  });
};
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
    label-width="102px"
  >
    <el-row :gutter="30">
      <re-col :value="20" :xs="24" :sm="24">
        <el-form-item label-width="auto" label="发件人邮箱" prop="fromUser">
          <el-input
            v-model="newFormInline.fromUser"
            clearable
            placeholder="请输入发件人邮箱"
          />
        </el-form-item>
      </re-col>
      <re-col :value="20" :xs="24" :sm="24">
        <el-form-item label="发件用户名" prop="user">
          <el-input
            v-model="newFormInline.user"
            clearable
            placeholder="发件用户名"
          />
        </el-form-item>
      </re-col>
      <re-col :value="20" :xs="24" :sm="24">
        <el-form-item label="邮箱密码" prop="pass">
          <el-input
            v-model="newFormInline.pass"
            clearable
            show-password
            placeholder="邮箱密码"
          />
        </el-form-item>
      </re-col>
      <re-col :value="20" :xs="24" :sm="24">
        <el-form-item label="SMTP地址" prop="host">
          <el-input
            v-model="newFormInline.host"
            clearable
            placeholder="SMTP地址"
          />
        </el-form-item>
      </re-col>
      <re-col :value="20" :xs="24" :sm="24">
        <el-form-item label="SMTP端口" prop="port">
          <el-input
            v-model="newFormInline.port"
            clearable
            placeholder="SMTP端口"
          />
        </el-form-item>
      </re-col>
      <el-col :value="22" :xs="24" :sm="24">
        <el-form-item>
          <el-button type="primary" text bg @click="submitForm(ruleFormRef)">
            提交
          </el-button>
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
</template>
