import type { BaseEntity, PageQuery } from "@/utils/http/ApiAbstract";

interface FormItemProps extends BaseEntity {
  id?: number; //存储桶名称
  ownerName?: string; //作者名称
  ownerId?: string; //作者id
  creationDate?: Date; //存储桶创建时间
  location?: string; //存储桶位置
  bucketType?: string; //存储桶类型
  type?: string; //内部设置的类型
  bucketName?: string;
}
interface FormProps {
  formInline: FormItemProps;
}
interface FormQuery extends PageQuery {
  //配置了搜索的数组
  bucketName?: string;
  ownerName?: string;
}
export type { FormItemProps, FormProps, FormQuery };
