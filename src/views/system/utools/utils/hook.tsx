import editForm from "../form.vue";
import upload from "../upload.vue";
import { message } from "@/utils/message";
import { addDialog } from "@/components/ReDialog";
import { reactive, ref, onMounted, h } from "vue";
import type { FormItemProps, FormQuery } from "./types";
import { ElMessageBox } from "element-plus";
import { PageQuery } from "@/utils/http/ApiAbstract";
import { CRUD, pagination } from "@/api/utils";

export function useDept() {
  //查询条件
  const formQuery = reactive<FormQuery>(new PageQuery());
  /** 请求URL */
  const crudURL = "localStorage";
  /** 新增编辑内容渲染 */
  const formRef = ref();
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
      type: "selection"
    },
    {
      label: "文件名",
      prop: "name",
      minWidth: 70,
      cellRenderer: scope => (
        <el-tooltip
          class="box-item"
          effect="dark"
          content={scope.row.path}
          placement="top"
        >
          <el-link href={scope.row.path} type="primary">
            {scope.row.name}
          </el-link>
        </el-tooltip>
      )
    },
    {
      label: "图像",
      slot: "image"
    },
    {
      label: "文件类型",
      prop: "suffix",
      minWidth: 70
    },
    {
      label: "类别",
      prop: "type",
      minWidth: 70
    },
    {
      label: "大小",
      prop: "size",
      minWidth: 70
    },
    {
      label: "操作人",
      prop: "createBy",
      minWidth: 70
    },
    {
      label: "创建日期",
      prop: "createTime",
      minWidth: 70
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
   * 新增修改函数
   * @param title 标题
   * @param row 数据
   */
  function openDialog(title = "新增", row?: FormItemProps) {
    const formInline = {
      id: row?.id,
      version: row?.version,
      realName: row?.realName,
      name: row?.name,
      suffix: row?.suffix,
      path: row?.path,
      type: row?.type,
      size: row?.size
    };
    addDialog({
      title: `${title}本地存储`,
      props: {
        formInline: formInline
      },
      width: "40%",
      draggable: true,
      fullscreenIcon: true,
      closeOnClickModal: false,
      popconfirm: { title: `是否确认${title}当前数据` },
      contentRenderer: () =>
        h(editForm, { ref: formRef, formInline: formInline }),
      beforeSure: (done, { options }) => {
        const FormRef = formRef.value.getRef();
        const curData = options.props.formInline as FormItemProps;
        function chores() {
          message(`您${title}了本地存储名称为${curData.name}的这条数据`, {
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
              }).then(() => chores());
            } else if (title === "编辑") {
              CRUD.put<FormItemProps, FormItemProps>(crudURL, {
                data: curData
              }).then(() => chores());
            }
          }
        });
      }
    });
  }
  function formUpload(title = "上传文件", row?: FormItemProps) {
    const formInline = {
      id: row?.id
    };
    addDialog({
      title: `${title}`,
      props: {
        formInline: formInline
      },
      draggable: true,
      fullscreenIcon: true,
      closeOnClickModal: false,
      hideFooter: true,
      contentRenderer: () => h(upload, { ref: null, formInline: formInline })
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
      message(`您删除了本地存储名称为${row.name}的这条数据`, {
        type: "success"
      });
      onSearch();
    });
  }

  async function deleteAll() {
    ElMessageBox.confirm(
      `确认要<strong>删除所选的</strong><strong style='color:var(--el-color-primary)'>${multipleSelection.value.length}</strong>个本地存储吗?`,
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
        message("已删除所选的本地存储", {
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
    formUpload
  };
}
