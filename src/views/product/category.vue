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
import {message} from "@/utils/message";


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

let del_node = ref(false)

function addNode(){
  tree_node.show = false
  if(! tree_node.name){
    return
  }
  http.post(
    '/api/pc',
    {data:{'pid':tree_node.current_node.data.id,name:tree_node.name}}
  ).then((res)=>{
    const newChild = { id: res.data.id, name: res.data.name, children: [] };
    if(!tree_node.current_node.data.children){
      tree_node.current_node.data.children = []
    }
    tree_node.current_node.data.children.push(newChild)
  })
  .catch((res)=>{
    alert('添加失败.')
  })
  tree_node.name = undefined
}

function delNodeConfirm(){
  del_node.value=true
  for(let e of document.getElementsByClassName('data-node')){
    e.classList.add('!hidden')
  }
  document.getElementById(tree_node.current_node.data.id).classList.toggle("!hidden")
}

function delNode(){
  http.request('delete',
    '/api/pc/'+tree_node.current_node.data.id
  ).then((res)=>{
    cancelDelNode()
    if(res.errcode == 0){
      message('删除成功.',{type:'success'})

      const parent = tree_node.current_node.parent;
      const children = parent.data.children || parent.data;
      const index = children.findIndex(d => d.id === tree_node.current_node.data.id);
      children.splice(index, 1);
    }else{
      message('删除失败.',{type:'error'})
    }
  })
  .catch((res)=>{
    alert('添加失败.')
  })
}

function cancelDelNode(){
  for(let e of document.getElementsByClassName('data-node')){
    e.classList.add('!hidden')
  }
}

let tree_node = reactive({
  name:undefined,
  show:false,
  current_node:null
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
        <span class="flex w-full justify-between items-center group">
          <span>{{ node.label }}</span>
          <span class="!hidden group-hover:!block mr-1">
            <button
              class="!text-gray-800 mr-2 bg-transparent font-bold text-base"
              v-if="node.level<3"
              @click="() => {tree_node.show=!tree_node.show;tree_node.current_node=node}">
              +
            </button>
            <button
              class="!text-gray-800 bg-transparent font-bold text-base"
              @click="() => {tree_node.current_node=node ; delNodeConfirm() }">
              -
            </button>
          </span>

          <div class="absolute left-0 flex justify-center w-full !hidden data-node bg-red-800" :id="node.data.id">
            <button class="flex-1 border-0 !text-white !bg-gray-800 p-1" @click="cancelDelNode">取消</button>
            <button class="flex-1 border-0 !bg-transparent !text-white p-1" @click="delNode">删除</button>
          </div>
        </span>
      </template>
    </el-tree>
  </div>
</template>
