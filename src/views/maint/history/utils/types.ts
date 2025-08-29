import type { BaseEntity, PageQuery } from "@/utils/http/ApiAbstract";

interface FormItemProps extends BaseEntity {
  id?: string; //ID
  appName?: string; //应用名称
  deployDate?: Date; //部署日期
  deployUser?: string; //部署用户
  ip?: string; //服务器IP
  deployId?: number; //部署编号
}
interface FormProps {
  formInline: FormItemProps;
}
interface FormQuery extends PageQuery {
  //配置了搜索的数组
  deployDate?: Date[];
}
export type { FormItemProps, FormProps, FormQuery };
