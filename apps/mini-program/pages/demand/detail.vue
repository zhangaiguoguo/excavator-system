<template>
  <view class="page">
    <view v-if="loading" class="loading-wrap">
      <uni-load-more status="loading" />
    </view>
    <template v-else-if="demand.id">
      <!-- 轮播图/视频 -->
      <view v-if="mediaItems(demand).length" class="card banner-card">
        <swiper class="banner" indicator-dots circular indicator-active-color="#4AB1F7" @change="onBannerSwiperChange">
          <swiper-item v-for="(m, idx) in mediaItems(demand)" :key="idx">
            <image
              v-if="m.type === 'image'"
              :src="getFileViewUrl(m.value) || '/static/default_machine.png'"
              mode="aspectFill"
              class="banner-img"
            />
            <view v-else class="banner-video-wrap" @click.stop>
              <video id="banner-video-demand" class="banner-img" :src="getFileViewUrl(m.value)" autoplay muted controls />
              <view class="video-badge">视频</view>
            </view>
          </swiper-item>
        </swiper>
      </view>
      <!-- 类型与状态 -->
      <view class="card head-card">
        <view class="tag-row">
          <text class="tag type-tag">{{ demand.type === '2' ? '招聘机手' : '求租设备' }}</text>
          <text class="tag status-tag">{{ statusText }}</text>
        </view>
        <view class="budget-row">
          <text class="label">预算</text>
          <text class="budget">{{ budgetText(demand) }}</text>
        </view>
        <view class="date-row">
          <uni-icons type="calendar" size="16" color="#999" />
          <text>{{ dateStr(demand.startDate) }} 至 {{ dateStr(demand.endDate) }}</text>
        </view>
      </view>

      <!-- 施工地址 -->
      <view class="card">
        <view class="section-title">施工地址</view>
        <view class="addr-row">
          <uni-icons type="location-filled" size="16" color="#4AB1F7" />
          <text>{{ demand.province }}{{ demand.city }}{{ demand.district || '' }} {{ demand.address }}</text>
        </view>
      </view>

      <!-- 需求描述 -->
      <view class="card">
        <view class="section-title">需求描述</view>
        <text class="desc">{{ demand.description || '暂无' }}</text>
      </view>

      <!-- 发布人（机主/施工方） -->
      <view class="card" v-if="demand.user">
        <view class="section-title">发布人</view>
        <view class="user-row">
          <text>{{ demand.user.nickname || '用户' }}</text>
          <text class="phone" @click="contactUser">{{ demand.user.phone || '暂无电话' }}</text>
        </view>
      </view>

      <!-- 底部操作 -->
      <view class="footer-bar">
        <button class="btn-contact" @click="contactUser">联系对方</button>
        <button
          v-if="demand.status === '1' && !isMyDemand"
          type="primary"
          class="btn-order"
          @click="goTakeOrder"
        >
          接单（发起合同）
        </button>
      </view>
    </template>
    <view v-else class="empty">需求不存在或已下架</view>
    <view class="safe-bottom" />
  </view>
</template>

<script>
import apiService, { getFileViewUrl } from '@/api/api';
import appStore from '@/store/app';

export default {
  data() {
    return {
      demand: {},
      loading: true,
    };
  },
  computed: {
    statusText() {
      const s = this.demand.status;
      if (s === '0') return '已关闭';
      if (s === '2') return '已完成';
      return '进行中';
    },
    isMyDemand() {
      const uid = (appStore().state.userInfo || {}).id || uni.getStorageSync('userId');
      return String(this.demand.userId) === String(uid);
    },
  },
  onLoad(options) {
    if (options.id) this.fetchDetail(options.id);
    else this.loading = false;
  },
  methods: {
    getFileViewUrl,
    mediaItems(item) {
      const list = [];
      if (item && item.video) list.push({ type: 'video', value: item.video });
      const imgs = Array.isArray(item && item.images) ? item.images : [];
      imgs.forEach((img) => list.push({ type: 'image', value: img }));
      return list;
    },
    onBannerSwiperChange(e) {
      const items = this.mediaItems(this.demand);
      const videoIdx = items.findIndex((m) => m.type === 'video');
      if (videoIdx >= 0 && e.detail.current !== videoIdx) {
        const ctx = uni.createVideoContext('banner-video-demand', this);
        if (ctx && ctx.pause) ctx.pause();
      }
    },
    fetchDetail(id) {
      this.loading = true;
      apiService
        .getDemand(id)
        .then((res) => {
          const data = res?.data ?? res;
          this.demand = data || {};
        })
        .catch(() => {
          this.demand = {};
        })
        .finally(() => {
          this.loading = false;
        });
    },
    dateStr(d) {
      if (!d) return '';
      if (typeof d === 'string') return d.slice(0, 10);
      if (d instanceof Date) return d.toISOString().slice(0, 10);
      return '';
    },
    budgetText(item) {
      if (item.budgetMin != null && item.budgetMax != null)
        return item.budgetMin + '-' + item.budgetMax + '元';
      if (item.budgetMin != null) return item.budgetMin + '元起';
      if (item.budgetMax != null) return '≤' + item.budgetMax + '元';
      return '面议';
    },
    contactUser() {
      const phone = this.demand?.user?.phone;
      if (phone) uni.makePhoneCall({ phoneNumber: String(phone) });
      else this.$tip.alert('暂无联系方式');
    },
    goTakeOrder() {
      // 接单 = 去发起合同，关联本需求 + 选择我的设备
      uni.navigateTo({
        url: '/pages/contract/create?demandId=' + this.demand.id,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #F5F6F8;
  padding: 16px;
  padding-bottom: 100px;
}
.loading-wrap {
  padding: 40px 0;
}
.card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  padding: 16px;
  margin-bottom: 12px;
}
.banner-card { padding: 0; margin: 0 16px 12px; }
.banner { height: 240px; border-radius: 16px; }
.banner-img { width: 100%; height: 100%; }
.banner-video-wrap { position: relative; width: 100%; height: 100%; }
.video-badge { position: absolute; top: 8px; right: 8px; font-size: 11px; padding: 2px 8px; border-radius: 4px; background: rgba(0,0,0,0.5); color: #fff; }
.head-card {
  .tag-row { display: flex; gap: 8px; margin-bottom: 12px; }
  .tag { padding: 4px 10px; border-radius: 8px; font-size: 12px; }
  .type-tag { background: #e8f4fd; color: #4AB1F7; }
  .status-tag { background: #f0f2f5; color: #666; }
  .budget-row { margin-bottom: 8px; }
  .label { font-size: 13px; color: #999; margin-right: 8px; }
  .budget { font-size: 18px; font-weight: 700; color: #FF4D4F; }
  .date-row { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #666; }
}
.section-title {
  font-size: 14px; color: #999; margin-bottom: 8px;
}
.addr-row, .user-row {
  display: flex; align-items: center; gap: 8px; font-size: 14px; color: #333;
}
.desc { font-size: 14px; color: #333; line-height: 1.6; display: block; }
.user-row .phone { color: #4AB1F7; margin-left: auto; }
.footer-bar {
  position: fixed;
  left: 0; right: 0; bottom: 0;
  display: flex;
  gap: 12px;
  padding: 12px 16px;
  background: #fff;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.06);
  padding-bottom: calc(12px + constant(safe-area-inset-bottom));
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
}
.btn-contact { flex: 1; border-radius: 24px; background: #F1F2F4; color: #333; border: none; }
.btn-order { flex: 1; border-radius: 24px; border: none; }
.safe-bottom { height: env(safe-area-inset-bottom); }
.empty { text-align: center; padding: 60px 20px; color: #999; }
</style>
