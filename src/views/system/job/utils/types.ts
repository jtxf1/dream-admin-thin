import type { BaseEntity, PageQuery } from "@/utils/http/ApiAbstract";
interface FormItemProps extends BaseEntity {
  higherDeptOptions: Record<string, unknown>[];
  parentId?: number;
  id: number;
  name: string;
  jobSort: number;
  enabled: boolean;
  principal: string;
  phone: string | number;
  email: string;
  sort: number;
  version: number;
  remark: string;
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
