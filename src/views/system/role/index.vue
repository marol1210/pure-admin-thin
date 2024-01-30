<script setup lang="ts">
import { reactive, ref, onMounted, h, toRaw } from "vue";
import Delete from "@iconify-icons/ep/delete";
import EditPen from "@iconify-icons/ep/edit-pen";
import Refresh from "@iconify-icons/ep/refresh";
import Menu from "@iconify-icons/ep/menu";
import AddFill from "@iconify-icons/ri/add-circle-line";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { addDialog } from "@/components/ReDialog";
import editForm from "./form.vue";
import * as laravel from "@/laravel";
import { message } from "@/utils/message"

import { http } from "@/utils/http";

const roleApi: laravel.Api = {
  url: "/api/role"
}

defineOptions({
  name: "SystemRole"
});

/**
 * 表单引用
 */
const formRef = ref();
const form = reactive({
  name: "",
  code: "",
  status: ""
});

const dataList = ref([]);
const table = ref()
const loading = ref(true);
const switchLoadMap = ref({});
let columns = ref([])

let pagination = reactive({
  total: 0,
  pageSize: 10,
  currentPage: 1,
  background: true
});

onMounted(() => {
  http.request("get",roleApi.url,{"params": {"pageSize":pagination.pageSize} }).then((res)=>{
    dataList.value = res.data.list
    columns.value = res.data.columns
    pagination = reactive( res.data.paginator )
  })
})

function handlerPageChange(page:number){
  laravel.handlerPageChange(roleApi,page).then((res)=>{
    pagination.currentPage=page
    dataList.value = res.data.list
    columns.value = res.data.columns
  })
}

function handlerSizeChange(pageSize:number){
  pagination.pageSize = pageSize
  laravel.handlerSizeChange(roleApi,pageSize).then((res)=>{
    dataList.value = res.data.list
    columns.value = res.data.columns
  })
}

function handleDelete(id:number){

}

function handleEdit(id:number){

}

/**
 * 重置表格
 */
const resetForm = formEl => {
  if (!formEl) return;
  formEl.resetFields();
};

function openDialog(title = "新增", row?) {
  addDialog({
    title: `${title}角色`,
    props: {
      formInline: {
        name: row?.name ?? "",
        code: row?.code ?? "",
        remark: row?.remark ?? ""
      }
    },
    width: "40%",
    draggable: true,
    fullscreenIcon: true,
    closeOnClickModal: false,
    contentRenderer: () => h(editForm, { ref: formRef }),
    beforeSure: (done, { options }) => {
      const FormRef = formRef.value.getRef();
      const curData = options.props.formInline;
      function chores() {
        message(`您${title}了角色名称为${curData.name}的这条数据`, {
          type: "success"
        });
        done(); // 关闭弹框
      }
      FormRef.validate(valid => {
        if (valid) {
          console.log("curData", curData);
          // 表单规则校验通过
          if (title === "新增") {
            // 实际开发先调用新增接口，再进行下面操作
            chores();
          } else {
            // 实际开发先调用修改接口，再进行下面操作
            chores();
          }
        }
      });
    }
  });
}
</script>

<template>
  <div class="main">
    <el-form
      ref="formRef"
      :inline="true"
      :model="form"
      class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px]"
    >
      <el-form-item label="角色名称：" prop="name">
        <el-input
          v-model="form.name"
          placeholder="请输入角色名称"
          clearable
          class="!w-[180px]"
        />
      </el-form-item>
      <el-form-item label="角色标识：" prop="code">
        <el-input
          v-model="form.code"
          placeholder="请输入角色标识"
          clearable
          class="!w-[180px]"
        />
      </el-form-item>
      <el-form-item label="状态：" prop="status">
        <el-select
          v-model="form.status"
          placeholder="请选择状态"
          clearable
          class="!w-[180px]"
        >
          <el-option label="已启用" value="1" />
          <el-option label="已停用" value="0" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          :icon="useRenderIcon('search')"
          :loading="loading"
        >
          搜索
        </el-button>
        <el-button :icon="useRenderIcon(Refresh)" @click="resetForm(formRef)">
          重置
        </el-button>
      </el-form-item>
    </el-form>

    <el-table
      ref="table"
      :data="dataList"
      @row-dblclick="function(row, column, event){
            table.toggleRowExpansion(row)
            table.toggleRowSelection(row,true)
        }"
      highlight-current-row
    >
      <el-table-column
        :prop="column['prop']" v-for="(column,idx) in columns" :key="idx"
        :label="column['label']"
      >
        <template #default="scope" v-if="column['prop'] == 'is_active'">
<!--          <el-switch width="60" inline-prompt v-model="scope.row['is_active']" active-text="激活" inactive-text="禁用" />-->
          <el-tag
            :type="scope.row['is_active']?'success':'info'"
          >
            {{scope.row['is_active'] ? '已启用':'已禁用'}}
          </el-tag>
        </template>

        <template #default="scope" v-if="column['prop'] == 'deleted_at'">
          <el-tag
            :type="scope.row['deleted_at'] ? 'danger' : 'success'"
          >
            {{scope.row['deleted_at'] ? '是':'否'}}
          </el-tag>
        </template>

      </el-table-column>

      <el-table-column label="操作">
        <template #default="scope">
          <el-button type="primary" :icon="useRenderIcon('ep-edit')"    circle  size="small"/>
          <el-button type="danger"  :icon="useRenderIcon('ep-delete')"  circle  size="small"/>
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

