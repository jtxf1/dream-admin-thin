export interface TreeData {
  id: string | number;
  name?: string;
  label: string;
  type?: number;
  children?: TreeData[];
  [key: string]: any;
}

export interface DeptTreeProps {
  treeData: TreeData[];
  treeLoading?: boolean;
}

export interface DeptTreeEmits {
  "tree-select": [{ id: number; menuIds: (string | number)[] }];
}
