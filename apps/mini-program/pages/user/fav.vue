<template>
  <view class="page">
    <view v-if="!userId" class="empty">
      <text>请先登录</text>
      <button class="btn-login" @click="goLogin">去登录</button>
    </view>
    <template v-else>
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

      <view class="list">
        <!-- 收藏的设备 -->
        <template v-if="activeTab === 'machine'">
          <view
            v-for="item in favMachines"
            :key="item.id"
            class="card"
            @click="goMachine(item.id)"
          >
            <image class="card-img" :src="getFileViewUrl(item.images && item.images[0]) || '/static/default_machine.png'" mode="aspectFill" />
            <view class="card-body">
              <text class="card-title">{{ item.model }}</text>
              <text class="card-meta">¥{{ item.rentAmount }}/{{ rentUnitLabel(item.rentUnit) }} · {{ item.province }}{{ item.city }}</text>
              <view class="card-actions">
                <button class="btn-call" @click.stop="contactMachine(item)">联系</button>
                <button class="btn-remove" @click.stop="unfav('machine', item.id)">取消收藏</button>
              </view>
            </view>
          </view>
          <view v-if="favMachines.length === 0 && !loading" class="empty-tip">暂无收藏设备</view>
        </template>

        <!-- 收藏的需求 -->
        <template v-if="activeTab === 'demand'">
          <view
            v-for="item in favDemands"
            :key="item.id"
            class="card demand-card"
            @click="goDemand(item.id)"
          >
            <view class="card-body">
              <text class="card-tag">{{ item.type === '2' ? '招聘机手' : '求租设备' }}</text>
              <text class="card-desc">{{ (item.description || '').slice(0, 50) }}{{ (item.description || '').length > 50 ? '...' : '' }}</text>
              <text class="card-meta">{{ item.province }}{{ item.city }}</text>
              <view class="card-actions">
                <button class="btn-call" @click.stop="contactDemand(item)">联系</button>
                <button class="btn-remove" @click.stop="unfav('demand', item.id)">取消收藏</button>
              </view>
            </view>
          </view>
          <view v-if="favDemands.length === 0 && !loading" class="empty-tip">暂无收藏需求</view>
        </template>

        <!-- 收藏的揽活 -->
        <template v-if="activeTab === 'job'">
          <view
            v-for="item in favJobs"
            :key="item.id"
            class="card job-card"
            @click="goJob(item.id)"
          >
            <view class="card-body">
              <text class="card-title">¥{{ item.price }}/{{ rentUnitLabel(item.priceUnit) }}</text>
              <text class="card-meta">{{ item.province }}{{ item.city }}</text>
              <view class="card-actions">
                <button class="btn-call" @click.stop="contactJob(item)">联系</button>
                <button class="btn-remove" @click.stop="unfav('job', item.id)">取消收藏</button>
              </view>
            </view>
          </view>
          <view v-if="favJobs.length === 0 && !loading" class="empty-tip">暂无收藏揽活</view>
        </template>
      </view>

      <uni-load-more :status="loading ? 'loading' : 'more'" />
    </template>
  </view>
</template>

<script>
import apiService, { getFileViewUrl } from '@/api/api';
import appStore from '@/store/app';
import { useDictOne } from '@/hooks/useDict';

