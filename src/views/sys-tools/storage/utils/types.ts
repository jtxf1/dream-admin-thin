import type { BaseEntity, PageQuery } from "@/utils/http/ApiAbstract";

interface FormItemProps extends BaseEntity {
  id?: number; //ID
  realName?: string; //文件真实的名称
  name?: string; //文件名
  suffix?: string; //后缀
  path?: string; //路径
  type?: string; //类型
  size?: string; //大小
}
interface FormProps {
  formInline: FormItemProps;
}
interface FormQuery extends PageQuery {
  //配置了搜索的数组
  createTime?: Date[];
}
export type { FormItemProps, FormProps, FormQuery };
