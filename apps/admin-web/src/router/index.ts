import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import Layout from '@/layout/index.vue'

// 公共路由
export const constantRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    component: () => import('@/views/login/index.vue'),
    meta: { hidden: true }
  },
  {
    path: '/404',
    component: () => import('@/views/error/404.vue'),
    meta: { hidden: true }
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '首页', icon: 'dashboard', affix: true }
      }
    ]
  },
  {
    path: '/user',
    component: Layout,
    meta: { hidden: true },
    redirect: 'noredirect',
    children: [
      {
        path: 'profile',
        component: () => import('@/views/profile/index.vue'),
        name: 'Profile',
        meta: { title: '个人中心', icon: 'user' }
      }
    ]
  }
]

// 动态路由 (这里仅作示例，实际会从后端获取)
export const asyncRoutes: RouteRecordRaw[] = [
  {
    path: '/system',
    component: Layout,
    redirect: 'noRedirect',
    name: 'System',
    meta: { title: '系统管理', icon: 'setting', roles: ['admin'] },
    children: [
      {
        path: 'user',
        component: () => import('@/views/system/user/index.vue'),
        name: 'User',
        meta: { title: '用户管理', icon: 'user', roles: ['admin'] }
      },
      {
        path: 'role',
        component: () => import('@/views/system/role/index.vue'),
        name: 'Role',
        meta: { title: '角色管理', icon: 'peoples', roles: ['admin'] }
      },
      {
        path: 'dict',
        component: () => import('@/views/system/dict/index.vue'),
        name: 'Dict',
        meta: { title: '字典管理', icon: 'dict', roles: ['admin'] }
      },
      {
        path: 'dict-data/:dictType',
        component: () => import('@/views/system/dict/data.vue'),
        name: 'DictData',
        meta: { title: '字典数据', icon: 'dict', roles: ['admin'], hidden: true, activeMenu: '/system/dict' }
      }
    ]
  },
  // 404 page must be placed at the end !!!
  { path: '/:pathMatch(.*)*', redirect: '/404', meta: { hidden: true } }
]

const router = createRouter({
  history: createWebHistory(),
  routes: constantRoutes,
  scrollBehavior: () => ({ left: 0, top: 0 })
})

export default router
