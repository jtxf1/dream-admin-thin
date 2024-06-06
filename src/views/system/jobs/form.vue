<script setup lang="ts">
import { ref } from "vue";
import ReCol from "@/components/ReCol";
import { formRules } from "./utils/rule";
import { FormProps } from "./utils/types";
const props = withDefaults(defineProps<FormProps>(), {
  formInline: () => ({
    id: 0,
    beanName: "",
    cronExpression: "",
    isPause: "",
    jobName: "",
    methodName: "",
    params: "",
    description: "",
    personInCharge: "",
    email: "",
    subTask: "",
    pauseAfterFailure: ""
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
        <el-form-item label="Spring Bean名称" prop="beanName">
          <el-input
            v-model="newFormInline.beanName"
            clearable
            placeholder="请输入Spring Bean名称"
          />
        </el-form-item>
      </re-col>
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="cron 表达式" prop="cronExpression">
          <el-input
            v-model="newFormInline.cronExpression"
            clearable
            placeholder="请输入cron 表达式"
          />
        </el-form-item>
      </re-col>
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="状态：1暂停、0启用" prop="isPause">
          <el-input
            v-model="newFormInline.isPause"
            clearable
            placeholder="请输入状态：1暂停、0启用"
          />
        </el-form-item>
      </re-col>
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="任务名称" prop="jobName">
          <el-input
            v-model="newFormInline.jobName"
            clearable
            placeholder="请输入任务名称"
          />
        </el-form-item>
      </re-col>
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="方法名称" prop="methodName">
          <el-input
            v-model="newFormInline.methodName"
            clearable
            placeholder="请输入方法名称"
          />
        </el-form-item>
      </re-col>
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="参数" prop="params">
          <el-input
            v-model="newFormInline.params"
            clearable
            placeholder="请输入参数"
          />
        </el-form-item>
      </re-col>
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="备注" prop="description">
          <el-input
            v-model="newFormInline.description"
            clearable
            placeholder="请输入备注"
          />
        </el-form-item>
      </re-col>
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="负责人" prop="personInCharge">
          <el-input
            v-model="newFormInline.personInCharge"
            clearable
            placeholder="请输入负责人"
          />
        </el-form-item>
      </re-col>
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="报警邮箱" prop="email">
          <el-input
            v-model="newFormInline.email"
            clearable
            placeholder="请输入报警邮箱"
          />
        </el-form-item>
      </re-col>
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="子任务ID" prop="subTask">
          <el-input
            v-model="newFormInline.subTask"
            clearable
            placeholder="请输入子任务ID"
          />
        </el-form-item>
      </re-col>
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="任务失败后是否暂停" prop="pauseAfterFailure">
          <el-input
            v-model="newFormInline.pauseAfterFailure"
            clearable
            placeholder="请输入任务失败后是否暂停"
          />
        </el-form-item>
      </re-col>
    </el-row>
  </el-form>
</template>
