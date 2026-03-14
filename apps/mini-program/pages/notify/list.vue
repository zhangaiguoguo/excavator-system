<template>
  <view class="page">
    <view v-if="!userId" class="empty">
      <text>请先登录</text>
    </view>
    <template v-else>
      <view class="toolbar">
        <view class="tabs">
          <view
            v-for="t in tabs"
            :key="t.key"
            class="tab"
            :class="{ active: activeTab === t.key }"
            @click="activeTab = t.key"
          >
            {{ t.label }}
          </view>
        </view>
        <view class="toolbar-right">
          <text class="unread-count" v-if="unreadCount > 0">未读 {{ unreadCount }}</text>
          <text class="read-all" @click="markAllRead">全部已读</text>
        </view>
      </view>
      <view class="list">
        <template v-if="activeTab === 'chat'">
          <view
            v-for="session in chatSessions"
            :key="session.key"
            class="chat-card"
            :class="{ unread: session.unreadCount > 0 }"
            @click="onChatSessionClick(session)"
          >
            <view class="chat-avatar">
              <text class="chat-avatar-text">{{ session.title.slice(0, 1) }}</text>
            </view>
            <view class="chat-main">
              <view class="chat-row">
                <text class="chat-title">{{ session.title }}</text>
                <text class="chat-time">{{ dateStr(session.lastTime) }}</text>
              </view>
              <view class="chat-row chat-preview-row">
                <text v-if="session.contentLabel" class="chat-type-tag">{{ session.contentLabel }}</text>
                <text class="chat-preview">{{ session.contentPreview || '新消息' }}</text>
                <view v-if="session.unreadCount > 0" class="chat-badge">
                  <text class="chat-badge-text">{{ session.unreadCount }}</text>
                </view>
              </view>
            </view>
          </view>
        </template>
        <template v-else>
          <view
            v-for="item in displayList"
            :key="item.id"
            class="card"
            :class="{ unread: item.isRead === 0 }"
            @click="onItemClick(item)"
          >
            <view class="card-head">
              <text class="title">{{ item.title }}</text>
              <text class="time">{{ dateStr(item.createTime) }}</text>
            </view>
            <view v-if="item.typeLabel" class="card-type-row">
              <text class="card-type-tag">{{ item.typeLabel }}</text>
            </view>
            <text class="content" v-if="item.content">{{ item.content }}</text>
          </view>
        </template>
      </view>
      <view v-if="!loading && list.length === 0" class="empty-tip">暂无消息</view>
      <uni-load-more :status="loading ? 'loading' : (list.length >= total && total > 0 ? 'noMore' : 'more')" />
    </template>
  </view>
</template>

<script>
import apiService from '@/api/api';
import appStore from '@/store/app';
import { getMessagePreview } from '@/common/util/chatMessageTypes.js';
import { RefType } from '@/common/util/constants';

