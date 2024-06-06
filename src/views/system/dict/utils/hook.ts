import editForm from "../form.vue";
import { message } from "@/utils/message";
import { addDialog } from "@/components/ReDialog";
import type { PaginationProps } from "@pureadmin/table";
import { reactive, ref, onMounted, h } from "vue";
import type { FormItemProps, FormQuery } from "./types";
import { ElMessageBox } from "element-plus";
import { CRUD } from "@/api/utils";

export function useDept() {
  //查询条件
  const formQuery = reactive<FormQuery>({ sort: "id,asc" });
  /** 请求URL */
  const crudURL = "dict";
  /** 新增编辑内容渲染 */
  const formRef = ref();
  /** 表格数据 */
  const dataList = reactive([]);
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
    });
    onSearch();
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
    exportClick
  };
}
