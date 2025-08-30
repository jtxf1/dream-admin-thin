import editForm from "../form.vue";
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
  const crudURL = "deploy";
  const appURL = "app";
  const serverURL = "serverDeploy";
  /** 新增编辑内容渲染 */
  const formRef = ref();
  /** 表格数据 */
  const dataList = reactive([]);
  const appList = reactive([]);
  const serverList = reactive([]);
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
      label: "应用名称",
      prop: "app.name",
      minWidth: 70
    },
    {
      label: "服务器列表",
      prop: "servers",
      minWidth: 70
    },
    {
      label: "部署日期",
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
      servers: row?.servers,
      app: row?.app,
      deploys: serverList,
      appList: appList,
      createTime: row?.createTime,
      appId: row?.app?.id,
      deployIds: row?.deploys?.map(server => server.id)
    };
    addDialog({
      title: `${title}部署管理`,
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
          message(`您${title}了部署管理名称为${curData?.app?.name}的这条数据`, {
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
                  app: { id: curData.appId },
                  deploys: curData?.deployIds?.map(num => ({ id: num }))
                }
              }).then(() => chores());
            } else if (title === "编辑") {
              CRUD.put<FormItemProps, FormItemProps>(crudURL, {
                data: {
                  id: curData.id,
                  app: { id: curData.appId },
                  deploys: curData?.deployIds?.map(num => ({ id: num }))
                }
              }).then(() => chores());
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
      message(`您删除了部署管理名称为${row.name}的这条数据`, {
        type: "success"
      });
      onSearch();
    });
  }

  async function deleteAll() {
    ElMessageBox.confirm(
      `确认要<strong>删除所选的</strong><strong style='color:var(--el-color-primary)'>${multipleSelection.value.length}</strong>个部署管理吗?`,
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
        message("已删除所选的部署管理", {
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
    appList.splice(0, appList.length);
    CRUD.get(appURL).then(res => {
      appList.push(...res.data.content);
    });
    serverList.splice(0, serverList.length);
    CRUD.get(serverURL).then(res => {
      serverList.push(...res.data.content);
    });
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
    exportClick
  };
}
