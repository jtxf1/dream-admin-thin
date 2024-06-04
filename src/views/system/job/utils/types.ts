import type { BaseEntity, PageQuery } from "@/utils/http/ApiAbstract";
interface FormItemProps extends BaseEntity {
  id?: number;
  name: string;
  jobSort: number;
  enabled: boolean;
  dictsDetails?: any[];
}
interface FormProps {
  formInline: FormItemProps;
}
interface FormQuery extends PageQuery {
  name?: string;
  enabled?: boolean;
  createTime?: Date[];
}

export type { FormItemProps, FormProps, FormQuery };
