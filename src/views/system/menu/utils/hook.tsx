import editForm from "../form.vue";
import { handleTree } from "@/utils/tree";
import { message } from "@/utils/message";
import { get, del, edit } from "@/api/system/menu";
import { transformI18n } from "@/plugins/i18n";
import { addDialog } from "@/components/ReDialog";
import { reactive, ref, onMounted, h } from "vue";
import type { FormItemProps } from "../utils/types";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { cloneDeep, isAllEmpty, deviceDetection } from "@pureadmin/utils";

export function useMenu() {
  const form = reactive({
    title: null,
    blurry: null,
    pid: null,
    createTime: null,
    page: 0,
    size: 10,
    sort: "id,asc"
  });

  const formRef = ref();
  const dataList = ref([]);
  const loading = ref(true);

  const getMenuType = (type, text = false) => {
    switch (type) {
      case 0:
        return text ? "目录" : "primary";
      case 1:
        return text ? "菜单" : "warning";
      case 2:
        return text ? "按钮" : "danger";
    }
  };

  const columns: TableColumnList = [
    {
      label: "菜单标题",
      prop: "title",
      align: "left",
      cellRenderer: ({ row }) => (
        <>
          <span class="inline-block mr-1">
            {h(useRenderIcon(row.icon), {
              style: { paddingTop: "1px" }
            })}
          </span>
          <span>{transformI18n(row.title)}</span>
        </>
      ),
      width: 170
    },
    {
      label: "排序",
      prop: "menuSort",
      width: 80
    },
    {
      label: "权限标识",
      prop: "permission"
    },
    {
      label: "组件名称",
      prop: "componentName"
    },
    {
      label: "组件路径",
      prop: "component",
      formatter: ({ path, component }) =>
        isAllEmpty(component) ? path : component
    },
    {
      label: "路由名称",
      prop: "mane"
    },
    {
      label: "路由路径",
      prop: "path"
    },
    {
      label: "外链",
      prop: "iframe",
      formatter: ({ iframe }) => (iframe > 0 ? "是" : "否"),
      width: 80
    },
    {
      label: "缓存",
      prop: "cache",
      formatter: ({ cache }) => (cache ? "是" : "否"),
      width: 80
    },
    {
      label: "可见",
      prop: "hidden",
      formatter: ({ hidden }) => (hidden ? "否" : "是"),
      width: 80
    },
    {
      label: "创建时间",
      prop: "createTime",
      width: 160
    },
    {
      label: "菜单类型",
      prop: "type",
      width: 100,
      cellRenderer: ({ row, props }) => (
        <el-tag size={props.size} type={getMenuType(row.type)} effect="plain">
          {getMenuType(row.type, true)}
        </el-tag>
      )
    },
    {
      label: "操作",
      fixed: "right",
      width: 180,
      slot: "operation"
    }
  ];

  function handleSelectionChange(val) {
    console.log("handleSelectionChange", val);
  }

  function resetForm(formEl) {
    if (!formEl) return;
    formEl.resetFields();
    onSearch();
  }

  async function onSearch() {
    loading.value = true;
    await get(form).then(data => {
      let newData = data.data;
      if (!isAllEmpty(form.title)) {
        // 前端搜索菜单名称
        newData = newData.filter(item =>
          transformI18n(item.title).includes(form.title)
        );
      }
      dataList.value = handleTree(newData, null, "pid"); // 处理成树结构
    });

    setTimeout(() => {
      loading.value = false;
    }, 500);
  }

  function formatHigherMenuOptions(treeList) {
    if (!treeList || !treeList.length) return;
    const newTreeList = [];
    for (let i = 0; i < treeList.length; i++) {
      treeList[i].title = transformI18n(treeList[i].title);
      formatHigherMenuOptions(treeList[i].children);
      newTreeList.push(treeList[i]);
    }
    return newTreeList;
  }

  function openDialog(title = "新增", row?: FormItemProps) {
    addDialog({
      title: `${title}菜单`,
      props: {
        formInline: {
          higherMenuOptions: formatHigherMenuOptions(cloneDeep(dataList.value)),
          id: row?.id ?? 0,
          pid: row?.pid ?? 0,
          parentId: row?.parentId ?? 0,
          title: row?.title ?? "",
          icon: "ep:" + row?.icon ?? "",
          menuSort: row?.menuSort ?? "",
          permission: row?.permission ?? "",
          component: row?.component ?? "",
          componentName: row?.componentName ?? "",
          path: row?.path ?? "",
          name: row?.name ?? "",
          iframe: row?.iframe ?? false,
          cache: row?.cache ?? false,
          hidden: row?.hidden ?? false,
          createTime: row?.createTime ?? "",
          type: row?.type ?? 0
        }
      },
      width: "45%",
      draggable: true,
      fullscreen: deviceDetection(),
      fullscreenIcon: true,
      closeOnClickModal: false,
      contentRenderer: () => h(editForm, { ref: formRef }),
      beforeSure: (done, { options }) => {
        const FormRef = formRef.value.getRef();
        const curData = options.props.formInline as FormItemProps;
        function chores() {
          message(
            `您${title}了菜单名称为${transformI18n(curData.title)}的这条数据`,
            {
              type: "success"
            }
          );
          done(); // 关闭弹框
          onSearch(); // 刷新表格数据
        }
        FormRef.validate(valid => {
          if (valid) {
            console.log("curData", curData);
            // 表单规则校验通过
            if (title === "新增") {
              // 实际开发先调用新增接口，再进行下面操作
              chores();
            } else {
              edit(curData).finally(() => chores());
            }
          }
        });
      }
    });
  }

  function handleDelete(row) {
    del([row.id]).finally(() => {
      message(`您删除了菜单名称为${transformI18n(row.title)}的这条数据`, {
        type: "success"
      });
      onSearch();
    });
  }

  onMounted(() => {
    onSearch();
  });

  return {
    form,
    loading,
    columns,
    dataList,
    /** 搜索 */
    onSearch,
    /** 重置 */
    resetForm,
    /** 新增、修改菜单 */
    openDialog,
    /** 删除菜单 */
    handleDelete,
    handleSelectionChange
  };
}
