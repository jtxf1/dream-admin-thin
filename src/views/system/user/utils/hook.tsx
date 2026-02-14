import "./reset.css";
import dayjs from "dayjs";
import editForm from "../form/index.vue";
import { zxcvbn } from "@zxcvbn-ts/core";
import { handleTree } from "@/utils/tree";
import { message } from "@/utils/message";
import { usePublicHooks } from "@/utils/theme";
import { addDialog } from "@/components/ReDialog";
import type { PaginationProps } from "@pureadmin/table";
import {
  hideTextAtIndex,
  getKeyList,
  isAllEmpty,
  cloneDeep
} from "@pureadmin/utils";
import * as User from "@/api/system/user";
import * as Dept from "@/api/system/dept";
import { CRUD, baseUrlHello } from "@/api/utils";
import * as Role from "@/api/system/role";
import { ElMessageBox } from "element-plus";
import { h, ref, watch, computed, reactive, onMounted } from "vue";
import ReCropperPreview from "@/components/ReCropperPreview";
import * as Img from "@/api/tools/img";

// 类型定义
interface TableRef {
  value: {
    setAdaptive: () => void;
    getTableRef: () => any;
  };
}

interface SwitchLoadMap {
  [key: number]: {
    loading: boolean;
  };
}

interface HigherDeptOption {
  id: number;
  label: string;
  children?: HigherDeptOption[];
  disabled?: boolean;
  status?: number;
}

interface UserRow extends User.User {
  roleOptionsId?: number[];
  jobOptionsId?: number[];
  remark?: string;
}

interface FormData {
  deptId: string;
  username: string;
  createTime: string;
  phone: string;
  status: string;
  blurry: string;
  enabled: string;
}

interface PwdFormData {
  newPwd: string;
}

interface CropperResult {
  blob: Blob;
}

interface UploadResult {
  data?: {
    links?: {
      url: string;
    };
    key: string;
  };
}

