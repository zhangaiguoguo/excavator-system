import MinCache from './common/util/MinCache.js'
import tip from './common/util/tip.js'
import { http } from '@/common/service/service'
import {createPinia} from "pinia";

// #ifndef VUE3
import Vue from 'vue'
import App from './App'

Vue.config.productionTip = false

App.mpType = 'app'

const app = new Vue({
  ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
import App from './App.vue'
export function createApp() {
  const app = createSSRApp(App)
  // 注册缓存器
  app.use(MinCache, {
    timeout: 6
  })
  app.use(createPinia())
  app.config.globalProperties.$http = http
  app.config.globalProperties.$tip = tip
  return {
    app
  }
}
// #endif