<template>
  <view class="page">
    <view class="header">
      <view class="search-row">
        <uni-search-bar
          v-model="keyword"
          placeholder="搜索需求描述/地址"
          bgColor="#f0f2f5"
          radius="20"
          @confirm="onSearch"
          @clear="onSearch"
        />
      </view>
      <view class="filter-row">
        <view
          v-for="item in filterTabs"
          :key="item.key"
          class="filter-tab"
          :class="{ active: filterActive === item.key }"
          @click="openFilter(item.key)"
        >
          <text>{{ item.label }}</text>
          <uni-icons type="bottom" size="12" :color="filterActive === item.key ? '#007aff' : '#666'"></uni-icons>
        </view>
      </view>
    </view>

    <uni-popup ref="filterPopup" type="bottom" background-color="#fff" border-radius="16 16 0 0">
      <view class="popup-content">
        <view class="popup-title">{{ filterTabs.find(t => t.key === filterActive)?.label || '筛选' }}</view>
        <view v-if="filterActive === 'type'" class="popup-section">
          <view class="section-label">需求类型</view>
          <view class="dict-options">
            <view
              v-for="opt in dictOptions.demand_type"
              :key="opt.value"
              class="dict-option"
              :class="{ on: filter.type === opt.value }"
              @click="filter.type = opt.value"
            >
              {{ opt.text }}
            </view>
          </view>
        </view>
        <view v-else-if="filterActive === 'area'" class="popup-section">
          <view class="section-label">省份</view>
          <uni-easyinput v-model="filter.province" placeholder="如：湖南省"></uni-easyinput>
          <view class="section-label">城市</view>
          <uni-easyinput v-model="filter.city" placeholder="如：长沙市"></uni-easyinput>
          <view class="section-label">区县</view>
          <uni-easyinput v-model="filter.district" placeholder="选填"></uni-easyinput>
        </view>
        <view v-else-if="filterActive === 'budget'" class="popup-section">
          <view class="section-label">预算区间（元）</view>
          <view class="input-row">
            <uni-easyinput v-model="filter.budgetMin" type="number" placeholder="最低"></uni-easyinput>
            <text class="to">-</text>
            <uni-easyinput v-model="filter.budgetMax" type="number" placeholder="最高"></uni-easyinput>
          </view>
        </view>
        <view v-else-if="filterActive === 'sort'" class="popup-section">
          <view class="dict-options">
            <view
              v-for="opt in sortOptions"
              :key="opt.value"
              class="dict-option"
              :class="{ on: filter.sort === opt.value }"
              @click="filter.sort = opt.value"
            >
              {{ opt.text }}
            </view>
          </view>
        </view>
        <view class="popup-actions">
          <button class="btn-reset" @click="resetFilter">重置</button>
          <button class="btn-confirm" @click="applyFilter">确定</button>
        </view>
      </view>
    </uni-popup>

    <view class="list">
      <view
        v-for="item in demands"
        :key="item.id"
        class="card"
        @click="goDetail(item.id)"
      >
        <view class="card-media">
          <swiper class="card-swiper" circular :indicator-dots="mediaItems(item).length > 1">
            <swiper-item v-for="(m, idx) in mediaItems(item)" :key="idx">
              <image
                v-if="m.type === 'image'"
                class="card-img"
                :src="getFileViewUrl(m.value) || '/static/default_machine.png'"
                mode="aspectFill"
              />
              <view v-else class="card-video-wrap" @click.stop>
                <video class="card-img" :src="getFileViewUrl(m.value)" controls />
                <view class="video-badge">视频</view>
              </view>
            </swiper-item>
          </swiper>
        </view>
        <view class="card-tag" :class="item.type === '2' ? 'job' : 'rent'">
          {{ item.type === '2' ? '招聘机手' : '求租设备' }}
        </view>
        <view class="card-body">
          <text class="card-desc">{{ descSlice(item.description) }}</text>
          <view class="card-meta">
            <uni-icons type="location-filled" size="14" color="#999" />
            <text>{{ item.province }}{{ item.city }}{{ item.district ? item.district : '' }}</text>
          </view>
          <view class="card-meta">
            <text>{{ dateStr(item.startDate) }} 至 {{ dateStr(item.endDate) }}</text>
          </view>
          <view class="card-footer">
            <text class="budget">{{ budgetText(item) }}</text>
            <text class="urgent" v-if="item.isUrgent === 'Y'">急</text>
          </view>
        </view>
      </view>
    </view>

    <uni-load-more :status="loading ? 'loading' : (loadingMore ? 'loading' : (demands.length >= total && total > 0 ? 'noMore' : (demands.length > 0 ? 'more' : 'noMore')))" />
    <view v-if="demands.length === 0 && !loading" class="empty">
      <uni-icons type="info-filled" size="64" color="#ddd" />
      <text>暂无需求</text>
    </view>

    <view class="fab" @click="goPublish">
      <uni-icons type="plusempty" size="28" color="#fff" />
    </view>
  </view>