export default {
  data() {
    return {
      activeTab: 'machine',
      tabs: [
        { key: 'machine', label: '设备' },
        { key: 'demand', label: '需求' },
        { key: 'job', label: '揽活' },
      ],
      favList: [],
      favMachines: [],
      favDemands: [],
      favJobs: [],
      loading: false,
      work_hours_unit: useDictOne('work_hours_unit'),
    };
  },
  computed: {
    userId() {
      return (appStore().state.userInfo || {}).id || uni.getStorageSync('userId') || '';
    },
  },
  watch: {
    activeTab() {
      this.fetchFav();
    },
  },
  onLoad() {},
  onShow() {
    if (this.userId) this.fetchFav();
  },
  onPullDownRefresh() {
    this.fetchFav().finally(() => uni.stopPullDownRefresh());
  },
  methods: {
    getFileViewUrl,
    rentUnitLabel(v) {
      const arr = this.work_hours_unit?.value ?? this.work_hours_unit ?? [];
      const o = arr.find(d => d.value === v);
      return o ? o.text : '天';
    },
    goLogin() {
      uni.switchTab({ url: '/pages/user/index' });
    },
    fetchFav() {
      if (!this.userId) return Promise.resolve();
      this.loading = true;
      return apiService.getFavorites(this.userId).then((res) => {
        const list = Array.isArray(res) ? res : (res?.data ?? res) || [];
        this.favList = list;
        const machineIds = list.filter(f => f.refType === 'machine').map(f => f.refId);
        const demandIds = list.filter(f => f.refType === 'demand').map(f => f.refId);
        const jobIds = list.filter(f => f.refType === 'job').map(f => f.refId);
        return Promise.all([
          machineIds.length ? Promise.all(machineIds.map(id => apiService.getMachine(id))) : Promise.resolve([]),
          demandIds.length ? Promise.all(demandIds.map(id => apiService.getDemand(id))) : Promise.resolve([]),
          jobIds.length ? Promise.all(jobIds.map(id => apiService.getJob(id))) : Promise.resolve([]),
        ]).then(([r1, r2, r3]) => {
          const toArr = (arr) => arr.map(x => (Array.isArray(x) ? x[0] : (x?.data ?? x)));
          this.favMachines = toArr(r1);
          this.favDemands = toArr(r2);
          this.favJobs = toArr(r3);
        });
      }).catch(() => {
        this.favMachines = [];
        this.favDemands = [];
        this.favJobs = [];
      }).finally(() => { this.loading = false; });
    },
    unfav(refType, refId) {
      apiService.removeFavorite(this.userId, refType, refId).then(() => {
        this.$tip.success('已取消收藏');
        this.fetchFav();
      });
    },
    goMachine(id) {
      uni.navigateTo({ url: '/pages/machine/detail?id=' + id });
    },
    goDemand(id) {
      uni.navigateTo({ url: '/pages/demand/detail?id=' + id });
    },
    goJob(id) {
      this.$tip.alert('揽活详情可后续扩展');
    },
    contactMachine(item) {
      const phone = item?.user?.phone;
      if (phone) uni.makePhoneCall({ phoneNumber: String(phone) });
      else this.$tip.alert('暂无联系方式');
    },
    contactDemand(item) {
      const phone = item?.user?.phone;
      if (phone) uni.makePhoneCall({ phoneNumber: String(phone) });
      else this.$tip.alert('暂无联系方式');
    },
    contactJob(item) {
      const phone = item?.user?.phone;
      if (phone) uni.makePhoneCall({ phoneNumber: String(phone) });
      else this.$tip.alert('暂无联系方式');
    },
  },
};
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #f5f6f8;
  padding-bottom: 30px;
}
.tabs {
  display: flex;
  background: #fff;
  padding: 0 16px;
  box-shadow: 0 1px 0 rgba(0,0,0,0.06);
}
.tab {
  flex: 1;
  text-align: center;
  font-size: 15px;
  color: #666;
  padding: 14px 0;
  &.active {
    color: #FFC107;
    font-weight: 600;
    border-bottom: 2px solid #FFC107;
  }
}
.list { padding: 12px 16px; }
.card {
  display: flex;
  background: #fff;
  border-radius: 12px;
  margin-bottom: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
  overflow: hidden;
}
.card-img {
  width: 100px;
  height: 100px;
  flex-shrink: 0;
  background: #f0f2f5;
}
.card-body {
  flex: 1;
  padding: 12px 14px;
}
.card-title { font-size: 16px; font-weight: 600; color: #1a1a1a; display: block; margin-bottom: 4px; }
.card-tag { font-size: 12px; color: #007aff; display: block; margin-bottom: 4px; }
.card-desc { font-size: 14px; color: #333; display: block; margin-bottom: 4px; }
.card-meta { font-size: 12px; color: #999; display: block; margin-bottom: 8px; }
.card-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}
.btn-call {
  padding: 4px 14px;
  font-size: 12px;
  height: 28px;
  line-height: 20px;
  border-radius: 14px;
  background: linear-gradient(90deg, #FFA500, #FF8F00);
  color: #fff;
  border: none;
}
.btn-remove {
  padding: 4px 10px;
  font-size: 12px;
  height: 28px;
  line-height: 20px;
  border-radius: 14px;
  background: #f5f5f5;
  color: #999;
  border: none;
}
.demand-card .card-body, .job-card .card-body { padding: 14px; }
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 120px;
  color: #999;
  font-size: 14px;
}
.btn-login {
  margin-top: 20px;
  background: #FFB800;
  color: #333;
  border: none;
  border-radius: 22px;
  height: 44px;
  line-height: 44px;
  padding: 0 32px;
  font-size: 15px;
}
.empty-tip {
  text-align: center;
  padding: 40px;
  color: #999;
  font-size: 14px;
}
</style>
