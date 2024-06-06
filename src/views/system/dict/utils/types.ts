import type { BaseEntity, PageQuery } from "@/utils/http/ApiAbstract";

interface FormItemProps extends BaseEntity {
  id?: number; //ID
  name?: string; //字典名称
  description?: string; //描述
  blurry?: string;
}
interface FormProps {
  formInline: FormItemProps;
}
interface FormQuery extends PageQuery {
  blurry?: string;
}
export type { FormItemProps, FormProps, FormQuery };
