import { reactive } from "vue";
import { isPhone } from "@pureadmin/utils";
import type { FormRules } from "element-plus";
import { $t, transformI18n } from "@/plugins/i18n";

export const REGEXP_SIX = /^\d{6}$/;
export const REGEXP_PWD =
  /^[0-9a-zA-Z!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]{6,18}$/;
export const REGEXP_USERNAME = /^[a-zA-Z0-9_]{3,20}$/;

const createRequiredValidator = (
  messageKey: string,
  trigger: string = "blur"
) => ({
  validator: (_rule: any, value: string, callback: any) => {
    if (value === "") {
      callback(new Error(transformI18n($t(messageKey))));
    } else {
      callback();
    }
  },
  trigger
});

const createUsernameValidator = () => ({
  validator: (_rule: any, value: string, callback: any) => {
    if (value === "") {
      callback(new Error(transformI18n($t("login.usernameReg"))));
    } else if (!REGEXP_USERNAME.test(value)) {
      callback(new Error(transformI18n($t("login.usernameRuleReg"))));
    } else {
      callback();
    }
  },
  trigger: "blur"
});

const createPhoneValidator = (trigger: string = "blur") => ({
  validator: (_rule: any, value: string, callback: any) => {
    if (value === "") {
      callback(new Error(transformI18n($t("login.phoneReg"))));
    } else if (!isPhone(value)) {
      callback(new Error(transformI18n($t("login.phoneCorrectReg"))));
    } else {
      callback();
    }
  },
  trigger
});

const createPasswordValidator = (
  emptyMessageKey: string,
  ruleMessageKey: string,
  trigger: string = "blur"
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
  trigger
});

const createVerifyCodeValidator = (
  requireSix = false,
  trigger: string = "blur"
) => ({
  validator: (_rule: any, value: string, callback: any) => {
    if (value === "") {
      callback(new Error(transformI18n($t("login.verifyCodeReg"))));
    } else if (requireSix && !REGEXP_SIX.test(value)) {
      callback(new Error(transformI18n($t("login.verifyCodeSixReg"))));
    } else {
      callback();
    }
  },
  trigger
});

const createRepeatPasswordValidator = (trigger: string = "blur") => ({
  validator: (_rule: any, value: string, callback: any, form: any) => {
    if (value === "") {
      callback(new Error(transformI18n($t("login.passwordSureReg"))));
    } else if (form.password !== value) {
      callback(new Error(transformI18n($t("login.passwordDifferentReg"))));
    } else {
      callback();
    }
  },
  trigger
});

const loginRules = reactive<FormRules>({
  username: [createUsernameValidator()],
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
  ],
  repeatPassword: [createRepeatPasswordValidator()]
});

// 实时验证规则
const loginRulesRealTime = reactive<FormRules>({
  username: [
    {
      validator: (_rule: any, value: string, callback: any) => {
        if (value === "") {
          callback(new Error(transformI18n($t("login.usernameReg"))));
        } else if (!REGEXP_USERNAME.test(value)) {
          callback(new Error(transformI18n($t("login.usernameRuleReg"))));
        } else {
          callback();
        }
      },
      trigger: "input"
    }
  ],
  password: [
    {
      validator: (_rule: any, value: string, callback: any) => {
        if (value === "") {
          callback(new Error(transformI18n($t("login.passwordReg"))));
        } else if (!REGEXP_PWD.test(value)) {
          callback(new Error(transformI18n($t("login.passwordRuleReg"))));
        } else {
          callback();
        }
      },
      trigger: "input"
    }
  ],
  verifyCode: [
    {
      validator: (_rule: any, value: string, callback: any) => {
        if (value === "") {
          callback(new Error(transformI18n($t("login.verifyCodeReg"))));
        } else {
          callback();
        }
      },
      trigger: "input"
    }
  ]
});

// 注册表单验证规则
const registerRules = reactive<FormRules>({
  username: [
    {
      validator: (_rule: any, value: string, callback: any) => {
        if (value === "") {
          callback(new Error(transformI18n($t("login.usernameReg"))));
        } else if (!REGEXP_USERNAME.test(value)) {
          callback(new Error(transformI18n($t("login.usernameRuleReg"))));
        } else {
          callback();
        }
      },
      trigger: "blur"
    }
  ],
  phone: [createPhoneValidator()],
  verifyCode: [createVerifyCodeValidator(true)],
  password: [
    createPasswordValidator("login.passwordReg", "login.passwordRuleReg")
  ],
  repeatPassword: [createRepeatPasswordValidator()]
});

// 注册表单实时验证规则
const registerRulesRealTime = reactive<FormRules>({
  username: [
    {
      validator: (_rule: any, value: string, callback: any) => {
        if (value === "") {
          callback(new Error(transformI18n($t("login.usernameReg"))));
        } else if (!REGEXP_USERNAME.test(value)) {
          callback(new Error(transformI18n($t("login.usernameRuleReg"))));
        } else {
          callback();
        }
      },
      trigger: "input"
    }
  ],
  phone: [
    {
      validator: (_rule: any, value: string, callback: any) => {
        if (value === "") {
          callback(new Error(transformI18n($t("login.phoneReg"))));
        } else if (!isPhone(value)) {
          callback(new Error(transformI18n($t("login.phoneCorrectReg"))));
        } else {
          callback();
        }
      },
      trigger: "input"
    }
  ],
  verifyCode: [
    {
      validator: (_rule: any, value: string, callback: any) => {
        if (value === "") {
          callback(new Error(transformI18n($t("login.verifyCodeReg"))));
        } else if (!REGEXP_SIX.test(value)) {
          callback(new Error(transformI18n($t("login.verifyCodeSixReg"))));
        } else {
          callback();
        }
      },
      trigger: "input"
    }
  ],
  password: [
    {
      validator: (_rule: any, value: string, callback: any) => {
        if (value === "") {
          callback(new Error(transformI18n($t("login.passwordReg"))));
        } else if (!REGEXP_PWD.test(value)) {
          callback(new Error(transformI18n($t("login.passwordRuleReg"))));
        } else {
          callback();
        }
      },
      trigger: "input"
    }
  ],
  repeatPassword: [
    {
      validator: (_rule: any, value: string, callback: any, form: any) => {
        if (value === "") {
          callback(new Error(transformI18n($t("login.passwordSureReg"))));
        } else if (form.password !== value) {
          callback(new Error(transformI18n($t("login.passwordDifferentReg"))));
        } else {
          callback();
        }
      },
      trigger: "input"
    }
  ]
});

export {
  loginRules,
  phoneRules,
  updateRules,
  loginRulesRealTime,
  registerRules,
  registerRulesRealTime
};
