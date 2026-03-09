<template>
  <view
    class="activity-card"
    :class="[theme]"
    @click="$emit('click')"
  >
    <text class="activity-title">{{ title }}</text>
    <text v-if="desc" class="activity-desc">{{ desc }}</text>
    <slot />
  </view>
</template>

<script>
/**
 * 活动区渐变卡片 - 设计规范：大圆角、蓝/绿渐变、白色文字
 * 使用: <ActivityCard title="热门设备" desc="优质好机" theme="activity-blue" @click="..." />
 */
export default {
  name: 'ActivityCard',
  props: {
    title: { type: String, required: true },
    desc: { type: String, default: '' },
    theme: {
      type: String,
      default: 'activity-blue',
      validator: (v) => ['activity-blue', 'activity-green'].includes(v),
    },
  },
};
</script>

<style lang="scss" scoped>
.activity-card {
  flex: 1;
  min-height: 80px;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
.activity-blue {
  background: linear-gradient(135deg, #43c6f1 0%, #4ab1f7 100%);
  color: #fff;
}
.activity-green {
  background: linear-gradient(135deg, #5ad0c8 0%, #62e2a0 100%);
  color: #fff;
}
.activity-title {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 4px;
}
.activity-desc {
  font-size: 12px;
  opacity: 0.95;
}
</style>
