import router from './router'
import { useUserStore } from './store/user'
import { usePermissionStore } from './store/permission'
import { ElMessage } from 'element-plus'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

NProgress.configure({ showSpinner: false })

const whiteList = ['/login', '/auth-redirect', '/bind', '/register']

router.beforeEach(async (to, from, next) => {
  NProgress.start()
  
  const userStore = useUserStore()
  const permissionStore = usePermissionStore()
  const hasToken = userStore.token

  if (hasToken) {
    if (to.path === '/login') {
      next({ path: '/' })
      NProgress.done()
    } else {
      const hasRoles = userStore.roles && userStore.roles.length > 0
      if (hasRoles) {
        next()
      } else {
        try {
          // 获取用户信息
          const { roles } = await userStore.getInfo()
          
          // 基于角色生成可访问路由表
          const accessRoutes = await permissionStore.generateRoutes(roles)
          
          // 动态添加可访问路由表
          accessRoutes.forEach(route => {
            router.addRoute(route)
          })
          
          next({ ...to, replace: true })
        } catch (error) {
          // 移除token并跳转登录页
          await userStore.logout()
          message.error(error.message || 'Has Error')
          next(`/login?redirect=${to.path}`)
          NProgress.done()
        }
      }
    }
  } else {
    if (whiteList.indexOf(to.path) !== -1) {
      next()
    } else {
      next(`/login?redirect=${to.path}`)
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  NProgress.done()
})
