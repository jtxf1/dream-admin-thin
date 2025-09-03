<script setup lang="ts">
import { ref } from "vue";
import ReCol from "@/components/ReCol";
import { formRules } from "./utils/rule";
import { FormProps } from "./utils/types";
import { getPickerShortcuts } from "@/views/monitor/utils";
const props = withDefaults(defineProps<FormProps>(), {
  formInline: () => ({
    bucketName: "",
    ownerName: "",
    ownerId: "",
    createBy: ""
  })
});

const ruleFormRef = ref();
const newFormInline = ref(props.formInline);

function getRef() {
  return ruleFormRef.value;
}
defineExpose({ getRef });
</script>

<template>
  <el-form
    ref="ruleFormRef"
    :model="newFormInline"
    :rules="formRules"
    label-width="82px"
  >
    <el-row :gutter="30">
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="存储桶名称" prop="bucketName">
          <el-input
            v-model="newFormInline.bucketName"
            clearable
            placeholder="请输入存储桶名称"
          />
        </el-form-item>
      </re-col>
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="作者名称" prop="ownerName">
          <el-input
            v-model="newFormInline.ownerName"
            clearable
            placeholder="请输入作者名称"
          />
        </el-form-item>
      </re-col>
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="作者id" prop="ownerId">
          <el-input
            v-model="newFormInline.ownerId"
            clearable
            placeholder="请输入作者id"
          />
        </el-form-item>
      </re-col>
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="创建人" prop="createBy">
          <el-radio-group v-model="newFormInline.createBy">
            <el-radio value="true" size="large">是</el-radio>
            <el-radio value="false" size="large">否</el-radio>
          </el-radio-group>
        </el-form-item>
      </re-col>
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="创建时间" prop="createTime">
          <el-date-picker
            v-model="newFormInline.createTime"
            type="date"
            class="!w-[160px]"
            placeholder="请选择创建时间"
            :shortcuts="getPickerShortcuts()"
            :popper-options="{
              placement: 'bottom-start'
            }"
          />
        </el-form-item>
      </re-col>
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="更新人" prop="updateBy">
          <el-input
            v-model="newFormInline.updateBy"
            clearable
            placeholder="请输入更新人"
          />
        </el-form-item>
      </re-col>
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="更新时间" prop="updateTime">
          <el-date-picker
            v-model="newFormInline.updateTime"
            type="date"
            class="!w-[160px]"
            placeholder="请选择更新时间"
            :shortcuts="getPickerShortcuts()"
            :popper-options="{
              placement: 'bottom-start'
            }"
          />
        </el-form-item>
      </re-col>
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="删除状态" prop="deleted">
          <el-input
            v-model="newFormInline.deleted"
            clearable
            placeholder="请输入删除状态"
          />
        </el-form-item>
      </re-col>
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="乐观锁" prop="version">
          <el-input
            v-model="newFormInline.version"
            clearable
            placeholder="请输入乐观锁"
          />
        </el-form-item>
      </re-col>
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="存储桶创建时间" prop="creationDate">
          <el-date-picker
            v-model="newFormInline.creationDate"
            type="date"
            class="!w-[160px]"
            placeholder="请选择存储桶创建时间"
            :shortcuts="getPickerShortcuts()"
            :popper-options="{
              placement: 'bottom-start'
            }"
          />
        </el-form-item>
      </re-col>
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="存储桶位置" prop="location">
          <el-input
            v-model="newFormInline.location"
            clearable
            placeholder="请输入存储桶位置"
          />
        </el-form-item>
      </re-col>
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="存储桶类型" prop="bucketType">
          <el-input
            v-model="newFormInline.bucketType"
            clearable
            placeholder="请输入存储桶类型"
          />
        </el-form-item>
      </re-col>
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="内部设置的类型" prop="type">
          <el-input
            v-model="newFormInline.type"
            clearable
            placeholder="请输入内部设置的类型"
          />
        </el-form-item>
      </re-col>
    </el-row>
  </el-form>
</template>
