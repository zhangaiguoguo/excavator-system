import { defineStore } from 'pinia'
import { constantRoutes } from '@/router'

// 匹配权限
function hasPermission(roles, route) {
  if (route.meta && route.meta.roles) {
    return roles.some(role => route.meta.roles.includes(role))
  } else {
    return true
  }
}

// 递归过滤异步路由表
export function filterAsyncRoutes(routes, roles) {
  const res = []

  routes.forEach(route => {
    const tmp = { ...route }
    if (hasPermission(roles, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, roles)
      }
      res.push(tmp)
    }
  })

  return res
}

export const usePermissionStore = defineStore('permission', {
  state: () => ({
    routes: [],
    addRoutes: []
  }),
  actions: {
    generateRoutes(roles) {
      return new Promise(resolve => {
        // 在实际应用中，这里应该请求后端获取动态路由表
        // 为了演示，我们使用预定义的异步路由表
        const asyncRoutes = [
          {
            path: '/system',
            component: 'Layout',
            redirect: 'noRedirect',
            meta: { title: '系统管理', icon: 'setting', roles: ['admin'] },
            children: [
              {
                path: 'user',
                component: 'system/user/index',
                name: 'User',
                meta: { title: '用户管理', icon: 'user', roles: ['admin'] }
              },
              {
                path: 'role',
                component: 'system/role/index',
                name: 'Role',
                meta: { title: '角色管理', icon: 'peoples', roles: ['admin'] }
              }
            ]
          }
        ]
        
        // 简单的角色过滤
        let accessedRoutes
        if (roles.includes('admin')) {
          accessedRoutes = asyncRoutes || []
        } else {
          accessedRoutes = filterAsyncRoutes(asyncRoutes, roles)
        }
        
        this.addRoutes = accessedRoutes
        this.routes = constantRoutes.concat(accessedRoutes)
        resolve(accessedRoutes)
      })
    }
  }
})
