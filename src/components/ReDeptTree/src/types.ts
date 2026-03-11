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
  /**
   * 控制组件显示/隐藏
   * @default true
   */
  visible?: boolean;
}

export interface DeptTreeEmits {
  "tree-select": [{ id: number; menuIds: (string | number)[] }];
}
