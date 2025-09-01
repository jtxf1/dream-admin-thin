import { message } from "@/utils/message";
import { reactive, ref, onMounted } from "vue";
import type { FormItemProps, FormQuery } from "./types";
import { ElMessageBox } from "element-plus";
import { PageQuery } from "@/utils/http/ApiAbstract";
import { CRUD, pagination } from "@/api/utils";

export function useDept(formInline) {
  //查询条件
  const formQuery = reactive<FormQuery>(new PageQuery());
  /** 请求URL */
  const crudURL = "deployHistory";
  /** 表格数据 */
  const dataList = reactive([]);
  /** 表格加载状态 */
  const loading = ref(true);
  /** 多选选中的数据 */
  const multipleSelection = ref([]);
  /**
   * 定义表头和数据格式
   */
  const columns: TableColumnList = [
    {
      type: "selection",
      hide: formInline?.id !== null && formInline?.id !== ""
    },
    {
      label: "应用名称",
      prop: "appName",
      minWidth: 70
    },
    {
      label: "服务器IP",
      prop: "ip",
      minWidth: 70
    },
    {
      label: "部署用户",
      prop: "deployUser",
      minWidth: 70
    },
    {
      label: "部署日期",
      prop: "deployDate",
      minWidth: 70
    },
    {
      label: "操作",
      fixed: "right",
      width: 160,
      slot: "operation",
      hide: formInline?.id !== null && formInline?.id !== ""
    }
  ];
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
    await CRUD.get<FormQuery, FormItemProps>(crudURL, {
      params: formQuery
    })
      .then(res => {
        pagination.total = res.data.totalElements;
        dataList.push(...res.data.content);
      })
      .finally(() => (loading.value = false));
  }
  /**
   * 删除函数
   * @param row 删除的数据
   */
  function handleDelete(row) {
    CRUD.delete(crudURL, {
      data: [row.id]
    }).then(() => {
      message(`您删除了部署备份管理名称为${row.name}的这条数据`, {
        type: "success"
      });
      onSearch();
    });
  }

  async function deleteAll() {
    ElMessageBox.confirm(
      `确认要<strong>删除所选的</strong><strong style='color:var(--el-color-primary)'>${multipleSelection.value.length}</strong>个部署备份管理吗?`,
      "系统提示",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        dangerouslyUseHTMLString: true,
        draggable: true
      }
    ).then(() => {
      CRUD.delete(crudURL, {
        data: multipleSelection.value.map(dept => dept.id)
      }).then(() => {
        message("已删除所选的部署备份管理", {
          type: "success"
        });
        onSearch();
      });
    });
  }
  /**
   * 下载表格数据
   */
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

  /**
   * 多选
   * @param val 选中的数据
   */
  const handleSelectionChange = val => {
    multipleSelection.value = val;
  };
  /** 页面初始化完成执行的函数 */
  onMounted(() => {
    onSearch();
  });

  return {
    formQuery,
    loading,
    columns,
    dataList,
    multipleSelection,
    pagination,
    /** 搜索 */
    onSearch,
    /** 重置 */
    resetForm,
    /** 删除岗位 */
    handleDelete,
    /** 分页大小 */
    handleSizeChange,
    /** 第几页 */
    handleCurrentChange,
    /** 多选 */
    handleSelectionChange,
    /** 删除 */
    deleteAll,
    exportClick
  };
}
