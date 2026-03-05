<template>
  <div class="app-wrapper">
    <div class="sidebar-container" :class="{ 'hide-sidebar': !sidebar.opened }">
      <Sidebar />
    </div>
    <div class="main-container" :class="{ 'hide-sidebar': !sidebar.opened }">
      <div class="fixed-header">
        <Navbar />
        <!-- <TagsView /> -->
      </div>
      <section class="app-main">
        <router-view v-slot="{ Component, route }">
          <transition name="fade-transform" mode="out-in">
            <component :is="Component" :key="route.path" />
          </transition>
        </router-view>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAppStore } from '@/store/app'
import { Sidebar, Navbar, TagsView } from './components'

const appStore = useAppStore()
const sidebar = computed(() => appStore.sidebar)
</script>

<style lang="scss" scoped>
.app-wrapper {
  position: relative;
  height: 100%;
  width: 100%;

  .sidebar-container {
    width: 200px;
    height: 100%;
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    z-index: 1001;
    overflow: hidden;
    transition: width 0.28s;
    background-color: #304156;

    &.hide-sidebar {
      width: 54px;
    }
  }

  .main-container {
    min-height: 100%;
    transition: margin-left 0.28s;
    margin-left: 200px;
    position: relative;

    &.hide-sidebar {
      margin-left: 54px;
    }
  }

  .fixed-header {
    position: fixed;
    top: 0;
    right: 0;
    z-index: 9;
    width: calc(100% - 200px);
    transition: width 0.28s;

    .hide-sidebar & {
      width: calc(100% - 54px);
    }
  }

  .app-main {
    min-height: calc(100vh - 64px);
    width: 100%;
    position: relative;
    overflow: hidden;
    padding-top: 90px;
  }
}
</style>
