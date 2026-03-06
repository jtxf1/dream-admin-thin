export interface TableOperation {
  label: string;
  type: "primary" | "success" | "warning" | "danger" | "info";
  icon?: string;
  visible?: (row: any) => boolean;
  action: string;
  confirm?: boolean;
  confirmMessage?: (row: any) => string;
}

export interface TableOperationProps {
  row: any;
  size?: "large" | "default" | "small";
  operations: TableOperation[];
}

export interface TableOperationEmits {
  operation: [action: string, row: any];
}
