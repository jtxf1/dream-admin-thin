import { http } from "@/utils/http";
import type { ApiAbstract } from "@/utils/http/ApiAbstract";
import { baseUrlApi } from "../utils";

export class Dict {
  createBy: string;
  id: number;
  dictDetails: DictDetail[];
  name: string;
  description: string;
}
export class DictDetail {
  id: number;
  dict: DictSmallDto;
  label: string;
  value: string;
  dictSort: number;
}
export class DictSmallDto {
  id: number;
}

export const getAllDepts = () => {
  return http.request<ApiAbstract<Dict>>("get", baseUrlApi("dict/all"));
};
