import type { CascaderProps } from "element-plus";
interface FormItemProps {
  higherDeptOptions: Record<string, unknown>[];
  higherDeptOptions2: CascaderProps;
  deptCascader?: any[];
  parentId: number;
  id: number;
  pid: number;
  deptSort: number;
  name: string;
  principal: string;
  phone: string | number;
  email: string;
  sort: number;
  enabled: boolean;
  remark: string;
}
interface FormProps {
  formInline: FormItemProps;
}

export type { FormItemProps, FormProps };
