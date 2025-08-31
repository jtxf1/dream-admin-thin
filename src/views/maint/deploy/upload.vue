<script setup lang="ts">
import { reactive, ref } from "vue";
import { formUpload } from "@/api/maint/database";
import { message } from "@/utils/message";
import { createFormData } from "@pureadmin/utils";
import { genFileId } from "element-plus";
import type { UploadProps, UploadRawFile } from "element-plus";
import { FormProps } from "./utils/types";

import UploadIcon from "~icons/ri/upload-2-line?width=26&height=26";

const props = withDefaults(defineProps<FormProps>(), {
  formInline: () => ({
    id: 0
  })
});
const ruleFormRef = ref();
const newFormInline = ref(props.formInline);
function getRef() {
  return ruleFormRef.value;
}
const uploadRef = ref();
const validateForm = reactive({
  fileList: [],
  date: ""
});

const submitForm = formEl => {
  if (!formEl) return;
  formEl.validate(valid => {
    if (valid) {
      // 多个 file 在一个接口同时上传
      const formData = createFormData({
        file: validateForm.fileList.map(file => ({ raw: file.raw }))[0], // file 文件
        id: newFormInline.value.id // 别的字段
      });
      formUpload(formData, "database/upload")
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

const handleExceed: UploadProps["onExceed"] = files => {
  uploadRef.value!.clearFiles();
  const file = files[0] as UploadRawFile;
  file.uid = genFileId();
  uploadRef.value!.handleStart(file);
};

const resetForm = formEl => {
  if (!formEl) return;
  formEl.resetFields();
};
defineExpose({ getRef });
</script>

<template>
  <el-form ref="ruleFormRef" :model="validateForm" label-width="82px">
    <el-form-item
      label="附件"
      prop="fileList"
      :rules="[{ required: true, message: '附件不能为空' }]"
    >
      <el-upload
        ref="uploadRef"
        v-model:file-list="validateForm.fileList"
        :limit="1"
        :on-exceed="handleExceed"
        :auto-upload="false"
        :multiple="false"
        drag
        action="#"
        class="w-[200px]!"
      >
        <div class="el-upload__text">
          <UploadIcon class="m-auto mb-2" />
          可点击或拖拽上传
        </div>
      </el-upload>
      <el-alert
        title="多个应用上传文件名称为all.zip,数据库更新脚本扩展名为.sql,上传成功后系统自动部署系统。"
        type="info"
        effect="dark"
        :closable="false"
      />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" text bg @click="submitForm(ruleFormRef)">
        提交
      </el-button>
      <el-button text bg @click="resetForm(ruleFormRef)">重置</el-button>
    </el-form-item>
  </el-form>
</template>
