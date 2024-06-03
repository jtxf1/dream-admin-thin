interface FormItemProps {
  id?: number;
  tableName?: string;
  author: string;
  pack: string;
  moduleName: string;
  path: string;
  apiAlias: string | any;
  apiPath: string;
  prefix: string;
  cover: boolean;
  apiCover: boolean;
  webCover: boolean;
}

export type { FormItemProps };
