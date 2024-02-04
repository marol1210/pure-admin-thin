<script setup lang="ts">
import { ref,reactive } from "vue";
import { FormProps } from "./types.ts"
import type { FormInstance, FormRules } from 'element-plus'

const props = withDefaults(defineProps<FormProps>(),{
  formInline:{
    email: "",
    name: "",
    is_active: false
  }
})

const ruleFormRef = ref();
const newFormInline = ref(props.formInline);

function getRef() {
  return ruleFormRef.value;
}

const rules = reactive<FormRules>({
  name: [
    { required: true, message: '账号名称', trigger: 'blur' },
    { min: 1, max: 100, message: '长度1 - 100', trigger: 'blur' },
  ],
  email: [
    { required: true, message: '账号', trigger: 'blur' },
    { min: 1, max: 100, message: '长度1 - 100', trigger: 'blur' },
  ]
})

defineExpose({ getRef });
</script>

<template>
  <el-form
    ref="ruleFormRef"
    :model="newFormInline"
    :rules="rules"
    label-width="82px"
    status-icon
  >
    <el-form-item label="账号" prop="email">
      <el-input
        v-model="newFormInline.email"
        clearable
        placeholder="请输入账号"
      />
    </el-form-item>

    <el-form-item label="名称" prop="name">
      <el-input
        v-model="newFormInline.name"
        clearable
        placeholder="请输入账号名称"
      />
    </el-form-item>

    <el-form-item label="是否激活">
      <el-switch
        v-model="newFormInline.is_active"
        placeholder="是否激活"
        type="boolean"
      />
    </el-form-item>
  </el-form>
</template>
