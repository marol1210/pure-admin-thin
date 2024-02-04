export default {
  path: "/system",
  meta: {
    title: "系统管理",
    // showLink: false,
    icon: "ep:setting",
    rank: 9
  },
  children: [
    {
      path: "/system/user",
      name: "UserManage",
      component: () => import("@/views/system/account/index.vue"),
      meta: {
        icon: "ep:user",
        title: "账号管理"
      }
    },
    {
      path: "/system/role",
      name: "SystemRole",
      component: () => import("@/views/system/role/index.vue"),
      meta: {
        icon: "ep:user-filled",
        title: "角色管理"
      }
    }
  ]
} as RouteConfigsTable;
