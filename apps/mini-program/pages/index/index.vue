<template>
  <view class="page">
    <!-- 顶部导航 + 搜索 -->
    <view class="top-bar">
      <view class="navbar">
        <view class="brand">
          <image src="/static/logo.png" class="nav-logo" mode="aspectFit" />
          <text class="brand-name">挖掘机之家</text>
        </view>
      </view>
      <view class="search-wrap" @click="goSearch">
        <uni-icons type="search" size="16" color="#999" />
        <text class="search-placeholder">搜索挖机、找活...</text>
      </view>
    </view>

    <!-- 一级分类导航：横向滚动 -->
    <scroll-view scroll-x class="category-nav" show-scrollbar="false" :scroll-into-view="'cat-0'">
      <view
        v-for="(item, index) in categoryTabs"
        :id="'cat-' + index"
        :key="item.key"
        class="category-item"
        :class="{ active: categoryActive === item.key }"
        @click="onCategory(item)"
      >
        {{ item.label }}
      </view>
    </scroll-view>

    <!-- Banner 轮播 -->
    <view class="banner-wrap card">
      <swiper
        class="banner-swiper"
        circular
        autoplay
        interval="4000"
        duration="500"
        indicator-dots
        indicator-active-color="#4AB1F7"
        indicator-color="rgba(255,255,255,0.5)"
      >
        <swiper-item v-for="(item, i) in banners" :key="i">
          <view class="banner-item">
            <image :src="item" mode="aspectFill" class="banner-img" lazy-load />
          </view>
        </swiper-item>
      </swiper>
    </view>

    <!-- 快捷分类入口：一行 5 个圆形图标 -->
    <view class="quick-section card">
      <view class="quick-grid">
        <view
          v-for="(item, index) in quickMenus"
          :key="index"
          class="quick-item"
          @click="handleMenuClick(item)"
          hover-class="quick-hover"
        >
          <view class="quick-icon-wrap">
            <image :src="item.image" mode="aspectFit" class="quick-icon" />
          </view>
          <text class="quick-text">{{ item.text }}</text>
        </view>
      </view>
    </view>

    <!-- 活动卡片区：两个渐变卡片（设计规范） -->
    <view class="activity-row">
      <ActivityCard title="热门设备" desc="优质好机 随时调配" theme="activity-blue" @click="goMoreMachine" />
      <ActivityCard title="发布需求" desc="求租/招人 快速对接" theme="activity-green" @click="goDemandAdd" />
    </view>

    <!-- 商品推荐区：猜你喜欢，两列 -->
    <view class="section card">
      <view class="section-head">
        <text class="section-title">猜你喜欢</text>
        <view class="section-more" @click="goMoreMachine">
          <text>更多</text>
          <uni-icons type="right" size="12" color="#999" />
        </view>
      </view>
      <view class="product-grid">
        <view
          v-for="item in recommendMachines"
          :key="item.id"
          class="product-card"
          @click="goDetail(item.id)"
        >
          <view class="product-img-wrap">
            <image
              :src="(item.images && item.images[0]) || '/static/default_machine.png'"
              mode="aspectFill"
              class="product-img"
              lazy-load
            />
            <view v-if="item.conditionType" class="product-tag">{{ conditionLabel(item.conditionType) }}</view>
          </view>
          <view class="product-info">
            <text class="product-name">{{ item.model || '挖机' }}</text>
            <view class="product-meta">
              <uni-icons type="location-filled" size="12" color="#999" />
              <text>{{ item.province }}{{ item.city || '' }}</text>
            </view>
            <view class="product-price">
              <text class="sym">¥</text>
              <text class="amount">{{ item.rentAmount || '—' }}</text>
              <text class="unit">/{{ rentUnitLabel(item.rentUnit) }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 最新需求 -->
    <view class="section card">
      <view class="section-head">
        <text class="section-title">最新需求</text>
        <view class="section-more" @click="goDemandList">
          <text>更多</text>
          <uni-icons type="right" size="12" color="#999" />
        </view>
      </view>
      <view class="demand-list">
        <view
          v-for="item in latestDemands"
          :key="item.id"
          class="demand-row"
          @click="goDemandDetail(item.id)"
        >
          <text class="demand-desc">{{ descSlice(item.description) }}</text>
          <text class="demand-budget">{{ budgetText(item) }}</text>
        </view>
      </view>
    </view>
    <view class="safe-bottom" />
  </view>
</template>

<script>
import apiService from '@/api/api';
import { useDictOne } from '@/hooks/useDict';
import ActivityCard from '@/components/ActivityCard.vue';

export default {
  components: { ActivityCard },
  data() {
    return {
      categoryActive: 'home',
      categoryTabs: [
        { key: 'home', label: '首页' },
        { key: 'machine', label: '找挖机' },
        { key: 'demand', label: '需求' },
        { key: 'publish', label: '我的发布' },
        { key: 'fav', label: '收藏' },
      ],
      banners: [
        'https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=600&q=60',
        'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=60',
      ],
      quickMenus: [
        { text: '发布设备', image: '/static/swiper/excavator.svg', path: '/pages/machine/add' },
        { text: '发布需求', image: '/static/swiper/earthwork.svg', path: '/pages/demand/add' },
        { text: '我的合同', image: '/static/swiper/transport.svg', path: '/pages/contract/list' },
        { text: '记账本', image: '/static/swiper/crane.svg', path: '/pages/record/list' },
        { text: '我的收藏', image: '/static/swiper/bucket.svg', path: '/pages/user/fav' },
      ],
      recommendMachines: [],
      latestDemands: [],
      work_hours_unit: useDictOne('work_hours_unit'),
      machine_condition: useDictOne('machine_condition'),
    };
  },
  onLoad() {
    this.fetchRecommend();
    this.fetchDemands();
  },
  onPullDownRefresh() {
    Promise.all([this.fetchRecommend(), this.fetchDemands()]).finally(() =>
      uni.stopPullDownRefresh()
    );
  },
  methods: {
    fetchRecommend() {
      return apiService
        .getMachines({ sort: 'latest', page: 1, pageSize: 6 })
        .then((res) => {
          const data = res?.data ?? res;
          const list = data?.list ?? (Array.isArray(data) ? data : []);
          this.recommendMachines = list;
        })
        .catch(() => {
          this.recommendMachines = [];
        });
    },
    fetchDemands() {
      return apiService
        .getDemands({ sort: 'latest', page: 1, pageSize: 4 })
        .then((res) => {
          const data = res?.data ?? res;
          const list = data?.list ?? (Array.isArray(data) ? data : []);
          this.latestDemands = list;
        })
        .catch(() => {
          this.latestDemands = [];
        });
    },
    goSearch() {
      uni.navigateTo({ url: '/pages/machine/list?focus=true' });
    },
    onCategory(item) {
      if (item.key === 'home') return;
      if (item.key === 'machine') uni.switchTab({ url: '/pages/machine/list' });
      else if (item.key === 'demand') uni.switchTab({ url: '/pages/demand/list' });
      else if (item.key === 'publish') uni.navigateTo({ url: '/pages/user/publish' });
      else if (item.key === 'fav') uni.navigateTo({ url: '/pages/user/fav' });
    },
    handleMenuClick(item) {
      uni.navigateTo({ url: item.path });
    },
    goMoreMachine() {
      uni.switchTab({ url: '/pages/machine/list' });
    },
    goDemandAdd() {
      uni.navigateTo({ url: '/pages/demand/add' });
    },
    goDemandList() {
      uni.switchTab({ url: '/pages/demand/list' });
    },
    goDetail(id) {
      uni.navigateTo({ url: '/pages/machine/detail?id=' + id });
    },
    goDemandDetail(id) {
      uni.navigateTo({ url: '/pages/demand/detail?id=' + id });
    },
    rentUnitLabel(v) {
      const arr = this.work_hours_unit?.value ?? this.work_hours_unit ?? [];
      const o = arr.find((d) => d.value === v);
      return o ? o.text : '天';
    },
    conditionLabel(v) {
      const arr = this.machine_condition?.value ?? this.machine_condition ?? [];
      const o = arr.find((x) => x.value === v);
      return o ? o.text : v || '';
    },
    descSlice(s) {
      if (!s) return '需求';
      return s.length > 24 ? s.slice(0, 24) + '...' : s;
    },
    budgetText(item) {
      if (item.budgetMin != null && item.budgetMax != null)
        return item.budgetMin + '-' + item.budgetMax + '元';
      if (item.budgetMin != null) return item.budgetMin + '元起';
      if (item.budgetMax != null) return '≤' + item.budgetMax + '元';
      return '面议';
    },
  },
};
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #F5F6F8;
  padding-bottom: 24px;
}

