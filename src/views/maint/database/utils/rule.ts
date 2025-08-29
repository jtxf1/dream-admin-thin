import { reactive } from "vue";
import type { FormRules } from "element-plus";

/** 自定义表单规则校验 */
export const formRules = reactive(<FormRules>{
  name: [{ required: true, message: "名称为必填项", trigger: "blur" }],
  jdbcUrl: [{ required: true, message: "jdbc连接为必填项", trigger: "blur" }],
  userName: [{ required: true, message: "账号为必填项", trigger: "blur" }],
  pwd: [{ required: true, message: "密码为必填项", trigger: "blur" }]
});
