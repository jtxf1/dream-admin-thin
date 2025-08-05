import dayjs from "dayjs";
import editForm from "../form.vue";
import { message } from "@/utils/message";
import * as Dept from "@/api/system/dept";
import { addDialog } from "@/components/ReDialog";
import { reactive, ref, onMounted, type Ref, h } from "vue";
import type { FormItemProps } from "../utils/types";
import { cloneDeep, isAllEmpty } from "@pureadmin/utils";
import { usePublicHooks } from "@/utils/theme";
import { ElMessageBox, type CascaderProps } from "element-plus";

export function useDept(tableRef: Ref, treeRef: Ref) {
  console.log(tableRef);
  console.log(treeRef);

  const form = reactive({
    name: "",
    enabled: null,
    createTime: ""
  });

  const formRef = ref();
  const dataList = ref([]);
  const deptCascader = ref([]);
  const loading = ref(true);
  const multipleSelection = ref([]);
  const switchLoadMap = ref({});
  const { switchStyle } = usePublicHooks();

  /** 表格索引 */
  const indexMethod = (index: number) => {
    return index + 1;
  };

  const columns: TableColumnList = [
    {
      type: "selection"
    },
    {
      type: "index",
      index: indexMethod
    },
    {
      label: "部门名称",
      prop: "name",
      width: 180,
      align: "left"
    },
    {
      label: "排序",
      prop: "deptSort",
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
          loading={switchLoadMap.value[scope.row.index]?.loading}
          style={switchStyle.value}
          inline-prompt
          active-value={true}
          inactive-value={false}
          active-text="启用"
          inactive-text="停用"
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
      label: "备注",
      prop: "remark",
      minWidth: 320
    },
    {
      label: "操作",
      fixed: "right",
      width: 160,
      slot: "operation"
    }
  ];

  function resetForm(formEl) {
    if (!formEl) return;
    formEl.resetFields();
    onSearch();
  }

  async function onSearch() {
    dataList.value = [];
    loading.value = true;
    const queryType = new Dept.DeptQueryCriteria();

    if (!isAllEmpty(form.name)) {
      queryType.name = form.name;
    }
    if (!isAllEmpty(form.enabled)) {
      queryType.enabled = form.enabled;
    }
    if (!isAllEmpty(form.createTime)) {
      queryType.createTime = form.createTime;
    }
    const depts = (await Dept.getDepts(queryType)).data; // 这里是返回一维数组结构，前端自行处理成树结构，返回格式要求：唯一id加父节点parentId，parentId取父节点id
    //dataList.value = handleTree2(newData); // 处理成树结构
    dataList.value = depts;
    deptCascader.value = extractFields(depts);
    setTimeout(() => {
      loading.value = false;
    }, 500);
  }
  function extractFields(arr) {
    const result = [];

    arr.forEach(item => {
      const obj = {
        value: item.id,
        label: item.name,
        subCount: item.subCount,
        leaf: item.subCount === 0,
        children: []
      };
      if (item.children !== null && item.children.length > 0) {
        obj.children = extractFields(item.children);
      }
      result.push(obj);
    });

    return result;
  }

  function copyFields(arr: any[], id?: number) {
    const result: any[] = cloneDeep(arr);
    result.forEach(item => {
      if (item.value === id) {
        item.disabled = true;
        //item["disabled"] = true;
        console.log(item.disabled);
      }
      if (item.children !== null && item.children.length > 0) {
        item.children = copyFields(item.children, id);
      }
    });
    return result;
  }

  function formatHigherDeptOptions(treeList) {
    // 根据返回数据的status字段值判断追加是否禁用disabled字段，返回处理后的树结构，用于上级部门级联选择器的展示（实际开发中也是如此，不可能前端需要的每个字段后端都会返回，这时需要前端自行根据后端返回的某些字段做逻辑处理）
    if (!treeList || !treeList.length) return;
    const newTreeList = [];
    for (let i = 0; i < treeList.length; i++) {
      treeList[i].disabled = treeList[i].enabled;
      formatHigherDeptOptions(treeList[i].children);
      newTreeList.push(treeList[i]);
    }
    return newTreeList;
  }
  const higherDeptOptions2: CascaderProps = {
    lazy: true,
    checkStrictly: true,
    lazyLoad(node, resolve) {
      setTimeout(() => {
        let queryDept = { pid: node?.data?.value };
        if (!node.data) {
          queryDept = null;
        }

        Dept.getDepts(queryDept).then(contentData => {
          const nodes = contentData.data.map(item => ({
            value: item.id,
            label: item.name,
            subCount: item.subCount,
            leaf: item.subCount === 0
          }));
          // 调用' resolve '回调以返回子节点数据并指示加载完成。
          resolve(nodes);
        });
      }, 1000);
    }
  };
  function openDialog(title = "新增", row?: FormItemProps) {
    addDialog({
      title: `${title}部门`,
      props: {
        formInline: {
          higherDeptOptions: formatHigherDeptOptions(cloneDeep(dataList)),
          higherDeptOptions2: higherDeptOptions2,
          deptCascader: copyFields(deptCascader.value, row?.id),
          parentId: row?.parentId ?? 0,
          id: row?.id ?? 0,
          pid: row?.pid ?? 0,
          name: row?.name ?? "",
          deptSort: row?.deptSort ?? 0,
          principal: row?.principal ?? "",
          phone: row?.phone ?? "",
          email: row?.email ?? "",
          sort: row?.sort ?? 0,
          enabled: row?.enabled ?? false,
          remark: row?.remark ?? ""
        }
      },
      width: "40%",
      draggable: true,
      fullscreenIcon: true,
      closeOnClickModal: false,
      contentRenderer: () => h(editForm, { ref: formRef, formInline: null }),
      beforeSure: (done, { options }) => {
        const FormRef = formRef.value.getRef();
        const curData = options.props.formInline as FormItemProps;
        function chores() {
          message(`您${title}了部门名称为${curData.name}的这条数据`, {
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
              Dept.add({
                name: curData.name,
                pid: curData.pid === 0 ? null : curData.pid[0],
                deptSort: curData.deptSort,
                enabled: curData.enabled
              }).then(() => {
                chores();
              });
            } else if (title === "编辑") {
              Dept.edit({
                id: curData.id,
                name: curData.name,
                pid: curData.pid === 0 ? null : curData.pid,
                deptSort: curData.deptSort,
                enabled: curData.enabled
              }).then(() => {
                chores();
              });
            } else {
              chores();
            }
          }
        });
      }
    });
  }

  function handleDelete(row) {
    Dept.del([row.id]).then(() => {
      message(`您删除了部门名称为${row.name}的这条数据`, { type: "success" });
    });
    onSearch();
  }

  function onChange({ row, index }) {
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
        switchLoadMap.value[index] = Object.assign(
          {},
          switchLoadMap.value[index],
          {
            loading: true
          }
        );
        setTimeout(() => {
          switchLoadMap.value[index] = Object.assign(
            {},
            switchLoadMap.value[index],
            {
              loading: false
            }
          );
          Dept.edit({
            id: row.id,
            name: row.name,
            pid: row.pid === 0 ? null : row.pid,
            deptSort: row.deptSort,
            enabled: row.enabled
          });
          message("已成功修改部门状态", {
            type: "success"
          });
        }, 300);
      })
      .catch(() => {
        row.enabled ? (row.enabled = false) : (row.enabled = true);
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
    deptCascader,
    multipleSelection,
    /** 搜索 */
    onSearch,
    /** 重置 */
    resetForm,
    /** 新增、编辑部门 */
    openDialog,
    /** 删除部门 */
    handleDelete
  };
}
