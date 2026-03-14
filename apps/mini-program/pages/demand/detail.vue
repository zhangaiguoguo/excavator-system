<template>
  <view class="page">
    <view v-if="showUpdateTip" class="update-tip">
      <text class="update-text">需求内容已更新，点击刷新查看最新内容</text>
      <text class="update-btn" @click="refreshDetail">刷新</text>
      <text class="update-close" @click="showUpdateTip = false">关闭</text>
    </view>
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
              @click="previewBannerImage(idx)"
            />
            <view v-else class="banner-video-wrap" @click="playBannerVideoFullscreen(idx)">
              <video :id="'banner-video-demand-' + idx" class="banner-img" :src="getFileViewUrl(m.value)" :show-center-play-btn="true" controls object-fit="contain" />
              <view class="video-badge">点击全屏观看</view>
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
        <view class="info-row equipment-row">
          <text class="label">所需设备</text>
          <text class="info-text equipment-text">{{ machineTypesText }}</text>
        </view>
        <view class="budget-row">
          <text class="label">预算</text>
          <text class="budget">{{ budgetText(demand) }}</text>
        </view>
        <view class="date-row">
          <uni-icons type="calendar" size="16" color="#999" />
          <text>{{ demandDateText }}</text>
        </view>
      </view>

      <!-- 施工地址 -->
      <view class="card">
        <view class="section-title">施工地址</view>
        <view class="addr-row addr-click" @click="openMap">
          <uni-icons type="location-filled" size="16" color="#4AB1F7" />
          <text class="addr-text">{{ demand.province }}{{ demand.city }}{{ demand.district || '' }} {{ demand.address }}</text>
          <uni-icons type="location" size="16" color="#4AB1F7" />
        </view>
      </view>

      <!-- 需求描述 -->
      <view class="card">
        <view class="section-title">需求描述</view>
        <text class="desc">{{ demand.description || '暂无' }}</text>
      </view>

      <!-- 评论 -->
      <view class="card">
        <CommentPanel refType="demand" :refId="demand.id" />
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
        <template v-if="isMyDemand">
          <button v-if="isOnShelf(demand.status)" class="btn-contact" @click="offShelfDemand">下架</button>
          <button v-else class="btn-contact" @click="onShelfDemand">上架</button>
          <button type="primary" class="btn-order" @click="goDemandEdit">编辑</button>
        </template>
        <template v-else>
          <button class="btn-contact" @click="goChat">跟需求方聊天</button>
          <button
            v-if="isOnShelf(demand.status)"
            type="primary"
            class="btn-order"
            @click="goTakeOrder"
          >
            接单（发起合同）
          </button>
        </template>
      </view>
    </template>
    <view v-else class="empty">需求不存在或已下架</view>
    <view class="safe-bottom" />
  </view>
</template>

<script>
import apiService, { getFileViewUrl } from '@/api/api';
import appStore from '@/store/app';
import { PublishStatus, RefType, isOnShelf, DemandStatus } from '@/common/util/constants';
import { useDictOne } from '@/hooks/useDict';
import { formatDemandMachineTypes, formatDemandDateRange } from '@/common/util/util.js';
import { DemandDateUnlimited } from '@excavator/utils';
import CommentPanel from '@/components/CommentPanel.vue';
import ChatPanel from '@/components/ChatPanel.vue';
import realtime from '@/common/service/realtime.js';

