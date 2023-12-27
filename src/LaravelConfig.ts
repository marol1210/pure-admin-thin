/**@interface import(./laravel).AdminConfig */
export const config = {
  /**
   * csrf protect
   */
  csrfUrl:'http://localhost:8080/sanctum/csrf-cookie',

  /**
   * login url
   */
  loginUrl:'http://localhost:8080/login'
}
