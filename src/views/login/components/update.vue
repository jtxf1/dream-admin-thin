<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { ref, reactive } from "vue";
import Motion from "../utils/motion";
import { updateRules } from "../utils/rule";
import type { FormInstance } from "element-plus";
import { useVerifyCode } from "../utils/verifyCode";
import { $t, transformI18n } from "@/plugins/i18n";
import { useUserStoreHook } from "@/store/modules/user";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import Lock from "~icons/ri/lock-fill";
import Iphone from "~icons/ep/iphone";
import { handleError, handleSuccess } from "../utils/errorHandler";
import { useCachedRenderIcon } from "../utils/iconCache";

const { t } = useI18n();
const loading = ref(false);
const ruleForm = reactive({
  phone: "",
  verifyCode: "",
  password: "",
  repeatPassword: ""
});
const ruleFormRef = ref<FormInstance>();
const { isDisabled, text } = useVerifyCode();

const onUpdate = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  try {
    await formEl.validate();
    loading.value = true;
    setTimeout(() => {
      handleSuccess("login.passwordUpdateReg");
      loading.value = false;
    }, 2000);
  } catch (error) {
    handleError(error);
    loading.value = false;
  }
};

function onBack() {
  useVerifyCode().end();
  useUserStoreHook().SET_CURRENTPAGE(0);
}
</script>

<template>
  <el-form
    ref="ruleFormRef"
    :model="ruleForm"
    :rules="updateRules"
    size="large"
  >
    <Motion>
      <el-form-item prop="phone">
        <el-input
          v-model="ruleForm.phone"
          clearable
          :placeholder="t('login.phone')"
          :prefix-icon="useCachedRenderIcon(Iphone)"
        />
      </el-form-item>
    </Motion>

    <Motion :delay="100">
      <el-form-item prop="verifyCode">
        <div class="w-full flex justify-between">
          <el-input
            v-model="ruleForm.verifyCode"
            clearable
            :placeholder="t('login.smsVerifyCode')"
            :prefix-icon="useCachedRenderIcon('ri:shield-keyhole-line')"
          />
          <el-button
            :disabled="isDisabled"
            class="ml-2"
            @click="useVerifyCode().start(ruleFormRef, 'phone')"
          >
            {{
              text.length > 0
                ? text + t("login.info")
                : t("login.getVerifyCode")
            }}
          </el-button>
        </div>
      </el-form-item>
    </Motion>

    <Motion :delay="150">
      <el-form-item prop="password">
        <el-input
          v-model="ruleForm.password"
          clearable
          show-password
          :placeholder="t('login.password')"
          :prefix-icon="useCachedRenderIcon(Lock)"
        />
      </el-form-item>
    </Motion>

    <Motion :delay="200">
      <el-form-item prop="repeatPassword">
        <el-input
          v-model="ruleForm.repeatPassword"
          clearable
          show-password
          :placeholder="t('login.sure')"
          :prefix-icon="useCachedRenderIcon(Lock)"
        />
      </el-form-item>
    </Motion>

    <Motion :delay="250">
      <el-form-item>
        <el-button
          class="w-full"
          size="default"
          type="primary"
          :loading="loading"
          @click="onUpdate(ruleFormRef)"
        >
          {{ t("login.definite") }}
        </el-button>
      </el-form-item>
    </Motion>

    <Motion :delay="300">
      <el-form-item>
        <el-button class="w-full" size="default" @click="onBack">
          {{ t("login.back") }}
        </el-button>
      </el-form-item>
    </Motion>
  </el-form>
</template>