export function useUser(tableRef: TableRef) {
  const form = reactive<FormData>({
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
  const userEdit = reactive({ user: {} as Partial<UserRow> });
  const cropperBlob = ref<Blob | undefined>();
  const formRef = ref<{
    getRef: () => { validate: (callback: (valid: boolean) => void) => void };
  }>();
  const dataList = ref<UserRow[]>([]);
  const loading = ref(true);
  const switchLoadMap = ref<SwitchLoadMap>({});
  const { switchStyle } = usePublicHooks();
  const higherDeptOptions = ref<HigherDeptOption[] | undefined>();
  const treeData = ref<HigherDeptOption[]>([]);
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
      prop: "avatarPath",
      cellRenderer: ({ row }) => (
        <el-image
          fit="cover"
          preview-teleported={true}
          src={baseUrlHello(row.avatarPath)}
          preview-src-list={Array.of(baseUrlHello(row.avatarPath))}
          class="w-[24px] h-[24px] rounded-full align-middle"
        >
          {{
            error: () => (
              <el-image src={new URL("/logo.svg", import.meta.url).href} />
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

  onMounted(async () => {
    treeLoading.value = true;
    onSearch();

    const { data } = await Dept.getDeptTree({ enabled: true });
    higherDeptOptions.value = handleTree(data, "id", "pid");
    treeData.value = handleTree(data, "id", "pid");
    treeLoading.value = false;

    roleOptions.value = (await Role.get()).data.content;
    jobOptions.value = (await CRUD.get("job")).data.content;
  });

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
  const pwdForm = reactive<PwdFormData>({
    newPwd: ""
  });
  // 当前密码强度（0-4）
  const curScore = ref<number | undefined>();
  const roleOptions = ref<Role.Role[]>([]);
  const jobOptions = ref<User.Job[]>([]);

  function onChange({ row, index }: { row: UserRow; index: number }) {
    const originalEnabled = row.enabled;
    const newEnabled = !originalEnabled;

    ElMessageBox.confirm(
      `确认要<strong>${
        newEnabled ? "激活" : "锁定"
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

        const updatedRow = { ...row, enabled: newEnabled };

        User.edit(updatedRow).finally(() => {
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
        // 取消操作，不需要修改数据，因为我们没有直接修改原始数据
      });
  }

  function handleDelete(row: UserRow) {
    User.del([row.id])
      .then(() => {
        message(`您删除了用户编号为${row.id}的这条数据!`, { type: "success" });
        onSearch();
      })
      .catch(error => {
        message("删除用户失败，请稍后重试", {
          type: "error"
        });
        console.error("删除用户失败:", error);
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
  function handleSelectionChange(val: UserRow[]) {
    selectedNum.value = val.length;
    // 重置表格高度
    tableRef.value.setAdaptive();
    if (val.length === 1) {
      userEdit.user = val[0];
    } else {
      userEdit.user = {} as Partial<UserRow>;
    }
  }

  /** 取消选择 */
  function onSelectionCancel() {
    selectedNum.value = 0;
    userEdit.user = {} as Partial<UserRow>;
    // 用于多选表格，清空用户的选择
    tableRef.value.getTableRef().clearSelection();
  }

  /** 批量删除 */
  function onbatchDel() {
    const curSelected = tableRef.value
      .getTableRef()
      .getSelectionRows() as UserRow[];
    if (curSelected.length === 0) {
      message("请先选择要删除的用户", {
        type: "warning"
      });
      return;
    }

    User.del(getKeyList(curSelected, "id"))
      .then(() => {
        message(`已删除用户编号为 ${getKeyList(curSelected, "id")} 的数据`, {
          type: "success"
        });
        tableRef.value.getTableRef().clearSelection();
        onSearch();
      })
      .catch(error => {
        message("批量删除用户失败，请稍后重试", {
          type: "error"
        });
        console.error("批量删除用户失败:", error);
      });
  }

  async function onSearch(): Promise<void> {
    loading.value = true;
    try {
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
      const data = await User.get(queryType);
      data.data.content.forEach(userFor => {
        userFor["roleOptionsId"] = userFor.roles.map(x => x.id);
        userFor["jobOptionsId"] = userFor.jobs.map(x => x.id);
      });
      dataList.value = data.data.content;
      pagination.total = data.data.totalElements;
    } catch (error) {
      message("获取用户列表失败，请稍后重试", {
        type: "error"
      });
      console.error("获取用户列表失败:", error);
    } finally {
      loading.value = false;
    }
  }

  const resetForm = (formEl: { resetFields: () => void } | undefined) => {
    if (!formEl) return;
    formEl.resetFields();
    form.deptId = "";
    onSearch();
  };

  function onTreeSelect({ id, selected }: { id: string; selected: boolean }) {
    form.deptId = selected ? id : "";
    onSearch();
  }

  function formatHigherDeptOptions(
    treeList: HigherDeptOption[] | undefined
  ): HigherDeptOption[] | undefined {
    // 根据返回数据的status字段值判断追加是否禁用disabled字段，返回处理后的树结构，用于上级部门级联选择器的展示（实际开发中也是如此，不可能前端需要的每个字段后端都会返回，这时需要前端自行根据后端返回的某些字段做逻辑处理）
    if (!treeList || !treeList.length) return;
    const newTreeList: HigherDeptOption[] = [];
    for (let i = 0; i < treeList.length; i++) {
      treeList[i].disabled = treeList[i].status === 0 ? true : false;
      formatHigherDeptOptions(treeList[i].children);
      newTreeList.push(treeList[i]);
    }
    return newTreeList;
  }

  function openDialog(title: string = "新增", row?: Partial<UserRow>) {
    addDialog({
      title: `${title}用户`,
      props: {
        formInline: {
          title,
          higherDeptOptions: formatHigherDeptOptions(higherDeptOptions.value),
          id: row?.id,
          parentId: row?.dept?.id ?? 0,
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
      beforeSure: (done: () => void, { options }: { options: any }) => {
        const FormRef = formRef.value.getRef();
        const curData = options.props.formInline as any;
        function chores() {
          message(`您${title}了用户名称为${curData.nickName}的这条数据`, {
            type: "success"
          });
          done(); // 关闭弹框
          onSearch(); // 刷新表格数据
        }
        FormRef.validate((valid: boolean) => {
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
              User.add(userClone)
                .then(() => {
                  chores();
                })
                .catch(error => {
                  message("新增用户失败，请稍后重试", {
                    type: "error"
                  });
                  console.error("新增用户失败:", error);
                });
            } else {
              // 返回当前选中的行
              const editData =
                row == null || row.id == null
                  ? tableRef.value.getTableRef().getSelectionRows()
                  : userClone;
              User.edit(editData)
                .then(() => {
                  chores();
                })
                .catch(error => {
                  message("编辑用户失败，请稍后重试", {
                    type: "error"
                  });
                  console.error("编辑用户失败:", error);
                });
            }
          }
        });
      }
    });
  }

  /** 上传头像 */
  function handleUpload(row: UserRow) {
    addDialog({
      title: "裁剪、上传头像",
      width: "40%",
      draggable: true,
      closeOnClickModal: false,
      contentRenderer: () =>
        h(ReCropperPreview, {
          imgSrc: baseUrlHello(row.avatarPath),
          onCropper: ({ blob }: CropperResult) => (cropperBlob.value = blob)
        }),
      beforeSure: (done: () => void) => {
        const fd = new FormData();
        fd.append("file", cropperBlob.value, "test.png");
        Img.uploadPost(fd)
          .then((data: UploadResult) => {
            if (data) {
              User.updateAvatarByid({
                id: row.id,
                avatar: data?.data?.links?.url,
                key: data?.data?.key
              })
                .then(() => {
                  message("上传头像成功", {
                    type: "success"
                  });
                })
                .catch(error => {
                  message("更新头像信息失败，请稍后重试", {
                    type: "error"
                  });
                  console.error("更新头像信息失败:", error);
                });
            } else {
              message("上传头像失败，请稍后重试", {
                type: "error"
              });
            }
          })
          .catch(error => {
            message("上传头像失败，请稍后重试", {
              type: "error"
            });
            console.error("上传头像失败:", error);
          })
          .finally(() => {
            done();
            onSearch();
          });
      }
    });
  }

  watch(
    pwdForm,
    ({ newPwd }: PwdFormData) =>
      (curScore.value = isAllEmpty(newPwd) ? -1 : zxcvbn(newPwd).score)
  );

  /** 重置密码 */
  function handleReset(row: UserRow) {
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
      beforeSure: (done: () => void) => {
        User.resetPwd([row.id])
          .then(() => {
            message(`已成功重置 ${row.username} 用户的密码`, {
              type: "success"
            });
          })
          .catch(error => {
            message("重置密码失败，请稍后重试", {
              type: "error"
            });
            console.error("重置密码失败:", error);
          })
          .finally(() => {
            done();
            onSearch();
          });
      }
    });
  }
  /** 批量重置密码 */
  function handleResetBatch() {
    const curSelected = tableRef.value
      .getTableRef()
      .getSelectionRows() as UserRow[];
    if (curSelected.length === 0) {
      message("请先选择要重置密码的用户", {
        type: "warning"
      });
      return;
    }

    addDialog({
      title: `重置 ${getKeyList(curSelected, "id")} 用户的密码`,
      width: "10%",
      draggable: true,
      closeOnClickModal: false,
      contentRenderer: () => (
        <>
          <div class="mt-1 flex"></div>
        </>
      ),
      beforeSure: (done: () => void) => {
        User.resetPwd(getKeyList(curSelected, "id"))
          .then(() => {
            message(`已成功重置 ${getKeyList(curSelected, "id")} 用户的密码`, {
              type: "success"
            });
          })
          .catch(error => {
            message("批量重置密码失败，请稍后重试", {
              type: "error"
            });
            console.error("批量重置密码失败:", error);
          })
          .finally(() => {
            done();
            onSearch();
          });
      }
    });
  }

  const exportClick = async (): Promise<void> => {
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
