import dayjs from "dayjs";
import editForm from "../form.vue";
import { message } from "@/utils/message";
import { addDialog } from "@/components/ReDialog";
import type { PaginationProps } from "@pureadmin/table";
import { reactive, ref, onMounted, h } from "vue";
import type { FormItemProps, FormQuery } from "./types";
import { cloneDeep } from "@pureadmin/utils";
import { usePublicHooks } from "@/utils/theme";
import { ElMessageBox } from "element-plus";
import { CRUD } from "@/api/utils";
import { getDictDetail } from "@/api/system/dict";

export function useDept() {
  //查询条件
  const formQuery = reactive<FormQuery>({ sort: "id,asc" });
  /** 请求URL */
  const crudURL = "job";
  /** 新增编辑内容渲染 */
  const formRef = ref();
  /** 表格数据 */
  const dataList = reactive([]);
  /** 表格加载状态 */
  const loading = ref(true);
  /** 多选选中的数据 */
  const multipleSelection = ref([]);
  const { switchStyle } = usePublicHooks();
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
      label: "岗位名称",
      prop: "name",
      width: 180,
      align: "left"
    },
    {
      label: "排序",
      prop: "jobSort",
      minWidth: 70
    },
    {
      label: "状态",
      prop: "enabled",
      minWidth: 100,
      cellRenderer: scope => (
        <el-switch
          v-model={scope.row.enabled}
          size={scope.props.size === "small" ? "small" : "default"}
          style={switchStyle.value}
          inline-prompt
          active-value={dictsDetails.value[0].value === "true"}
          inactive-value={dictsDetails.value[1].value === "true"}
          active-text={dictsDetails.value[0].label}
          inactive-text={dictsDetails.value[1].label}
          onChange={() => onChange(scope as any)}
        />
      )
    },
    {
      label: "创建时间",
      minWidth: 200,
      prop: "createTime",
      formatter: ({ createTime }) =>
        dayjs(createTime).format("YYYY-MM-DD HH:mm:ss")
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
    await getDictDetails("job_status");
    formQuery.page = pagination.currentPage - 1;
    formQuery.size = pagination.pageSize;
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
      title: `${title}岗位`,
      props: {
        formInline: {
          higherDeptOptions: cloneDeep(dataList),
          id: row?.id,
          name: row?.name ?? "",
          jobSort: row?.jobSort ?? 0,
          version: row?.version ?? 0,
          enabled: row?.enabled ?? false,
          dictsDetails: dictsDetails.value ?? []
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
          message(`您${title}了岗位名称为${curData.name}的这条数据`, {
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
                data: {
                  name: curData.name,
                  enabled: curData.enabled,
                  jobSort: curData.jobSort
                }
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
      message(`您删除了岗位名称为${row.name}的这条数据`, { type: "success" });
    });
    onSearch();
  }
  /**
   * 状态: 停用 启用
   * @param row   表数据
   * @param index 数据索引
   *
   */
  function onChange({ row }) {
    ElMessageBox.confirm(
      `确认要<strong>${
        !row.enabled ? "停用" : "启用"
      }</strong><strong style='color:var(--el-color-primary)'>${
        row.name
      }</strong>用户吗?`,
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
        setTimeout(() => {
          CRUD.put<FormItemProps, FormItemProps>(crudURL, {
            data: row
          });
          message("已成功修改岗位状态", {
            type: "success"
          });
        }, 300);
      })
      .catch(() => {
        row.enabled ? (row.enabled = false) : (row.enabled = true);
      });
  }

  async function deleteAll() {
    ElMessageBox.confirm(
      `确认要<strong>删除所选的</strong><strong style='color:var(--el-color-primary)'>${multipleSelection.value.length}</strong>个岗位吗?`,
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
          message("已删除所选的岗位", {
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
    CRUD.download("job");

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

  /** 字典查询 */
  function getDictDetails(name) {
    getDictDetail(name).then(data => {
      dictsDetails.value = data.data.content;
    });
  }

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
