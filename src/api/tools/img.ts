import { http } from "@/utils/http";
import type { ApiAbstract } from "@/utils/http/ApiAbstract";
import { baseUrlApi } from "../utils";
import axios from "axios";

export class Img {
  status: boolean;
  message: string;
  data: ImgData;
}
export class ImgData {
  tokens: ImgToken[];
}
export class ImgToken {
  token: string;
  expired_at: string;
}
export class ImgReturn {
  status: boolean;
  message: string;
  data: ImgName;
}
export class ImgName {
  key: string;
  name: string;
  pathname: string;
  origin_name: string;
  size: number;
  mimetype: string;
  extension: string;
  md5: string;
  sha1: string;
  links: Links;
}
export class Links {
  url: string;
  html: string;
  bbcode: string;
  markdown: string;
  markdown_with_link: string;
  thumbnail_url: string;
  delete_url: string;
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
  return http.request<ApiAbstract<Img>>(
    "post",
    baseUrlApi("helloimg/imageTokens")
  );
};

export const uploadPost = async (data: FormData): Promise<ImgReturn | any> => {
  let token;
  await imageTokens()
    .then(async req => {
      token = await req?.data?.data?.tokens[0]?.token;
    })
    .catch(error => {
      throw error;
    });

  await data.append("token", token);
  data.append("album_id", "2054");
  const config: {
    method: "post";
    url: string;
    headers: { [key: string]: string };
    data: FormData;
  } = {
    method: "post",
    url: "https://picui.cn/api/v1/upload",
    headers: {
      Accept: "application/json",
      "Content-Type": "multipart/form-data"
    },
    data: data
  };
  return await axios(config)
    .then(app => {
      return app.data;
    })
    .catch(error => {
      throw error;
    });
};
