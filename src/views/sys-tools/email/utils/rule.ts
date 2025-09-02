import { reactive } from "vue";
import type { FormRules } from "element-plus";

/** 自定义表单规则校验 */
export const formRules = reactive(<FormRules>{
  fromUser: [
    { required: true, message: "发件人邮箱为必填项", trigger: "blur" }
  ],
  host: [{ required: true, message: "SMTP地址为必填项", trigger: "blur" }],
  pass: [{ required: true, message: "邮箱密码为必填项", trigger: "blur" }],
  port: [{ required: true, message: "SMTP端口为必填项", trigger: "blur" }],
  user: [{ required: true, message: "发件用户名为必填项", trigger: "blur" }]
});
