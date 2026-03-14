<template>
  <view class="page">
    <view v-if="!userId" class="empty">
      <text>请先登录</text>
    </view>
    <template v-else>
      <view class="list">
        <view
          v-for="item in list"
          :key="item.key"
          class="chat-card"
          @click="onItemClick(item)"
        >
          <view class="chat-avatar">
            <image
              v-if="item.avatar"
              class="chat-avatar-img"
              :src="item.avatar"
              mode="aspectFill"
            />
            <text v-else class="chat-avatar-text">{{ (item.title || '聊').slice(0, 1) }}</text>
          </view>
          <view class="chat-main">
            <view class="chat-row">
              <text class="chat-title">{{ item.title || '未知用户' }}</text>
              <text class="chat-time">{{ dateStr(item.lastTime) }}</text>
            </view>
            <view class="chat-row chat-preview-row">
              <text v-if="item.contentLabel" class="chat-type-tag">{{ item.contentLabel }}</text>
              <text class="chat-preview">{{ item.contentPreview || '新消息' }}</text>
            </view>
          </view>
        </view>
      </view>
      <view v-if="!loading && list.length === 0" class="empty-tip">暂无聊天记录</view>
    </template>
  </view>
</template>

<script>
import apiService from '@/api/api';
import appStore from '@/store/app';
import { getMessagePreview } from '@/common/util/chatMessageTypes.js';

export default {
  data() {
    return {
      list: [],
      loading: false,
    };
  },
  computed: {
    userId() {
      return (appStore().state.userInfo || {}).id || uni.getStorageSync('userId') || '';
    },
  },
  onShow() {
    if (this.userId) this.fetch();
  },
  onPullDownRefresh() {
    this.fetch().finally(() => uni.stopPullDownRefresh());
  },
  methods: {
    dateStr(d) {
      if (!d) return '';
      const date = typeof d === 'string' ? new Date(d) : d;
      const now = new Date();
      const diff = now - date;
      if (diff < 60000) return '刚刚';
      if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前';
      if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前';
      if (diff < 86400000 * 7) return Math.floor(diff / 86400000) + '天前';
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const h = String(date.getHours()).padStart(2, '0');
      const min = String(date.getMinutes()).padStart(2, '0');
      if (date.toDateString() === now.toDateString()) return `${h}:${min}`;
      if (y === now.getFullYear()) return `${m}-${day} ${h}:${min}`;
      return `${y}-${m}-${day}`;
    },
    fetch() {
      this.loading = true;
      return apiService
        .getChatConversations()
        .then((res) => {
          const data = res?.data ?? res;
          const arr = data?.list ?? (Array.isArray(data) ? data : []);
          const withUser = arr.map((c) => {
            const key = `${c.refType}:${c.refId}:${c.otherUserId || ''}`;
            const { label, preview } = getMessagePreview(c.lastContent || '');
            return {
              ...c,
              key,
              title: '',
              avatar: '',
              contentLabel: label,
              contentPreview: preview || '新消息',
            };
          });
          this.list = withUser;
          withUser.forEach((item) => {
            if (!item.otherUserId) return;
            apiService.getUser(item.otherUserId).then((r) => {
              const u = r?.data ?? r;
              const name = (u && (u.nickname || u.realName)) || '用户';
              const av = (u && u.avatar) || '';
              const idx = this.list.findIndex((x) => x.key === item.key);
              if (idx >= 0) {
                this.$set(this.list[idx], 'title', name);
                this.$set(this.list[idx], 'avatar', typeof av === 'string' && av.trim() ? av : '');
              }
            }).catch(() => {});
          });
        })
        .catch(() => {
          this.list = [];
        })
        .finally(() => {
          this.loading = false;
        });
    },
    onItemClick(item) {
      const title = encodeURIComponent(item.title || '聊天');
      let url = '/pages/chat/index?refType=' + item.refType + '&refId=' + item.refId + '&title=' + title;
      if (item.otherUserId) url += '&otherUserId=' + item.otherUserId;
      uni.navigateTo({ url });
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
.empty {
  padding: 60px 20px;
  text-align: center;
  color: #999;
}
.list {
  padding: 12px 16px;
  background: #fff;
}
.chat-card {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}
.chat-card:active {
  background: #f8f8f8;
}
.chat-avatar {
  width: 48px;
  height: 48px;
  border-radius: 6px;
  background: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  flex-shrink: 0;
  overflow: hidden;
}
.chat-avatar-img {
  width: 100%;
  height: 100%;
  display: block;
}
.chat-avatar-text {
  color: #666;
  font-size: 20px;
  font-weight: 600;
}
.chat-main {
  flex: 1;
  min-width: 0;
}
.chat-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}
.chat-row:last-child {
  margin-bottom: 0;
}
.chat-title {
  font-size: 16px;
  font-weight: 500;
  color: #1a1a1a;
  flex-shrink: 0;
  margin-right: 8px;
}
.chat-time {
  font-size: 12px;
  color: #999;
  flex-shrink: 0;
}
.chat-preview-row {
  margin-top: 2px;
}
.chat-type-tag {
  font-size: 12px;
  color: #07c160;
  margin-right: 6px;
  flex-shrink: 0;
}
.chat-preview {
  font-size: 14px;
  color: #999;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
}
.empty-tip {
  padding: 40px 20px;
  text-align: center;
  color: #999;
  font-size: 14px;
}
</style>
