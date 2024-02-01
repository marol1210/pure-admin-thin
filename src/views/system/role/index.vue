<script setup lang="ts">
import { reactive, ref, onMounted, h, toRaw } from "vue";
import Refresh from "@iconify-icons/ep/refresh";
import Search from "@iconify-icons/ep/search";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import {addDialog, closeDialog} from "@/components/ReDialog";
import editForm from "./form.vue";
import * as laravel from "@/laravel";
import { message } from "@/utils/message"
import { http } from "@/utils/http";
import { ElMessageBox } from 'element-plus'
import {isFunction} from "@pureadmin/utils";

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
  http.request("get",roleApi.url,{"params": {"pageSize":pagination.pageSize} }).then((res)=>{
    dataList.value = res.data.list
    columns.value = res.data.columns
    pagination = reactive( res.data.paginator )
  })
})

/**
 * 翻页
 */
function handlerPageChange(page:number){
  laravel.handlerPageChange(roleApi,page).then((res)=>{
    pagination.currentPage=page
    dataList.value = res.data.list
    columns.value = res.data.columns
  })
}

/**
 * 修改每页条数
 */
function handlerSizeChange(pageSize:number){
  pagination.pageSize = pageSize
  laravel.handlerSizeChange(roleApi,pageSize).then((res)=>{
    dataList.value = res.data.list
    columns.value = res.data.columns
  })
}

/**
 * 激活
 */
function handleActive(row){
  return () => new Promise((resolve) => {
    ElMessageBox.confirm(
      `是否${row.is_active ? '禁用' : '启用'} “${row.name}”?`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info',
      }
    )
    .then(() => {
      row.activing = true
      http.request('put',"/api/role/"+row.id,{data:{is_active:!row.is_active}})
        .then((res)=>{
          row.activing = false;
          message('修改成功');
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
 * 删除（暂未使用）
 */
function handleDelete(row){
  return  () => new Promise((resolve) => {
    row.deleting = true
    console.log(row)
    http.request('put',"/api/role/"+row.id,{data:row})
      .then((res)=>{
        row.deleting = false;
        resolve(true)
        message('修改成功');
      })
      .catch((err)=>{
        resolve(false)
        row.deleting = false;
      });
  })
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
        title: row?.title ?? "",
        remark: row?.remark ?? "",
        isActive: row?.is_active ?? "",
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
          :icon="useRenderIcon(Search)"
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

<!--          <template #default="scope" v-if="column['prop'] == 'deleted_at'">-->
<!--            <el-switch width="70" inline-prompt v-model="scope.row.deleted_at" active-text="未删除" inactive-text="已删除"-->
<!--                       :loading="scope.row.deleting == true"-->
<!--                       :before-change="handleDelete(scope.row)"/>-->
<!--          </template>-->
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
