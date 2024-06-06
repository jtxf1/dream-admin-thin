import { reactive } from "vue";
import type { FormRules } from "element-plus";

/** 自定义表单规则校验 */
export const formRules = reactive(<FormRules>{
  name: [{ required: true, message: "字典名称为必填项", trigger: "blur" }],
  queryTypeOptions: [{ key: "name", display_name: "字典名称" }]
});

export const formRules1 = reactive(<FormRules>{
  label: [{ required: true, message: "字典标签为必填项", trigger: "blur" }],
  value: [{ required: true, message: "字典值为必填项", trigger: "blur" }],
  dictSort: [{ required: true, message: "字典排序为必填项", trigger: "blur" }]
});
