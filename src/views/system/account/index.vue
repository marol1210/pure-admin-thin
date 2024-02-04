<script setup lang="ts">
import { reactive, ref, onMounted, h, toRaw } from "vue";
import RefreshIcon from "@iconify-icons/ep/refresh";
import SearchIcon from "@iconify-icons/ep/search";
import PlusIcon from "@iconify-icons/ep/plus";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import {addDialog, closeDialog} from "@/components/ReDialog";
import editForm from "./form.vue";
import * as laravel from "@/laravel";
import { message } from "@/utils/message"
import { http } from "@/utils/http";
import { ElMessageBox } from 'element-plus'
import { isFunction } from "@pureadmin/utils";

defineOptions({
  name: "SystemUser"
});

const userApi: laravel.Api = {
  url: "/api/account"
}

const form = reactive({
  name: "",
  email: "",
  is_active: ""
});
const searchForm = ref();
const formRef = ref()
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

function formParams(){
  Object.assign(form, {"pageSize":pagination.pageSize,"page":pagination.currentPage})
}

/**
 * 搜索基础函数
 */
function search(params?:any){
  formParams()
  const _params =  Object.assign(form, params)
  return http.get(userApi.url,{"params":_params})
}

/**
 * 列表搜索
 */
function listFilter(){
  search()
    .then((res)=>{
      dataList.value = res.data.list
      columns.value = res.data.columns
      pagination = reactive(res.data.paginator)
    })
    .catch((err)=>{
      message(err)
    })
}


onMounted(() => {
  search()
    .then((res)=>{
      dataList.value = res.data.list
      columns.value = res.data.columns
      pagination = reactive(res.data.paginator)
    })
    .catch((err)=>{
      message(err)
    })
})


/**
 * 翻页
 */
function handlerPageChange(page:number){
  formParams()
  const _params =  Object.assign(form, {"page":page})
  laravel.handlerPageChange(userApi,_params).then((res)=>{
    pagination = reactive(res.data.paginator)
    dataList.value = res.data.list
    columns.value = res.data.columns
  })
}

/**
 * 修改每页条数
 */
function handlerSizeChange(pageSize:number){
  formParams()
  const _params =  Object.assign(form, {"pageSize":pageSize})
  laravel.handlerSizeChange(userApi,_params).then((res)=>{
    dataList.value = res.data.list
    columns.value = res.data.columns
    pagination = reactive(res.data.paginator)
  })
}

/**
 * 激活
 */
function handleActive(row){
  return () => new Promise((resolve) => {
    ElMessageBox.confirm(
      `是否${row.is_active ? '禁用' : '启用'} “${row.email}”?`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info',
      }
    )
      .then(() => {
        row.activing = true
        http.request('put',"/api/role/"+row.id,{data:{is_active:row.is_active ? 0 : 1}})
          .then((res)=>{
            row.activing = false;
            message('修改成功',{type:'success'});
            return resolve(true)
          })
          .catch((err)=>{
            row.activing = false;
            return resolve(false)
          });
      })
      .catch(() => {

      })
  })
}

/**
 * 删除
 */
function handleDelete(row){
  ElMessageBox.confirm(
    `是否删除账号 “${row.email}”?`,
    '注意',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      row.deleting = true
      http.request('delete',"/api/account/"+row.id,{data:row})
        .then((res)=>{
          row.deleting = false;
          message('删除成功',{type:'success'});
          listFilter()
        })
        .catch((err)=>{
          row.deleting = false;
          message('删除失败',{type:'warning'});
        });
    })
    .catch(() => {

    })
}

/**
 * 重置表格
 */
const resetForm = formEl => {
  if (!formEl) return;
  formEl.resetFields()
  listFilter();
}


