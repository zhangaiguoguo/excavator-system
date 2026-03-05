/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'vue-cropper' {
  import type { DefineComponent } from 'vue'
  export const VueCropper: DefineComponent<{}, {}, any>
}
