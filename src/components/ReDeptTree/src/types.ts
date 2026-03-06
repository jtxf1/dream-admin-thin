export interface TreeData {
  id: string | number;
  label: string;
  children?: TreeData[];
  [key: string]: any;
}

export interface DeptTreeProps {
  treeData: TreeData[];
  loading?: boolean;
  defaultExpandedKeys?: (string | number)[];
  defaultCheckedKeys?: (string | number)[];
  checkStrictly?: boolean;
  showCheckbox?: boolean;
}

export interface DeptTreeEmits {
  select: [node: any, selected: boolean];
  check: [checkedKeys: (string | number)[], checkedNodes: any[]];
}
