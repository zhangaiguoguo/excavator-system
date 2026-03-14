<template>
  <view class="page">
    <view class="card tabs-card">
      <uni-segmented-control
        :current="current"
        :values="items.length ? items : ['全部', '待接单', '施工中', '已完成', '已取消']"
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
          <text class="device-name">{{ deviceName(item) }}</text>
          <text class="status-tag">{{ getStatusText(item.status) }}</text>
        </view>
        <view class="item-addr" v-if="item.serviceLocation">{{ item.serviceLocation }}</view>
        <view class="item-meta">
          <text class="item-time">{{ dateRangeStr(item) }}</text>
          <text class="item-amount" v-if="item.totalPrice != null">¥{{ Number(item.totalPrice).toFixed(2) }}</text>
        </view>
      </view>
    </view>
    <view v-if="!loading && contracts.length === 0" class="empty">暂无订单</view>
    <uni-load-more :status="loading ? 'loading' : (loadingMore ? 'loading' : (contracts.length >= total && total > 0 ? 'noMore' : (contracts.length > 0 ? 'more' : 'noMore')))" />
  </view>
</template>

<script>
import apiService from '@/api/api';
import appStore from '@/store/app';
import { useDictOne } from '@/hooks/useDict';

export default {
  data() {
    return {
      current: 0,
      items: [],
      contracts: [],
      order_status: useDictOne('order_status'),
      loading: false,
      loadingMore: false,
      page: 1,
      pageSize: 10,
      total: 0,
    };
  },
  computed: {
    tabItems() {
      const arr = (this.order_status && this.order_status.value) || this.order_status || [];
      const list = Array.isArray(arr) ? arr : [];
      return ['全部', ...list.map((i) => i.text || i.label)];
    },
  },
  watch: {
    tabItems: {
      immediate: true,
      handler(val) {
        if (val && val.length) this.items = val;
      },
    },
  },
  onLoad() {
    if (!this.items.length) this.items = ['全部', '待接单', '施工中', '已完成', '已取消'];
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
      if (this.current === 1) params.status = 0;
      else if (this.current === 2) params.status = 1;
      else if (this.current === 3) params.status = 2;
      else if (this.current === 4) params.status = 3;
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
      const arr = (this.order_status && this.order_status.value) || this.order_status || [];
      const list = Array.isArray(arr) ? arr : [];
      const item = list.find((i) => String(i.value) === String(status));
      return (item && (item.text || item.label)) || '未知';
    },
    deviceName(item) {
      const info = item.resourceInfo || {};
      const m = item.machine;
      return info.model || (m && (m.model || m.brand)) || item.contractNo || '订单';
    },
    dateRangeStr(item) {
      const s = item.serviceStartTime;
      const e = item.serviceEndTime;
      const fmt = (d) => {
        if (!d) return '';
        if (typeof d === 'string') return d.slice(0, 10);
        if (d instanceof Date) return d.toISOString().slice(0, 10);
        return '';
      };
      if (s && e) return fmt(s) + ' 至 ' + fmt(e);
      return fmt(s) || fmt(item.createTime);
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
.device-name { font-size: 15px; font-weight: 600; color: #333; flex: 1; margin-right: 8px; }
.status-tag {
  font-size: 12px;
  color: #4AB1F7;
  background: #e8f4fd;
  padding: 4px 10px;
  border-radius: 8px;
  flex-shrink: 0;
}
.item-addr { font-size: 13px; color: #666; margin-bottom: 4px; }
.item-meta { display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: #999; }
.item-amount { color: #FF4D4F; font-weight: 600; }
.empty { text-align: center; padding: 60px 20px; color: #999; }
</style>
