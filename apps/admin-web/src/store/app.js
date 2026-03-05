import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    sidebar: {
      opened: true
    },
    sidebarLogo: true
  }),
  actions: {
    toggleSidebar() {
      this.sidebar.opened = !this.sidebar.opened
    }
  }
})
