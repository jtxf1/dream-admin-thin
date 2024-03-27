interface FormItemProps {
  id?: number;
  /** 用于判断是`新增`还是`修改` */
  title: string;
  higherDeptOptions: Record<string, unknown>[];
  parentId: number;
  username: string;
  nickName: string;
  password: string;
  phone: string | number;
  email: string;
  gender: string | number;
  enabled: boolean;
  dept?: {
    id?: number;
    name?: string;
  };
  remark: string;
  roleOptionsId: number[];
  roleOptions: Record<string, number>[];
  jobOptionsId: number[];
  jobOptions: Record<string, number>[];
}
interface FormProps {
  formInline: FormItemProps;
}

interface RoleFormItemProps {
  username: string;
  nickName: string;
  /** 角色列表 */
  roleOptions: any[];
  /** 选中的角色列表 */
  ids: Record<number, unknown>[];
}
interface RoleFormProps {
  formInline: RoleFormItemProps;
}

interface LogProps {
  id: number;
  /**
   * 操作用户
   */
  username: string;
  /**
   * 描述
   */
  description: string;
  /**
   * 方法名
   */
  method: string;
  /**
   * 参数
   */
  params: string;
  /**
   * 日志类型
   */
  logType: string;
  /**
   * 请求ip
   */
  requestIp: string;
  /**
   * 地址
   */
  address: string;
  /**
   * 浏览器
   */
  browser: string;
  /**
   * 请求耗时
   */
  time: number;
  /**
   * 异常详细
   */
  exceptionDetail: Uint8Array;
  /**
   * 创建日期
   */
  createTime: Date;
}

export type {
  FormItemProps,
  FormProps,
  RoleFormItemProps,
  RoleFormProps,
  LogProps
};
