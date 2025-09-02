import { ref, onMounted } from "vue";
import { CRUD } from "@/api/utils";
import type { FormItemProps } from "./types";

export function useDept() {
  /** 请求URL */
  const crudURL = "email";
  /** 新增编辑内容渲染 */
  const formRef = ref();
  const formData = ref<FormItemProps>({});
  /** 表格加载状态 */
  const loading = ref(true);
  async function onSearch() {
    await CRUD.get(crudURL)
      .then(res => {
        formData.value = res.data as FormItemProps;
      })
      .finally(() => (loading.value = false));
  }
  /** 页面初始化完成执行的函数 */
  onMounted(() => onSearch());

  return {
    formRef,
    formData,
    loading
  };
}
