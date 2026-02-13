import dayjs from "dayjs";
import { message } from "@/utils/message";
import { get, del } from "@/api/monitor/online";
import { reactive, ref, onMounted, toRaw } from "vue";
import type { PaginationProps } from "@pureadmin/table";
import { CRUD } from "@/api/utils";

export function useOnline() {
  const form = reactive({
    username: ""
  });
  const dataList = ref([]);
  const changeList = ref([]);
  const loading = ref(true);
  const pagination = reactive<PaginationProps>({
    total: 0,
    pageSize: 10,
    currentPage: 1,
    background: true
  });
  const columns: TableColumnList = [
    {
      type: "selection",
      align: "left"
    },
    {
      label: "用户名",
      prop: "userName",
      minWidth: 100
    },
    {
      label: "用户昵称",
      prop: "nickName",
      minWidth: 100
    },
    {
      label: "部门",
      prop: "dept",
      minWidth: 140
    },
    {
      label: "登录 IP",
      prop: "ip",
      minWidth: 140
    },
    {
      label: "登录地点",
      prop: "address",
      minWidth: 140
    },
    {
      label: "浏览器类型",
      prop: "browser",
      minWidth: 100
    },
    {
      label: "登录时间",
      prop: "loginTime",
      minWidth: 180,
      formatter: ({ loginTime }) =>
        dayjs(loginTime).format("YYYY-MM-DD HH:mm:ss")
    },
    {
      label: "操作",
      fixed: "right",
      slot: "operation"
    }
  ];

  /**
   * 分页大小
   * @param val pageSize
   */
  function handleSizeChange(val: number) {
    pagination.pageSize = val;
    onSearch();
  }
  /**
   * 第几页
   * @param val 第几页
   */
  function handleCurrentChange(val: number) {
    pagination.currentPage = val;
    onSearch();
  }
  function handleSelectionChange(val) {
    changeList.value = val.map(person => person.id);
  }

  function handleOffline(row) {
    del([row?.id])
      .then(() => {
        message(`${row.nickName}已被强制下线`, { type: "success" });
        onSearch();
      })
      .catch(() => {
        message(`${row.nickName}强制下线失败`, { type: "error" });
      });
  }
  function handleOfflineAll() {
    del(changeList.value)
      .then(() => {
        message(`已被强制下线`, { type: "success" });
        onSearch();
      })
      .catch(() => {
        message(`强制下线失败`, { type: "error" });
      });
  }

  async function onSearch() {
    loading.value = true;
    const { data } = await get(toRaw(form));
    dataList.value = data.content;
    pagination.total = data.totalElements;

    loading.value = false;
  }

  const resetForm = formEl => {
    if (!formEl) return;
    formEl.resetFields();
    onSearch();
  };

  const exportClick = async () => {
    CRUD.download("auth/online");
    message("导出成功", {
      type: "success"
    });
  };
  onMounted(() => {
    onSearch();
  });

  return {
    form,
    loading,
    columns,
    dataList,
    pagination,
    onSearch,
    resetForm,
    handleOffline,
    handleSizeChange,
    handleCurrentChange,
    handleSelectionChange,
    handleOfflineAll,
    exportClick
  };
}
