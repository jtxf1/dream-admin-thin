import type { BaseEntity, PageQuery } from "@/utils/http/ApiAbstract";

interface FormItemProps extends BaseEntity {
  id?: number; //ID
  beanName?: string; //Spring Bean名称
  cronExpression?: string; //cron 表达式
  isPause?: boolean; //状态：1暂停、0启用
  jobName?: string; //任务名称
  methodName?: string; //方法名称
  params?: string; //参数
  description?: string; //备注
  personInCharge?: string; //负责人
  email?: string; //报警邮箱
  subTask?: string; //子任务ID
  pauseAfterFailure?: boolean; //任务失败后是否暂停
}
interface LogsProps extends BaseEntity {
  id?: number; //ID
  jobName?: string; //任务名称
  beanName?: string; //Spring Bean名称
  methodName?: string; //方法名称
  params?: string; //参数
  cronExpression?: string; //cron 表达式
  isSuccess?: boolean; //状态
  exceptionDetail?: string;
  time?: number; //耗时
}
interface FormProps {
  formInline: FormItemProps;
}
interface FormQuery extends PageQuery {
  //配置了搜索的数组
  jobName?: string;
}
export type { FormItemProps, FormProps, FormQuery, LogsProps };
