<template>
  <view class="page">
    <!-- 顶部导航栏：返回 + 标题 + 更多 -->
    <view class="nav-bar">
      <view class="nav-left" @click="goBack">
        <uni-icons type="back" size="20" color="#333" />
      </view>
      <view class="nav-title">{{ pageTitle }}</view>
      <view class="nav-right" @click="onMore">
        <uni-icons type="more" size="20" color="#333" />
      </view>
    </view>

    <!-- 聊天内容区 -->
    <view class="body">
      <ChatPanel
        v-if="refType && refId"
        :refType="refType"
        :refId="refId"
        :otherUserId="otherUserId"
      />
    </view>
  </view>
</template>

<script>
import ChatPanel from '@/components/ChatPanel.vue';
import realtime from '@/common/service/realtime.js';

export default {
  components: { ChatPanel },
  data() {
    return {
      refType: '',
      refId: '',
      otherUserId: '',
      pageTitle: 'uniCloud报警小助手',
    };
  },
  onLoad(options) {
    const refType = options.refType || '';
    const refId = options.refId || '';
    const title = options.title || '';
    const otherUserId = options.otherUserId || '';
    this.refType = refType;
    this.refId = refId;
    this.otherUserId = otherUserId;
    if (title) this.pageTitle = decodeURIComponent(title);
  },
  methods: {
    goBack() {
      uni.navigateBack();
    },
    onMore() {
      // 预留“更多”操作入口
    },
  },
  onUnload() {},
};
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #f5f6f8;
  display: flex;
  flex-direction: column;
}

.nav-bar {
  padding: 44px 16px 10px;
  padding-top: calc(44px + constant(safe-area-inset-top));
  padding-top: calc(44px + env(safe-area-inset-top));
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.06);
}

.nav-left,
.nav-right {
  width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-title {
  flex: 1;
  text-align: center;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.body {
  flex: 1;
  background: #f5f6f8;
}
</style>

      