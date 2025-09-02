<script setup lang="ts">
import { ref } from "vue";
import ReCol from "@/components/ReCol";
import { message } from "@/utils/message";
import { CRUD } from "@/api/utils";
import { formRules } from "./utils/rule";
import { FormProps } from "./utils/types";
import { EditorUpload } from "@/views/components/editor/components";

const props = withDefaults(defineProps<FormProps>(), {
  formInline: () => ({
    content: ""
  })
});

const ruleFormRef = ref();
const newFormInline = ref(props.formInline);

const submitForm = formEl => {
  formEl.validate(valid => {
    if (valid) {
      CRUD.post("email", {
        data: {
          subject: newFormInline.value.subject,
          tos: newFormInline.value.tos,
          content: newFormInline.value.content
        }
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

const handleContentUpdate = content => {
  newFormInline.value.content = content;
  // 这里可以处理实时获取到的编辑器内容
};
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
        <el-form-item label-width="auto" label="邮件标题" prop="subject">
          <el-input
            v-model="newFormInline.subject"
            clearable
            placeholder="请输入邮件标题"
          />
        </el-form-item>
      </re-col>
      <re-col :value="20" :xs="24" :sm="24">
        <el-form-item label="收件地址" prop="tos">
          <el-input
            v-model="newFormInline.tos"
            clearable
            placeholder="收件地址"
          />
        </el-form-item>
      </re-col>
      <br />
      <el-form-item prop="content">
        <EditorUpload
          v-model="newFormInline.content"
          @update:content="handleContentUpdate"
        />
      </el-form-item>
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
