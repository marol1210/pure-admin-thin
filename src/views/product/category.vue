<script setup lang="ts">
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { ref, computed, watch, getCurrentInstance,reactive } from "vue";
import { http } from "@/utils/http";
import Dept from "@iconify-icons/ri/git-branch-line";
// import Reset from "@iconify-icons/ri/restart-line";
import Search from "@iconify-icons/ep/search";
import More2Fill from "@iconify-icons/ri/more-2-fill";
import OfficeBuilding from "@iconify-icons/ep/office-building";
import LocationCompany from "@iconify-icons/ep/add-location";
interface Tree {
  id: number;
  name: string;
  highlight?: boolean;
  children?: Tree[];
}

const props = defineProps({
  treeLoading: Boolean,
  treeData: Array
});

function addNode(){
  tree_node.show = false
  if(! tree_node.name){
    return
  }
  http.post(
    '/api/pc',
    {data:{'pid':tree_node.current_idx,name:tree_node.name}}
  )
  .then((res)=>{
    if(res.msg=='ok'){
      http.request("get","/api/pc").then((res)=>{
        props.treeData.value = res.data
      })
    }
  })
  tree_node.name = undefined
}

let tree_node = reactive({
  name:undefined,
  show:false,
  current_idx:0
})

const emit = defineEmits(["tree-select"]);
const treeRef = ref();
const isExpand = ref(true);
const searchValue = ref("");
const highlightMap = ref({});
const { proxy } = getCurrentInstance();
const defaultProps = {
  children: "children",
  label: "name"
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
  return data.name.includes(value);
};

function nodeClick(value) {
  const nodeId = value.$treeNodeId;
  highlightMap.value[nodeId] = highlightMap.value[nodeId]?.highlight
    ? Object.assign({ id: nodeId }, highlightMap.value[nodeId], {
      highlight: false
    })
    : Object.assign({ id: nodeId }, highlightMap.value[nodeId], {
      highlight: true
    });
  Object.values(highlightMap.value).forEach((v: Tree) => {
    if (v.id !== nodeId) {
      v.highlight = false;
    }
  });
  emit(
    "tree-select",
    highlightMap.value[nodeId]?.highlight
      ? Object.assign({ ...value, selected: true })
      : Object.assign({ ...value, selected: false })
  );
}

function toggleRowExpansionAll(status) {
  isExpand.value = status;
  const nodes = (proxy.$refs["treeRef"] as any).store._getAllNodes();
  for (let i = 0; i < nodes.length; i++) {
    nodes[i].expanded = status;
  }
}

/** 重置部门树状态（选中状态、搜索框值、树初始化） */
function onTreeReset() {
  highlightMap.value = {};
  searchValue.value = "";
  toggleRowExpansionAll(true);
}

watch(searchValue, val => {
  treeRef.value!.filter(val);
});

defineExpose({ onTreeReset });
</script>

<template>
  <div
    v-loading="props.treeLoading"
    class="h-full bg-bg_color overflow-auto relative"
    :style="{ minHeight: `calc(100vh - 133px)` }"
  >
    <div class="flex items-center h-[34px]">
      <el-input
        v-model="searchValue"
        class="ml-2"
        size="small"
        placeholder="请输入分类名称"
        clearable
      >
        <template #suffix>
          <el-icon class="el-input__icon">
            <IconifyIconOffline
              v-show="searchValue.length === 0"
              :icon="Search"
            />
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
            <!-- <el-dropdown-item>
              <el-button
                :class="buttonClass"
                link
                type="primary"
                :icon="useRenderIcon(Reset)"
                @click="onTreeReset"
              >
                重置状态
              </el-button>
            </el-dropdown-item> -->
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
    <div class="!h-full bg-gray-700 !w-full opacity-90 absolute z-50" v-if="tree_node.show">
      <div class="flex flex-col opacity-100 p-2">
        <input class="mt-20 p-1 !border" v-model="tree_node.name"/>
        <div class="mt-2 flex justify-center">
          <el-button class="!bg-blue-600 !text-white" @click="addNode">确定</el-button>
          <el-button class="!bg-blue-600 !text-white" @click="tree_node.show=!tree_node.show">取消</el-button>
        </div>

      </div>
    </div>
    <el-divider class="!my-3 !w-full"/>
    <el-button class="w-full !bg-blue-600 !text-white mb-3" @click="tree_node.show=true">添加</el-button>
    <el-tree
      ref="treeRef"
      :data="props.treeData"
      node-key="id"
      size="small"
      :props="defaultProps"
      default-expand-all
      :expand-on-click-node="false"
      :filter-node-method="filterNode"
      @node-click="nodeClick"
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
              node.label.includes(searchValue) &&
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
          {{ node.label }}
        </span>
        <el-button @click.stop="" class="!flex add_node_btn !hidden !h-full absolute right-3">+</el-button>
      </template>
    </el-tree>
  </div>
</template>

<style>
.el-tree-node__content,.el-tree-node__children{
  position: relative;
}
.el-tree-node__content:hover > .add_node_btn, .el-tree-node__children:hover > .add_node_btn{
  display: flex !important;
}
</style>
