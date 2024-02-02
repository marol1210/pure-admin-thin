<script setup lang="ts">
import {onMounted, reactive, ref} from "vue";
import {http} from "@/utils/http";
import * as laravel from "@/laravel";
defineOptions({
  name: "SystemUser"
});

const userApi: laravel.Api = {
  url: "/api/user"
}

const dataList = ref([]);
const DialogConfirm = ref(false);
const table = ref()
const loading = ref(false);
let columns = ref([]);

let pagination = reactive({
  total: 0,
  pageSize: 10,
  currentPage: 1,
  background: true
});

onMounted(() => {
  http.request("get",userApi.url,{"params": {"pageSize":pagination.pageSize} }).then((res)=>{
    dataList.value = res.data.list
    columns.value = res.data.columns
    pagination = reactive( res.data.paginator )
  })
})

</script>

<template>
  <div class="main">
    <el-table
      ref="table"
      :data="dataList"
      highlight-current-row
    >
      <el-table-column
        :prop="column['prop']" v-for="(column,idx) in columns"
        :key="idx"
        :label="column['label']">
        <template #default="scope" v-if="column['prop'] == 'is_active'">
          <el-switch width="60" inline-prompt v-model="scope.row.is_active" active-text="激活" inactive-text="禁用"

                     :loading="scope.row.activing == true"
                     :before-change="handleActive(scope.row)"
          />
        </template>
      </el-table-column>

      <el-table-column fixed="right" label="操作">
        <template #default="{row}">
          <el-button type="primary" :icon="useRenderIcon('ep-edit')"  circle  size="small" @click="openDialog('修改', row)"/>
        </template>
      </el-table-column>

      <template #append="scope">
        <div class="flex m-1 justify-end">
          <el-pagination :small="true"
                         :total="pagination.total"
                         :page-sizes="[10, 20, 50, 100]"
                         layout="total, sizes, prev, pager, next"
                         @current-change="handlerPageChange"
                         @size-change="handlerSizeChange"
          />
        </div>
      </template>
    </el-table>
  </div>
</template>
