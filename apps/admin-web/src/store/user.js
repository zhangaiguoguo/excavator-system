import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    name: '',
    avatar: '',
    roles: [],
    permissions: []
  }),
  actions: {
    // 登录
    login(userInfo) {
      const { username, password } = userInfo
      return new Promise((resolve, reject) => {
        // Mock API call
        setTimeout(() => {
          if (username === 'admin' && password === '123') {
            const token = 'mock-token-admin'
            this.token = token
            localStorage.setItem('token', token)
            resolve()
          } else {
            reject(new Error('账号或密码错误'))
          }
        }, 1000)
      })
    },

    // 获取用户信息
    getInfo() {
      return new Promise((resolve, reject) => {
        // Mock API call based on token
        setTimeout(() => {
          const token = this.token
          if (token === 'mock-token-admin') {
            const data = {
              roles: ['admin'],
              name: 'Admin',
              avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
              permissions: ['*:*:*']
            }
            this.roles = data.roles
            this.name = data.name
            this.avatar = data.avatar
            this.permissions = data.permissions
            resolve(data)
          } else {
            reject(new Error('Verification failed, please Login again.'))
          }
        }, 500)
      })
    },

    // 退出系统
    logout() {
      return new Promise((resolve, reject) => {
        this.token = ''
        this.roles = []
        this.permissions = []
        localStorage.removeItem('token')
        resolve()
      })
    }
  }
})
