interface FormItemProps {
  type?: number;
  higherMenuOptions: Record<string, unknown>[];
  parentId: number;
  title: string;
  menuSort: number;
  permission: string;
  path: string;
  name?: string;
  iframe: boolean;
  cache: boolean;
  hidden: boolean;
  createTime?: Date;
  componentName: string;
  component: string;
  icon: string;
}
interface FormProps {
  formInline: FormItemProps;
}

export type { FormItemProps, FormProps };
