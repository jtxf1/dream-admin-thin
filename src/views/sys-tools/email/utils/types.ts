interface FormItemProps {
  id?: number; //ID
  fromUser?: string;
  host?: string;
  pass?: string;
  port?: string;
  user?: string;
  content?: string;
  subject?: string;
  tos?: string;
}
interface FormProps {
  formInline: FormItemProps;
}
export type { FormItemProps, FormProps };
