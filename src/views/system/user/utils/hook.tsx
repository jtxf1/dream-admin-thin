import "./reset.css";
import dayjs from "dayjs";
import editForm from "../form/index.vue";
import { zxcvbn } from "@zxcvbn-ts/core";
import { handleTree } from "@/utils/tree";
import { message } from "@/utils/message";
import { usePublicHooks } from "@/utils/theme";
import { addDialog } from "@/components/ReDialog";
import type { PaginationProps } from "@pureadmin/table";
import type { FormItemProps } from "../utils/types";
import {
  hideTextAtIndex,
  getKeyList,
  isAllEmpty,
  cloneDeep
} from "@pureadmin/utils";
import * as User from "@/api/system/user";
import * as Dept from "@/api/system/dept";
import { CRUD } from "@/api/utils";
import * as Role from "@/api/system/role";
import { ElMessageBox } from "element-plus";
import { type Ref, h, ref, watch, computed, reactive, onMounted } from "vue";
import ReCropperPreview from "@/components/ReCropperPreview";

export function useUser(tableRef: Ref, treeRef: Ref) {
  const form = reactive({
    // 左侧部门树的id
    deptId: "",
    username: "",
    createTime: "",
    phone: "",
    status: "",
    blurry: "",
    enabled: ""
  });
  //要编辑的user
  const userEdit = reactive({ user: {} });
  const cropperBlob = ref();
  const formRef = ref();
  const dataList = ref([]);
  const loading = ref(true);
  // 上传头像信息
  //const avatarInfo = ref();
  const switchLoadMap = ref({});
  const { switchStyle } = usePublicHooks();
  const higherDeptOptions = ref();
  const treeData = ref([]);
  const treeLoading = ref(true);
  const selectedNum = ref(0);
  /** 分页配置 */
  const pagination = reactive<PaginationProps>({
    total: 0,
    pageSize: 10,
    pageSizes: [10, 20, 50, 100],
    currentPage: 1,
    align: "left",
    background: true
  });
  const columns: TableColumnList = [
    {
      label: "勾选列", // 如果需要表格多选，此处label必须设置
      type: "selection",
      fixed: "left",
      reserveSelection: true // 数据刷新后保留选项
    },
    {
      label: "用户编号",
      prop: "id",
      width: 90
    },
    {
      label: "用户头像",
      prop: "avatarName",
      cellRenderer: ({ row }) => (
        <el-image
          fit="cover"
          preview-teleported={true}
          src={row.avatarPath}
          preview-src-list={Array.of(row.avatarPath)}
          class="w-[24px] h-[24px] rounded-full align-middle"
        >
          {{
            error: () => (
              <el-image src="https://element-plus.org/images/element-plus-logo.svg" />
            )
          }}
        </el-image>
      ),
      width: 90
    },
    {
      label: "用户名称",
      prop: "username",
      minWidth: 130
    },
    {
      label: "用户昵称",
      prop: "nickName",
      minWidth: 130
    },
    {
      label: "性别",
      prop: "gender",
      minWidth: 90,
      cellRenderer: ({ row }) => {
        return (
          <el-tag type={row.gender === "女" ? "danger" : "success"}>
            {row.gender}
          </el-tag>
        );
      }
    },
    {
      label: "部门",
      prop: "dept.name",
      minWidth: 90
    },
    {
      label: "手机号码",
      prop: "phone",
      minWidth: 90,
      formatter: ({ phone }) => hideTextAtIndex(phone, { start: 3, end: 6 })
    },
    {
      label: "邮箱",
      prop: "email",
      minWidth: 90
    },
    {
      label: "状态",
      prop: "enabled",
      minWidth: 90,
      cellRenderer: scope => (
        <el-switch
          size={scope.props.size === "small" ? "small" : "default"}
          loading={switchLoadMap.value[scope.index]?.loading}
          v-model={scope.row.enabled}
          active-value={true}
          inactive-value={false}
          active-text="激活"
          inactive-text="锁定"
          inline-prompt
          style={switchStyle.value}
          onChange={() => onChange(scope as any)}
        />
      )
    },
    {
      label: "创建时间",
      minWidth: 90,
      prop: "createTime",
      formatter: ({ createTime }) =>
        dayjs(createTime).format("YYYY-MM-DD HH:mm:ss")
    },
    {
      label: "操作",
      fixed: "right",
      width: 180,
      slot: "operation"
    }
  ];
  const buttonClass = computed(() => {
    return [
      "!h-[20px]",
      "reset-margin",
      "!text-gray-500",
      "dark:!text-white",
      "dark:hover:!text-primary"
    ];
  });

  // 重置的新密码
  const pwdForm = reactive({
    newPwd: ""
  });
  // 当前密码强度（0-4）
  const curScore = ref();
  const roleOptions = ref([]);
  const jobOptions = ref([]);

  function onChange({ row, index }) {
    ElMessageBox.confirm(
      `确认要<strong>${
        row.enabled ? "激活" : "锁定"
      }</strong><strong style='color:var(--el-color-primary)'>${
        row.username
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
        User.edit(row).finally(() => {
          switchLoadMap.value[index] = Object.assign(
            {},
            switchLoadMap.value[index],
            {
              loading: false
            }
          );
          message("已成功修改用户状态", {
            type: "success"
          });
          onSearch();
        });
      })
      .catch(() => {
        row.status === 0 ? (row.status = 1) : (row.status = 0);
      });
  }

  function handleUpdate(row) {
    console.log(row);
  }

  function handleDelete(row) {
    User.del([row.id]).then(() => {
      message(`您删除了用户编号为${row.id}的这条数据!`, { type: "success" });
      onSearch();
    });
  }

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
    if (val.length === 1) {
      userEdit.user = val[0];
    } else {
      userEdit.user = {};
    }
  }

  /** 取消选择 */
  function onSelectionCancel() {
    selectedNum.value = 0;
    userEdit.user = {};
    // 用于多选表格，清空用户的选择
    tableRef.value.getTableRef().clearSelection();
  }

  /** 批量删除 */
  function onbatchDel() {
    // 返回当前选中的行
    const curSelected = tableRef.value.getTableRef().getSelectionRows();
    User.del(getKeyList(curSelected, "id")).then(() => {
      // 接下来根据实际业务，通过选中行的某项数据，比如下面的id，调用接口进行批量删除
      message(`已删除用户编号为 ${getKeyList(curSelected, "id")} 的数据`, {
        type: "success"
      });
      tableRef.value.getTableRef().clearSelection();
      onSearch();
    });
  }

  async function onSearch() {
    loading.value = true;
    const queryType = new User.UserQueryCriteria();
    if (!isAllEmpty(form.blurry)) {
      queryType.blurry = form.blurry;
    }
    if (!isAllEmpty(form.enabled)) {
      queryType.enabled = form.enabled;
    }
    if (!isAllEmpty(form.createTime)) {
      queryType.createTime = form.createTime;
    }
    if (
      form.deptId !== null &&
      form.deptId !== "0" &&
      form.deptId !== "" &&
      form.deptId !== " "
    ) {
      queryType.deptId = Number(form.deptId);
    }
    queryType.page = pagination.currentPage - 1;
    queryType.size = pagination.pageSize;
    User.get(queryType)
      .then(data => {
        data.data.content.forEach(userFor => {
          userFor["roleOptionsId"] = userFor.roles.map(x => x.id);
          userFor["jobOptionsId"] = userFor.jobs.map(x => x.id);
        });
        dataList.value = data.data.content;
        pagination.total = data.data.totalElements;
      })
      .finally(() => (loading.value = false));
  }

  const resetForm = formEl => {
    if (!formEl) return;
    formEl.resetFields();
    form.deptId = "";
    treeRef.value.onTreeReset();
    onSearch();
  };

  function onTreeSelect({ id, selected }) {
    form.deptId = selected ? id : "";
    onSearch();
  }

  function formatHigherDeptOptions(treeList) {
    // 根据返回数据的status字段值判断追加是否禁用disabled字段，返回处理后的树结构，用于上级部门级联选择器的展示（实际开发中也是如此，不可能前端需要的每个字段后端都会返回，这时需要前端自行根据后端返回的某些字段做逻辑处理）
    if (!treeList || !treeList.length) return;
    const newTreeList = [];
    for (let i = 0; i < treeList.length; i++) {
      treeList[i].disabled = treeList[i].status === 0 ? true : false;
      formatHigherDeptOptions(treeList[i].children);
      newTreeList.push(treeList[i]);
    }
    return newTreeList;
  }

  function openDialog(title = "新增", row?: FormItemProps | any) {
    addDialog({
      title: `${title}用户`,
      props: {
        formInline: {
          title,
          higherDeptOptions: formatHigherDeptOptions(higherDeptOptions.value),
          id: row?.id,
          parentId: row?.dept.id ?? 0,
          nickName: row?.nickName ?? "",
          username: row?.username ?? "",
          password: row?.password ?? "",
          phone: row?.phone ?? "",
          email: row?.email ?? "",
          gender: row?.gender ?? "男",
          enabled: row?.enabled ?? 1,
          remark: row?.remark ?? "",
          jobOptionsId: row?.jobOptionsId ?? [],
          roleOptionsId: row?.roleOptionsId ?? [],
          roleOptions: roleOptions?.value ?? [],
          jobOptions: jobOptions?.value ?? []
        }
      },
      width: "46%",
      draggable: true,
      fullscreenIcon: true,
      closeOnClickModal: false,
      contentRenderer: () => h(editForm, { ref: formRef, formInline: null }),
      beforeSure: (done, { options }) => {
        const FormRef = formRef.value.getRef();
        const curData = options.props.formInline as FormItemProps;
        function chores() {
          message(`您${title}了用户名称为${curData.nickName}的这条数据`, {
            type: "success"
          });
          done(); // 关闭弹框
          onSearch(); // 刷新表格数据
        }
        FormRef.validate(valid => {
          if (valid) {
            const userClone = cloneDeep(curData);
            userClone["dept"] = { id: userClone.parentId };
            userClone["roles"] = userClone.roleOptionsId.map(x => ({
              id: x
            }));
            userClone["jobs"] = userClone.jobOptionsId.map(x => ({
              id: x
            }));
            delete userClone.title;
            delete userClone.higherDeptOptions;
            delete userClone.parentId;
            delete userClone.roleOptions;
            delete userClone.jobOptions;
            delete userClone.roleOptionsId;
            delete userClone.jobOptionsId;
            // 表单规则校验通过
            if (title === "新增") {
              User.add(userClone).finally(() => {
                chores();
              });
            } else {
              // 返回当前选中的行
              User.edit(
                row == null || row.id == null
                  ? tableRef.value.getTableRef().getSelectionRows()
                  : userClone
              ).finally(() => {
                chores();
              });
            }
          }
        });
      }
    });
  }

  /** 上传头像 */
  function handleUpload(row) {
    console.log(row);

    addDialog({
      title: "裁剪、上传头像",
      width: "40%",
      draggable: true,
      closeOnClickModal: false,
      contentRenderer: () =>
        h(ReCropperPreview, {
          imgSrc: row.avatarPath,
          cropper: ({ blob }) => (cropperBlob.value = blob)
        }),
      beforeSure: done => {
        //User.updateAvatarByid({ id: row.id, avatar: avatarInfo.value.blob });
        // 根据实际业务使用avatarInfo.value和row里的某些字段去调用上传头像接口即可
        done(); // 关闭弹框
        onSearch(); // 刷新表格数据
      }
    });
  }

  watch(
    pwdForm,
    ({ newPwd }) =>
      (curScore.value = isAllEmpty(newPwd) ? -1 : zxcvbn(newPwd).score)
  );

  /** 重置密码 */
  function handleReset(row) {
    addDialog({
      title: `重置 ${row.username} 用户的密码`,
      width: "10%",
      draggable: true,
      closeOnClickModal: false,
      contentRenderer: () => (
        <>
          <div class="mt-1 flex"></div>
        </>
      ),
      beforeSure: done => {
        // 表单规则校验通过
        User.resetPwd([row.id]).then(() => {
          message(`已成功重置 ${row.username} 用户的密码`, {
            type: "success"
          });
        });
        // 根据实际业务使用pwdForm.newPwd和row里的某些字段去调用重置用户密码接口即可
        done(); // 关闭弹框
        onSearch(); // 刷新表格数据
      }
    });
  }
  /** 批量重置密码 */
  function handleResetBatch() {
    addDialog({
      title: `重置 ${getKeyList(tableRef.value.getTableRef().getSelectionRows(), "id")} 用户的密码`,
      width: "10%",
      draggable: true,
      closeOnClickModal: false,
      contentRenderer: () => (
        <>
          <div class="mt-1 flex"></div>
        </>
      ),
      beforeSure: done => {
        // 返回当前选中的行
        const curSelected = tableRef.value.getTableRef().getSelectionRows();
        // 表单规则校验通过
        User.resetPwd(getKeyList(curSelected, "id")).then(() => {
          message(`已成功重置 ${getKeyList(curSelected, "id")} 用户的密码`, {
            type: "success"
          });
        });
        // 根据实际业务使用pwdForm.newPwd和row里的某些字段去调用重置用户密码接口即可
        done(); // 关闭弹框
        onSearch(); // 刷新表格数据
      }
    });
  }

  onMounted(async () => {
    treeLoading.value = true;
    onSearch();

    // 归属部门
    // const { data } = await getDeptList();
    const { data } = await Dept.getDeptTree({ enabled: true });
    higherDeptOptions.value = handleTree(data, "id", "pid");
    treeData.value = handleTree(data, "id", "pid");
    treeLoading.value = false;

    // 角色列表
    roleOptions.value = (await Role.get()).data.content;
    jobOptions.value = (await CRUD.get("job")).data.content;
  });

  const exportClick = async () => {
    CRUD.download("users");

    message("导出成功", {
      type: "success"
    });
  };
  return {
    form,
    loading,
    columns,
    dataList,
    treeData,
    treeLoading,
    selectedNum,
    pagination,
    buttonClass,
    userEdit,
    onSearch,
    resetForm,
    onbatchDel,
    openDialog,
    onTreeSelect,
    handleUpdate,
    handleDelete,
    handleUpload,
    handleReset,
    handleSizeChange,
    onSelectionCancel,
    handleCurrentChange,
    handleSelectionChange,
    handleResetBatch,
    exportClick
  };
}
