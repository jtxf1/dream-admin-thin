import { reactive } from "vue";
import type { FormRules } from "element-plus";

/** 自定义表单规则校验 */
export const formRules = reactive(<FormRules>{
  account: [{ required: true, message: "账号为必填项", trigger: "blur" }],
  ip: [{ required: true, message: "IP地址为必填项", trigger: "blur" }],
  name: [{ required: true, message: "名称为必填项", trigger: "blur" }],
  password: [{ required: true, message: "密码为必填项", trigger: "blur" }],
  port: [{ required: true, message: "端口为必填项", trigger: "blur" }]
});
