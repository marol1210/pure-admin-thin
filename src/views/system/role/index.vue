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
const loading = ref(true);
const switchLoadMap = ref({});
const pagination = reactive<PaginationProps>({
  total: 0,
  pageSize: 10,
  currentPage: 1,
  background: true
});

/**
 * 重置表格
 */
const resetForm = formEl => {
  if (!formEl) return;
  formEl.resetFields();
};

/**
 * 表头
 */
const columns: TableColumnList = [
              {
                label: "角色编号",
                prop: "id",
                minWidth: 100
              },
              {
                label: "角色名称",
                prop: "name",
                minWidth: 120
              },
              {
                label: "角色标识",
                prop: "code",
                minWidth: 150
              },
              {
                label: "状态",
                minWidth: 130
              },
            {
              label: "备注",
                prop: "remark",
              minWidth: 150
            },
            {
              label: "创建时间",
                minWidth: 180,
              prop: "createTime",
              formatter: ({ createTime }) =>
              dayjs(createTime).format("YYYY-MM-DD HH:mm:ss")
            },
            {
              label: "操作",
                fixed: "right",
              width: 240,
              slot: "operation"
            }
          ];

function openDialog(title = "新增", row?: FormItemProps) {
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
      const curData = options.props.formInline as FormItemProps;
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
          @click="onSearch"
        >
          搜索
        </el-button>
        <el-button :icon="useRenderIcon(Refresh)" @click="resetForm(formRef)">
          重置
        </el-button>
      </el-form-item>
    </el-form>
    <el-table>

    </el-table>
  </div>
</template>

