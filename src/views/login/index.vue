<script setup lang="ts">
import { useI18n } from "vue-i18n";
import Motion from "./utils/motion";
import { useRouter } from "vue-router";
import { loginRules } from "./utils/rule";
import phone from "./components/phone.vue";
import TypeIt from "@/components/ReTypeit";
import { debounce } from "@pureadmin/utils";
import qrCode from "./components/qrCode.vue";
import regist from "./components/regist.vue";
import update from "./components/update.vue";
import { useNav } from "@/layout/hooks/useNav";
import { useEventListener } from "@vueuse/core";
import type { FormInstance } from "element-plus";
import { operates, thirdParty } from "./utils/enums";
import { useLayout } from "@/layout/hooks/useLayout";
import { useUserStoreHook } from "@/store/modules/user";
import { initRouter, getTopMenu } from "@/router/utils";
import { bg, avatar, illustration } from "./utils/static";
import { ReImageVerify } from "@/components/ReImageVerify";
import { ref, reactive, watch, computed, markRaw } from "vue";
import { useTranslationLang } from "@/layout/hooks/useTranslationLang";
import { useDataThemeChange } from "@/layout/hooks/useDataThemeChange";
import { handleError, handleSuccess } from "./utils/errorHandler";
import { useCachedRenderIcon } from "./utils/iconCache";

import dayIcon from "@/assets/svg/day.svg?component";
import darkIcon from "@/assets/svg/dark.svg?component";
import globalization from "@/assets/svg/globalization.svg?component";
import Lock from "~icons/ri/lock-fill";
import Check from "~icons/ep/check";
import User from "~icons/ri/user-3-fill";
import Info from "~icons/ri/file-info-line";

defineOptions({
  name: "Login"
});

const imgCode = ref("");
const loginDay = ref(7);
const router = useRouter();
const loading = ref(false);
const disabled = ref(false);
const checked = ref(false);
const ruleFormRef = ref<FormInstance>();
const userStore = useUserStoreHook();
const currentPage = computed(() => userStore.currentPage);
const illustrationComponent = markRaw(illustration);

const { t } = useI18n();
const { initStorage } = useLayout();
initStorage();
const { dataTheme, overallStyle, dataThemeChange } = useDataThemeChange();
dataThemeChange(overallStyle.value);
const { title, getDropdownItemStyle, getDropdownItemClass } = useNav();
const { locale, translationCh, translationEn } = useTranslationLang();

const userIcon = useCachedRenderIcon(User);
const lockIcon = useCachedRenderIcon(Lock);
const shieldIcon = useCachedRenderIcon("ri:shield-keyhole-line");

const ruleForm = reactive({
  username: "admin",
  password: "123456",
  verifyCode: ""
});

const reImageVerifyRef = ref<any>();

const onLogin = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  try {
    await formEl.validate();
    loading.value = true;
    const res = await userStore.loginByUsername({
      username: ruleForm.username,
      password: ruleForm.password,
      code: ruleForm.verifyCode,
      uuid: imgCode.value
    });
    if (res) {
      await initRouter();
      disabled.value = true;
      try {
        await router.push(getTopMenu(true).path);
        handleSuccess("login.pureLoginSuccess");
      } finally {
        disabled.value = false;
      }
    }
  } catch (error) {
    handleError(error);
    // 登录失败时自动刷新验证码
    if (reImageVerifyRef.value) {
      reImageVerifyRef.value.getImgCode();
    }
  } finally {
    loading.value = false;
  }
};

const handleKeyPress = () => {
  if (ruleFormRef.value) {
    onLogin(ruleFormRef.value);
  }
};

const immediateDebounce = debounce(handleKeyPress, 1000, true);

useEventListener(document, "keypress", ({ code }) => {
  if (
    ["Enter", "NumpadEnter"].includes(code) &&
    !disabled.value &&
    !loading.value
  ) {
    immediateDebounce();
  }
});

