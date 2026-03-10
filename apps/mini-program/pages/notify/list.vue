<template>
  <view class="page">
    <view v-if="!userId" class="empty">
      <text>请先登录</text>
    </view>
    <template v-else>
      <view class="toolbar">
        <text class="unread-count" v-if="unreadCount > 0">未读 {{ unreadCount }}</text>
        <text class="read-all" @click="markAllRead">全部已读</text>
      </view>
      <view class="list">
        <view
          v-for="item in list"
          :key="item.id"
          class="card"
          :class="{ unread: item.isRead === 0 }"
          @click="onItemClick(item)"
        >
          <view class="card-head">
            <text class="title">{{ item.title }}</text>
            <text class="time">{{ dateStr(item.createTime) }}</text>
          </view>
          <text class="content" v-if="item.content">{{ item.content }}</text>
        </view>
      </view>
      <view v-if="!loading && list.length === 0" class="empty-tip">暂无消息</view>
      <uni-load-more :status="loading ? 'loading' : (list.length >= total && total > 0 ? 'noMore' : 'more')" />
    </template>
  </view>
</template>

<script>
import apiService from '@/api/api';
import appStore from '@/store/app';

export default {
  data() {
    return {
      list: [],
      loading: false,
      page: 1,
      pageSize: 20,
      total: 0,
      unreadCount: 0,
    };
  },
  computed: {
    userId() {
      return (appStore().state.userInfo || {}).id || uni.getStorageSync('userId') || '';
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
    onItemClick(item) {
      if (item.isRead === 0) {
        apiService.markNotificationRead(item.id).catch(() => {});
        item.isRead = 1;
        if (this.unreadCount > 0) this.unreadCount--;
      }
      if (item.refType === 'contract' && item.refId) {
        uni.navigateTo({ url: '/pages/contract/detail?id=' + item.refId });
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
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #fff;
  font-size: 13px;
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
