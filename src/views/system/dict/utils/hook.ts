import editForm from "../form.vue";
import editForm1 from "../formDictDetail.vue";
import { message } from "@/utils/message";
import { addDialog } from "@/components/ReDialog";
import type { PaginationProps } from "@pureadmin/table";
import { reactive, ref, onMounted, h } from "vue";
import type {
  FormItemProps,
  FormQuery,
  DictDetailProps,
  FormDetailQuery
} from "./types";
import { ElMessageBox } from "element-plus";
import { CRUD } from "@/api/utils";

export function useDept() {
  //查询条件
  const formQuery = reactive<FormQuery>({ sort: "id,asc" });
  const formQuery1 = reactive<FormDetailQuery>({ sort: "id,asc" });
  /** 请求URL */
  const crudURL = "dict";
  const crudDictDetailURL = "dictDetail";
  /** 新增编辑内容渲染 */
  const formRef = ref();
  /** 表格数据 */
  const dataList = reactive([]);
  const dataListDictDetail = reactive([]);
  /** 表格加载状态 */
  const loading = ref(true);
  /** 多选选中的数据 */
  const multipleSelection = ref([]);
  /** 字典列表 */
  const dictsDetails = ref([]);

  /** 分页配置 */
  const pagination = reactive<PaginationProps>({
    total: 10,
    pageSize: 10,
    pageSizes: [10, 20, 50],
    currentPage: 1,
    align: "left"
  });
  /** 分页配置 */
  const paginationDictDetail = reactive<PaginationProps>({
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
      type: "selection"
    },
    {
      type: "index",
      index: indexMethod
    },
    {
      label: "字典名称",
      prop: "name",
      minWidth: 70
    },
    {
      label: "描述",
      prop: "description",
      minWidth: 70
    },
    {
      label: "创建日期",
      prop: "createTime",
      minWidth: 70
    },
    {
      label: "操作",
      fixed: "right",
      width: 160,
      slot: "operation"
    }
  ];
  const columnsDictDetail: TableColumnList = [
    {
      label: "所属字典",
      prop: "dict.description",
      minWidth: 70
    },
    {
      label: "字典标签",
      prop: "label",
      minWidth: 70
    },
    {
      label: "字典值",
      prop: "value",
      minWidth: 70
    },
    {
      label: "排序",
      prop: "dictSort",
      minWidth: 70
    },
    {
      label: "描述",
      prop: "description",
      minWidth: 70
    },
    {
      label: "创建日期",
      prop: "createTime",
      minWidth: 70
    },
    {
      label: "操作",
      fixed: "right",
      width: 160,
      slot: "operation"
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
    }).then(res => {
      pagination.total = res.data.totalElements;
      dataList.push(...res.data.content);
    });
    /** 表格加载完成 */
    setTimeout(() => {
      loading.value = false;
    }, 500);
  }
  async function onSearchDictDetail() {
    dataListDictDetail.splice(0, dataListDictDetail.length);
    await CRUD.get<DictDetailProps, FormQuery>(crudDictDetailURL, {
      params: formQuery1
    }).then(res => {
      paginationDictDetail.total = res.data.totalElements;
      dataListDictDetail.push(...res.data.content);
      console.log(res.data.content);
    });
    /** 表格加载完成 */
    setTimeout(() => {
      loading.value = false;
    }, 500);
  }
  /**
   * 新增修改函数
   * @param title 标题
   * @param row 数据
   */
  function openDialog(title = "新增", row?: FormItemProps) {
    addDialog({
      title: `${title}字典`,
      props: {
        formInline: {
          id: row?.id,
          name: row?.name,
          description: row?.description
        }
      },
      width: "40%",
      draggable: true,
      fullscreenIcon: true,
      closeOnClickModal: false,
      contentRenderer: () => h(editForm, { ref: formRef }),
      beforeSure: (done, { options }) => {
        const FormRef = formRef.value.getRef();
        const curData = options.props.formInline as FormItemProps;
        function chores() {
          message(`您${title}了字典名称为${curData.name}的这条数据`, {
            type: "success"
          });
          done(); // 关闭弹框
          onSearch(); // 刷新表格数据
        }
        FormRef.validate(valid => {
          if (valid) {
            // 表单规则校验通过
            if (title === "新增") {
              // 实际开发先调用新增接口，再进行下面操作
              CRUD.post<FormItemProps, FormItemProps>(crudURL, {
                data: curData
              }).finally(() => chores());
            } else if (title === "编辑") {
              CRUD.put<FormItemProps, FormItemProps>(crudURL, {
                data: curData
              }).finally(() => chores());
            }
          }
        });
      }
    });
  }
  /**
   * 删除函数
   * @param row 删除的数据
   */
  function handleDelete(row) {
    CRUD.delete(crudURL, {
      data: [row.id]
    }).then(() => {
      message(`您删除了字典名称为${row.name}的这条数据`, { type: "success" });
      onSearch();
    });
  }

  /**
   * 新增修改函数
   * @param title 标题
   * @param row 数据
   */
  function openDialog1(title = "新增", row?: DictDetailProps) {
    addDialog({
      title: `${title}字典详情`,
      props: {
        formInline: {
          id: row?.id,
          blurry: row?.blurry,
          dict: row?.dict,
          label: row?.label,
          value: row?.value,
          dictSort: row?.dictSort ?? 0,
          description: row?.description,
          version: row?.version
        }
      },
      width: "40%",
      draggable: true,
      fullscreenIcon: true,
      closeOnClickModal: false,
      contentRenderer: () => h(editForm1, { ref: formRef }),
      beforeSure: (done, { options }) => {
        const FormRef = formRef.value.getRef();
        const curData = options.props.formInline as DictDetailProps;
        function chores() {
          message(
            `您${title}了字典详情名称为${curData.description}的这条数据`,
            {
              type: "success"
            }
          );
          done(); // 关闭弹框
          onSearchDictDetail(); // 刷新表格数据
        }
        FormRef.validate(valid => {
          if (valid) {
            curData.dict = { id: formQuery1.id };
            // 表单规则校验通过
            if (title === "新增") {
              // 实际开发先调用新增接口，再进行下面操作
              CRUD.post<DictDetailProps, FormItemProps>(crudDictDetailURL, {
                data: curData
              }).finally(() => chores());
            } else if (title === "编辑") {
              CRUD.put<DictDetailProps, FormItemProps>(crudDictDetailURL, {
                data: curData
              }).finally(() => chores());
            }
          }
        });
      }
    });
  }
  /**
   * 删除函数
   * @param row 删除的数据
   */
  function handleDelete1(row) {
    CRUD.delete(crudDictDetailURL + "/" + row.id).then(() => {
      message(`您删除了字典详情名称为${row.label}的这条数据`, {
        type: "success"
      });
      onSearchDictDetail();
    });
  }

  async function deleteAll() {
    ElMessageBox.confirm(
      `确认要<strong>删除所选的</strong><strong style='color:var(--el-color-primary)'>${multipleSelection.value.length}</strong>个字典吗?`,
      "系统提示",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        dangerouslyUseHTMLString: true,
        draggable: true
      }
    )
      .then(() => {
        CRUD.delete(crudURL, {
          data: multipleSelection.value.map(dept => dept.id)
        }).then(() => {
          message("已删除所选的字典", {
            type: "success"
          });
          onSearch();
        });
      })
      .catch(() => {
        onSearch();
      });
  }
  const exportClick = async () => {
    CRUD.download(crudURL);
    // downloadByUrl("/api/dict/download", "test-url.xls");
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
   * 分页大小
   * @param val pageSize
   */
  function handleSizeChange1(val: number) {
    paginationDictDetail.pageSize = val;
    formQuery1.size = paginationDictDetail.pageSize;
    onSearchDictDetail();
  }
  /**
   * 第几页
   * @param val 第几页
   */
  function handleCurrentChange1(val: number) {
    paginationDictDetail.currentPage = val;
    formQuery1.page = paginationDictDetail.currentPage - 1;
    onSearchDictDetail();
  }
  function handleRowClick(row: any) {
    formQuery1.sort = "dictSort,asc;dict_id,asc";
    formQuery1.id = row.id;

    dataListDictDetail.splice(0, dataListDictDetail.length);
    CRUD.get<DictDetailProps, FormDetailQuery>(crudDictDetailURL, {
      params: formQuery1
    }).then(res => {
      paginationDictDetail.total = res.data.totalElements;
      dataListDictDetail.push(...res.data.content);
    });
    /** 表格加载完成 */
    setTimeout(() => {
      loading.value = false;
    }, 500);
    // 在这里，你可以根据 row 数据做你想做的事情
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
    dictsDetails,
    /** 搜索 */
    onSearch,
    /** 重置 */
    resetForm,
    /** 新增、编辑岗位 */
    openDialog,
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
    /** 导出 */
    exportClick,
    handleRowClick,
    dataListDictDetail,
    paginationDictDetail,
    columnsDictDetail,
    onSearchDictDetail,
    handleSizeChange1,
    handleCurrentChange1,
    openDialog1,
    handleDelete1
  };
}
