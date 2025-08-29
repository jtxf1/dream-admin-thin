import type { BaseEntity, PageQuery } from "@/utils/http/ApiAbstract";

interface FormItemProps extends BaseEntity {
  id?: number; //ID
  account?: string; //账号
  ip?: string; //IP地址
  name?: string; //名称
  password?: string; //密码
  port?: number; //端口
}
interface FormProps {
  formInline: FormItemProps;
}
interface FormQuery extends PageQuery {
  //配置了搜索的数组
  blurry?: string;
  createTime?: Date[];
}
export type { FormItemProps, FormProps, FormQuery };
