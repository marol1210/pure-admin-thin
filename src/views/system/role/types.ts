// 虽然字段很少 但是抽离出来 后续有扩展字段需求就很方便了
interface FormItemProps {
  /** 角色名称 */
  name: string;
  /** 角色编号 */
  code: string;
  /** 备注 */
  remark: string;
  /** 停用 or 启用*/
  is_active?: boolean
}
interface FormProps {
  formInline: FormItemProps;
}
export type { FormItemProps, FormProps };
