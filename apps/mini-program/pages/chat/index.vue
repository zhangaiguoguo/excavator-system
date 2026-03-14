<template>
  <view class="chat-page">
    <!-- 上：标题栏 -->
    <view class="chat-header">
      <view class="header-left" @click="goBack">
        <uni-icons type="back" size="22" color="#000" />
      </view>
      <view class="header-title">{{ pageTitle }}</view>
      <view class="header-right" @click="onMore">
        <uni-icons type="more" size="22" color="#000" />
      </view>
    </view>

    <!-- 中：聊天内容区（占满剩余高度） -->
    <view class="chat-body">
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

export default {
  components: { ChatPanel },
  data() {
    return {
      refType: '',
      refId: '',
      otherUserId: '',
      pageTitle: '跟TA聊天',
    };
  },
  onLoad(options) {
    this.refType = options.refType || '';
    this.refId = options.refId || '';
    const name = (options.title && decodeURIComponent(options.title)) || '';
    this.pageTitle = name ? '跟' + name + '聊天' : '跟TA聊天';
    this.otherUserId = options.otherUserId || '';
  },
  methods: {
    goBack() {
      uni.navigateBack();
    },
    onMore() {},
  },
};
</script>

<style lang="scss" scoped>
.chat-page {
  height: 100vh;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  background: #ededed;
  box-sizing: border-box;
  overflow: hidden;
}

.chat-header {
  flex-shrink: 0;
  min-height: 44px;
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);
  padding-left: 4px;
  padding-right: 4px;
  padding-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-bottom: 1px solid #e7e7e7;
}

.header-left,
.header-right {
  width: 44px;
  min-width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.header-title {
  flex: 1;
  min-width: 0;
  text-align: center;
  font-size: 16px;
  font-weight: 600;
  color: #000;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  word-break: break-all;
  padding: 0 4px;
  line-height: 1.35;
}

.chat-body {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
}
</style>