function openDialog(title = "新增", row?) {
  addDialog({
    title: `${title}角色`,
    props: {
      formInline: {
        name: row?.name ?? "",
        email: row?.email ?? "",
        is_active: row?.is_active ?? false,
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
          type: "success",
          duration: 2500
        });
        done(); // 关闭弹框
        listFilter()
      }

      function chores_err() {
        message(`您${title}了角色名称为${curData.name},未成功.`, {
          type: "warning",
          duration: 2500
        });
        done(); // 关闭弹框
        listFilter()
      }

      FormRef.validate(valid => {
        if (valid) {
          // 表单规则校验通过
          if (title === "新增") {
            // 实际开发先调用新增接口，再进行下面操作
            http.post(`${userApi.url}`,{data:curData})
              .then((response) =>{
                if(response.code==200){
                  chores()
                }
              })
              .catch((err) => chores_err())
          } else {
            // 实际开发先调用修改接口，再进行下面操作
            http.request('put',`${userApi.url}/${row.id}`,{data:curData})
              .then((response) =>{
                if(response.code==200){
                  chores()
                }
              })
              .catch((err) => chores_err())
          }
        }
      });
    },
    footerButtons: [
      {
        label: "取消",
        text: true,
        bg: true,
        btnClick: ({ dialog: { options, index } }) => {
          const done = () =>
            closeDialog(options, index, { command: "cancel" });
          if (options?.beforeCancel && isFunction(options?.beforeCancel)) {
            options.beforeCancel(done, { options, index });
          } else {
            done();
          }
        }
      },
      {
        label: "确定",
        type: "primary",
        text: true,
        bg: true,
        btnClick: ({ dialog: { options, index } }) => {
          const done = () =>
            closeDialog(options, index, { command: "sure" });
          if (options?.beforeSure && isFunction(options?.beforeSure)) {
            options.beforeSure(done, { options, index });
          } else {
            done();
          }
        }
      }
    ]
  });
}
</script>

<template>
  <div class="main">
    <el-form
      ref="searchForm"
      :inline="true"
      :model="form"
      class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px]"
    >
      <el-form-item label="名称：" prop="name">
        <el-input
          v-model="form.title"
          placeholder="请输入角色名称"
          clearable
          class="!w-[180px]"
        />
      </el-form-item>
      <!--      <el-form-item label="角色标识：" prop="code">-->
      <!--        <el-input-->
      <!--          v-model="form.code"-->
      <!--          placeholder="请输入角色标识"-->
      <!--          clearable-->
      <!--          class="!w-[180px]"-->
      <!--        />-->
      <!--      </el-form-item>-->
      <el-form-item label="状态：" prop="is_active">
        <el-select
          v-model="form.is_active"
          placeholder="请选择状态"
          clearable
          class="!w-[180px]"
        >
          <el-option label="启用" value="1" />
          <el-option label="停用" value="0" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          :icon="useRenderIcon(SearchIcon)"
          :loading="loading"
          @click.prevent="listFilter"
        >
          搜索
        </el-button>
        <el-button :icon="useRenderIcon(RefreshIcon)" @click="resetForm(searchForm)">重置</el-button>
        <el-button :icon="useRenderIcon(PlusIcon)" @click="openDialog('新增')" type="success">新增</el-button>
      </el-form-item>
    </el-form>

    <el-table
      ref="table"
      :data="dataList"
      class="mt-3"
      highlight-current-row
    >
      <el-table-column
        :prop="column['prop']" v-for="(column,idx) in columns"
        :key="idx"
        :label="column['label']">
        <template #default="scope" v-if="column['prop'] == 'is_active'">
          <el-switch width="60" inline-prompt v-model="scope.row.is_active" active-text="启用" inactive-text="停用"

                     :loading="scope.row.activing == true"
                     :before-change="handleActive(scope.row)"
          />
        </template>
      </el-table-column>

      <el-table-column fixed="right" label="操作">
        <template #default="{row}">
          <el-button type="primary" :icon="useRenderIcon('ep-edit')"  circle  size="small" @click="openDialog('修改', row)"/>
          <el-button type="danger"  :icon="useRenderIcon('ep-delete')"  circle  size="small" @click="handleDelete(row)"/>
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