.top-bar {
  background: #fff;
  padding: 44px 16px 12px 16px;
  padding-top: calc(44px + constant(safe-area-inset-top));
  padding-top: calc(44px + env(safe-area-inset-top));
}

.navbar .brand {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  .nav-logo {
    width: 28px;
    height: 28px;
    margin-right: 8px;
  }
  .brand-name {
    font-size: 18px;
    font-weight: 800;
    color: #333;
  }
}

.search-wrap {
  height: 36px;
  border-radius: 18px;
  background: #F1F2F4;
  padding: 0 16px;
  display: flex;
  align-items: center;
  .search-placeholder {
    font-size: 14px;
    color: #999;
    margin-left: 8px;
  }
}

/* 一级分类导航 */
.category-nav {
  white-space: nowrap;
  padding: 12px 16px;
  background: #fff;
  margin-bottom: 12px;
}
.category-item {
  display: inline-block;
  font-size: 14px;
  color: #999;
  margin-right: 20px;
  padding: 4px 0;
  &.active {
    color: #333;
    font-weight: 600;
  }
}

/* Banner */
.banner-wrap {
  padding: 0;
  margin: 0 16px 16px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}
.banner-swiper {
  height: 140px;
  border-radius: 16px;
}
.banner-item .banner-img {
  width: 100%;
  height: 100%;
}

