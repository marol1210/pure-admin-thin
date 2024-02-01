<script setup lang="ts">
import { ref,reactive } from "vue";
import { FormProps } from "./types.ts"
import type { FormInstance, FormRules } from 'element-plus'

const props = withDefaults(defineProps<FormProps>(),{
  formInline:{
    title: "",
    name: "",
    remark: "",
    isActive: false
  }
})

const ruleFormRef = ref();
const newFormInline = ref(props.formInline);

function getRef() {
  return ruleFormRef.value;
}

const rules = reactive<FormRules>({
  title: [
    { required: true, message: '角色名称必填', trigger: 'blur' },
    { min: 3, max: 10, message: '长度3 - 10', trigger: 'blur' },
  ],
  name: [
    { required: true, message: '角色标识必填', trigger: 'blur' },
    { min: 3, max: 10, message: '长度3 - 10', trigger: 'blur' },
  ],
  remark: [
    { min: 3, max: 50, message: '长度3 - 50', trigger: 'blur' },
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
    <el-form-item label="角色名称" prop="title">
      <el-input
        v-model="newFormInline.title"
        clearable
        placeholder="请输入角色名称"
      />
    </el-form-item>

    <el-form-item label="角色标识" prop="name">
      <el-input
        v-model="newFormInline.name"
        clearable
        placeholder="请输入角色标识"
      />
    </el-form-item>

    <el-form-item label="是否激活">
      <el-switch
        v-model="newFormInline.isActive"
        placeholder="是否激活"
        type="textarea"
      />
    </el-form-item>

    <el-form-item label="备注">
      <el-input
        v-model="newFormInline.remark"
        placeholder="请输入备注信息"
        type="textarea"
      />
    </el-form-item>
  </el-form>
</template>
