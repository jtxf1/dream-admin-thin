import { ref, onMounted } from "vue";
import { CRUD } from "@/api/utils";
import { message } from "@/utils/message";
import type { FormItemProps } from "./types";

export function useEmail() {
  /** 请求URL */
  const crudURL = "email";
  /** 新增编辑内容渲染 */
  const formRef = ref();
  const formData = ref<FormItemProps>({
    fromUser: "",
    host: "",
    pass: "",
    port: "",
    user: "",
    content: "",
    subject: "",
    tos: ""
  });
  /** 表格加载状态 */
  const loading = ref(true);
  async function onSearch() {
    try {
      await CRUD.get(crudURL)
        .then(res => {
          if (res && res.data) {
            formData.value = {
              fromUser: res.data.fromUser || "",
              host: res.data.host || "",
              pass: res.data.pass || "",
              port: res.data.port || "",
              user: res.data.user || "",
              content: res.data.content || "",
              subject: res.data.subject || "",
              tos: res.data.tos || "",
              id: res.data.id
            };
          }
        })
        .catch(error => {
          message("加载邮件配置失败，请重试", {
            type: "error"
          });
          console.error("加载邮件配置失败:", error);
        });
    } catch (error) {
      message("加载邮件配置失败，请重试", {
        type: "error"
      });
      console.error("加载邮件配置失败:", error);
    } finally {
      loading.value = false;
    }
  }
  /** 页面初始化完成执行的函数 */
  onMounted(() => onSearch());

  return {
    formRef,
    formData,
    loading
  };
}
