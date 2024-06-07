import { reactive } from "vue";
import type { FormRules } from "element-plus";

/** 自定义表单规则校验 */
export const formRules = reactive(<FormRules>{
  jobName: [{ required: true, message: "任务名称为必填项", trigger: "blur" }],
  description: [
    { required: true, message: "任务描述为必填项", trigger: "blur" }
  ],
  beanName: [{ required: true, message: "执行方法为必填项", trigger: "blur" }],
  methodName: [
    { required: true, message: "执行方法为必填项", trigger: "blur" }
  ],
  cronExpression: [
    { required: true, message: "Cron表达式为必填项", trigger: "blur" }
  ],
  personInCharge: [
    { required: true, message: "负责人为必填项", trigger: "blur" }
  ]
});
