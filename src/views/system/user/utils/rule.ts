import { reactive } from "vue";
import type { FormRules } from "element-plus";
import { isPhone, isEmail } from "@pureadmin/utils";

// 正则表达式定义
const REGEXP_USERNAME = /^[a-zA-Z0-9_]{3,20}$/;
const REGEXP_PASSWORD = /^[0-9a-zA-Z!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]{6,18}$/;
const REGEXP_NICKNAME = /^[\u4e00-\u9fa5a-zA-Z0-9_]{2,20}$/;

/** 自定义表单规则校验 */
export const formRules = reactive(<FormRules>{
  nickName: [
    {
      required: true,
      message: "用户昵称为必填项",
      trigger: "blur"
    },
    {
      validator: (rule, value, callback) => {
        if (!REGEXP_NICKNAME.test(value)) {
          callback(
            new Error("昵称长度应在2-20个字符之间，支持中英文、数字和下划线")
          );
        } else {
          callback();
        }
      },
      trigger: "blur"
    }
  ],
  username: [
    {
      required: true,
      message: "用户名称为必填项",
      trigger: "blur"
    },
    {
      validator: (rule, value, callback) => {
        if (!REGEXP_USERNAME.test(value)) {
          callback(
            new Error("用户名长度应在3-20个字符之间，支持英文、数字和下划线")
          );
        } else {
          callback();
        }
      },
      trigger: "blur"
    }
  ],
  password: [
    {
      required: true,
      message: "用户密码为必填项",
      trigger: "blur"
    },
    {
      validator: (rule, value, callback) => {
        if (!REGEXP_PASSWORD.test(value)) {
          callback(
            new Error("密码长度应在6-18个字符之间，支持字母、数字和特殊字符")
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
      required: true,
      validator: (rule, value, callback) => {
        if (value === "") {
          callback(new Error("手机号为必填项"));
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
      required: true,
      validator: (rule, value, callback) => {
        if (value === "") {
          callback(new Error("邮箱为必填项"));
        } else if (!isEmail(value)) {
          callback(new Error("请输入正确的邮箱格式"));
        } else {
          callback();
        }
      },
      trigger: "blur"
    }
  ],
  parentId: [{ required: true, message: "部门为必填项", trigger: "blur" }],
  roleOptionsId: [{ required: true, message: "角色为必填项", trigger: "blur" }],
  jobOptionsId: [{ required: true, message: "岗位为必填项", trigger: "blur" }]
});

/** 自定义修改密码规则校验 */
export const formRulesPwd = reactive(<FormRules>{
  oldPwd: [{ required: true, message: "旧密码为必填项", trigger: "blur" }],
  newPwd: [
    {
      required: true,
      validator: (rule, value, callback) => {
        if (value === "") {
          callback(new Error("新密码为必填项"));
        } else if (!REGEXP_PASSWORD.test(value)) {
          callback(
            new Error("密码长度应在6-18个字符之间，支持字母、数字和特殊字符")
          );
        } else {
          callback();
        }
      },
      trigger: "blur"
    }
  ],
  newPwdCop: [
    {
      required: true,
      validator: (rule, value, callback, form) => {
        if (value === "") {
          callback(new Error("确认新密码为必填项"));
        } else if (value !== form.newPwd) {
          callback(new Error("两次输入的密码不一致"));
        } else {
          callback();
        }
      },
      trigger: "blur"
    }
  ]
});

/** 自定义修改邮箱规则校验 */
export function formRulesEmail(emailButton) {
  return {
    email: [
      {
        required: true,
        validator: (rule, value, callback) => {
          if (value === "") {
            emailButton.value = true;
            callback(new Error("邮箱为必填项"));
          } else if (!isEmail(value)) {
            emailButton.value = true;
            callback(new Error("请输入正确的邮箱格式"));
          } else {
            emailButton.value = false; // 格式正确，启用按钮
            callback();
          }
        },
        trigger: "blur"
      }
    ],
    code: [
      { required: true, message: "验证码为必填项", trigger: "blur" },
      { min: 6, max: 6, message: "验证码长度为6位", trigger: "blur" }
    ],
    pwd: [
      { required: true, message: "密码为必填项", trigger: "blur" },
      {
        min: 6,
        max: 18,
        message: "密码长度应在6-18个字符之间",
        trigger: "blur"
      }
    ]
  };
}

/** 实时验证规则 */
export const formRulesRealTime = reactive(<FormRules>{
  nickName: [
    {
      required: true,
      message: "用户昵称为必填项",
      trigger: "input"
    },
    {
      validator: (rule, value, callback) => {
        if (!REGEXP_NICKNAME.test(value)) {
          callback(
            new Error("昵称长度应在2-20个字符之间，支持中英文、数字和下划线")
          );
        } else {
          callback();
        }
      },
      trigger: "input"
    }
  ],
  username: [
    {
      required: true,
      message: "用户名称为必填项",
      trigger: "input"
    },
    {
      validator: (rule, value, callback) => {
        if (!REGEXP_USERNAME.test(value)) {
          callback(
            new Error("用户名长度应在3-20个字符之间，支持英文、数字和下划线")
          );
        } else {
          callback();
        }
      },
      trigger: "input"
    }
  ],
  password: [
    {
      required: true,
      message: "用户密码为必填项",
      trigger: "input"
    },
    {
      validator: (rule, value, callback) => {
        if (!REGEXP_PASSWORD.test(value)) {
          callback(
            new Error("密码长度应在6-18个字符之间，支持字母、数字和特殊字符")
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
      required: true,
      validator: (rule, value, callback) => {
        if (value === "") {
          callback(new Error("手机号为必填项"));
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
      required: true,
      validator: (rule, value, callback) => {
        if (value === "") {
          callback(new Error("邮箱为必填项"));
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

/** 修改密码实时验证规则 */
export const formRulesPwdRealTime = reactive(<FormRules>{
  oldPwd: [{ required: true, message: "旧密码为必填项", trigger: "input" }],
  newPwd: [
    {
      required: true,
      validator: (rule, value, callback) => {
        if (value === "") {
          callback(new Error("新密码为必填项"));
        } else if (!REGEXP_PASSWORD.test(value)) {
          callback(
            new Error("密码长度应在6-18个字符之间，支持字母、数字和特殊字符")
          );
        } else {
          callback();
        }
      },
      trigger: "input"
    }
  ],
  newPwdCop: [
    {
      required: true,
      validator: (rule, value, callback, form) => {
        if (value === "") {
          callback(new Error("确认新密码为必填项"));
        } else if (form.newPwd !== value) {
          callback(new Error("两次输入的密码不一致"));
        } else {
          callback();
        }
      },
      trigger: "input"
    }
  ]
});
