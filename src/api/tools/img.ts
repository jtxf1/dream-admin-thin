import { http } from "@/utils/http";
import type { ApiAbstract } from "@/utils/http/ApiAbstract";
import { baseUrlApi } from "../utils";

export class Img {
  status: boolean;
  message: string;
  data: JSON;
}

export const deleteImages = (key: string) => {
  return http.request<ApiAbstract<Img>>(
    "delete",
    baseUrlApi("helloimg/deleteImages"),
    {
      data: key
    }
  );
};

export const imageTokens = () => {
  return http.request("post", baseUrlApi("helloimg/imageTokens"));
};
