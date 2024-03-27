import { reactive } from "vue";
import type { FormRules } from "element-plus";

/** 自定义表单规则校验 */
export const formRules = reactive(<FormRules>{
  author: [{ required: true, message: "部门名称为必填项", trigger: "blur" }],
  pack: [{ required: true, message: "包路径不能为空", trigger: "blur" }],
  moduleName: [{ required: true, message: "包路径不能为空", trigger: "blur" }],
  path: [{ required: true, message: "前端路径不能为空", trigger: "blur" }],
  apiAlias: [{ required: true, message: "接口名称不能为空", trigger: "blur" }],
  cover: [{ required: true, message: "不能为空", trigger: "blur" }]
});
