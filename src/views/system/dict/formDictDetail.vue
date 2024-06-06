<script setup lang="ts">
import { ref } from "vue";
import ReCol from "@/components/ReCol";
import { formRules1 } from "./utils/rule";
import { FormDictDetail } from "./utils/types";
const props = withDefaults(defineProps<FormDictDetail>(), {
  formInline: () => ({
    id: 0,
    description: ""
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
    :rules="formRules1"
    label-width="82px"
  >
    <el-row :gutter="30">
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="字典标签" prop="label">
          <el-input
            v-model="newFormInline.label"
            clearable
            placeholder="请输入字典标签"
          />
        </el-form-item>
      </re-col>
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="字典值" prop="value">
          <el-input
            v-model="newFormInline.value"
            clearable
            placeholder="请输入字典值"
          />
        </el-form-item>
      </re-col>
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="newFormInline.description"
            clearable
            placeholder="请输入字典描述"
          />
        </el-form-item>
      </re-col>
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="排序" prop="dictSort">
          <el-input-number
            v-model="newFormInline.dictSort"
            :min="0"
            :max="9999"
            controls-position="right"
          />
        </el-form-item>
      </re-col>
    </el-row>
  </el-form>
</template>
