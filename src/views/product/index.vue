<script setup lang="ts">
import { PureTable } from "@pureadmin/table";
import { ref, onMounted } from "vue";
import { http } from "@/utils/http";
import {productCategoryTree} from '@/laravel.ts'
let dataList = ref([])
let columns = ref([])
let treeData = ref([])

onMounted(() => {
  http.request("get","/api/product").then((res)=>{
    dataList.value = res.data.list
    columns.value = res.data.columns
  })

  http.request("get","/api/pc").then((res)=>{
    treeData.value = res.data
  })
})
</script>

<script lang="ts">
import category from './category.vue'
</script>

<template>
  <div class="flex space-x-2">
    <category class="flex-none overflow-hidden" :treeData="treeData"></category>
    <pure-table :data="dataList" stripe  :columns="columns" ></pure-table>
  </div>
</template>