export default {
  data() {
    return {
      list: [],
      loading: false,
      page: 1,
      pageSize: 20,
      total: 0,
      unreadCount: 0,
      activeTab: 'all',
      tabs: [
        { key: 'all', label: '全部' },
        { key: 'unread', label: '未读' },
        { key: 'chat', label: '聊天' },
        { key: 'system', label: '系统' },
      ],
    };
  },
  computed: {
    userId() {
      return (appStore().state.userInfo || {}).id || uni.getStorageSync('userId') || '';
    },
    displayList() {
      let arr = this.list;
      if (this.activeTab === 'unread') arr = arr.filter((n) => n.isRead === 0);
      else if (this.activeTab === 'chat') arr = arr.filter((n) => n.type === 'chat_message');
      else if (this.activeTab === 'system') arr = arr.filter((n) => n.type !== 'chat_message');
      return arr.map((n) => ({
        ...n,
        typeLabel: this.notificationTypeLabel(n.type),
      }));
    },
    chatSessions() {
      const map = new Map();
      this.list.forEach((n) => {
        if (n.type !== 'chat_message') return;
        const key = (n.refType || '') + ':' + (n.refId || '');
        if (!n.refType || !n.refId) return;
        const exist = map.get(key);
        const time = n.createTime;
        const { label, preview } = getMessagePreview(n.content || '');
        if (!exist) {
          map.set(key, {
            key,
            refType: n.refType,
            refId: n.refId,
            title: n.title || '聊天',
            content: n.content || '',
            contentLabel: label,
            contentPreview: preview || '新消息',
            lastTime: time,
            unreadCount: n.isRead === 0 ? 1 : 0,
            otherUserId: n.fromUserId || '',
          });
        } else {
          if (new Date(time) > new Date(exist.lastTime)) {
            exist.lastTime = time;
            exist.content = n.content || exist.content;
            const latest = getMessagePreview(exist.content || '');
            exist.contentLabel = latest.label;
            exist.contentPreview = latest.preview || '新消息';
            exist.title = n.title || exist.title;
            if (n.fromUserId) exist.otherUserId = n.fromUserId;
          }
          if (n.isRead === 0) exist.unreadCount += 1;
        }
      });
      return Array.from(map.values()).sort(
        (a, b) => new Date(b.lastTime).getTime() - new Date(a.lastTime).getTime(),
      );
    },
  },
  onLoad() {},
  onShow() {
    if (this.userId) this.fetch(true);
  },
  onReachBottom() {
    if (this.loading || this.list.length >= this.total) return;
    this.page++;
    this.fetch(false);
  },
  onPullDownRefresh() {
    this.fetch(true).finally(() => uni.stopPullDownRefresh());
  },
  methods: {
    notificationTypeLabel(type) {
      const map = {
        chat_message: '聊天',
        contract_invite: '订单邀请',
        contract_signed: '订单签约',
        contract_cancel: '订单取消',
        contract_complete: '订单完成',
        system: '系统通知',
      };
      return map[type] || (type ? '通知' : '');
    },
    dateStr(d) {
      if (!d) return '';
      const date = typeof d === 'string' ? new Date(d) : d;
      const now = new Date();
      const diff = now - date;
      if (diff < 60000) return '刚刚';
      if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前';
      if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前';
      if (diff < 86400000 * 7) return Math.floor(diff / 86400000) + '天前';
      return date.toLocaleDateString();
    },
    fetch(reset) {
      if (reset) {
        this.page = 1;
        this.loading = true;
      }
      return apiService
        .getNotifications({ page: this.page, pageSize: this.pageSize })
        .then((res) => {
          const data = res?.data ?? res;
          const arr = data?.list ?? (Array.isArray(data) ? data : []);
          const total = data?.total ?? arr.length;
          if (reset) this.list = arr;
          else this.list = this.list.concat(arr);
          this.total = total;
          this.unreadCount = this.list.filter((n) => n.isRead === 0).length;
        })
        .catch(() => {
          if (reset) this.list = [];
        })
        .finally(() => {
          this.loading = false;
        });
    },
    markAllRead() {
      apiService.markAllNotificationsRead().then(() => {
        this.$tip.success('已全部标为已读');
        this.unreadCount = 0;
        this.list.forEach((n) => (n.isRead = 1));
      });
    },
    onChatSessionClick(session) {
      // 标记该会话相关的通知为已读
      const related = this.list.filter(
        (n) =>
          n.type === 'chat_message' &&
          n.refType === session.refType &&
          String(n.refId) === String(session.refId) &&
          n.isRead === 0,
      );
      related.forEach((n) => {
        n.isRead = 1;
        apiService.markNotificationRead(n.id).catch(() => {});
      });
      this.unreadCount = this.list.filter((n) => n.isRead === 0).length;

      const title = encodeURIComponent(session.title || '聊天');
      let url = '/pages/chat/index?refType=' + session.refType + '&refId=' + session.refId + '&title=' + title;
      if (session.otherUserId) url += '&otherUserId=' + session.otherUserId;
      uni.navigateTo({ url });
    },
    onItemClick(item) {
      if (item.isRead === 0) {
        apiService.markNotificationRead(item.id).catch(() => {});
        item.isRead = 1;
        if (this.unreadCount > 0) this.unreadCount--;
      }
      if (item.refType === 'contract' && item.refId) {
        uni.navigateTo({ url: '/pages/contract/detail?id=' + item.refId });
      } else if ((item.refType === RefType.MACHINE || item.refType === RefType.DEMAND) && item.refId) {
        const title = encodeURIComponent(item.title || '聊天');
        let url = '/pages/chat/index?refType=' + item.refType + '&refId=' + item.refId + '&title=' + title;
        if (item.fromUserId) url += '&otherUserId=' + item.fromUserId;
        uni.navigateTo({ url });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #f5f6f8;
  padding-bottom: 40px;
}
.toolbar {
  display: flex;
  flex-direction: column;
  padding: 8px 16px 0;
  background: #fff;
  font-size: 13px;
}
.tabs {
  display: flex;
  border-bottom: 1px solid #f0f0f0;
}
.tab {
  padding: 8px 12px;
  font-size: 14px;
  color: #666;
}
.tab.active {
  color: #07c160;
  border-bottom: 2px solid #07c160;
}
.toolbar-right {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0 8px;
}
.unread-count {
  color: #ff5722;
}
.read-all {
  color: #4ab1f7;
}
.list {
  padding: 12px 16px;
}
.chat-card {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}
.chat-card.unread .chat-title {
  font-weight: 600;
}
.chat-avatar {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  background: #07c160;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
}
.chat-avatar-text {
  color: #fff;
  font-size: 18px;
}
.chat-main {
  flex: 1;
}
.chat-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}
.chat-title {
  font-size: 15px;
  color: #111;
  max-width: 70%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.chat-time {
  font-size: 12px;
  color: #999;
  margin-left: 8px;
}
.chat-preview-row {
  flex-wrap: wrap;
  gap: 4px 8px;
}
.chat-type-tag {
  font-size: 11px;
  color: #4AB1F7;
  background: rgba(74, 177, 247, 0.12);
  padding: 2px 6px;
  border-radius: 4px;
  flex-shrink: 0;
}
.chat-preview {
  font-size: 13px;
  color: #666;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  margin-right: 8px;
}
.chat-badge {
  min-width: 18px;
  padding: 0 6px;
  height: 18px;
  border-radius: 9px;
  background: #ff4d4f;
  display: flex;
  align-items: center;
  justify-content: center;
}
.chat-badge-text {
  color: #fff;
  font-size: 11px;
}
.card {
  background: #fff;
  border-radius: 12px;
  padding: 14px 16px;
  margin-bottom: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}
.card.unread {
  background: #f0f8ff;
}
.card-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 6px;
}
.card-type-row {
  margin-bottom: 4px;
}
.card-type-tag {
  font-size: 11px;
  color: #4AB1F7;
  background: rgba(74, 177, 247, 0.12);
  padding: 2px 8px;
  border-radius: 4px;
}
.title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  flex: 1;
}
.time {
  font-size: 12px;
  color: #999;
  margin-left: 8px;
}
.content {
  font-size: 13px;
  color: #666;
  line-height: 1.5;
}
.empty,
.empty-tip {
  text-align: center;
  padding: 40px 20px;
  color: #999;
  font-size: 14px;
}
</style>
