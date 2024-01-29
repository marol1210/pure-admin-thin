<script setup lang="ts">
import { ref, onMounted } from "vue";
import { http } from "@/utils/http";
import category from './category.vue'

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
<template>
  <div class="flex justify-between">
    <category class="flex-none overflow-hidden mr-2" :treeData="treeData"></category>
    <el-table :data="dataList" highlight-current-row>
      <el-table-column type="expand">
        <template #default="props">
          <el-form label-position="left" inline class="demo-table-expand">
            <el-form-item label="创建人">
              <span>{{ props.row['creater_id'] }}</span>
            </el-form-item>
          </el-form>
        </template>
      </el-table-column>

      <el-table-column
        :prop="column['prop']" v-for="(column,idx) in columns" :key="idx"
        :label="column['label']"
      >
        <template #default="scope" v-if="column['label'] == '更新时间'">
          <el-tag
            :type="scope.row['updated_at'] ? 'primary' : 'success'"
            disable-transitions>{{scope.row['updated_at']}}</el-tag>
        </template>

        <template #default="scope" v-else-if="column['prop'] == 'category'">
          <el-tag class="mr-1" type="info" v-for="(c,i) in scope.row['category']" :key=" 'c_'+i ">{{c['name']}}</el-tag>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
