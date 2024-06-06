import type { BaseEntity, PageQuery } from "@/utils/http/ApiAbstract";

interface FormItemProps extends BaseEntity {
  id?: number; //ID
  name?: string; //字典名称
  description?: string; //描述
  blurry?: string;
}
interface DictDetailProps extends BaseEntity {
  id?: number; //ID
  description?: string; //描述
  blurry?: string;
  dict?: FormItemProps;
  label?: string;
  value?: string;
  dictSort?: number;
}
interface FormProps {
  formInline: FormItemProps;
}
interface FormDictDetail {
  formInline: DictDetailProps;
}
interface FormQuery extends PageQuery {
  blurry?: string;
}
interface FormDetailQuery extends PageQuery {
  dictName?: string;
  id?: number;
}
export type {
  FormItemProps,
  FormProps,
  DictDetailProps,
  FormDictDetail,
  FormQuery,
  FormDetailQuery
};
