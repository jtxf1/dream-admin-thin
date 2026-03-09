<template>
  <div class="form-validation-demo">
    <el-card class="mb-4">
      <template #header>
        <div class="flex justify-between items-center">
          <span>表单验证演示</span>
          <el-button type="primary" @click="resetForm">重置</el-button>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        class="mt-4"
      >
        <!-- 用户名 -->
        <ReFormItem prop="username" label="用户名" :rules="rules.username">
          <el-input
            v-model="form.username"
            placeholder="请输入用户名"
            clearable
          />
        </ReFormItem>

        <!-- 密码 -->
        <ReFormItem prop="password" label="密码" :rules="rules.password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            clearable
            show-password
          />
        </ReFormItem>

        <!-- 确认密码 -->
        <ReFormItem
          prop="confirmPassword"
          label="确认密码"
          :rules="rules.confirmPassword"
        >
          <el-input
            v-model="form.confirmPassword"
            type="password"
            placeholder="请确认密码"
            clearable
            show-password
          />
        </ReFormItem>

        <!-- 昵称 -->
        <ReFormItem prop="nickname" label="昵称" :rules="rules.nickname">
          <el-input
            v-model="form.nickname"
            placeholder="请输入昵称"
            clearable
          />
        </ReFormItem>

        <!-- 手机号 -->
        <ReFormItem prop="phone" label="手机号" :rules="rules.phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" clearable />
        </ReFormItem>

        <!-- 邮箱 -->
        <ReFormItem prop="email" label="邮箱" :rules="rules.email">
          <el-input v-model="form.email" placeholder="请输入邮箱" clearable />
        </ReFormItem>

        <!-- IP地址 -->
        <ReFormItem prop="ip" label="IP地址" :rules="rules.ip">
          <el-input v-model="form.ip" placeholder="请输入IP地址" clearable />
        </ReFormItem>

        <!-- 端口号 -->
        <ReFormItem prop="port" label="端口号" :rules="rules.port">
          <el-input
            v-model.number="form.port"
            type="number"
            placeholder="请输入端口号"
            clearable
          />
        </ReFormItem>

        <!-- URL -->
        <ReFormItem prop="url" label="URL" :rules="rules.url">
          <el-input v-model="form.url" placeholder="请输入URL" clearable />
        </ReFormItem>

        <!-- 验证码 -->
        <ReFormItem prop="verifyCode" label="验证码" :rules="rules.verifyCode">
          <el-input
            v-model="form.verifyCode"
            placeholder="请输入验证码"
            clearable
            class="w-64"
          >
            <template #append>
              <el-button @click="getVerifyCode">获取验证码</el-button>
            </template>
          </el-input>
        </ReFormItem>

        <!-- 提交按钮 -->
        <el-form-item class="mt-6">
          <el-button type="primary" @click="submitForm">提交</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card>
      <template #header>
        <span>实时验证演示</span>
      </template>

      <el-form
        ref="realTimeFormRef"
        :model="form"
        :rules="realTimeRules"
        label-width="120px"
        class="mt-4"
      >
        <!-- 实时验证用户名 -->
        <ReFormItem
          prop="username"
          label="用户名"
          :rules="realTimeRules.username"
        >
          <el-input
            v-model="form.username"
            placeholder="请输入用户名"
            clearable
          />
        </ReFormItem>

        <!-- 实时验证密码 -->
        <ReFormItem
          prop="password"
          label="密码"
          :rules="realTimeRules.password"
        >
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            clearable
            show-password
          />
        </ReFormItem>

        <!-- 实时验证手机号 -->
        <ReFormItem prop="phone" label="手机号" :rules="realTimeRules.phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" clearable />
        </ReFormItem>

        <!-- 实时验证邮箱 -->
        <ReFormItem prop="email" label="邮箱" :rules="realTimeRules.email">
          <el-input v-model="form.email" placeholder="请输入邮箱" clearable />
        </ReFormItem>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { ElMessage } from "element-plus";
import ReFormItem from "@/components/ReFormItem/src/index.vue";
import {
  createUsernameRule,
  createPasswordRule,
  createRepeatPasswordRule,
  createNicknameRule,
  createPhoneRule,
  createEmailRule,
  createIPRule,
  createPortRule,
  createURLRule,
  createVerifyCodeRule,
  createRealTimeRules
} from "@/utils/formValidator";

const formRef = ref();
const realTimeFormRef = ref();

const form = reactive({
  username: "",
  password: "",
  confirmPassword: "",
  nickname: "",
  phone: "",
  email: "",
  ip: "",
  port: "",
  url: "",
  verifyCode: ""
});

const rules = reactive({
  username: [createUsernameRule()],
  password: [createPasswordRule()],
  confirmPassword: [createRepeatPasswordRule("password")],
  nickname: [createNicknameRule()],
  phone: [createPhoneRule()],
  email: [createEmailRule()],
  ip: [createIPRule()],
  port: [createPortRule()],
  url: [createURLRule()],
  verifyCode: [createVerifyCodeRule()]
});

// 实时验证规则
const realTimeRules = createRealTimeRules({
  username: [createUsernameRule()],
  password: [createPasswordRule()],
  phone: [createPhoneRule()],
  email: [createEmailRule()]
});

const submitForm = async () => {
  try {
    await formRef.value.validate();
    ElMessage.success("表单验证通过！");
    // 这里可以处理表单提交逻辑
  } catch (error) {
    ElMessage.error("表单验证失败，请检查输入内容");
  }
};

const resetForm = () => {
  formRef.value.resetFields();
  realTimeFormRef.value.resetFields();
};

const getVerifyCode = () => {
  ElMessage.success("验证码已发送");
};
</script>

<style scoped lang="scss">
.form-validation-demo {
  padding: 20px;
}
</style>
