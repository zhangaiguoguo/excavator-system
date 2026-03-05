<template>
  <div class="scroll-container" ref="scrollContainer" @wheel.prevent="handleScroll">
    <div class="scroll-wrapper" ref="scrollWrapper" :style="{ left: left + 'px' }">
      <slot />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const scrollContainer = ref(null)
const scrollWrapper = ref(null)
const left = ref(0)

const handleScroll = (e) => {
  const eventDelta = e.wheelDelta || -e.deltaY * 40
  const $scrollWrapper = scrollWrapper.value
  const $scrollContainer = scrollContainer.value
  const $containerWidth = $scrollContainer.offsetWidth
  const $wrapperWidth = $scrollWrapper.offsetWidth

  if (eventDelta > 0) {
    left.value = Math.min(0, left.value + eventDelta)
  } else {
    if ($containerWidth - 100 < $wrapperWidth) {
      if (left.value < -($wrapperWidth - $containerWidth + 100)) {
        left.value = left.value
      } else {
        left.value = Math.max(left.value + eventDelta, $containerWidth - $wrapperWidth - 100)
      }
    } else {
      left.value = 0
    }
  }
}
</script>

<style lang="scss" scoped>
.scroll-container {
  white-space: nowrap;
  position: relative;
  overflow: hidden;
  width: 100%;
  
  .scroll-wrapper {
    position: absolute;
  }
}
</style>