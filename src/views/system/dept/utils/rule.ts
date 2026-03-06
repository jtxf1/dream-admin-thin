import { reactive } from "vue";
import type { FormRules } from "element-plus";
import { isPhone, isEmail } from "@pureadmin/utils";

// 正则表达式定义
const REGEXP_DEPT_NAME = /^[\u4e00-\u9fa5a-zA-Z0-9_]{2,20}$/;

/** 自定义表单规则校验 */
export const formRules = reactive(<FormRules>{
  name: [
    {
      required: true,
      message: "部门名称为必填项",
      trigger: "blur"
    },
    {
      validator: (rule, value, callback) => {
        if (!REGEXP_DEPT_NAME.test(value)) {
          callback(
            new Error(
              "部门名称长度应在2-20个字符之间，支持中英文、数字和下划线"
            )
          );
        } else {
          callback();
        }
      },
      trigger: "blur"
    }
  ],
  phone: [
    {
      validator: (rule, value, callback) => {
        if (value === "") {
          callback();
        } else if (!isPhone(value)) {
          callback(new Error("请输入正确的手机号码格式"));
        } else {
          callback();
        }
      },
      trigger: "blur"
    }
  ],
  email: [
    {
      validator: (rule, value, callback) => {
        if (value === "") {
          callback();
        } else if (!isEmail(value)) {
          callback(new Error("请输入正确的邮箱格式"));
        } else {
          callback();
        }
      },
      trigger: "blur"
    }
  ]
});

/** 实时验证规则 */
export const formRulesRealTime = reactive(<FormRules>{
  name: [
    {
      required: true,
      message: "部门名称为必填项",
      trigger: "input"
    },
    {
      validator: (rule, value, callback) => {
        if (!REGEXP_DEPT_NAME.test(value)) {
          callback(
            new Error(
              "部门名称长度应在2-20个字符之间，支持中英文、数字和下划线"
            )
          );
        } else {
          callback();
        }
      },
      trigger: "input"
    }
  ],
  phone: [
    {
      validator: (rule, value, callback) => {
        if (value === "") {
          callback();
        } else if (!isPhone(value)) {
          callback(new Error("请输入正确的手机号码格式"));
        } else {
          callback();
        }
      },
      trigger: "input"
    }
  ],
  email: [
    {
      validator: (rule, value, callback) => {
        if (value === "") {
          callback();
        } else if (!isEmail(value)) {
          callback(new Error("请输入正确的邮箱格式"));
        } else {
          callback();
        }
      },
      trigger: "input"
    }
  ]
});