</template>

<script>
import apiService, { getFileViewUrl } from '@/api/api';
import { useDictOne } from '@/hooks/useDict';
import { tryRefreshList } from '@/common/util/listRefresh.js';

export default {
  data() {
    return {
      keyword: '',
      demands: [],
      loading: false,
      loadingMore: false,
      page: 1,
      pageSize: 10,
      total: 0,
      filterActive: '',
      filter: {
        type: '',
        province: '',
        city: '',
        district: '',
        budgetMin: '',
        budgetMax: '',
        sort: 'latest',
      },
      filterTabs: [
        { key: 'type', label: '类型' },
        { key: 'area', label: '地区' },
        { key: 'budget', label: '预算' },
        { key: 'sort', label: '排序' },
      ],
      sortOptions: [
        { text: '最新发布', value: 'latest' },
        { text: '预算从低到高', value: 'price_asc' },
      ],
      dictOptions: {
        demand_type: useDictOne('demand_type'),
      },
    };
  },
  onLoad() {
    this.fetchDemands(true);
  },
  onShow() {
    tryRefreshList('demand', () => this.fetchDemands(true));
  },
  onReachBottom() {
    this.loadMore();
  },
  onPullDownRefresh() {
    this.fetchDemands(true).finally(() => uni.stopPullDownRefresh());
  },
  methods: {
    getFileViewUrl,
    mediaItems(item) {
      const list = [];
      if (item.video) list.push({ type: 'video', value: item.video });
      const imgs = Array.isArray(item.images) ? item.images : [];
      imgs.forEach((img) => list.push({ type: 'image', value: img }));
      if (list.length === 0) list.push({ type: 'image', value: null });
      return list;
    },
    descSlice(s) {
      if (!s) return '需求';
      return s.length > 36 ? s.slice(0, 36) + '...' : s;
    },
    dateStr(d) {
      if (!d) return '';
      if (typeof d === 'string') return d.slice(0, 10);
      if (d instanceof Date) return d.toISOString().slice(0, 10);
      return '';
    },
    budgetText(item) {
      if (item.budgetMin != null && item.budgetMax != null) return item.budgetMin + '-' + item.budgetMax + '元';
      if (item.budgetMin != null) return item.budgetMin + '元起';
      if (item.budgetMax != null) return '≤' + item.budgetMax + '元';
      return '面议';
    },
    onSearch() {
      this.fetchDemands(true);
    },
    openFilter(key) {
      this.filterActive = key;
      this.$refs.filterPopup.open();
    },
    resetFilter() {
      if (this.filterActive === 'type') this.filter.type = '';
      else if (this.filterActive === 'area') this.filter.province = this.filter.city = this.filter.district = '';
      else if (this.filterActive === 'budget') this.filter.budgetMin = this.filter.budgetMax = '';
      else if (this.filterActive === 'sort') this.filter.sort = 'latest';
    },
    applyFilter() {
      this.$refs.filterPopup.close();
      this.fetchDemands(true);
    },
    fetchDemands(reset = true) {
      if (reset) {
        this.page = 1;
        this.loading = true;
      } else {
        this.loadingMore = true;
      }
      const params = { page: this.page, pageSize: this.pageSize };
      if (this.filter.type) params.type = this.filter.type;
      if (this.filter.province) params.province = this.filter.province;
      if (this.filter.city) params.city = this.filter.city;
      if (this.filter.district) params.district = this.filter.district;
      if (this.filter.budgetMin) params.budgetMin = this.filter.budgetMin;
      if (this.filter.budgetMax) params.budgetMax = this.filter.budgetMax;
      if (this.keyword) params.keyword = this.keyword;
      if (this.filter.sort) params.sort = this.filter.sort;
      return apiService.getDemands(params).then((res) => {
        const data = res?.data ?? res;
        const list = data?.list ?? (Array.isArray(data) ? data : []);
        const total = data?.total ?? list.length;
        if (reset) this.demands = list;
        else this.demands = this.demands.concat(list);
        this.total = total;
      }).catch(() => {
        if (reset) this.demands = [];
      }).finally(() => {
        this.loading = false;
        this.loadingMore = false;
      });
    },
    loadMore() {
      if (this.loading || this.loadingMore) return;
      if (this.demands.length >= this.total) return;
      this.page++;
      this.fetchDemands(false);
    },
    goDetail(id) {
      uni.navigateTo({ url: '/pages/demand/detail?id=' + id });
    },
    goPublish() {
      uni.navigateTo({ url: '/pages/demand/add' });
    },
  },
};
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #f5f6f8;
  padding-bottom: 90px;
}
.header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: #fff;
  padding: 12px 16px;
  box-shadow: 0 1px 0 rgba(0,0,0,0.06);
}
.search-row { margin-bottom: 8px; }
.filter-row { display: flex; gap: 8px; }
.filter-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 13px;
  color: #666;
  padding: 8px 0;
  border-radius: 8px;
  &.active {
    color: #007aff;
    background: rgba(0, 122, 255, 0.08);
  }
}
.popup-content {
  padding: 20px 16px 40px;
  max-height: 70vh;
  overflow-y: auto;
}
.popup-title {
  font-size: 17px;
  font-weight: 600;
  margin-bottom: 16px;
}
.popup-section {
  margin-bottom: 16px;
  .section-label { font-size: 13px; color: #666; margin-bottom: 8px; }
  .input-row {
    display: flex;
    align-items: center;
    gap: 12px;
    .to { color: #999; }
  }
}
.dict-options {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.dict-option {
  padding: 8px 16px;
  font-size: 14px;
  color: #333;
  background: #f0f2f5;
  border-radius: 20px;
  &.on {
    background: rgba(0, 122, 255, 0.15);
    color: #007aff;
  }
}
.popup-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
  .btn-reset, .btn-confirm {
    flex: 1;
    height: 44px;
    line-height: 44px;
    border-radius: 22px;
    font-size: 15px;
    border: none;
  }
  .btn-reset { background: #f0f2f5; color: #666; }
  .btn-confirm { background: #007aff; color: #fff; }
}
.list { padding: 12px 16px; }
.card {
  background: #fff;
  border-radius: 12px;
  margin-bottom: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
  position: relative;
  overflow: hidden;
}
.card-media {
  width: 100%;
  height: 180px;
  background: #f0f2f5;
}
.card-swiper {
  width: 100%;
  height: 100%;
}
.card-img {
  width: 100%;
  height: 100%;
  background: #f0f2f5;
}
.card-video-wrap {
  position: relative;
  width: 100%;
  height: 100%;
}
.video-badge {
  position: absolute;
  top: 6px;
  right: 6px;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  background: rgba(0,0,0,0.5);
  color: #fff;
}
.card-tag {
  position: absolute;
  top: 12px;
  right: 12px;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  &.rent { background: #e3f2fd; color: #1976d2; }
  &.job { background: #f3e5f5; color: #7b1fa2; }
}
.card-body { padding: 14px 16px; padding-right: 70px; }
.card-desc {
  font-size: 15px;
  color: #1a1a1a;
  line-height: 1.45;
  display: block;
  margin-bottom: 8px;
}
.card-meta {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}
.card-footer {
  margin-top: 8px;
  font-size: 13px;
  color: #ff5a5f;
  .urgent {
    margin-left: 8px;
    color: #f44336;
    font-size: 12px;
  }
}
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 80px;
  color: #999;
  font-size: 14px;
}
.fab {
  position: fixed;
  right: 20px;
  bottom: 100px;
  width: 56px;
  height: 56px;
  border-radius: 28px;
  background: linear-gradient(135deg, #2196F3, #1976D2);
  box-shadow: 0 4px 16px rgba(33, 150, 243, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9;
}
</style>
