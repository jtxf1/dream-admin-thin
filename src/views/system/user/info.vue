<script setup lang="ts">
import { ref, reactive } from "vue";
import type { TabsPaneContext } from "element-plus";
import { useUser } from "./utils/info";
import type { FormInstance } from "element-plus";
import { isPhone, deviceDetection } from "@pureadmin/utils";
import ReCropperPreview from "@/components/ReCropperPreview";
import { baseUrlAvatar } from "@/api/utils";
import * as Img from "@/api/tools/img";
import * as User from "@/api/system/user";
import { message } from "@/utils/message";
import { storageLocal } from "@pureadmin/utils";
import type { DataInfo } from "@/utils/auth";

import Check from "~icons/ep/avatar";
import SignIn from "~icons/ri/login-box-line";
import NodeTree from "~icons/ri/node-tree";
import Phone from "~icons/ep/iphone";
import Mail from "~icons/ri/mail-fill";
import Secure from "~icons/ri/secure-payment-fill";

const activeName = ref("first");
const cropRef = ref();
const uploadRef = ref();
const imgSrc = ref("");
const isShow = ref(false);
const cropperBlob = ref();
const handleClick = (tab: TabsPaneContext, event: Event) => {
  if (tab.paneName === "second") {
    getLogs();
  }
};
const ruleFormRef = ref<FormInstance>();
const {
  userInfo,
  pagination,
  columns,
  loading,
  dataList,
  handleReset,
  handleResetEmail,
  submitEditUser,
  handleSizeChange,
  handleCurrentChange,
  getLogs
} = useUser();

const user = reactive(userInfo.value);
defineOptions({
  name: "UserInfo"
});

const imgSrcHead = ref(user.avatarPath);
const onChange = uploadFile => {
  const reader = new FileReader();
  reader.onload = e => {
    imgSrc.value = e.target.result as string;
    isShow.value = true;
  };
  reader.readAsDataURL(uploadFile.raw);
};
const onCropper = ({ blob }) => (cropperBlob.value = blob);
const handleClose = () => {
  cropRef.value.hidePopover();
  uploadRef.value.clearFiles();
  isShow.value = false;
};
const handleSubmitImage = () => {
  var fd = new FormData();
  fd.append("file", cropperBlob.value, "test.png");
  Img.uploadPost(fd).then(data => {
    if (data) {
      User.updateAvatarByid({
        id: user.id,
        avatar: data?.data?.links?.url,
        key: data?.data?.key
      })
        .then(data1 => {
          if (data1) {
            message("更新头像成功", { type: "success" });
            const info = storageLocal().getItem<DataInfo<Date>>("user-info");
            // 假设 data 的类型是 { data: { avatarName: string } }
            const result = data1 as {
              data: { avatarName: string; avatar: string };
            };
            info.user.avatarName = result?.data?.avatarName;
            info.user.avatarPath = result?.data?.avatar;
            imgSrcHead.value = baseUrlAvatar(result?.data?.avatar);
            storageLocal().setItem("user-info", info);

            handleClose();
          } else {
            message("更新头像失败");
          }
        })
        .catch(error => {
          message(`提交异常 ${error}`, { type: "error" });
        });
    }
  });
};
</script>

