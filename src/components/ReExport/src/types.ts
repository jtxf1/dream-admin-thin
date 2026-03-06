export interface ExportProps {
  loading?: boolean;
  formats?: Array<{ label: string; value: string }>;
  formatter?: (data: any[]) => any[];
}

export interface ExportEmits {
  export: [format: string];
}
