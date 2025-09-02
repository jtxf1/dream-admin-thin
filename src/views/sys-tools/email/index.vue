<script setup lang="ts">
import { useDept } from "./utils/hook";
import Form from "./form.vue";
import Send from "./send.vue";

import Setting from "~icons/ep/setting";
import Mail from "~icons/ri/mail-send-line";
import Fill from "~icons/ri/information-fill";

defineOptions({
  // 定义组件的名称
  name: "Email"
});
const { formData, loading } = useDept();
</script>

<template>
  <div class="main">
    <el-tabs type="border-card" class="demo-tabs">
      <el-tab-pane>
        <template #label>
          <span class="custom-tabs-label">
            <span>
              <el-icon> <IconifyIconOffline :icon="Setting" /> </el-icon
              >邮件配置</span
            >
          </span>
        </template>
        <Form v-if="!loading" :formInline="formData" />
      </el-tab-pane>
      <el-tab-pane>
        <template #label>
          <span class="custom-tabs-label">
            <span>
              <el-icon> <IconifyIconOffline :icon="Mail" /> </el-icon
              >发送邮件</span
            >
          </span>
        </template>
        <Send :formInline="formData" />
      </el-tab-pane>
      <el-tab-pane>
        <template #label>
          <span class="custom-tabs-label">
            <span>
              <el-icon> <IconifyIconOffline :icon="Fill" /> </el-icon
              >使用说明</span
            >
          </span>
        </template>
        <el-space direction="vertical">
          <el-card class="box-card" style="width: 50ch">
            <template #header>
              <div class="card-header">
                <span>
                  <el-icon> <IconifyIconOffline :icon="Fill" /> </el-icon
                  >使用说明</span
                >
              </div>
            </template>
            <div class="text item">
              # 邮件服务器的SMTP地址，可选，默认为smtp <br />#
              邮件服务器的SMTP端口，可选，默认465或者25 <br />#
              发件人（必须正确，否则发送失败） <br />#
              用户名，默认为发件人邮箱前缀 <br />#
              密码（注意，某些邮箱需要为SMTP服务单独设置密码，如QQ和163等等）
              <br /># 是否开启ssl，默认开启
            </div>
          </el-card>
          <el-card class="box-card" style="width: 50ch">
            <template #header>
              <div class="card-header">
                <span>更多帮助</span>
              </div>
            </template>
            <div class="text item">
              更多帮助请查看文档：<el-link
                type="primary"
                href="http://hutool.mydoc.io/#text_319499"
                target="_blank"
                >hutool工具包</el-link
              >
            </div>
          </el-card>
        </el-space>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<style lang="scss" scoped>
.demo-tabs > .el-tabs__content {
  padding: 32px;
  font-size: 32px;
  font-weight: 600;
  color: #6b778c;
}

.demo-tabs .custom-tabs-label .el-icon {
  vertical-align: middle;
}

.demo-tabs .custom-tabs-label span {
  margin-left: 4px;
  vertical-align: middle;
}
</style>
