import { reactive } from "vue";
import type { FormRules } from "element-plus";

/** 自定义表单规则校验 */
export const formRules = reactive(<FormRules>{
  name: [{ required: true, message: "应用名称为必填项", trigger: "blur" }],
  uploadPath: [
    { required: true, message: "上传目录为必填项", trigger: "blur" }
  ],
  deployPath: [
    { required: true, message: "部署路径为必填项", trigger: "blur" }
  ],
  backupPath: [
    { required: true, message: "备份路径为必填项", trigger: "blur" }
  ],
  port: [{ required: true, message: "应用端口为必填项", trigger: "blur" }],
  startScript: [
    { required: true, message: "启动脚本为必填项", trigger: "blur" }
  ],
  deployScript: [
    { required: true, message: "部署脚本为必填项", trigger: "blur" }
  ]
});
