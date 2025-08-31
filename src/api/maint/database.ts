import { http } from "@/utils/http";
import type { ApiAbstract } from "@/utils/http/ApiAbstract";
import { baseUrlApi } from "../utils";

/** 文件上传 */
export const formUpload = (data, url) => {
  return http.request<ApiAbstract>(
    "post",
    baseUrlApi(url),
    { data },
    {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  );
};
