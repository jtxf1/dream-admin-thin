<script setup lang="ts">
import { ref } from "vue";
import { SearchFormProps, SearchFormEmits } from "./types";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import Search from "~icons/ep/search";
import Refresh from "~icons/ep/refresh";
import datePicker from "@/views/components/date-picker.vue";

const props = withDefaults(defineProps<SearchFormProps>(), {
  loading: false,
  inline: true
});

const emit = defineEmits<SearchFormEmits>();

const formRef = ref();

const handleSearch = () => {
  emit("search");
};

const handleReset = () => {
  if (formRef.value) {
    formRef.value.resetFields();
  }
  emit("reset");
};
</script>

<template>
  <el-form
    ref="formRef"
    :inline="inline"
    :model="model"
    class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px]"
  >
    <el-form-item
      v-for="field in fields"
      :key="field.prop"
      :label="field.label"
      :prop="field.prop"
    >
      <el-input
        v-if="field.type === 'input'"
        v-model="model[field.prop]"
        :placeholder="field.placeholder"
        :clearable="field.clearable"
        :class="field.width ? `!w-[${field.width}]` : ''"
      />
      <el-select
        v-else-if="field.type === 'select'"
        v-model="model[field.prop]"
        :placeholder="field.placeholder"
        :clearable="field.clearable"
        :class="field.width ? `!w-[${field.width}]` : ''"
      >
        <el-option
          v-for="option in field.options"
          :key="option.value"
          :label="option.label"
          :value="option.value"
        />
      </el-select>
      <datePicker
        v-else-if="field.type === 'date' || field.type === 'daterange'"
        v-model="model[field.prop]"
      />
    </el-form-item>
    <el-form-item>
      <el-button
        type="primary"
        :icon="useRenderIcon(Search)"
        :loading="loading"
        @click="handleSearch"
      >
        搜索
      </el-button>
      <el-button :icon="useRenderIcon(Refresh)" @click="handleReset">
        重置
      </el-button>
    </el-form-item>
  </el-form>
</template>

<style scoped lang="scss">
/* 使用Tailwind工具类替代原有样式 */

/* .search-form 已通过class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px]"实现 */
</style>
