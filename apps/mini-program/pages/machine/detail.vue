<template>
  <view class="page">
    <view v-if="loading" class="loading-wrap"><uni-load-more status="loading" /></view>
    <template v-else-if="machine.id">
      <view class="card banner-card">
        <swiper class="banner" indicator-dots circular indicator-active-color="#4AB1F7" @change="onBannerSwiperChange">
          <swiper-item v-for="(m, idx) in mediaItems(machine)" :key="idx">
            <image
              v-if="m.type === 'image'"
              :src="getFileViewUrl(m.value) || '/static/default_machine.png'"
              mode="aspectFill"
              class="banner-img"
              @click="previewImage(idx)"
            />
            <view v-else class="banner-video-wrap" @click.stop>
              <video id="banner-video-machine" class="banner-img" :src="getFileViewUrl(m.value)" autoplay muted controls />
              <view class="video-badge">视频</view>
            </view>
          </swiper-item>
        </swiper>
      </view>
      <view class="card info-card">
        <view class="price-row">
          <view class="price-box">
            <text class="symbol">¥</text>
            <text class="price">{{ machine.rentAmount || '—' }}</text>
            <text class="unit">/{{ rentUnitLabel(machine.rentUnit) }}</text>
          </view>
          <view class="fav-box" @click="toggleFav">
            <uni-icons :type="isFav ? 'star-filled' : 'star'" size="24" :color="isFav ? '#FFC107' : '#999'" />
            <text class="fav-text">{{ isFav ? '已收藏' : '收藏' }}</text>
          </view>
        </view>
        <text class="title">{{ machine.model || '设备' }}</text>
        <view class="tag-row">
          <text class="tag">{{ machine.province }}{{ machine.city }}{{ machine.district || '' }}</text>
          <text class="tag">{{ conditionLabel(machine.conditionType) }}</text>
        </view>
      </view>
      <view class="card">
        <view class="section-title">基本信息</view>
        <view class="row"><text class="label">型号</text><text class="value">{{ machine.model }}</text></view>
        <view class="row"><text class="label">位置</text><text class="value">{{ machine.province }} {{ machine.city }} {{ machine.district || '' }} {{ machine.address }}</text></view>
      </view>
      <view class="card">
        <view class="section-title">设备描述</view>
        <text class="desc">{{ machine.description || '暂无描述' }}</text>
      </view>
      <view class="card" v-if="machine.user">
        <view class="section-title">机主</view>
        <view class="user-row">
          <text>{{ machine.user.nickname || '用户' }}</text>
          <text class="link" @click="contactOwner">联系机主</text>
        </view>
      </view>
      <view class="footer-bar">
        <button type="default" class="btn" @click="goContract">发起合同</button>
        <button type="primary" class="btn" @click="contactOwner">立即联系</button>
      </view>
    </template>
    <view v-else class="empty">设备不存在或已下架</view>
    <view class="safe-bottom" />
  </view>
</template>

<script>
import apiService, { getFileViewUrl } from '@/api/api';
import appStore from '@/store/app';
import { useDictOne } from '@/hooks/useDict';

