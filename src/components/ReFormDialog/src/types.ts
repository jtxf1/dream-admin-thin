export interface FormDialogProps {
  visible: boolean;
  title: string;
  loading?: boolean;
  width?: string;
  appendToBody?: boolean;
  destroyOnClose?: boolean;
}

export interface FormDialogEmits {
  save: [];
  cancel: [];
  "update:visible": [value: boolean];
}
