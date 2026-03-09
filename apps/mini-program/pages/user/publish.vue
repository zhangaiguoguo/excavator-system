<template>
  <view class="page">
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

    <!-- 我的设备 -->
    <view v-if="activeTab === 'machine'" class="list">
      <view
        v-for="item in myMachines"
        :key="item.id"
        class="card"
        @click="goMachineDetail(item.id)"
      >
        <image class="card-img" :src="(item.images && item.images[0]) || '/static/default_machine.png'" mode="aspectFill" />
        <view class="card-body">
          <text class="card-title">{{ item.model }}</text>
          <text class="card-meta">{{ item.province }} {{ item.city }} · ¥{{ item.rentAmount }}/{{ rentUnitLabel(item.rentUnit) }}</text>
          <view class="card-actions">
            <button class="btn-sm" @click.stop="goMachineEdit(item.id)">编辑</button>
            <button class="btn-sm danger" @click.stop="removeMachine(item)">删除</button>
          </view>
        </view>
      </view>
      <view v-if="myMachines.length === 0 && !loading" class="empty">
        <text>暂无发布设备</text>
        <button class="btn-publish" @click="goMachineAdd">去发布</button>
      </view>
    </view>

    <!-- 我的需求 -->
    <view v-if="activeTab === 'demand'" class="list">
      <view
        v-for="item in myDemands"
        :key="item.id"
        class="card demand-card"
        @click="goDemandDetail(item.id)"
      >
        <view class="card-body">
          <text class="card-tag">{{ item.type === '2' ? '招聘机手' : '求租设备' }}</text>
          <text class="card-desc">{{ (item.description || '').slice(0, 40) }}{{ (item.description || '').length > 40 ? '...' : '' }}</text>
          <text class="card-meta">{{ item.province }}{{ item.city }} · {{ dateStr(item.startDate) }} 至 {{ dateStr(item.endDate) }}</text>
          <view class="card-actions">
            <button class="btn-sm" @click.stop="goDemandEdit(item.id)">编辑</button>
            <button class="btn-sm danger" @click.stop="removeDemand(item)">删除</button>
          </view>
        </view>
      </view>
      <view v-if="myDemands.length === 0 && !loading" class="empty">
        <text>暂无发布需求</text>
        <button class="btn-publish" @click="goDemandAdd">去发布</button>
      </view>
    </view>

    <!-- 我的揽活 -->
    <view v-if="activeTab === 'job'" class="list">
      <view
        v-for="item in myJobs"
        :key="item.id"
        class="card job-card"
        @click="goJobDetail(item.id)"
      >
        <view class="card-body">
          <text class="card-title">¥{{ item.price }}/{{ rentUnitLabel(item.priceUnit) }}</text>
          <text class="card-meta">{{ item.province }}{{ item.city }} · {{ expLabel(item.experience) }}</text>
          <view class="card-actions">
            <button class="btn-sm" @click.stop="goJobEdit(item.id)">编辑</button>
            <button class="btn-sm danger" @click.stop="removeJob(item)">删除</button>
          </view>
        </view>
      </view>
      <view v-if="myJobs.length === 0 && !loading" class="empty">
        <text>暂无揽活信息</text>
        <button class="btn-publish" @click="goJobAdd">去发布揽活</button>
      </view>
    </view>

    <uni-load-more :status="loading ? 'loading' : 'more'" />
  </view>
</template>

<script>
import apiService from '@/api/api';
import appStore from '@/store/app';
import { useDictOne } from '@/hooks/useDict';

