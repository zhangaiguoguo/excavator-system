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
        <view class="chat-avatar" v-if="!m.isSelf">
          <text class="chat-avatar-txt">{{ (m.fromName || '对').slice(0, 1) }}</text>
        </view>
        <view class="chat-bubble">
          <text class="chat-name" v-if="!m.isSelf">{{ m.fromName || '对方' }}</text>
          <text class="chat-text">{{ m.text }}</text>
          <text class="chat-time">{{ timeStr(m.ts) }}</text>
        </view>
        <view class="chat-avatar self-avatar" v-if="m.isSelf">
          <uni-icons type="person" size="20" color="#fff" />
        </view>
      </view>
      <view v-if="!messages.length" class="chat-empty">暂无消息，开始聊天吧～</view>
    </scroll-view>
    <view class="chat-input-row">
      <view class="input-wrap">
        <uni-easyinput
          v-model="inputText"
          type="textarea"
          placeholder="请输入内容"
          :maxlength="300"
          class="chat-input"
        />
      </view>
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
    /** 对方 userId，用于后端给对方发聊天通知（如机主回复时通知访客） */
    otherUserId: { type: String, default: '' },
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
      const isSelf = myId && data.fromUserId && String(myId) === String(data.fromUserId);
      // 自己发的消息已在 send() 里本地插入，不再重复添加，避免一条变两条
      if (isSelf) return;
      this.messages.push({
        text: data.text || '',
        fromName: data.fromName || '用户',
        fromUserId: data.fromUserId,
        ts: data.ts || new Date().toISOString(),
        isSelf: false,
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
      const diff = Date.now() - d.getTime();
      if (diff < 60000) return '刚刚';
      if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前';
      if (diff < 86400000) return d.toTimeString().slice(0, 5);
      return d.toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' }) + ' ' + d.toTimeString().slice(0, 5);
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
      const payload = {
        refType: this.refType,
        refId: String(this.refId),
        text,
        fromUserId: String(userId),
        fromName,
      };
      if (this.otherUserId) payload.toUserId = String(this.otherUserId);
      realtime.send('chat_message', payload);
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
  background: #ededed;
}
.chat-list {
  flex: 1;
  padding: 12px 12px 8px;
  box-sizing: border-box;
}
.chat-item-wrap {
  display: flex;
  align-items: flex-start;
  margin-bottom: 14px;
}
.chat-item-wrap.self {
  flex-direction: row-reverse;
}
.chat-avatar {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  background: #07c160;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.chat-avatar-txt {
  font-size: 18px;
  color: #fff;
  font-weight: 600;
}
.chat-item-wrap.self .chat-avatar.self-avatar {
  background: #c7c7cc;
}
.chat-bubble {
  max-width: 75%;
  padding: 10px 12px;
  border-radius: 4px;
  font-size: 15px;
  background: #fff;
  margin: 0 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
.chat-item-wrap.self .chat-bubble {
  background: #95ec69;
}
.chat-name {
  display: block;
  font-size: 12px;
  color: #888;
  margin-bottom: 2px;
}
.chat-text {
  display: block;
  color: #111;
  word-break: break-all;
  line-height: 1.45;
}
.chat-time {
  display: block;
  margin-top: 4px;
  font-size: 11px;
  color: #999;
  text-align: right;
}
.chat-empty {
  text-align: center;
  color: #999;
  font-size: 14px;
  padding: 24px 0;
}
.chat-input-row {
  display: flex;
  align-items: flex-end;
  padding: 8px 10px 10px;
  padding-bottom: calc(10px + env(safe-area-inset-bottom));
  gap: 8px;
  background: #f7f7f7;
  border-top: 1px solid #e0e0e0;
}
.input-wrap {
  flex: 1;
  min-height: 36px;
  background: #fff;
  border-radius: 4px;
  padding: 4px 10px;
  box-sizing: border-box;
}
.chat-input {
  min-height: 28px;
  font-size: 15px;
}
.chat-send {
  flex-shrink: 0;
  margin: 0;
  padding: 0 18px;
  height: 36px;
  line-height: 36px;
  font-size: 15px;
  border-radius: 4px;
  background: #07c160;
}
.chat-send[disabled] {
  background: #b2b2b2;
}
</style>

