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
    isPause: false,
    jobName: "",
    methodName: "",
    params: "",
    description: "",
    personInCharge: "",
    email: "",
    subTask: "",
    pauseAfterFailure: false
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
        <el-form-item label="任务名称" prop="jobName">
          <el-input
            v-model="newFormInline.jobName"
            clearable
            placeholder="请输入任务名称"
          />
        </el-form-item>
      </re-col>
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="任务描述" prop="description">
          <el-input
            v-model="newFormInline.description"
            clearable
            placeholder="请输入任务描述"
          />
        </el-form-item>
      </re-col>
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="Bean" prop="beanName">
          <el-input
            v-model="newFormInline.beanName"
            clearable
            placeholder="请输入Bean名称"
          />
        </el-form-item>
      </re-col>
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="执行方法" prop="methodName">
          <el-input
            v-model="newFormInline.methodName"
            clearable
            placeholder="请输入执行方法"
          />
        </el-form-item>
      </re-col>
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="cron" prop="cronExpression">
          <el-input
            v-model="newFormInline.cronExpression"
            clearable
            placeholder="请输入cron表达式"
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
        <el-form-item label="失败后暂停" prop="pauseAfterFailure">
          <el-radio-group v-model="newFormInline.pauseAfterFailure">
            <el-radio-button label="是" :value="false" />
            <el-radio-button label="否" :value="true" />
          </el-radio-group>
        </el-form-item>
      </re-col>
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="状态"
          ><el-radio-group v-model="newFormInline.isPause">
            <el-radio-button label="是" :value="false" />
            <el-radio-button label="否" :value="true" />
          </el-radio-group>
        </el-form-item>
      </re-col>
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="参数内容" prop="params">
          <el-input
            v-model="newFormInline.params"
            clearable
            placeholder="请输入参数内容"
          />
        </el-form-item>
      </re-col>
    </el-row>
  </el-form>
</template>
