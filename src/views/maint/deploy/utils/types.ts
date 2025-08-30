import type { BaseEntity, PageQuery } from "@/utils/http/ApiAbstract";
import type { FormItemProps as App } from "@/views/maint/app/utils/types";
import type { FormItemProps as Server } from "@/views/maint/server/utils/types";

interface FormItemProps extends BaseEntity {
  id?: number; //ID
  servers?: number;
  app?: App;
  deploys?: Server[];
  appList?: App[];
  appId?: number;
  deployIds?: number[];
}
interface FormProps {
  formInline: FormItemProps;
}
interface FormQuery extends PageQuery {
  //配置了搜索的数组
  appName?: string;
  createTime?: Date[];
}
export type { FormItemProps, FormProps, FormQuery };
