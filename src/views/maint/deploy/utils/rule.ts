import { reactive } from "vue";
import type { FormRules } from "element-plus";

/** 自定义表单规则校验 */
export const formRules = reactive(<FormRules>{
  appId: [{ required: true, message: "应用为必填项", trigger: "blur" }],
  deployIds: [{ required: true, message: "服务器为必填项", trigger: "blur" }]
});