export default {
  data() {
    return {
      activeTab: 'machine',
      tabs: [
        { key: 'machine', label: '我的设备' },
        { key: 'demand', label: '我的需求' },
        { key: 'job', label: '我的揽活' },
      ],
      myMachines: [],
      myDemands: [],
      myJobs: [],
      loading: false,
      work_hours_unit: useDictOne('work_hours_unit'),
      job_experience: useDictOne('job_experience'),
    };
  },
  computed: {
    userId() {
      return (appStore().state.userInfo || {}).id || uni.getStorageSync('userId') || '';
    },
  },
  watch: {
    activeTab() {
      this.fetchCurrent();
    },
  },
  onLoad() {
    this.fetchCurrent();
  },
  onShow() {
    if (this.userId) this.fetchCurrent();
  },
  onPullDownRefresh() {
    this.fetchCurrent().finally(() => uni.stopPullDownRefresh());
  },
  methods: {
    rentUnitLabel(v) {
      const arr = this.work_hours_unit?.value ?? this.work_hours_unit ?? [];
      const o = arr.find(d => d.value === v);
      return o ? o.text : '天';
    },
    expLabel(v) {
      const arr = this.job_experience?.value ?? this.job_experience ?? [];
      const o = arr.find(d => d.value === v);
      return o ? o.text : (v || '');
    },
    dateStr(d) {
      if (!d) return '';
      if (typeof d === 'string') return d.slice(0, 10);
      if (d instanceof Date) return d.toISOString().slice(0, 10);
      return '';
    },
    fetchCurrent() {
      if (!this.userId) {
        this.$tip.alert('请先登录');
        return Promise.resolve();
      }
      this.loading = true;
      const toArr = (res, key = 'list') => {
        const d = res?.data ?? res;
        const list = d?.[key] ?? (Array.isArray(d) ? d : []);
        return Array.isArray(list) ? list : [];
      };
      if (this.activeTab === 'machine') {
        return apiService.getMachines({ userId: this.userId, page: 1, pageSize: 100 }).then((res) => {
          this.myMachines = toArr(res);
        }).finally(() => { this.loading = false; });
      }
      if (this.activeTab === 'demand') {
        return apiService.getDemands({ userId: this.userId, page: 1, pageSize: 100 }).then((res) => {
          this.myDemands = toArr(res);
        }).finally(() => { this.loading = false; });
      }
      if (this.activeTab === 'job') {
        return apiService.getJobs({ userId: this.userId }).then((res) => {
          this.myJobs = toArr(res);
        }).finally(() => { this.loading = false; });
      }
      this.loading = false;
      return Promise.resolve();
    },
    goMachineDetail(id) {
      uni.navigateTo({ url: '/pages/machine/detail?id=' + id });
    },
    goMachineEdit(id) {
      uni.navigateTo({ url: '/pages/machine/add?id=' + id });
    },
    goMachineAdd() {
      uni.navigateTo({ url: '/pages/machine/add' });
    },
    removeMachine(item) {
      this.$tip.confirm('确定删除该设备吗？', true, {}, '提示').then(() => {
        apiService.removeMachine(item.id).then(() => {
          this.$tip.success('已删除');
          this.fetchCurrent();
        });
      }).catch(() => {});
    },
    goDemandDetail(id) {
      uni.navigateTo({ url: '/pages/demand/detail?id=' + id });
    },
    goDemandEdit(id) {
      uni.navigateTo({ url: '/pages/demand/add?id=' + id });
    },
    goDemandAdd() {
      uni.navigateTo({ url: '/pages/demand/add' });
    },
    removeDemand(item) {
      this.$tip.confirm('确定删除该需求吗？', true, {}, '提示').then(() => {
        apiService.removeDemand(item.id).then(() => {
          this.$tip.success('已删除');
          this.fetchCurrent();
        });
      }).catch(() => {});
    },
    goJobDetail(id) {
      this.$tip.alert('揽活详情页可后续扩展');
    },
    goJobEdit(id) {
      this.$tip.alert('揽活编辑页可后续扩展');
    },
    goJobAdd() {
      this.$tip.alert('揽活发布页可后续扩展');
    },
    removeJob(item) {
      this.$tip.confirm('确定删除该揽活吗？', true, {}, '提示').then(() => {
        apiService.removeJob(item.id).then(() => {
          this.$tip.success('已删除');
          this.fetchCurrent();
        });
      }).catch(() => {});
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
    color: #FFB800;
    font-weight: 600;
    border-bottom: 2px solid #FFB800;
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
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.card-title { font-size: 16px; font-weight: 600; color: #1a1a1a; margin-bottom: 4px; }
.card-tag {
  font-size: 12px;
  color: #007aff;
  margin-bottom: 4px;
}
.card-desc {
  font-size: 14px;
  color: #333;
  margin-bottom: 4px;
  display: block;
}
.card-meta { font-size: 12px; color: #999; margin-bottom: 8px; }
.card-actions {
  display: flex;
  gap: 10px;
}
.btn-sm {
  padding: 4px 12px;
  font-size: 12px;
  height: 28px;
  line-height: 20px;
  border-radius: 14px;
  background: #f0f2f5;
  color: #666;
  border: none;
  &.danger { background: #ffebee; color: #f44336; }
}
.demand-card .card-body, .job-card .card-body { padding: 14px; }
.empty {
  text-align: center;
  padding: 60px 20px;
  color: #999;
  font-size: 14px;
}
.btn-publish {
  margin-top: 16px;
  background: linear-gradient(90deg, #FFA500, #FF8F00);
  color: #fff;
  border: none;
  border-radius: 22px;
  height: 44px;
  line-height: 44px;
  padding: 0 32px;
  font-size: 15px;
}
</style>