watch(checked, bool => {
  userStore.SET_ISREMEMBERED(bool);
});

watch(loginDay, value => {
  userStore.SET_LOGINDAY(value);
});
</script>

<template>
  <div class="select-none">
    <img :src="bg" class="wave" />
    <div class="flex-c absolute right-5 top-3">
      <!-- 主题 -->
      <el-switch
        v-model="dataTheme"
        inline-prompt
        :active-icon="dayIcon"
        :inactive-icon="darkIcon"
        @change="dataThemeChange"
      />
      <!-- 国际化 -->
      <el-dropdown trigger="click">
        <globalization
          class="hover:text-primary hover:bg-[transparent]! w-[20px] h-[20px] ml-1.5 cursor-pointer outline-hidden duration-300"
        />
        <template #dropdown>
          <el-dropdown-menu class="translation">
            <el-dropdown-item
              :style="getDropdownItemStyle(locale, 'zh')"
              :class="['dark:text-white!', getDropdownItemClass(locale, 'zh')]"
              @click="translationCh"
            >
              <IconifyIconOffline
                v-show="locale === 'zh'"
                class="check-zh"
                :icon="Check"
              />
              简体中文
            </el-dropdown-item>
            <el-dropdown-item
              :style="getDropdownItemStyle(locale, 'en')"
              :class="['dark:text-white!', getDropdownItemClass(locale, 'en')]"
              @click="translationEn"
            >
              <span v-show="locale === 'en'" class="check-en">
                <IconifyIconOffline :icon="Check" />
              </span>
              English
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
    <div class="login-container">
      <div class="img">
        <component :is="illustrationComponent" />
      </div>
      <div class="login-box">
        <div class="login-form">
          <avatar class="avatar" />
          <Motion>
            <h2 class="outline-hidden">
              <TypeIt
                :options="{ strings: [title], cursor: false, speed: 100 }"
              />
            </h2>
          </Motion>

          <el-form
            v-if="currentPage === 0"
            ref="ruleFormRef"
            :model="ruleForm"
            :rules="loginRules"
            size="large"
          >
            <Motion :delay="100">
              <el-form-item prop="username">
                <el-input
                  v-model="ruleForm.username"
                  v-copy="ruleForm.username"
                  clearable
                  :placeholder="t('login.username')"
                  :prefix-icon="userIcon"
                />
              </el-form-item>
            </Motion>

            <Motion :delay="150">
              <el-form-item prop="password">
                <el-input
                  v-model="ruleForm.password"
                  clearable
                  show-password
                  :placeholder="t('login.password')"
                  :prefix-icon="lockIcon"
                />
              </el-form-item>
            </Motion>

            <Motion :delay="200">
              <el-form-item prop="verifyCode">
                <el-input
                  v-model="ruleForm.verifyCode"
                  clearable
                  :placeholder="t('login.verifyCode')"
                  :prefix-icon="shieldIcon"
                >
                  <template v-slot:append>
                    <ReImageVerify
                      ref="reImageVerifyRef"
                      v-model:code="imgCode"
                    />
                  </template>
                </el-input>
              </el-form-item>
            </Motion>

            <Motion :delay="250">
              <el-form-item>
                <div class="w-full h-[20px] flex justify-between items-center">
                  <el-checkbox v-model="checked">
                    <span class="flex">
                      <select
                        v-model="loginDay"
                        :style="{
                          width: loginDay < 10 ? '10px' : '16px',
                          outline: 'none',
                          background: 'none',
                          appearance: 'none'
                        }"
                      >
                        <option value="1">1</option>
                        <option value="7">7</option>
                        <option value="30">30</option>
                      </select>
                      {{ t("login.remember") }}
                      <el-tooltip
                        effect="dark"
                        placement="top"
                        :content="t('login.rememberInfo')"
                      >
                        <IconifyIconOffline :icon="Info" class="ml-1" />
                      </el-tooltip>
                    </span>
                  </el-checkbox>
                  <el-button
                    link
                    type="primary"
                    @click="userStore.SET_CURRENTPAGE(4)"
                  >
                    {{ t("login.forget") }}
                  </el-button>
                </div>
                <el-button
                  class="w-full mt-4!"
                  size="default"
                  type="primary"
                  :loading="loading"
                  :disabled="disabled"
                  @click="onLogin(ruleFormRef)"
                >
                  {{ t("login.login") }}
                </el-button>
              </el-form-item>
            </Motion>

            <Motion :delay="300">
              <el-form-item>
                <div class="w-full h-[20px] flex justify-between items-center">
                  <el-button
                    v-for="(item, index) in operates"
                    :key="index"
                    class="w-full mt-4"
                    size="default"
                    @click="userStore.SET_CURRENTPAGE(index + 1)"
                  >
                    {{ t(item.title) }}
                  </el-button>
                </div>
              </el-form-item>
            </Motion>
          </el-form>

          <Motion v-if="currentPage === 0" :delay="350">
            <el-form-item>
              <el-divider>
                <p class="text-gray-500 text-xs">{{ t("login.thirdLogin") }}</p>
              </el-divider>
              <div class="w-full flex justify-evenly">
                <span
                  v-for="(item, index) in thirdParty"
                  :key="index"
                  :title="t(item.title)"
                >
                  <IconifyIconOnline
                    :icon="`ri:${item.icon}-fill`"
                    width="20"
                    class="cursor-pointer text-gray-500 hover:text-blue-400"
                  />
                </span>
              </div>
            </el-form-item>
          </Motion>
          <!-- 手机号登录 -->
          <phone v-if="currentPage === 1" />
          <!-- 二维码登录 -->
          <qrCode v-if="currentPage === 2" />
          <!-- 注册 -->
          <regist v-if="currentPage === 3" />
          <!-- 忘记密码 -->
          <update v-if="currentPage === 4" />
        </div>
      </div>
    </div>
    <div
      class="w-full flex-c absolute bottom-3 text-sm text-[rgba(0,0,0,0.6)] dark:text-[rgba(220,220,242,0.8)]"
    >
      Copyright © 2020-present
      <a
        class="hover:text-primary"
        href="https://github.com/pure-admin"
        target="_blank"
      >
        &nbsp;{{ title }}
      </a>
    </div>
  </div>
