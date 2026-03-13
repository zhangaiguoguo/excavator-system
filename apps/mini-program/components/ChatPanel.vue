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
        class="chat-item-row"
        :class="{ self: m.isSelf }"
      >
        <!-- 左侧 / 右侧头像 -->
        <view class="avatar" v-if="!m.isSelf">
          <text class="avatar-text">{{ (m.fromName || '对').slice(0, 1) }}</text>
        </view>
        <view class="chat-bubble">
          <text class="chat-text">{{ m.text }}</text>
          <view class="bubble-avatar">
            <uni-icons type="person" size="18" color="#ffffff" />
          </view>
        </view>
        <view class="avatar self-avatar" v-if="m.isSelf">
          <uni-icons type="person" size="18" color="#ffffff" />
        </view>
        <text class="row-time" v-if="m.ts">{{ fullTimeStr(m.ts) }}</text>
      </view>
      <view v-if="!messages.length" class="chat-empty">暂无消息，开始聊天吧～</view>
    </scroll-view>
    <!-- 右下角“刚刚”按钮 -->
    <view class="floating-btn" v-if="lastTimeText">
      {{ lastTimeText }}
    </view>
    <!-- 底部输入栏：语音 + 文本框 + 表情 + 加号 + 发送 -->
    <view class="chat-input-bar">
      <view class="icon-btn">
        <uni-icons type="mic" size="22" color="#333" />
      </view>
      <view class="input-wrapper">
        <input
          class="text-input"
          v-model="inputText"
          placeholder="请输入内容"
          placeholder-class="input-placeholder"
          confirm-type="send"
          @confirm="send"
        />
      </view>
      <view class="icon-btn">
        <uni-icons type="emoji" size="22" color="#333" />
      </view>
      <view class="icon-btn">
        <uni-icons type="plusempty" size="22" color="#333" />
      </view>
      <button class="send-btn" size="mini" :disabled="!canSend" @click="send">发送</button>
    </view>
  </view>
</template>

<script>
import appStore from '@/store/app';
import apiService from '@/api/api';
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
    lastTimeText() {
      if (!this.messages.length) return '';
      const last = this.messages[this.messages.length - 1];
      return this.timeStr(last.ts);
    },
    canSend() {
      return (this.inputText || '').trim().length > 0;
    },
  },
  mounted() {
    // 先拉取历史记录
    this.fetchHistory();
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
    fetchHistory() {
      const store = appStore();
      const myId = (store.state && store.state.userInfo && store.state.userInfo.id) || uni.getStorageSync('userId');
      if (!myId) return;
      // 按 refType + refId + otherUserId 作为一个会话拉取
      apiService
        .getChatMessages({
          refType: this.refType,
          refId: this.refId,
          otherUserId: this.otherUserId || undefined,
        })
        .then((res) => {
          const data = res?.data ?? res;
          const list = data?.list ?? (Array.isArray(data) ? data : []);
          this.messages = list.map((m) => ({
            text: m.content,
            fromName: '', // 当前样式不展示昵称
            fromUserId: String(m.fromUserId),
            ts: m.createTime,
            isSelf: myId && String(myId) === String(m.fromUserId),
          }));
          this.$nextTick(() => this.scrollToBottom());
        })
        .catch(() => {});
    },
    fullTimeStr(ts) {
      if (!ts) return '';
      const d = new Date(ts);
      if (Number.isNaN(d.getTime())) return '';
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      return `${y}/${m}/${day} ${hh}:${mm}`;
    },
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
  background: #f5f5f7;
  position: relative;
}
.chat-list {
  flex: 1;
  padding: 16px 16px 80px;
  box-sizing: border-box;
}
.chat-item-row {
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  margin-bottom: 12px;
}
.chat-item-row.self {
  flex-direction: row-reverse;
}
.avatar {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #00c777;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
}
.chat-item-row.self .avatar {
  margin-right: 0;
  margin-left: 8px;
  background: #c7c7cc;
}
.avatar-text {
  color: #fff;
  font-size: 16px;
  font-weight: 600;
}
.chat-bubble {
  max-width: 70%;
  padding: 8px 10px;
  border-radius: 8px;
  font-size: 14px;
  background: #f7f7f7;
  display: flex;
  align-items: center;
}
.chat-item-row.self .chat-bubble {
  background: #d2f5c4;
}
.chat-text {
  flex: 1;
  color: #111;
  word-break: break-all;
  line-height: 1.45;
}
.bubble-avatar {
  width: 28px;
  height: 28px;
  border-radius: 4px;
  background: #c7c7cc;
  margin-left: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.row-time {
  margin-left: 8px;
  font-size: 11px;
  color: #999;
  align-self: center;
}
.chat-empty {
  text-align: center;
  color: #999;
  font-size: 14px;
  padding: 24px 0;
}

.floating-btn {
  position: absolute;
  right: 16px;
  bottom: 72px;
  padding: 4px 12px;
  font-size: 12px;
  color: #1677ff;
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.12);
}

.chat-input-bar {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  padding-bottom: calc(8px + env(safe-area-inset-bottom));
  gap: 8px;
  background: #ffffff;
  border-top: 1px solid #e0e0e0;
}
.icon-btn {
  width: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.input-wrapper {
  flex: 1;
  background-color: #f5f5f7;
  border-radius: 20px;
  padding: 4px 10px;
  box-sizing: border-box;
}
.text-input {
  width: 100%;
  font-size: 14px;
}
.input-placeholder {
  color: #b3b3b3;
}
.send-btn {
  margin: 0;
  height: 30px;
  line-height: 30px;
  padding: 0 10px;
  font-size: 14px;
  background: #07c160;
  color: #fff;
  border-radius: 4px;
}
.send-btn[disabled] {
  background: #cfcfcf;
}
</style>

