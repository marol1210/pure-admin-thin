import { http } from "@/utils/http";
import { reactive } from "vue";

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


let pagination = reactive({
  total: 0,
  pageSize: 10,
  currentPage: 1,
  background: true
});


export interface Api {
  url: string;
  success?: (res) => void;
  error?: (err) => void;
}

export async function handlerPageChange(api: Api, page:number) : Promise<any> {
  return http.request("get",api.url,{"params": {"page": page,"pageSize":pagination.pageSize} })
}

export async function handlerSizeChange(api: Api, pageSize:number) : Promise<any> {
  pagination.pageSize = pageSize
  return http.request("get",api.url,{"params": {"pageSize":pagination.pageSize} })
}
