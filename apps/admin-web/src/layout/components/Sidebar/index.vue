<template>
  <a-layout-sider 
    v-model:collapsed="isCollapse" 
    :trigger="null" 
    collapsible 
    class="sidebar-container"
    :width="200"
  >
    <div class="logo-container" v-if="showLogo">
      <transition name="sidebarLogoFade">
        <div v-if="isCollapse" class="sidebar-logo-link" key="collapse">
          <img v-if="logo" :src="logo" class="sidebar-logo" />
          <DesktopOutlined v-else class="sidebar-logo-icon" />
        </div>
        <div v-else class="sidebar-logo-link" key="expand">
          <img v-if="logo" :src="logo" class="sidebar-logo" />
          <DesktopOutlined v-else class="sidebar-logo-icon" />
          <h1 class="sidebar-title">{{ title }}</h1>
        </div>
      </transition>
    </div>
    
    <div class="menu-container">
      <a-menu
        v-model:selectedKeys="selectedKeys"
        v-model:openKeys="openKeys"
        theme="dark"
        mode="inline"
        class="custom-menu"
      >
        <template v-for="route in permission_routes" :key="route.path">
          <template v-if="!route.hidden">
            <!-- No Children or Only One Child -->
            <a-menu-item 
              v-if="hasOneShowingChild(route.children, route) && (!onlyOneChild.children || onlyOneChild.noShowingChildren) && !route.alwaysShow"
              :key="resolvePath(onlyOneChild.path, route.path)"
              @click="handleMenuClick(resolvePath(onlyOneChild.path, route.path))"
            >
              <template #icon>
                <component :is="onlyOneChild.meta?.icon ? (icons[onlyOneChild.meta.icon] || icons['AppstoreOutlined']) : icons['AppstoreOutlined']" />
              </template>
              <span>{{ onlyOneChild.meta.title }}</span>
            </a-menu-item>

            <!-- Nested Children -->
            <a-sub-menu v-else :key="route.path">
              <template #icon>
                <component :is="route.meta?.icon ? (icons[route.meta.icon] || icons['AppstoreOutlined']) : icons['AppstoreOutlined']" />
              </template>
              <template #title>{{ route.meta.title }}</template>
              
              <template v-for="child in route.children" :key="child.path">
                <a-menu-item 
                  v-if="!child.hidden" 
                  :key="resolvePath(child.path, route.path)"
                  @click="handleMenuClick(resolvePath(child.path, route.path))"
                >
                  <template #icon v-if="child.meta && child.meta.icon">
                    <component :is="icons[child.meta.icon] || icons['AppstoreOutlined']" />
                  </template>
                  <span>{{ child.meta.title }}</span>
                </a-menu-item>
              </template>
            </a-sub-menu>
          </template>
        </template>
      </a-menu>
    </div>
  </a-layout-sider>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/store/app'
import { usePermissionStore } from '@/store/permission'
import * as Icons from '@ant-design/icons-vue'
import { DesktopOutlined, AppstoreOutlined } from '@ant-design/icons-vue'

// Map element icon names to ant design icons or provide a mapping logic
// For simplicity, we assume meta.icon contains valid Ant Design Icon names or we default
const icons = Icons

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const permissionStore = usePermissionStore()

const isCollapse = computed(() => appStore.sidebar.opened === false)
const showLogo = computed(() => appStore.sidebarLogo)
const permission_routes = computed(() => permissionStore.routes)

const logo = '' 
const title = import.meta.env.VITE_APP_TITLE

const selectedKeys = ref([])
const openKeys = ref([])

// Sync menu state with route
watch(
  () => route.path,
  (val) => {
    selectedKeys.value = [val]
    // Simple logic to open parent submenu
    // Ideally this should be more robust
    const parts = val.split('/')
    if (parts.length > 2) {
      openKeys.value = ['/' + parts[1]]
    }
  },
  { immediate: true }
)

const handleMenuClick = (path) => {
  router.push(path)
}

const onlyOneChild = ref(null)

const hasOneShowingChild = (children = [], parent) => {
  const showingChildren = children.filter(item => {
    if (item.hidden) {
      return false
    } else {
      onlyOneChild.value = item
      return true
    }
  })

  if (showingChildren.length === 1) {
    return true
  }

  if (showingChildren.length === 0) {
    onlyOneChild.value = { ...parent, path: '', noShowingChildren: true }
    return true
  }

  return false
}

const resolvePath = (routePath, basePath) => {
  if (/^(https?:|mailto:|tel:)/.test(routePath)) {
    return routePath
  }
  if (/^(https?:|mailto:|tel:)/.test(basePath)) {
    return basePath
  }
  
  // Simple path join
  if (basePath === '/') {
    return '/' + routePath
  }
  // Remove duplicate slashes
  const path = basePath + '/' + routePath
  return path.replace('//', '/')
}
</script>

<style lang="scss" scoped>
.sidebar-container {
  height: 100vh;
  overflow: hidden;
  box-shadow: 2px 0 6px rgba(0, 21, 41, 0.15);
  z-index: 1001;
  background: #001529; /* Ant Design dark theme color */

  .menu-container {
    height: calc(100vh - 64px);
    overflow-y: auto;
    
    &::-webkit-scrollbar {
      width: 0;
      background: transparent;
    }
  }

  /* Ant Design Menu Overrides for matching previous look if needed */
  :deep(.ant-menu) {
    background: #001529;
    color: rgba(255, 255, 255, 0.65);
  }
  
  :deep(.ant-menu-item-selected) {
    background-color: #1890ff !important;
  }
}

.logo-container {
  position: relative;
  width: 100%;
  height: 64px;
  line-height: 64px;
  background: #002140;
  text-align: center;
  overflow: hidden;
  
  & .sidebar-logo-link {
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  & .sidebar-logo {
    width: 32px;
    height: 32px;
    vertical-align: middle;
    margin-right: 12px;
  }
  
  & .sidebar-logo-icon {
    font-size: 28px;
    color: #1890ff;
    vertical-align: middle;
    margin-right: 10px;
  }

  & .sidebar-title {
    display: inline-block;
    margin: 0;
    color: #fff;
    font-weight: 600;
    line-height: 50px;
    font-size: 16px;
    font-family: Avenir, Helvetica Neue, Arial, Helvetica, sans-serif;
    vertical-align: middle;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.sidebarLogoFade-enter-active {
  transition: opacity 1.5s;
}

.sidebarLogoFade-enter,
.sidebarLogoFade-leave-to {
  opacity: 0;
}
</style>
