// 模拟后端动态生成路由
import { MockMethod } from "vite-plugin-mock";

/**
 * roles：页面级别权限，这里模拟二种 "admin"、"common"
 * admin：管理员角色
 * common：普通角色
 */

const permissionRouter = {
  path: "/permission",
  meta: {
    title: "权限管理",
    icon: "lollipop",
    rank: 10
  },
  children: [
    {
      path: "/permission/page/index",
      name: "PermissionPage",
      meta: {
        title: "页面权限",
        roles: ["admin", "common"]
      }
    },
    {
      path: "/permission/button/index",
      name: "PermissionButton",
      meta: {
        title: "按钮权限",
        roles: ["admin", "common"],
        auths: ["btn_add", "btn_edit", "btn_delete"]
      }
    }
  ]
};

const member = {
  path: "/member",
  meta: {
    title: "用户管理",
    icon: "lollipop",
    rank: 10
  },
  children: [
    {
      path: "/member/fans",
      name: "fansList",
      component: 'member/fans_list',
      meta: {
        title: "粉丝列表",
        roles: ["admin", "common"]
      }
    },
    {
      path: "/member/list",
      name: "memberList",
      component: 'member/member_list',
      meta: {
        title: "会员列表",
        roles: ["admin", "common"]
      }
    }
  ]
} as RouteConfigsTable

const product = {
  path: "/product",
  meta: {
    title: "商品管理",
    icon: "lollipop",
    rank: 10
  },
  children: [
    {
      path: "/p_categorys",
      component: "product/category/index",
      name: "productCategory",
      meta: {
        title: "商品类别",
        roles: ["admin", "common"]
      }
    },
    {
      path: "/products",
      component: "product/index",
      name: "productList",
      meta: {
        title: "商品列表",
        roles: ["admin", "common"]
      }
    }
  ]
} as RouteConfigsTable

export default [
  {
    url: "/getAsyncRoutes",
    method: "get",
    response: () => {
      return {
        success: true,
        data: [permissionRouter,member,product]
      };
    }
  }
] as MockMethod[];
