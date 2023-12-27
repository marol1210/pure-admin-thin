import {http} from "@/utils/http";

/**
 * login data
 */
export interface LoginData {
  email: string;
  password: string;
}

/**
 * config
 */
export interface AdminConfig {
  csrfUrl: string;
  loginUrl: string;
}

/**
 * 后端登录接口
 * @param $data LoginData
 */
export async function doLogin(cfg:AdminConfig , data:LoginData): Promise<any> {
  return await http.get(cfg.csrfUrl).then((req)=>{
    return http.request("post",cfg.loginUrl,{data:data})
  })
}

export async function productCategoryTree(){
  return await http.request("get","/api/pc")
}
