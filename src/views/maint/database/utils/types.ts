import type { BaseEntity, PageQuery } from "@/utils/http/ApiAbstract";

interface FormItemProps extends BaseEntity {
  id?: string; //ID
  name?: string; //名称
  jdbcUrl?: string; //jdbc连接
  userName?: string; //账号
  pwd?: string; //密码
}
interface FormProps {
  formInline: FormItemProps;
}
interface FormQuery extends PageQuery {
  //配置了搜索的数组
  name?: string;
  createTime?: Date[];
}
export type { FormItemProps, FormProps, FormQuery };