<template>
  <div class="justify-between">
    <el-row :gutter="30">
      <el-col :xs="8" :sm="6" :md="4" :lg="6" :xl="5">
        <div class="grid-content">
          <el-card class="box-card">
            <template #header>
              <div class="card-header">
                <span>个人信息</span>
              </div>
            </template>
            <div class="el-upload">
              <el-upload
                ref="uploadRef"
                accept="image/*"
                action="#"
                :limit="1"
                :auto-upload="false"
                :show-file-list="false"
                :on-change="onChange"
              >
                <el-avatar :size="80" :src="imgSrcHead">
                  <img :src="imgSrcHead" />
                </el-avatar>
              </el-upload>
            </div>

            <ul class="user-info">
              <li>
                <div style="height: 100%">
                  <IconifyIconOffline class="check-zh" :icon="SignIn" />
                  登录账号
                  <div class="user-right">{{ userInfo.username }}</div>
                </div>
              </li>
              <li>
                <IconifyIconOffline class="check-zh" :icon="Check" />
                用户昵称
                <div class="user-right">{{ userInfo.nickName }}</div>
              </li>
              <li>
                <IconifyIconOffline class="check-zh" :icon="NodeTree" />
                所属部门
                <div class="user-right">{{ userInfo.dept.name }}</div>
              </li>
              <li>
                <IconifyIconOffline class="check-zh" :icon="Phone" />
                手机号码
                <div class="user-right">{{ userInfo.phone }}</div>
              </li>
              <li>
                <IconifyIconOffline class="check-zh" :icon="Mail" />
                用户邮箱
                <div class="user-right">{{ userInfo.email }}</div>
              </li>
              <li>
                <IconifyIconOffline class="check-zh" :icon="Secure" />
                安全设置
                <div class="user-right">
                  <a @click="handleReset">修改密码 </a>

                  <a @click="handleResetEmail"> 修改邮箱</a>
                </div>
              </li>
            </ul>
          </el-card>
        </div>
      </el-col>
      <el-col :xs="8" :sm="6" :md="8" :lg="18" :xl="11"
        ><div class="grid-content">
          <el-tabs
            v-model="activeName"
            class="demo-tabs grid-content"
            @tab-click="handleClick"
          >
            <el-tab-pane label="用户资料" name="first">
              <el-form
                ref="ruleFormRef"
                :model="user"
                style="margin-top: 10px"
                size="small"
                label-width="65px"
              >
                <el-form-item
                  label="昵称"
                  prop="nickName"
                  :rules="[
                    {
                      required: true,
                      message: '昵称为必填项',
                      trigger: 'blur'
                    },
                    {
                      min: 3,
                      max: 12,
                      message: 'Length should be 4 to 12',
                      trigger: 'blur'
                    }
                  ]"
                >
                  <el-input
                    v-model="user.nickName"
                    clearable
                    style="width: 35%"
                  />
                  <span style="margin-left: 10px; color: #e6a23c"
                    >⚠️用户昵称不作为登录使用</span
                  >
                </el-form-item>
                <el-form-item
                  label="手机号"
                  prop="phone"
                  :rules="[
                    {
                      required: true,
                      message: '手机号为必填项',
                      trigger: 'blur'
                    },
                    {
                      required: true,
                      validator: (rule, value, callback) => {
                        if (value === '') {
                          callback(new Error('手机号为必填项'));
                        } else if (!isPhone(value)) {
                          callback(new Error('请输入正确的手机号码格式'));
                        } else {
                          callback();
                        }
                      },
                      trigger: 'blur'
                    }
                  ]"
                >
                  <el-input v-model="user.phone" clearable style="width: 35%" />
                  <span style="margin-left: 10px; color: #e6a23c"
                    >⚠️手机号码不能重复</span
                  >
                </el-form-item>
                <el-form-item label="性别" prop="gender">
                  <el-radio-group v-model="user.gender" style="width: 178px">
                    <el-radio label="男" value="男">男</el-radio>
                    <el-radio label="女" value="女">女</el-radio>
                  </el-radio-group>
                </el-form-item>
                <el-form-item>
                  <el-button
                    type="primary"
                    @click="submitEditUser(ruleFormRef, user)"
                    >保存配置</el-button
                  >
                </el-form-item>
              </el-form>
            </el-tab-pane>
            <el-tab-pane label="操作日志" name="second">
              <pure-table
                ref="tableRef"
                adaptive
                :loading="loading"
                :data="dataList"
                :columns="columns"
                height="80%"
                style="height: 80%"
                :pagination="pagination"
                @page-size-change="handleSizeChange"
                @page-current-change="handleCurrentChange"
              />
            </el-tab-pane>
          </el-tabs></div
      ></el-col>
    </el-row>
    <el-dialog
      v-model="isShow"
      width="40%"
      title="编辑头像"
      destroy-on-close
      :closeOnClickModal="false"
      :before-close="handleClose"
      :fullscreen="deviceDetection()"
    >
      <ReCropperPreview ref="cropRef" :imgSrc="imgSrc" @cropper="onCropper" />
      <template #footer>
        <div class="dialog-footer">
          <el-button bg text @click="handleClose">取消</el-button>
          <el-button bg text type="primary" @click="handleSubmitImage">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style>
.el-col {
  border-radius: 4px;
}

.grid-content {
  min-height: 36px;
  border-radius: 4px;
}

.demo-tabs > .el-tabs__content {
  padding: 32px;
  font-size: 32px;
  font-weight: 600;
  color: #6b778c;
}

.el-upload {
  display: inline-block;
  width: 100%;
  text-align: center;
  cursor: pointer;
  outline: none;
}

.user-info {
  padding-left: 0;
  list-style: none;

  li {
    padding: 11px 0;
    font-size: 13px;
    border-bottom: 1px solid #f0f3f4;
  }

  .user-right {
    float: right;

    a {
      color: #317ef3;
    }
  }
}

.check-zh {
  display: unset;
}
</style>
