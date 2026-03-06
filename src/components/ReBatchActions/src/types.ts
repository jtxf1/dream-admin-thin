export interface BatchAction {
  label: string;
  type: "primary" | "success" | "warning" | "danger" | "info";
  icon?: string;
  disabled?: (selectedCount: number) => boolean;
  action: string;
  confirm?: boolean;
  confirmMessage?: (selectedCount: number) => string;
}

export interface BatchActionsProps {
  selectedCount: number;
  actions: BatchAction[];
}

export interface BatchActionsEmits {
  batchAction: [action: string];
}
