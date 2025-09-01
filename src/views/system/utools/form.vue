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
        <el-form-item label="文件名" prop="name">
          <el-input
            v-model="newFormInline.name"
            clearable
            placeholder="请输入文件名"
          />
        </el-form-item>
      </re-col>
    </el-row>
  </el-form>
</template>
