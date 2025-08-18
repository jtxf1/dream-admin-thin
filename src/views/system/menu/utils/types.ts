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
  iframe: number;
  cache: boolean;
  hidden: boolean;
  showLink: boolean;
  createTime?: Date;
  componentName: string;
  component: string;
  icon: string;
  redirect: string;
  extraIcon: string;
  activePath: string;
  showParent: number;
  hiddenTag: boolean;
  fixedTag: number;
}
interface FormProps {
  formInline: FormItemProps;
}

export type { FormItemProps, FormProps };
