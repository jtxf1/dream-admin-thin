import dayjs from "dayjs";
import { message } from "@/utils/message";
import {
  get,
  delInfo,
  queryErrorLogDetail,
  type LogQueryCriteria
} from "@/api/monitor/log";
import type { PaginationProps } from "@pureadmin/table";
import { type Ref, reactive, ref, onMounted, toRaw } from "vue";
import { addDialog } from "@/components/ReDialog";
import { Code } from "@/views/editor/components";

export function useLog(tableRef: Ref) {
  const form = reactive({
    blurry: "",
    createTime: [],
    logType: ""
  });
  const dataList = ref([]);
  const loading = ref(true);
  const selectedNum = ref(0);

  const pagination = reactive<PaginationProps>({
    total: 0,
    pageSize: 10,
    pageSizes: [10, 20, 50],
    currentPage: 1,
    background: true
  });
  const columns: TableColumnList = [
    {
      type: "expand",
      slot: "expand"
    },
    {
      label: "用户名",
      prop: "username",
      minWidth: 100
    },
    {
      label: "登录 IP",
      prop: "requestIp",
      minWidth: 140
    },
    {
      label: "登录地点",
      prop: "address",
      minWidth: 140
    },
    {
      label: "描述",
      prop: "description",
      minWidth: 100
    },
    {
      label: "浏览器类型",
      prop: "browser",
      minWidth: 100
    },
    {
      label: "请求耗时",
      prop: "time",
      minWidth: 100,
      cellRenderer: ({ row, props }) => (
        <el-tag
          size={props.size}
          style={true}
          type={row.time <= 100 ? "success" : "warning"}
        >
          {row.time + "ms"}
        </el-tag>
      )
    },
    {
      label: "请求类型",
      prop: "logType",
      minWidth: 100,
      cellRenderer: ({ row, props }) => (
        <el-tag
          size={props.size}
          style={true}
          type={row.logType === "INFO" ? "success" : "danger"}
        >
          {row.logType}
        </el-tag>
      )
    },
    {
      label: "创建时间",
      prop: "createTime",
      minWidth: 180,
      formatter: ({ loginTime }) =>
        dayjs(loginTime).format("YYYY-MM-DD HH:mm:ss")
    },
    {
      label: "异常详情",
      prop: "exceptionDetail",
      minWidth: 180,
      cellRenderer: ({ row, props }) => (
        <el-tag
          v-show={row.logType === "ERROR"}
          size={props.size}
          type="danger"
          effect="dark"
          onClick={() => onHideFooterClick(row)}
        >
          查看异常详情
        </el-tag>
      )
    }
  ];

  function handleSizeChange(val: number) {
    pagination.pageSize = val;
    onSearch();
  }

  function handleCurrentChange(val: number) {
    pagination.currentPage = val;
    onSearch();
  }

  /** 当CheckBox选择项发生变化时会触发该事件 */
  function handleSelectionChange(val) {
    selectedNum.value = val.length;
    // 重置表格高度
    tableRef.value.setAdaptive();
  }

  /** 取消选择 */
  function onSelectionCancel() {
    selectedNum.value = 0;
    // 用于多选表格，清空用户的选择
    tableRef.value.getTableRef().clearSelection();
  }

  /** 清空日志 */
  function clearAll() {
    delInfo()
      .then(() => {
        // 根据实际业务，调用接口删除所有日志数据
        message("已删除所有日志数据", {
          type: "success"
        });
        onSearch();
      })
      .catch(err => {
        // 根据实际业务，调用接口删除所有日志数据
        message(err.message, {
          type: "error"
        });
      });
  }

  async function onSearch() {
    loading.value = true;
    const forms: LogQueryCriteria = toRaw(form);
    forms.page = pagination.currentPage - 1;
    forms.size = pagination.pageSize;
    const { data } = await get(forms);

    dataList.value = data?.content;
    pagination.total = data?.totalElements;

    loading.value = false;
  }

  function onHideFooterClick(row) {
    queryErrorLogDetail(row.id).then(res => {
      addDialog({
        title: row.description,
        hideFooter: true,
        fullscreen: true,
        contentRenderer: () => (
          <p>
            <Code code={res?.data?.exception} type="type" />
          </p>
        )
      });
    });
  }
  const resetForm = formEl => {
    if (!formEl) return;
    formEl.resetFields();
    onSearch();
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
    selectedNum,
    onSearch,
    clearAll,
    resetForm,
    handleSizeChange,
    onSelectionCancel,
    handleCurrentChange,
    handleSelectionChange
  };
}
