<template>
  <view class="page">
    <view class="card tabs-card">
      <uni-segmented-control
        :current="current"
        :values="items"
        @clickItem="onClickItem"
        styleType="text"
        activeColor="#4AB1F7"
      />
    </view>
    <view class="list">
      <view
        v-for="item in contracts"
        :key="item.id"
        class="card list-item"
        @click="goDetail(item.id)"
      >
        <view class="item-head">
          <text class="contract-no">{{ item.contractNo }}</text>
          <text class="status-tag">{{ getStatusText(item.status) }}</text>
        </view>
        <view class="item-meta">
          <text>{{ lessorName(item) }} · {{ lesseeName(item) }}</text>
        </view>
        <view class="item-time">{{ dateStr(item.createTime) }}</view>
      </view>
    </view>
    <view v-if="!loading && contracts.length === 0" class="empty">暂无合同</view>
    <uni-load-more :status="loading ? 'loading' : (loadingMore ? 'loading' : (contracts.length >= total && total > 0 ? 'noMore' : (contracts.length > 0 ? 'more' : 'noMore')))" />
  </view>
</template>

<script>
import apiService from '@/api/api';
import appStore from '@/store/app';

export default {
  data() {
    return {
      current: 0,
      items: ['全部', '待签署', '已生效', '已过期'],
      contracts: [],
      loading: false,
      loadingMore: false,
      page: 1,
      pageSize: 10,
      total: 0,
    };
  },
  onLoad() {
    this.fetchContracts(true);
  },
  onShow() {
    this.fetchContracts(true);
  },
  onReachBottom() {
    this.loadMore();
  },
  onPullDownRefresh() {
    this.fetchContracts(true).finally(() => uni.stopPullDownRefresh());
  },
  methods: {
    onClickItem(e) {
      if (this.current !== e.currentIndex) {
        this.current = e.currentIndex;
        this.fetchContracts(true);
      }
    },
    fetchContracts(reset = true) {
      if (reset) {
        this.page = 1;
        this.loading = true;
      } else {
        this.loadingMore = true;
      }
      const userId = (appStore().state.userInfo || {}).id || uni.getStorageSync('userId');
      const params = { page: this.page, pageSize: this.pageSize };
      if (userId) params.userId = userId;
      if (this.current === 1) params.status = 1;
      else if (this.current === 2) params.status = 2;
      else if (this.current === 3) params.status = 3;
      return apiService
        .getContracts(params)
        .then((res) => {
          const data = res?.data ?? res;
          const list = data?.list ?? (Array.isArray(data) ? data : []);
          const total = data?.total ?? list.length;
          if (reset) this.contracts = list;
          else this.contracts = this.contracts.concat(list);
          this.total = total;
        })
        .catch(() => {
          if (reset) this.contracts = [];
        })
        .finally(() => {
          this.loading = false;
          this.loadingMore = false;
        });
    },
    loadMore() {
      if (this.loading || this.loadingMore) return;
      if (this.contracts.length >= this.total) return;
      this.page++;
      this.fetchContracts(false);
    },
    getStatusText(status) {
      const map = { 0: '草稿', 1: '待签署', 2: '已生效', 3: '已过期', 4: '已终止' };
      return map[status] ?? '未知';
    },
    lessorName(item) {
      const u = item.lessor;
      return (u && (u.nickname || u.phone)) || '甲方';
    },
    lesseeName(item) {
      const u = item.lessee;
      return (u && (u.nickname || u.phone)) || '乙方';
    },
    dateStr(d) {
      if (!d) return '';
      if (typeof d === 'string') return d.slice(0, 10);
      if (d instanceof Date) return d.toISOString().slice(0, 10);
      return '';
    },
    goDetail(id) {
      uni.navigateTo({ url: '/pages/contract/detail?id=' + id });
    },
  },
};
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #F5F6F8;
  padding: 16px;
  padding-bottom: 40px;
}
.card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}
.tabs-card { padding: 8px; margin-bottom: 12px; }
.list-item {
  padding: 16px;
  margin-bottom: 12px;
}
.item-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.contract-no { font-size: 15px; font-weight: 600; color: #333; }
.status-tag {
  font-size: 12px;
  color: #4AB1F7;
  background: #e8f4fd;
  padding: 4px 10px;
  border-radius: 8px;
}
.item-meta { font-size: 13px; color: #666; margin-bottom: 4px; }
.item-time { font-size: 12px; color: #999; }
.empty { text-align: center; padding: 60px 20px; color: #999; }
</style>
