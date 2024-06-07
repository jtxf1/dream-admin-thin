import { message } from "@/utils/message";
import type { PaginationProps } from "@pureadmin/table";
import { reactive, ref, onMounted } from "vue";
import type { LogsProps, FormQuery } from "./types";
import { CRUD } from "@/api/utils";

export function useDept() {
  //查询条件
  const formQuery = reactive<FormQuery>({ sort: "id,asc" });
  /** 请求URL */
  const crudURL = "jobs/logs";
  /** 表格数据 */
  const dataList = reactive([]);
  /** 表格加载状态 */
  const loading = ref(true);

  /** 分页配置 */
  const pagination = reactive<PaginationProps>({
    total: 10,
    pageSize: 10,
    pageSizes: [10, 20, 50],
    currentPage: 1,
    align: "left"
  });
  /** 表格索引 */
  const indexMethod = (index: number) => {
    return index + 1 + (pagination.currentPage - 1) * pagination.pageSize;
  };
  /**
   * 定义表头和数据格式
   */
  const columns: TableColumnList = [
    {
      type: "index",
      index: indexMethod
    },
    {
      label: "任务名称",
      prop: "jobName",
      minWidth: 70
    },
    {
      label: "Bean名称",
      prop: "beanName",
      minWidth: 70
    },
    {
      label: "执行方法",
      prop: "methodName",
      minWidth: 70
    },
    {
      label: "参数",
      prop: "params",
      minWidth: 70
    },
    {
      label: "cron",
      prop: "cronExpression",
      minWidth: 70
    },
    {
      label: "异常详情",
      prop: "exceptionDetail",
      minWidth: 70
    },
    {
      label: "耗时",
      prop: "time",
      minWidth: 70
    },
    {
      label: "状态",
      prop: "isSuccess",
      minWidth: 70
    },
    {
      label: "创建日期",
      prop: "createTime",
      minWidth: 110
    }
  ];
  /**
   * 加载数据
   */
  async function onSearch() {
    dataList.splice(0, dataList.length);
    await CRUD.get<FormQuery, LogsProps>(crudURL, {
      params: formQuery
    }).then(res => {
      pagination.total = res.data.totalElements;
      dataList.push(...res.data.content);
    });
    /** 表格加载完成 */
    setTimeout(() => {
      loading.value = false;
    }, 500);
  }
  const exportClick = async () => {
    CRUD.download(crudURL);
    message("导出成功", {
      type: "success"
    });
  };
  /**
   * 分页大小
   * @param val pageSize
   */
  function handleSizeChange(val: number) {
    pagination.pageSize = val;
    formQuery.size = pagination.pageSize;
    onSearch();
  }
  /**
   * 第几页
   * @param val 第几页
   */
  function handleCurrentChange(val: number) {
    pagination.currentPage = val;
    formQuery.page = pagination.currentPage - 1;
    onSearch();
  }

  /** 页面初始化完成执行的函数 */
  onMounted(() => {
    onSearch();
  });

  return {
    formQuery,
    loading,
    columns,
    dataList,
    pagination,
    /** 搜索 */
    onSearch,
    /** 分页大小 */
    handleSizeChange,
    /** 第几页 */
    handleCurrentChange,
    /** 导出 */
    exportClick
  };
}
