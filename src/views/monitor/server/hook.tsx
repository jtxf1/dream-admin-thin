import { get, type LogQueryCriteria } from "@/api/monitor/log";
import type { PaginationProps } from "@pureadmin/table";
import { reactive, ref, onMounted, toRaw } from "vue";

export function useRole() {
  const form = reactive({
    blurry: "",
    createTime: [],
    logType: ""
  });
  const dataList = ref([]);
  const loading = ref(true);

  const pagination = reactive<PaginationProps>({
    total: 0,
    pageSize: 10,
    pageSizes: [10, 20, 50],
    currentPage: 1,
    background: true
  });
  async function onSearch() {
    loading.value = true;
    const forms: LogQueryCriteria = toRaw(form);
    forms.page = pagination.currentPage - 1;
    forms.size = pagination.pageSize;
    const { data } = await get(forms);

    dataList.value = data?.content;
    pagination.total = data?.totalElements;

    setTimeout(() => {
      loading.value = false;
    }, 500);
  }

  onMounted(() => {
    onSearch();
  });

  return {
    form,
    onSearch
  };
}