</template>

<style scoped lang="scss">
:deep(.el-input-group__append, .el-input-group__prepend) {
  padding: 0;
}

.translation {
  :deep(.el-dropdown-menu__item) {
    padding: 5px 40px;
  }

  .check-zh {
    position: absolute;
    left: 20px;
  }

  .check-en {
    position: absolute;
    left: 20px;
  }
}

.wave {
  position: fixed;
  bottom: 0;
  left: 0;
  z-index: -1;
  width: 80%;
  height: 100%;
}

.login-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 18rem;
  width: 100vw;
  max-width: 100%;
  height: 100vh;
  padding: 0 2rem;
}

.img {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.img img {
  width: 500px;
}

.login-box {
  display: flex;
  align-items: center;
  overflow: hidden;
  text-align: center;
}

.login-form {
  width: 360px;
}

.avatar {
  width: 350px;
  height: 80px;
}

.login-form h2 {
  margin: 15px 0;
  font:
    bold 200% Consolas,
    Monaco,
    monospace;
  color: #999;
  text-transform: uppercase;
}

@media screen and (width <= 1180px) {
  .login-container {
    gap: 9rem;
  }

  .login-form {
    width: 290px;
  }

  .login-form h2 {
    margin: 8px 0;
    font-size: 2.4rem;
  }

  .img img {
    width: 360px;
  }

  .avatar {
    width: 280px;
    height: 80px;
  }
}

@media screen and (width <= 968px) {
  .wave {
    display: none;
  }

  .img {
    display: none;
  }

  .login-container {
    grid-template-columns: 1fr;
  }

  .login-box {
    justify-content: center;
  }
}
</style>
