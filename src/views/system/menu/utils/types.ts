interface FormItemProps {
  type?: number;
  higherMenuOptions: Record<string, unknown>[];
  id?: number;
  pid?: number;
  parentId: number;
  title: string;
  menuSort: number;
  permission: string;
  path: string;
  routeName?: string;
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
