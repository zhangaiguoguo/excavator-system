<template>
  <view class="chat-panel">
    <scroll-view
      class="chat-list"
      scroll-y
      :scroll-into-view="scrollIntoId"
    >
      <view
        v-for="(m, idx) in messages"
        :key="idx"
        :id="'msg-' + idx"
        class="chat-item-wrap"
        :class="{ self: m.isSelf }"
      >
        <view class="chat-bubble">
          <text class="chat-name" v-if="!m.isSelf">{{ m.fromName || '对方' }}</text>
          <text class="chat-text">{{ m.text }}</text>
          <text class="chat-time">{{ timeStr(m.ts) }}</text>
        </view>
      </view>
      <view v-if="!messages.length" class="chat-empty">暂无消息，开始聊天吧～</view>
    </scroll-view>
    <view class="chat-input-row">
      <uni-easyinput
        v-model="inputText"
        type="textarea"
        placeholder="请输入内容"
        :maxlength="300"
        class="chat-input"
      />
      <button class="chat-send" type="primary" :disabled="!canSend" @click="send">发送</button>
    </view>
  </view>
</template>

<script>
import appStore from '@/store/app';
import realtime from '@/common/service/realtime.js';

export default {
  name: 'ChatPanel',
  props: {
    refType: { type: String, required: true },
    refId: { type: [String, Number], required: true },
  },
  data() {
    return {
      messages: [],
      inputText: '',
      offRealtime: null,
      scrollIntoId: '',
    };
  },
  computed: {
    canSend() {
      return (this.inputText || '').trim().length > 0;
    },
  },
  mounted() {
    this.offRealtime = realtime.on((event, data) => {
      if (event !== 'chat_message') return;
      if (!data || String(data.refType) !== this.refType || String(data.refId) !== String(this.refId)) return;
      const store = appStore();
      const myId = (store.state && store.state.userInfo && store.state.userInfo.id) || uni.getStorageSync('userId');
      this.messages.push({
        text: data.text || '',
        fromName: data.fromName || '用户',
        fromUserId: data.fromUserId,
        ts: data.ts || new Date().toISOString(),
        isSelf: myId && data.fromUserId && String(myId) === String(data.fromUserId),
      });
      this.$nextTick(() => {
        this.scrollToBottom();
      });
    });
    realtime.subscribe(this.refType, this.refId);
  },
  beforeUnmount() {
    if (this.offRealtime) this.offRealtime();
    this.offRealtime = null;
    realtime.unsubscribe(this.refType, this.refId);
  },
  methods: {
    timeStr(ts) {
      if (!ts) return '';
      const d = new Date(ts);
      if (Number.isNaN(d.getTime())) return '';
      return d.toTimeString().slice(0, 5);
    },
    send() {
      const text = (this.inputText || '').trim();
      if (!text) return;
      const store = appStore();
      const user = (store.state && store.state.userInfo) || uni.getStorageSync('userInfo') || {};
      const userId = user.id || uni.getStorageSync('userId');
      if (!userId) {
        this.$tip && this.$tip.alert('请先登录');
        return;
      }
      const fromName = user.nickname || '我';
      const now = new Date().toISOString();
      // 本地先插入一条自己的消息
      this.messages.push({
        text,
        fromName,
        fromUserId: String(userId),
        ts: now,
        isSelf: true,
      });
      this.inputText = '';
      this.$nextTick(() => {
        this.scrollToBottom();
      });
      realtime.send('chat_message', {
        refType: this.refType,
        refId: String(this.refId),
        text,
        fromUserId: String(userId),
        fromName,
      });
    },
    scrollToBottom() {
      if (!this.messages.length) return;
      this.scrollIntoId = 'msg-' + (this.messages.length - 1);
    },
  },
};
</script>

<style lang="scss" scoped>
.chat-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #e5e5e5;
}
.chat-list {
  flex: 1;
  padding: 10px 12px;
  box-sizing: border-box;
}
.chat-item-wrap {
  display: flex;
  margin-bottom: 10px;
}
.chat-item-wrap.self {
  justify-content: flex-end;
}
.chat-bubble {
  max-width: 80%;
  padding: 8px 10px;
  border-radius: 6px;
  font-size: 14px;
  background: #fff;
}
.chat-item-wrap.self .chat-bubble {
  background: #95ec69;
}
.chat-name {
  font-size: 11px;
  color: #666;
}
.chat-text {
  display: block;
  margin-top: 2px;
  color: #111;
  word-break: break-all;
}
.chat-time {
  display: block;
  margin-top: 2px;
  font-size: 10px;
  color: #999;
  text-align: right;
}
.chat-empty {
  text-align: center;
  color: #999;
  font-size: 13px;
  padding: 20px 0;
}
.chat-input-row {
  display: flex;
  align-items: flex-end;
  padding: 8px 10px;
  gap: 8px;
  background: #f7f7f7;
  border-top: 1px solid #e0e0e0;
}
.chat-input {
  flex: 1;
  min-height: 36px;
}
.chat-send {
  flex-shrink: 0;
  margin: 0;
  padding: 0 16px;
  height: 36px;
  line-height: 36px;
}
</style>

