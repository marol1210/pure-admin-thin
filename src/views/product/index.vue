<script setup lang="ts">
import { ref, onMounted,reactive } from "vue";
import { http } from "@/utils/http";
import category from './category.vue'
import ProductDetail from './components/ProductDetail.vue'

let dataList = ref([])
let columns = ref([])
let treeData = ref([])

const table = ref()
let pagination = reactive({
  total: 0,
  pageSize: 10,
  currentPage: 1,
  background: true
});

onMounted(() => {
  http.request("get","/api/product",{"params": {"pageSize":pagination.pageSize} }).then((res)=>{
    dataList.value = res.data.list
    columns.value = res.data.columns
    pagination = reactive( res.data.paginator )
  })

  http.request("get","/api/pc").then((res)=>{
    treeData.value = res.data
  })
})

function handlerPageChange(page:number){
  http.request("get","/api/product", {"params": {"page": page,"pageSize":pagination.pageSize} }).then((res)=>{
    pagination.currentPage=page
    dataList.value = res.data.list
    columns.value = res.data.columns
  })
}

function handlerSizeChange(pageSize:number){
  pagination.pageSize = pageSize
  http.request("get","/api/product", {"params": {"pageSize":pagination.pageSize} }).then((res)=>{
    dataList.value = res.data.list
    columns.value = res.data.columns
  })
}
</script>
<template>
  <div class="flex justify-between">
    <category class="flex-none overflow-hidden mr-2" :treeData="treeData"></category>
    <el-table
        ref="table"
        :data="dataList"
        @row-dblclick="function(row, column, event){
            table.toggleRowExpansion(row)
            table.toggleRowSelection(row,true)
        }"
        highlight-current-row>

      <el-table-column type="expand">
        <template #default="props">
          <ProductDetail :row="props.row"/>
        </template>
      </el-table-column>

      <el-table-column
        :prop="column['prop']" v-for="(column,idx) in columns" :key="idx"
        :label="column['label']"
      >
        <template #default="scope" v-if="column['prop'] == 'updated_at'">
          <el-tag
            :type="scope.row['updated_at'] ? 'primary' : 'success'"
            disable-transitions>{{scope.row['updated_at']}}</el-tag>
        </template>

        <template #default="scope" v-else-if="column['prop'] == 'category'">
          <el-tag class="mr-1" type="info" v-for="(c,i) in scope.row['category']" :key=" 'c_'+i ">{{c['name']}}</el-tag>
        </template>
      </el-table-column>

      <template #append="scope">
        <div class="flex m-1 justify-end">
          <el-pagination default-page-size="2" small="true"
               :total="pagination.total"
               :page-sizes="[2,3,10, 20, 50, 100]"
               layout="total, sizes, prev, pager, next"
               @current-change="handlerPageChange"
               @size-change="handlerSizeChange"
          />
        </div>
      </template>
    </el-table>
  </div>
</template>

<style>
table tr:hover {
  cursor: pointer;
}
</style>
