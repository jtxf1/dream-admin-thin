export interface SearchFormField {
  label: string;
  prop: string;
  type: "input" | "select" | "date" | "daterange";
  placeholder?: string;
  options?: Array<{ label: string; value: any }>;
  clearable?: boolean;
  width?: string;
}

export interface SearchFormProps {
  fields: SearchFormField[];
  model: Record<string, any>;
  loading?: boolean;
  inline?: boolean;
}

export interface SearchFormEmits {
  search: [];
  reset: [];
}
