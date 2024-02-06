// 虽然字段很少 但是抽离出来 后续有扩展字段需求就很方便了
interface FormItemProps {
  /** 账号名 */
  name: string;
  /** 备注 */
  email: string;
  /** 密码 */
  password: string;
  /** 密码 */
  password_confirm: string;
  /** 停用 or 启用*/
  is_active?: boolean;
  is_edit: false;
  roles:[];
}
interface FormProps {
  formInline: FormItemProps;
}
export type { FormItemProps, FormProps };
