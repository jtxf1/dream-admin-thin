import type { BaseEntity, PageQuery } from "@/utils/http/ApiAbstract";

interface FormItemProps extends BaseEntity {
  id?: number; //ID
  name?: string; //应用名称
  uploadPath?: string; //上传目录
  deployPath?: string; //部署路径
  backupPath?: string; //备份路径
  port?: number; //应用端口
  startScript?: string; //启动脚本
  deployScript?: string; //部署脚本
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
