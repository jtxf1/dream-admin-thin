import { reactive } from "vue";
import type { FormRules } from "element-plus";

/** 自定义表单规则校验 */
export const formRules = reactive(<FormRules>{
  bucketName: [
    { required: true, message: "存储桶名称为必填项", trigger: "blur" }
  ]
});
