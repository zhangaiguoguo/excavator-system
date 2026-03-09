<template>
  <view class="page">
    <view v-if="loading" class="loading-wrap"><uni-load-more status="loading" /></view>
    <template v-else-if="contract.id">
      <view class="card">
        <view class="card-head">
          <text class="contract-no">{{ contract.contractNo }}</text>
          <text class="status-tag">{{ getStatusText(contract.status) }}</text>
        </view>
        <view class="row"><text class="label">甲方（出租方）</text><text class="value">{{ lessorName }}</text></view>
        <view class="row"><text class="label">乙方（承租方）</text><text class="value">{{ lesseeName }}</text></view>
        <view class="row"><text class="label">设备</text><text class="value">{{ machineName }}</text></view>
        <view class="row"><text class="label">租期</text><text class="value">{{ dateStr(contract.createTime) }} 起</text></view>
      </view>
      <view class="card">
        <view class="section-title">合同条款预览</view>
        <view class="terms">
          <text>第一条 租赁设备及用途</text>
          <text>第二条 租赁期限与租金</text>
          <text>第三条 双方权利与义务</text>
        </view>
      </view>
      <view class="footer-bar">
        <button type="default" class="btn" @click="downloadPdf">下载PDF</button>
        <button
          v-if="contract.status === 1"
          type="primary"
          class="btn"
          @click="signContract"
        >签署合同</button>
        <button
          v-else-if="contract.status === 2 && contract.demandId && !demandCompleted"
          type="primary"
          class="btn btn-complete"
          @click="confirmComplete"
        >确认完成</button>
      </view>
    </template>
    <view v-else class="empty">合同不存在</view>
    <view class="safe-bottom" />
  </view>
</template>

<script>
import apiService from '@/api/api';
import appStore from '@/store/app';

export default {
  data() {
    return {
      contract: {},
      loading: true,
      demandCompleted: false,
    };
  },
  computed: {
    lessorName() {
      const u = this.contract.lessor;
      return (u && (u.nickname || u.phone)) || '—';
    },
    lesseeName() {
      const u = this.contract.lessee;
      return (u && (u.nickname || u.phone)) || '—';
    },
    machineName() {
      const m = this.contract.machine;
      return (m && (m.model || m.brand)) || '—';
    },
  },
  onLoad(options) {
    if (options.id) this.fetchDetail(options.id);
    else this.loading = false;
  },
  methods: {
    fetchDetail(id) {
      this.loading = true;
      apiService
        .getContract(id)
        .then((res) => {
          const data = res?.data ?? res;
          this.contract = data || {};
        })
        .catch(() => { this.contract = {}; })
        .finally(() => { this.loading = false; });
    },
    dateStr(d) {
      if (!d) return '';
      if (typeof d === 'string') return d.slice(0, 10);
      if (d instanceof Date) return d.toISOString().slice(0, 10);
      return '';
    },
    getStatusText(status) {
      const map = { 0: '草稿', 1: '待签署', 2: '已生效', 3: '已过期', 4: '已终止' };
      return map[status] ?? '未知';
    },
    signContract() {
      this.$tip.confirm('签署即代表您同意合同所有条款', true, {}, '确认签署').then(() => {
        const userId = (appStore().state.userInfo || {}).id || uni.getStorageSync('userId');
        if (!userId) {
          this.$tip.alert('请先登录');
          return;
        }
        const role = String(this.contract.lessorId) === String(userId) ? 'lessor' : 'lessee';
        this.$tip.loading('签署中...');
        apiService.signContract(this.contract.id, { userId, role }).then(() => {
          this.$tip.loaded();
          this.contract.status = 2;
          this.$tip.success('签署成功');
        }).catch((err) => {
          this.$tip.loaded();
          this.$tip.alert(err?.message || '签署失败');
        });
      }).catch(() => {});
    },
    confirmComplete() {
      if (!this.contract.demandId) return;
      this.$tip.confirm('确认已将本单完成？完成后需求方会收到通知。', true, {}, '确认完成').then(() => {
        this.$tip.loading('提交中...');
        apiService.updateDemand(this.contract.demandId, { status: '2' }).then(() => {
          this.$tip.loaded();
          this.demandCompleted = true;
          this.$tip.success('已标记完成，对方将收到通知');
        }).catch((err) => {
          this.$tip.loaded();
          this.$tip.alert(err?.message || '操作失败');
        });
      }).catch(() => {});
    },
    downloadPdf() {
      this.$tip.alert('下载功能开发中');
    },
  },
};
</script>

<style lang="scss" scoped>
.page { min-height: 100vh; background: #F5F6F8; padding: 16px; padding-bottom: 100px; }
.loading-wrap { padding: 40px 0; }
.card {
  background: #fff; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  padding: 16px; margin-bottom: 12px;
}
.card-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.contract-no { font-size: 15px; font-weight: 700; color: #333; }
.status-tag { font-size: 12px; color: #4AB1F7; background: #e8f4fd; padding: 4px 10px; border-radius: 8px; }
.row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
.label { color: #666; }
.value { color: #333; font-weight: 500; }
.section-title { font-size: 14px; color: #999; margin-bottom: 8px; }
.terms text { display: block; font-size: 13px; color: #666; line-height: 1.8; }
.footer-bar {
  position: fixed; left: 0; right: 0; bottom: 0;
  display: flex; gap: 12px; padding: 12px 16px; background: #fff;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.06);
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
}
.footer-bar .btn { flex: 1; border-radius: 24px; }
.btn-complete { background: #5AD0C8 !important; color: #fff !important; }
.safe-bottom { height: env(safe-area-inset-bottom); }
.empty { text-align: center; padding: 60px 20px; color: #999; }
</style>
