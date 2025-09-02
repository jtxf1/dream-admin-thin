<script setup lang="ts">
import { reactive, ref } from "vue";
import { formUpload } from "@/api/maint/database";
import { message } from "@/utils/message";
import { createFormData } from "@pureadmin/utils";
import { genFileId } from "element-plus";
import type { UploadProps, UploadRawFile } from "element-plus";
import { FormProps } from "./utils/types";
import { formRules } from "./utils/rule";

import UploadIcon from "~icons/ri/upload-2-line?width=26&height=26";

const props = withDefaults(defineProps<FormProps>(), {
  formInline: () => ({
    name: ""
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
  date: "",
  name: newFormInline.value.name
});

const submitForm = formEl => {
  formEl.validate(valid => {
    if (valid) {
      // 多个 file 在一个接口同时上传
      const formData = createFormData({
        file: validateForm.fileList.map(file => ({ raw: file.raw }))[0], // file 文件
        id: newFormInline.value.id // 别的字段
      });
      console.log(formData);

      formUpload(formData, "localStorage?name=" + validateForm.name)
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
  <el-form
    ref="ruleFormRef"
    :rules="formRules"
    :model="validateForm"
    label-width="82px"
  >
    <el-row>
      <el-col :value="30" :xs="24" :sm="24">
        <el-form-item
          label="文件名"
          prop="name"
          :rules="[{ required: true, message: '文件名不能为空' }]"
        >
          <el-input
            v-model="validateForm.name"
            clearable
            placeholder="请输入文件名"
          />
        </el-form-item>
      </el-col>
      <el-col :value="30" :xs="24" :sm="24">
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
            title="限制文件大小小于50KB"
            type="info"
            effect="dark"
            :closable="false"
          />
        </el-form-item>
      </el-col>
      <el-col :value="22" :xs="24" :sm="24">
        <el-form-item>
          <el-button type="primary" text bg @click="submitForm(ruleFormRef)">
            提交
          </el-button>
          <el-button text bg @click="resetForm(ruleFormRef)">重置</el-button>
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
</template>
