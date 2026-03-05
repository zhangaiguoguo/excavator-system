<template>
  <div class="navbar">
    <div class="hamburger" @click="toggleSideBar">
      <MenuUnfoldOutlined v-if="sidebar.opened" class="icon" />
      <MenuFoldOutlined v-else class="icon" />
    </div>
    
    <div class="breadcrumb-container">
      <Breadcrumb />
    </div>

    <div class="right-menu">
      <div class="right-menu-item hover-effect">
        <SearchOutlined />
      </div>
      <div class="right-menu-item hover-effect">
        <BellOutlined />
      </div>
      <a-dropdown class="avatar-container right-menu-item hover-effect" :trigger="['click']">
        <div class="avatar-wrapper">
          <img :src="avatar" class="user-avatar">
          <span class="user-name">Admin</span>
          <DownOutlined class="icon-caret-bottom" />
        </div>
        <template #overlay>
          <a-menu class="user-dropdown">
            <a-menu-item key="profile">
              <router-link to="/user/profile">
                个人中心
              </router-link>
            </a-menu-item>
            <a-menu-item key="home">
              <router-link to="/">
                首页
              </router-link>
            </a-menu-item>
            <a-menu-divider />
            <a-menu-item key="logout" @click="logout">
              <span style="display:block;">退出登录</span>
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAppStore } from '@/store/app'
import { useRouter } from 'vue-router'
import { 
  MenuUnfoldOutlined, 
  MenuFoldOutlined, 
  DownOutlined, 
  SearchOutlined, 
  BellOutlined 
} from '@ant-design/icons-vue'

import Breadcrumb from '@/components/Breadcrumb/index.vue'

const appStore = useAppStore()
const router = useRouter()

const sidebar = computed(() => appStore.sidebar)
const avatar = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'

const toggleSideBar = () => {
  appStore.toggleSidebar()
}

const logout = () => {
  // Clear token
  localStorage.removeItem('token')
  router.push('/login')
}
</script>

<style lang="scss" scoped>
.navbar {
  height: 64px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);
  display: flex;
  justify-content: space-between;
  align-items: center;

  .hamburger {
    line-height: 64px;
    height: 100%;
    cursor: pointer;
    transition: background .3s;
    -webkit-tap-highlight-color: transparent;
    padding: 0 24px;
    font-size: 20px;
    color: #5a5e66;
    display: flex;
    align-items: center;

    &:hover {
      background: rgba(0, 0, 0, .025)
    }
    
    .icon {
      font-size: 20px;
    }
  }

  .breadcrumb-container {
    flex: 1;
  }

  .right-menu {
    height: 100%;
    line-height: 64px;
    display: flex;
    align-items: center;
    padding-right: 20px;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0 12px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background .3s;

        &:hover {
          background: rgba(0, 0, 0, .025)
        }
      }
    }

    .avatar-container {
      margin-right: 0; // Removed extra margin

      .avatar-wrapper {
        display: flex;
        align-items: center;
        position: relative;
        
        .user-avatar {
          cursor: pointer;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          margin-right: 8px;
        }
        
        .user-name {
          font-size: 14px;
          margin-right: 4px;
          display: inline-block;
          max-width: 100px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .icon-caret-bottom {
          cursor: pointer;
          font-size: 12px;
        }
      }
    }
  }
}
</style>