export default {
  data() {
    return {
      machine: {},
      loading: true,
      isFav: false,
      work_hours_unit: useDictOne('work_hours_unit'),
      machine_condition: useDictOne('machine_condition'),
    };
  },
  onLoad(options) {
    if (options.id) {
      this.fetchDetail(options.id);
      this.checkFav(options.id);
    } else this.loading = false;
  },
  methods: {
    getFileViewUrl,
    mediaItems(item) {
      const list = [];
      if (item && item.video) list.push({ type: 'video', value: item.video });
      const imgs = Array.isArray(item && item.images) ? item.images : [];
      imgs.forEach((img) => list.push({ type: 'image', value: img }));
      if (list.length === 0) list.push({ type: 'image', value: null });
      return list;
    },
    fetchDetail(id) {
      this.loading = true;
      apiService
        .getMachine(id)
        .then((res) => {
          const data = res?.data ?? res;
          this.machine = data || {};
        })
        .catch(() => { this.machine = {}; })
        .finally(() => { this.loading = false; });
    },
    checkFav(machineId) {
      const userId = (appStore().state.userInfo || {}).id || uni.getStorageSync('userId');
      if (!userId) return;
      apiService.checkFavorite(userId, 'machine', machineId).then((res) => {
        const data = res?.data ?? res;
        this.isFav = !!(data && (data.favorited === true || data.isFav === true));
      }).catch(() => {});
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
    previewImage(index) {
      const items = this.mediaItems(this.machine).filter((m) => m.type === 'image');
      const urls = items.map((m) => this.getFileViewUrl(m.value)).filter(Boolean);
      if (urls.length) uni.previewImage({ urls, current: urls[index] || urls[0] });
    },
    onBannerSwiperChange(e) {
      const items = this.mediaItems(this.machine);
      const videoIdx = items.findIndex((m) => m.type === 'video');
      if (videoIdx >= 0 && e.detail.current !== videoIdx) {
        const ctx = uni.createVideoContext('banner-video-machine', this);
        if (ctx && ctx.pause) ctx.pause();
      }
    },
    toggleFav() {
      const userId = (appStore().state.userInfo || {}).id || uni.getStorageSync('userId');
      if (!userId) { this.$tip.alert('请先登录'); return; }
      if (this.isFav) {
        apiService.removeFavorite(userId, 'machine', this.machine.id).then(() => {
          this.isFav = false;
          this.$tip.success('已取消收藏');
        }).catch(() => {});
      } else {
        apiService.addFavorite(userId, 'machine', this.machine.id).then(() => {
          this.isFav = true;
          this.$tip.success('收藏成功');
        }).catch(() => {});
      }
    },
    contactOwner() {
      const phone = this.machine?.user?.phone;
      if (phone) uni.makePhoneCall({ phoneNumber: String(phone) });
      else this.$tip.alert('暂无联系方式');
    },
    goContract() {
      uni.navigateTo({ url: '/pages/contract/create?machineId=' + this.machine.id });
    },
  },
};
</script>

<style lang="scss" scoped>
.page { min-height: 100vh; background: #F5F6F8; padding-bottom: 90px; }
.loading-wrap { padding: 40px 0; }
.card {
  background: #fff; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  margin: 0 16px 12px; padding: 16px; overflow: hidden;
}
.banner-card { padding: 0; }
.banner { height: 240px; border-radius: 16px; }
.banner-img { width: 100%; height: 100%; }
.banner-video-wrap { position: relative; width: 100%; height: 100%; }
.video-badge { position: absolute; top: 8px; right: 8px; font-size: 11px; padding: 2px 8px; border-radius: 4px; background: rgba(0,0,0,0.5); color: #fff; }
.info-card {
  .price-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
  .price-box { color: #FF4D4F; display: flex; align-items: baseline; }
  .symbol { font-size: 14px; font-weight: 700; }
  .price { font-size: 22px; font-weight: 800; margin: 0 2px; }
  .unit { font-size: 12px; color: #999; }
  .fav-box { display: flex; flex-direction: column; align-items: center; }
  .fav-text { font-size: 11px; color: #999; }
  .title { font-size: 17px; font-weight: 700; color: #333; display: block; margin-bottom: 8px; }
  .tag-row { display: flex; gap: 8px; flex-wrap: wrap; }
  .tag { font-size: 12px; color: #666; background: #F1F2F4; padding: 4px 10px; border-radius: 8px; }
}
.section-title { font-size: 14px; color: #999; margin-bottom: 8px; }
.row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
.label { color: #666; }
.value { color: #333; flex: 1; margin-left: 12px; text-align: right; }
.desc { font-size: 14px; color: #666; line-height: 1.6; display: block; }
.user-row { display: flex; align-items: center; justify-content: space-between; font-size: 14px; }
.user-row .link { color: #4AB1F7; }
.footer-bar {
  position: fixed; left: 0; right: 0; bottom: 0; display: flex; gap: 12px; padding: 12px 16px; background: #fff;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.06);
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
}
.footer-bar .btn { flex: 1; border-radius: 24px; }
.safe-bottom { height: env(safe-area-inset-bottom); }
.empty { text-align: center; padding: 60px 20px; color: #999; }
</style>
