<script setup lang="ts">
import { ref,reactive } from "vue";
import { FormProps } from "./types.ts"
import type { FormRules } from 'element-plus'

const props = withDefaults(defineProps<FormProps>(),{
  formInline:{
    email: "",
    name: "",
    password: "",
    roles:[],
    selected_roles:[],
    password_confirm: "",
    is_active: false,
    is_edit: false
  }
})

const ruleFormRef = ref();
const newFormInline = ref(props.formInline);

function getRef() {
  return ruleFormRef.value;
}

const validatePass = (rule: any, value: any, callback: any) => {
  if (!newFormInline.value.is_edit  && value === '') {
    callback(new Error('不能为空.'))
  } else if (value !== props.formInline.password && props.formInline.password!='') {
    callback(new Error("两次密码不一致，请重新确认密码."))
  } else {
    callback()
  }
}

const rules = reactive<FormRules>({
  selected_roles:[
    { required: true, message: '不能为空', trigger: 'blur' },
  ],
  name: [
    { required: true, message: '不能为空', trigger: 'blur' },
    { min: 1, max: 100, message: '长度1 - 100', trigger: 'blur' },
  ],
  email: [
    { required: true, message: '不能为空', trigger: 'blur' },
    { min: 1, max: 100, message: '长度1 - 100', trigger: 'blur' },
  ],
  password:  [
    { required: !newFormInline.value.is_edit, message: '不能为空', trigger: 'blur' },
    { min: 8, max: 32, message: '长度8 - 32', trigger: 'blur' },
  ] ,
  password_confirm: newFormInline.value.is_edit ? [{ validator:validatePass, trigger:'blur' }] : [
    { required: !newFormInline.value.is_edit, message: '不能为空', trigger: 'blur' },
    { validator:validatePass, trigger:'blur' }
  ]
})


defineExpose({ getRef,newFormInline });
</script>

<template>
  <el-form
    ref="ruleFormRef"
    :model="newFormInline"
    :rules="rules"
    label-width="82px"
    status-icon
  >
    <el-form-item label="名称" prop="name">
      <el-input
        v-model="newFormInline.name"
        clearable
        placeholder="请输入账号名称"
      />
    </el-form-item>

    <el-form-item label="账号" prop="email">
      <el-input
        v-model="newFormInline.email"
        clearable
        placeholder="请输入账号"
      />
    </el-form-item>

    <el-form-item label="角色" prop="selected_roles">
      <el-select
        v-model="newFormInline.selected_roles"
        clearable
        multiple
        placeholder="所属角色"
        style="width: 240px"
      >
        <el-option
          v-for="item in props.formInline.roles"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </el-form-item>

    <el-form-item label="密码" prop="password">
      <el-input
        type="password"
        v-model="newFormInline.password"
        clearable
        :show-password="true"
        placeholder="请输入密码"
      />
    </el-form-item>

    <el-form-item label="确认密码" prop="password_confirm">
      <el-input
        type="password"
        v-model="newFormInline.password_confirm"
        clearable
        :show-password="true"
        placeholder="请确认密码"
      />
    </el-form-item>

    <el-form-item label="是否激活" prop="is_active">
      <el-switch
        v-model="newFormInline.is_active"
        placeholder="是否激活"
        type="boolean"
      />
    </el-form-item>
  </el-form>
</template>
