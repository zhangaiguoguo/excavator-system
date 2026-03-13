<template>
  <view class="page">
    <view class="header">
      <text class="title">{{ pageTitle }}</text>
    </view>
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
      pageTitle: '实时聊天',
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
  onUnload() {
  },
};
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #f5f6f8;
  display: flex;
  flex-direction: column;
}
.header {
  padding: 12px 16px;
  background: #fff;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.06);
}
.title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}
.body {
  flex: 1;
  padding: 8px 16px 16px;
}
</style>