/* 快捷入口 */
.quick-section {
  margin: 0 16px 16px;
}
.quick-grid {
  display: flex;
  justify-content: space-between;
}
.quick-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 20%;
}
.quick-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e8f4fd 0%, #d6ebfa 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 6px;
}
.quick-icon {
  width: 28px;
  height: 28px;
}
.quick-text {
  font-size: 12px;
  color: #666;
}
.quick-hover {
  opacity: 0.85;
}

/* 活动卡片区 */
.activity-row {
  display: flex;
  gap: 12px;
  padding: 0 16px 16px;
}

/* 商品区 */
.section {
  margin: 0 16px 16px;
}
.section-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.section-title {
  font-size: 17px;
  font-weight: 700;
  color: #333;
}
.section-more {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #999;
}

.product-grid {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -6px;
}
.product-card {
  width: 50%;
  padding: 0 6px 12px;
  box-sizing: border-box;
}
.product-img-wrap {
  position: relative;
  width: 100%;
  padding-bottom: 100%;
  border-radius: 12px;
  overflow: hidden;
  background: #f0f2f5;
}
.product-img {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}
.product-tag {
  position: absolute;
  top: 8px;
  left: 8px;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
}
.product-info {
  padding: 8px 0 0;
}
.product-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.product-meta {
  font-size: 11px;
  color: #999;
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
}
.product-price {
  margin-top: 6px;
  color: #FF4D4F;
  .sym { font-size: 12px; font-weight: 700; }
  .amount { font-size: 16px; font-weight: 800; margin: 0 2px; }
  .unit { font-size: 11px; color: #999; font-weight: normal; }
}

.demand-list {
  padding: 0;
}
.demand-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f2f5;
  &:last-child {
    border-bottom: none;
  }
}
.demand-desc {
  flex: 1;
  font-size: 14px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-right: 8px;
}
.demand-budget {
  font-size: 14px;
  font-weight: 600;
  color: #FF4D4F;
  flex-shrink: 0;
}

.safe-bottom {
  height: constant(safe-area-inset-bottom);
  height: env(safe-area-inset-bottom);
}
</style>
