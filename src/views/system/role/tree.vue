<script setup lang="ts">
import { ref, computed, watch, getCurrentInstance } from "vue";
import { ElTree } from "element-plus";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";

import Dept from "~icons/ri/git-branch-line";
// import Reset from "~icons/ri/restart-line";
import More2Fill from "~icons/ri/more-2-fill";
import OfficeBuilding from "~icons/ep/office-building";
import LocationCompany from "~icons/ep/add-location";
import Check from "~icons/ep/check";
import CheckListAll from "~icons/ep/circle-check-filled";
import CircleCheck from "~icons/ep/circle-check";
import SemiSelect from "~icons/ep/semi-select";
import ExpandIcon from "../user/svg/expand.svg?component";
import UnExpandIcon from "../user/svg/unexpand.svg?component";
import { TreeKey } from "element-plus/es/components/tree/src/tree.type.mjs";

interface Tree {
  id: number;
  label: string;
  name?: string;
  title?: string;
  highlight?: boolean;
  children?: Tree[];
}

const props = defineProps({
  treeLoading: Boolean,
  treeData: Array
});
const currentRow = defineModel<TreeKey[]>("currentRow");
const deptId = defineModel<Number>("deptId");

const emit = defineEmits(["tree-select"]);

const treeRef = ref<InstanceType<typeof ElTree>>();
const treeRef2 = ref();
const isExpand = ref(true);
const isSelectAll = ref(true);
const searchValue = ref("");
const highlightMap = ref({});
const { proxy } = getCurrentInstance();
const defaultProps = {
  children: "children",
  label: "label"
};
const buttonClass = computed(() => {
  return [
    "!h-[20px]",
    "reset-margin",
    "!text-gray-500",
    "dark:!text-white",
    "dark:hover:!text-primary"
  ];
});

const filterNode = (value: string, data: Tree) => {
  if (!value) return true;
  return data?.title.includes(value);
};

function toggleRowExpansionAll(status) {
  isExpand.value = status;
  const nodes = (proxy.$refs["treeRef"] as any).store._getAllNodes();
  for (let i = 0; i < nodes.length; i++) {
    nodes[i].expanded = status;
  }
}
/** 重置部门树状态（选中状态、搜索框值、树初始化） */
function onTreeReset(isa?: boolean) {
  isSelectAll.value = isa;
  toggleRowExpansionAll(!isa);
  if (!isa) {
    treeRef.value!.setCheckedKeys(currentRowList(props.treeData), false);
  } else {
    treeRef.value!.setCheckedKeys([], false);
  }
}
/** 重置部门树状态（选中状态、搜索框值、树初始化） */
function onTreeInvert() {
  const treeSelicts = treeRef.value!.getCheckedKeys(false);
  treeRef.value!.setCheckedKeys(
    currentRowList(props.treeData).filter(x => !treeSelicts.includes(x)),
    false
  );
}
const currentRowList = tree => {
  const ids: number[] = [];

  function traverse(node) {
    if (node.children || node.children === null) {
      node.children?.forEach(traverse);
    } else {
      ids.push(node.id);
    }
  }

  tree.forEach(traverse);

  return ids;
};
function handleNodeClick(data, node) {
  if (!node) {
    console.log(node);
  }
  return data?.name;
}

function testClick() {
  emit("tree-select", { id: deptId, menuIds: treeRef.value.getCheckedKeys() });
}

watch(searchValue, val => {
  treeRef.value!.filter(val);
});

defineExpose({ onTreeReset });
</script>

<template>
  <div
    v-loading="props.treeLoading"
    class="h-full bg-bg_color overflow-auto"
    :style="{ minHeight: `calc(100vh - 133px)` }"
  >
    <el-row :gutter="20">
      <el-col :span="17"> 菜单分配</el-col>
      <el-col :span="3">
        <el-button
          type="primary"
          :icon="useRenderIcon(Check)"
          size="small"
          @click="testClick"
          >保存</el-button
        >
      </el-col>
    </el-row>
    <div class="flex items-center h-[34px]">
      <el-input
        v-model="searchValue"
        class="ml-2"
        size="small"
        placeholder="请输入部门名称"
        clearable
      >
        <template #suffix>
          <el-icon v-show="searchValue.length === 0" class="el-input__icon">
            <IconifyIconOffline icon="search" />
          </el-icon>
        </template>
      </el-input>
      <el-dropdown :hide-on-click="false">
        <IconifyIconOffline
          class="w-[28px] cursor-pointer"
          width="18px"
          :icon="More2Fill"
        />
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item>
              <el-button
                :class="buttonClass"
                link
                type="primary"
                :icon="useRenderIcon(isExpand ? ExpandIcon : UnExpandIcon)"
                @click="toggleRowExpansionAll(isExpand ? false : true)"
              >
                {{ isExpand ? "折叠全部" : "展开全部" }}
              </el-button>
            </el-dropdown-item>
            <el-dropdown-item>
              <el-button
                :class="buttonClass"
                link
                type="primary"
                :icon="useRenderIcon(isSelectAll ? CheckListAll : CircleCheck)"
                @click="onTreeReset(isSelectAll ? false : true)"
              >
                {{ isSelectAll ? "全选" : "全不选" }}
              </el-button>
            </el-dropdown-item>
            <el-dropdown-item>
              <el-button
                :class="buttonClass"
                link
                type="primary"
                :icon="useRenderIcon(SemiSelect)"
                @click="onTreeInvert"
              >
                反选
              </el-button>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
    <el-divider />
    <el-tree
      ref="treeRef"
      node-key="id"
      size="small"
      show-checkbox
      :data="treeData"
      :props="defaultProps"
      :default-checked-keys="currentRow"
      :current-node-key="treeRef2"
      :expand-on-click-node="false"
      :filter-node-method="filterNode"
    >
      <template #default="{ node, data }">
        <span
          :class="[
            'pl-1',
            'pr-1',
            'rounded',
            'flex',
            'items-center',
            'select-none',
            'hover:text-primary',
            searchValue.trim().length > 0 &&
              node.title?.includes(searchValue) &&
              'text-red-500',
            highlightMap[node.id]?.highlight ? 'dark:text-primary' : ''
          ]"
          :style="{
            color: highlightMap[node.id]?.highlight
              ? 'var(--el-color-primary)'
              : '',
            background: highlightMap[node.id]?.highlight
              ? 'var(--el-color-primary-light-7)'
              : 'transparent'
          }"
        >
          <IconifyIconOffline
            :icon="
              data.type === 1
                ? OfficeBuilding
                : data.type === 2
                  ? LocationCompany
                  : Dept
            "
          />
          {{ handleNodeClick(data, node) }}
        </span>
      </template>
    </el-tree>
  </div>
</template>

<style lang="scss" scoped>
:deep(.el-divider) {
  margin: 0;
}

:deep(.el-tree) {
  --el-tree-node-hover-bg-color: transparent;
}
</style>
