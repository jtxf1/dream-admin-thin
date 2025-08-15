import { ref, watch, reactive, computed } from "vue";
//import { baseUrlAvatar } from "@/api/utils";
import { zxcvbn } from "@zxcvbn-ts/core";
import { isAllEmpty, isNull, isEmail } from "@pureadmin/utils";
import { addDialog } from "@/components/ReDialog";
import { storageLocal } from "@pureadmin/utils";
import * as User from "@/api/system/user";
import {
  ElForm,
  ElInput,
  ElFormItem,
  ElProgress,
  ElButton
} from "element-plus";
import { message } from "@/utils/message";
import { formRulesPwd, formRulesEmail } from "./rule";
import type { FormInstance } from "element-plus";
import type { DataInfo } from "@/utils/auth";
import { putUserInfo } from "@/utils/auth";
import type { PaginationProps } from "@pureadmin/table";
import type { LogProps } from "./types";

export function useUser() {
  const ruleFormRef = ref();
  const emailButton = ref(false);
  const emailButtonLoading = ref(false);
  // 重置的新密码
  const pwdForm = reactive({
    newPwd: "",
    oldPwd: "",
    newPwdCop: ""
  });
  const pwdProgress = [
    { color: "#e74242", text: "非常弱" },
    { color: "#EFBD47", text: "弱" },
    { color: "#ffa500", text: "一般" },
    { color: "#1bbf1b", text: "强" },
    { color: "#008000", text: "非常强" }
  ];
  const ruleEmailFormRef = ref();

  // 重置的新邮箱
  const emailForm = reactive({
    pwd: "",
    code: "",
    email: ""
  });
  // 当前密码强度（0-4）
  const curScore = ref();
  const form = reactive({
    // 左侧部门树的id
    deptId: "",
    username: "",
    createTime: "",
    phone: "",
    status: ""
  });
  /** 用户信息 */
  const userInfo = computed(() => {
    return storageLocal().getItem<DataInfo<Date>>("user-info")?.user;
  });
  /** 获取邮箱验证码 */
  const getEmailCode = email => {
    emailButtonLoading.value = true;
    setTimeout(() => {
      emailButtonLoading.value = false; // 60秒后恢复
    }, 60000);
    if (isNull(email)) {
      message("email必填", {
        type: "error"
      });
    } else if (!isEmail(email)) {
      message("email格式错误", {
        type: "error"
      });
    } else {
      User.resetEmail(email)
        .then(() => {
          message("验证码发送成功", {
            type: "success"
          });
        })
        .catch(error => {
          message(`${error}`, {
            type: "error"
          });
        });
    }
  };
  watch(
    pwdForm,
    ({ newPwd }) =>
      (curScore.value = isAllEmpty(newPwd) ? -1 : zxcvbn(newPwd).score)
  );
  /** 重置密码 */
  function handleReset() {
    addDialog({
      title: `重置 ${userInfo.value.nickName} 用户的密码`,
      width: "30%",
      draggable: true,
      closeOnClickModal: false,
      contentRenderer: () => (
        <>
          <ElForm
            ref={ruleFormRef}
            model={pwdForm}
            {...{ rules: formRulesPwd }}
          >
            <ElFormItem prop="oldPwd" label="请输入旧密码：">
              <ElInput
                clearable
                show-password
                type="password"
                v-model={pwdForm.oldPwd}
                placeholder="请输入旧密码"
              />
            </ElFormItem>
            <ElFormItem prop="newPwd" label="请输入新密码：">
              <ElInput
                clearable
                show-password
                type="password"
                v-model={pwdForm.newPwd}
                placeholder="请输入新密码"
              />
            </ElFormItem>
            <div class="mt-4 flex">
              {pwdProgress.map(({ color, text }, idx) => (
                <div
                  class="w-[19vw]"
                  style={{ marginLeft: idx !== 0 ? "4px" : 0 }}
                >
                  <ElProgress
                    striped
                    striped-flow
                    duration={curScore.value === idx ? 6 : 0}
                    percentage={curScore.value >= idx ? 100 : 0}
                    color={color}
                    stroke-width={10}
                    show-text={false}
                  />
                  <p
                    class="text-center"
                    style={{ color: curScore.value === idx ? color : "" }}
                  >
                    {text}
                  </p>
                </div>
              ))}
            </div>
            <ElFormItem prop="newPwdCop" label="请确认新密码：">
              <ElInput
                clearable
                show-password
                type="password"
                v-model={pwdForm.newPwdCop}
                placeholder="请确认新密码"
              />
            </ElFormItem>
          </ElForm>
        </>
      ),
      closeCallBack: () =>
        Object.assign(pwdForm, {
          newPwd: "",
          oldPwd: "",
          newPwdCop: ""
        }),
      beforeSure: done => {
        ruleFormRef.value.validate(valid => {
          if (valid) {
            if (pwdForm.newPwd !== pwdForm.newPwdCop) {
              message(`两次密码不想等`, {
                type: "error"
              });
            } else {
              // 表单规则校验通过
              message(`已成功修改 ${userInfo.value.nickName} 用户的密码`, {
                type: "success"
              });
              // 根据实际业务使用pwdForm.newPwd和row里的某些字段去调用重置用户密码接口即可
              done(); // 关闭弹框
            }
          }
        });
      }
    });
  }
  /** 更换邮箱 */
  function handleResetEmail() {
    addDialog({
      title: `更换 ${userInfo.value.nickName} 用户的邮箱`,
      width: "20%",
      draggable: true,
      closeOnClickModal: false,
      contentRenderer: () => (
        <>
          <ElForm
            ref={ruleEmailFormRef}
            model={emailForm}
            {...{ rules: formRulesEmail(emailButton) }}
          >
            <ElFormItem prop="email" label="新邮箱：">
              <ElInput
                clearable
                type="email"
                v-model={emailForm.email}
                placeholder="请输入邮箱"
              />
            </ElFormItem>
            <ElFormItem prop="code" label="验证码：">
              <ElInput
                clearable
                type="number"
                min={100000}
                max={999999}
                controls={false}
                v-model={emailForm.code}
                placeholder="请输入验证码"
                v-slots={{
                  append: () => (
                    <ElButton
                      onClick={() => getEmailCode(emailForm.email)}
                      loading={emailButtonLoading.value}
                      disabled={emailButton.value}
                    >
                      获取验证码
                    </ElButton>
                  )
                }}
              ></ElInput>
            </ElFormItem>
            <ElFormItem prop="pwd" label="当前密码：">
              <ElInput
                clearable
                show-password
                type="password"
                v-model={emailForm.pwd}
                placeholder="请输入当前密码"
              />
            </ElFormItem>
          </ElForm>
        </>
      ),
      closeCallBack: () =>
        Object.assign(emailForm, {
          pwd: "",
          code: "",
          email: ""
        }),
      beforeSure: done => {
        ruleEmailFormRef.value.validate(valid => {
          if (valid) {
            User.updateEmail({
              code: emailForm.code,
              pass: emailForm.pwd,
              email: emailForm.email
            })
              .then(() => {
                const info =
                  storageLocal().getItem<DataInfo<Date>>("user-info");
                info.user.email = emailForm.email;
                storageLocal().setItem("user-info", info);
                // 表单规则校验通过
                message(`已成功更换 ${userInfo.value?.nickName} 用户的邮箱`, {
                  type: "success"
                });
                // 根据实际业务使用pwdForm.newPwd和row里的某些字段去调用重置用户密码接口即可
                done(); // 关闭弹框
              })
              .catch(error => {
                message(`验证码错误：${error}`, {
                  type: "error"
                });
              });
          }
        });
      }
    });
  }
  //更新用户信息
  const submitEditUser = async (formEl: FormInstance | undefined, userI) => {
    if (!formEl) return;
    await formEl.validate(valid => {
      if (valid) {
        User.editUser(userI);
        putUserInfo(userI);
      }
    });
  };

  const columns: TableColumnList = [
    {
      label: "行为",
      prop: "description"
    },
    {
      label: "IP",
      prop: "requestIp"
    },
    {
      label: "IP来源",
      prop: "address"
    },
    {
      label: "浏览器",
      prop: "browser"
    },
    {
      label: "请求耗时",
      prop: "time",
      cellRenderer: scope => (
        <el-text
          type={
            scope.row.time <= 300
              ? "success"
              : scope.row.time > 1000
                ? "danger"
                : "warning"
          }
        >
          {scope.row.time}ms
        </el-text>
      )
    },
    {
      label: "创建日期",
      prop: "createTime"
    }
  ];

  const loading = ref(true);

  const dataList = ref();
  /** 分页配置 */
  const pagination = reactive<PaginationProps>({
    total: 0,
    pageSize: 10,
    pageSizes: [10, 20, 50],
    currentPage: 1,
    align: "left",
    background: true
  });

  function handleSizeChange(val: number) {
    pagination.pageSize = val;
    getLogs();
  }

  function handleCurrentChange(val: number) {
    pagination.currentPage = val;
    getLogs();
  }
  function getLogs() {
    User.getLog<LogProps>(pagination.currentPage - 1, pagination.pageSize)
      .then(res => {
        dataList.value = res.data.content;
        pagination.total = res.data.totalElements;
      })
      .finally(() => {
        loading.value = false;
      });
  }

  return {
    form,
    userInfo,
    pagination,
    columns,
    dataList,
    loading,
    handleReset,
    handleResetEmail,
    submitEditUser,
    handleSizeChange,
    handleCurrentChange,
    getLogs
  };
}
