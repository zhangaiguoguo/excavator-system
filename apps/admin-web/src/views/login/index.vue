<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <div class="logo-wrapper">
          <img src="@/assets/vue.svg" alt="logo" class="logo" v-if="hasLogo" />
          <div v-else class="logo-icon-box">
            <DesktopOutlined class="logo-icon" />
          </div>
        </div>
        <h2 class="title">{{ title }}</h2>
        <p class="subtitle">让工程机械租赁更简单、更高效</p>
      </div>
      
      <a-form :model="loginForm" :rules="loginRules" ref="loginFormRef" class="login-form">
        <a-form-item name="username">
          <a-input 
            v-model:value="loginForm.username" 
            placeholder="请输入账号" 
            size="large"
            class="custom-input"
          >
            <template #prefix>
              <UserOutlined class="input-icon" />
            </template>
          </a-input>
        </a-form-item>
        <a-form-item name="password">
          <a-input-password
            v-model:value="loginForm.password" 
            placeholder="请输入密码" 
            size="large"
            class="custom-input"
            @keyup.enter="handleLogin"
          >
            <template #prefix>
              <LockOutlined class="input-icon" />
            </template>
          </a-input-password>
        </a-form-item>
        
        <div class="form-actions">
          <a-checkbox v-model:checked="rememberMe">记住我</a-checkbox>
          <a class="forgot-link">忘记密码？</a>
        </div>

        <a-button type="primary" :loading="loading" class="login-btn" size="large" @click="handleLogin">
          登 录
        </a-button>
      </a-form>
      
      <div class="login-footer">
        <span>&copy; {{ new Date().getFullYear() }} 挖掘机租赁管理系统 v1.0.0</span>
      </div>
    </div>
    
    <!-- Decorative Background Elements -->
    <div class="bg-circle circle-1"></div>
    <div class="bg-circle circle-2"></div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { UserOutlined, LockOutlined, DesktopOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { useUserStore } from '@/store/user'

const router = useRouter()
const userStore = useUserStore()
const title = import.meta.env.VITE_APP_TITLE || '挖掘机租赁管理系统'
const hasLogo = false 

const loginForm = reactive({
  username: 'admin',
  password: '123'
})
const rememberMe = ref(false)

const loginRules = {
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const loginFormRef = ref(null)
const loading = ref(false)

const handleLogin = () => {
  loginFormRef.value.validate().then(async () => {
    loading.value = true
    try {
      await userStore.login(loginForm)
      message.success('登录成功')
      router.push('/')
    } catch (error) {
      message.error(error.message || '登录失败')
    } finally {
      loading.value = false
    }
  }).catch(() => {
    // validation failed
  })
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  position: relative;
  overflow: hidden;
}

.bg-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  z-index: 0;
}

.circle-1 {
  width: 400px;
  height: 400px;
  top: -100px;
  left: -100px;
  background: linear-gradient(to right, #4facfe 0%, #00f2fe 100%);
  opacity: 0.1;
}

.circle-2 {
  width: 600px;
  height: 600px;
  bottom: -200px;
  right: -200px;
  background: linear-gradient(to right, #43e97b 0%, #38f9d7 100%);
  opacity: 0.1;
}

.login-box {
  width: 420px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  z-index: 1;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.login-box:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.logo-wrapper {
  margin: 0 auto 20px;
  display: flex;
  justify-content: center;
}

.logo-icon-box {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #1890ff 0%, #36cfc9 100%);
  border-radius: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
}

.logo-icon {
  font-size: 32px;
  color: white;
}

.title {
  margin: 0;
  color: #303133;
  font-size: 26px;
  font-weight: 700;
  letter-spacing: 1px;
}

.subtitle {
  margin: 10px 0 0;
  color: #909399;
  font-size: 14px;
}

.login-form {
  margin-bottom: 20px;
}

.input-icon {
  color: #bfbfbf;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.forgot-link {
  color: #1890ff;
}

.login-btn {
  width: 100%;
  border-radius: 8px;
  height: 44px;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 2px;
  background: linear-gradient(90deg, #1890ff 0%, #36cfc9 100%);
  border: none;
  transition: all 0.3s;
}

.login-btn:hover {
  opacity: 0.9;
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.4);
}

.login-footer {
  text-align: center;
  color: #c0c4cc;
  font-size: 12px;
  margin-top: 30px;
}
</style>
