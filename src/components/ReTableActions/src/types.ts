export interface TableAction {
  label: string;
  type: "primary" | "success" | "warning" | "danger" | "info";
  icon?: string;
  disabled?: (selectedCount: number) => boolean;
  action: string;
}

export interface TableActionsProps {
  actions: TableAction[];
  selectedCount: number;
  loading?: boolean;
}

export interface TableActionsEmits {
  action: [action: string];
}