export default {
  components: { CommentPanel, ChatPanel },
  data() {
    return {
      demandId: '',
      demand: {},
      loading: true,
      showUpdateTip: false,
      offRealtime: null,
      currentBannerIndex: 0,
      dictOptions: {
        machine_types: useDictOne('machine_types'),
        work_hours_unit: useDictOne('work_hours_unit'),
      },
    };
  },
  computed: {
    machineTypesText() {
      return formatDemandMachineTypes(
        this.demand.machineTypes,
        this.demand.machineTypeOther,
        this.dictOptions.machine_types,
      );
    },
    demandDateText() {
      return formatDemandDateRange(
        this.demand.startDate,
        this.demand.endDate,
        DemandDateUnlimited.START,
        DemandDateUnlimited.END,
      );
    },
    statusText() {
      const s = this.demand.status;
      if (s === PublishStatus.OFF_SHELF) return '已关闭';
      if (s === DemandStatus.COMPLETED) return '已完成';
      return '进行中';
    },
    isMyDemand() {
      const uid = (appStore().state.userInfo || {}).id || uni.getStorageSync('userId');
      return !!(this.demand.userId && uid && String(this.demand.userId) === String(uid));
    },
  },
  onLoad(options) {
    if (options.id) {
      this.demandId = String(options.id);
      this.fetchDetail(this.demandId);
      realtime.subscribe(RefType.DEMAND, this.demandId);
      this.offRealtime = realtime.on((event, data) => {
        if (event === 'content_updated' && data && data.refType === RefType.DEMAND && String(data.refId) === this.demandId) {
          this.showUpdateTip = true;
        }
        if (event === 'reconnected') {
          // 断网重连后同步最新内容，避免通知丢失
          this.fetchDetail(this.demandId);
        }
      });
    } else this.loading = false;
  },
  onUnload() {
    if (this.demandId) realtime.unsubscribe(RefType.DEMAND, this.demandId);
    if (this.offRealtime) this.offRealtime();
    this.offRealtime = null;
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
      const oldIdx = this.currentBannerIndex;
      if (oldIdx >= 0 && items[oldIdx] && items[oldIdx].type === 'video') {
        const ctx = uni.createVideoContext('banner-video-demand-' + oldIdx, this);
        if (ctx && ctx.pause) ctx.pause();
      }
      this.currentBannerIndex = e.detail.current;
    },
    /** 轮播视频点击全屏播放（传入当前 swiper 下标，保证操作的是当前可见视频） */
    playBannerVideoFullscreen(idx) {
      const ctx = uni.createVideoContext('banner-video-demand-' + idx, this);
      if (!ctx) return;
      if (ctx.requestFullScreen) {
        ctx.requestFullScreen({ direction: 0 });
      } else {
        ctx.play();
      }
    },
    /** 轮播图点击查看大图（仅图片，视频不预览） */
    previewBannerImage(swiperIndex) {
      const items = this.mediaItems(this.demand);
      const imageItems = items.filter((m) => m.type === 'image');
      if (!imageItems.length) return;
      const urls = imageItems.map((m) => getFileViewUrl(m.value)).filter(Boolean);
      if (!urls.length) return;
      const imageIndexInSwiper = items.slice(0, swiperIndex + 1).filter((m) => m.type === 'image').length - 1;
      const current = urls[Math.max(0, imageIndexInSwiper)] || urls[0];
      uni.previewImage({ urls, current });
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
    refreshDetail() {
      this.showUpdateTip = false;
      this.fetchDetail(this.demandId);
    },
    dateStr(d) {
      if (!d) return '';
      if (typeof d === 'string') return d.slice(0, 10);
      if (d instanceof Date) return d.toISOString().slice(0, 10);
      return '';
    },
    budgetUnitLabel(item) {
      const u = item && item.budgetUnit;
      if (!u) return '元';
      const arr = (this.dictOptions.work_hours_unit && this.dictOptions.work_hours_unit.value) || this.dictOptions.work_hours_unit || [];
      const o = Array.isArray(arr) ? arr.find((d) => String(d.value) === String(u)) : null;
      return o ? (o.text || o.label || '元') : '元';
    },
    budgetText(item) {
      const unit = this.budgetUnitLabel(item);
      if (item.budgetMin != null && item.budgetMax != null)
        return item.budgetMin + '-' + item.budgetMax + unit;
      if (item.budgetMin != null) return item.budgetMin + unit + '起';
      if (item.budgetMax != null) return '≤' + item.budgetMax + unit;
      return '面议';
    },
    openMap() {
      const lat = this.demand.latitude != null ? Number(this.demand.latitude) : null;
      const lng = this.demand.longitude != null ? Number(this.demand.longitude) : null;
      const name = [this.demand.province, this.demand.city, this.demand.district, this.demand.address].filter(Boolean).join('');
      if (lat != null && lng != null && !Number.isNaN(lat) && !Number.isNaN(lng)) {
        uni.openLocation({
          latitude: lat,
          longitude: lng,
          name: name || '施工地址',
          address: name || '',
        });
      } else {
        this.$tip && this.$tip.alert('暂无坐标，无法打开地图');
      }
    },
    contactUser() {
      const phone = this.demand?.user?.phone;
      if (phone) uni.makePhoneCall({ phoneNumber: String(phone) });
      else this.$tip.alert('暂无联系方式');
    },
    goChat() {
      if (!this.demand || !this.demand.id) return;
      const otherName = (this.demand.user && this.demand.user.nickname) || (this.demand.type === '2' ? '招聘方' : '需求方');
      const title = otherName; // 聊天页显示「跟XXX聊天」
      let url = '/pages/chat/index?refType=' + RefType.DEMAND + '&refId=' + this.demand.id + '&title=' + encodeURIComponent(title);
      if (this.demand.userId) url += '&otherUserId=' + this.demand.userId;
      uni.navigateTo({ url });
    },
    goTakeOrder() {
      // 接单 = 去发起合同，关联本需求 + 选择我的设备
      uni.navigateTo({
        url: '/pages/contract/create?demandId=' + this.demand.id,
      });
    },
    goDemandEdit() {
      if (this.demand.id) uni.navigateTo({ url: '/pages/demand/add?id=' + this.demand.id });
    },
    offShelfDemand() {
      uni.showModal({
        title: '提示',
        content: '确定下架该需求吗？下架后不会在找活列表展示。',
        success: (res) => {
          if (!res.confirm) return;
          apiService.updateDemand(this.demand.id, { status: PublishStatus.OFF_SHELF }).then(() => {
            uni.showToast({ title: '已下架' });
            this.fetchDetail(this.demandId);
          }).catch((e) => uni.showToast({ title: e?.msg || '操作失败', icon: 'none' }));
        },
      });
    },
    onShelfDemand() {
      apiService.updateDemand(this.demand.id, { status: PublishStatus.ON_SHELF }).then(() => {
        uni.showToast({ title: '已上架' });
        this.fetchDetail(this.demandId);
      }).catch((e) => uni.showToast({ title: e?.msg || '操作失败', icon: 'none' }));
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
.update-tip {
  position: sticky;
  top: 0;
  z-index: 20;
  background: rgba(74, 177, 247, 0.12);
  border: 1px solid rgba(74, 177, 247, 0.25);
  color: #1a1a1a;
  padding: 10px 12px;
  border-radius: 12px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.update-text {
  flex: 1;
  min-width: 0;
  font-size: 13px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.update-btn {
  flex-shrink: 0;
  font-size: 13px;
  color: #007aff;
  font-weight: 600;
}
.update-close {
  flex-shrink: 0;
  font-size: 13px;
  color: #666;
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
  .info-row { margin-bottom: 8px; }
  .info-text { font-size: 14px; color: #333; word-break: break-all; }
  .equipment-row { display: flex; align-items: flex-start; gap: 8px; min-width: 0; }
  .equipment-row .label { flex-shrink: 0; }
  .equipment-text { flex: 1; min-width: 0; }
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
.addr-click { cursor: pointer; }
.addr-text { flex: 1; }
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
.btn-contact { flex: 1; background: #F1F2F4; color: #333; border: none; }
.btn-order { flex: 1; border: none; }
.safe-bottom { height: env(safe-area-inset-bottom); }
.empty { text-align: center; padding: 60px 20px; color: #999; }
</style>
