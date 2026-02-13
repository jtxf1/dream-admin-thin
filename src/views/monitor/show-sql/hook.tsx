import { reactive, ref, onMounted } from "vue";
import dayjs from "dayjs";
import { getShowSql } from "@/api/monitor/log";
import type { PageQuery } from "@/utils/http/ApiAbstract";
import { pagination } from "@/api/utils";
import { addDialog } from "@/components/ReDialog";
import { Code } from "@/views/editor/components";
import { View as IconView } from "@element-plus/icons-vue";

export function useSql() {
  //查询条件
  const formQuery = reactive<PageQuery>({ sort: "id,asc" });
  /** 表格数据 */
  const dataList = reactive([]);
  /** 表格加载状态 */
  const loading = ref(true);
  /**
   * 定义表头和数据格式
   */
  const columns: TableColumnList = [
    {
      label: "开始时间",
      prop: "startTime",
      minWidth: 100
    },
    {
      label: "主机",
      prop: "userHost",
      minWidth: 70
    },
    {
      label: "查询时间",
      prop: "queryTime",
      minWidth: 40,
      formatter: ({ queryTime }) => dayjs(queryTime).format("mm:ss")
    },
    {
      label: "锁定时间",
      prop: "lockTime",
      minWidth: 40,
      formatter: ({ lockTime }) => dayjs(lockTime).format("mm:ss")
    },
    {
      label: "发送行",
      prop: "rowsSent",
      minWidth: 70
    },
    {
      label: "查询行",
      prop: "rowsExamined",
      minWidth: 70
    },
    {
      label: "数据库",
      prop: "db",
      minWidth: 70
    },
    {
      label: "最后插入id",
      prop: "lastInsertId",
      minWidth: 70
    },
    {
      label: "插入id",
      prop: "insertId",
      minWidth: 70
    },
    {
      label: "服务id",
      prop: "serverId",
      minWidth: 70
    },
    {
      label: "sql",
      prop: "sqlText",
      minWidth: 70,
      cellRenderer: ({ row, props }) => (
        <el-link
          type="warning"
          size={props.size}
          effect="dark"
          icon={IconView}
          onClick={() => onHideFooterClick(row)}
        >
          {row.sqlText}
        </el-link>
      )
    },
    {
      label: "线程id",
      prop: "threadId",
      minWidth: 70
    }
  ];

  function onHideFooterClick(row) {
    addDialog({
      title: row.description,
      hideFooter: true,
      fullscreen: true,
      contentRenderer: () => (
        <p>
          <Code code={row?.sqlText} type="type" />
        </p>
      )
    });
  }
  /**
   * 重置函数
   * @param formEl form对象
   */
  const resetForm = formEl => {
    if (!formEl) return;
    formEl.resetFields();
    onSearch();
  };

  /**
   * 加载数据
   */
  async function onSearch() {
    dataList.splice(0, dataList.length);
    await getShowSql(formQuery).then(res => {
      pagination.total = res.data.totalElements;
      dataList.push(...res.data.content);
    });
    /** 表格加载完成 */
    loading.value = false;
  }
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
    /** 重置 */
    resetForm,
    /** 分页大小 */
    handleSizeChange,
    /** 第几页 */
    handleCurrentChange
  };
}
