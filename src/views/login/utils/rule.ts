import { reactive } from "vue";
import { isPhone } from "@pureadmin/utils";
import type { FormRules } from "element-plus";
import { $t, transformI18n } from "@/plugins/i18n";

export const REGEXP_SIX = /^\d{6}$/;
export const REGEXP_PWD =
  /^[0-9a-zA-Z!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]{5,12}$/;

const createRequiredValidator = (messageKey: string) => ({
  validator: (_rule: any, value: string, callback: any) => {
    if (value === "") {
      callback(new Error(transformI18n($t(messageKey))));
    } else {
      callback();
    }
  },
  trigger: "blur"
});

const createPhoneValidator = () => ({
  validator: (_rule: any, value: string, callback: any) => {
    if (value === "") {
      callback(new Error(transformI18n($t("login.phoneReg"))));
    } else if (!isPhone(value)) {
      callback(new Error(transformI18n($t("login.phoneCorrectReg"))));
    } else {
      callback();
    }
  },
  trigger: "blur"
});

const createPasswordValidator = (
  emptyMessageKey: string,
  ruleMessageKey: string
) => ({
  validator: (_rule: any, value: string, callback: any) => {
    if (value === "") {
      callback(new Error(transformI18n($t(emptyMessageKey))));
    } else if (!REGEXP_PWD.test(value)) {
      callback(new Error(transformI18n($t(ruleMessageKey))));
    } else {
      callback();
    }
  },
  trigger: "blur"
});

const createVerifyCodeValidator = (requireSix = false) => ({
  validator: (_rule: any, value: string, callback: any) => {
    if (value === "") {
      callback(new Error(transformI18n($t("login.verifyCodeReg"))));
    } else if (requireSix && !REGEXP_SIX.test(value)) {
      callback(new Error(transformI18n($t("login.verifyCodeSixReg"))));
    } else {
      callback();
    }
  },
  trigger: "blur"
});

const loginRules = reactive<FormRules>({
  password: [
    createPasswordValidator("login.passwordReg", "login.passwordRuleReg")
  ],
  verifyCode: [createRequiredValidator("login.verifyCodeReg")]
});

const phoneRules = reactive<FormRules>({
  phone: [createPhoneValidator()],
  verifyCode: [createRequiredValidator("login.verifyCodeReg")]
});

const updateRules = reactive<FormRules>({
  phone: [createPhoneValidator()],
  verifyCode: [createVerifyCodeValidator(true)],
  password: [
    createPasswordValidator(
      "login.purePassWordReg",
      "login.purePassWordRuleReg"
    )
  ]
});

export { loginRules, phoneRules, updateRules };
