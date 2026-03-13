<template>
  <view class="page">
    <view v-if="loading" class="loading-wrap"><uni-load-more status="loading" /></view>
    <template v-else-if="contract.id">
      <view class="card">
        <view class="card-head">
          <text class="contract-no">{{ contract.contractNo }}</text>
          <text class="status-tag">{{ getStatusText(contract.status) }}</text>
        </view>
        <view class="row"><text class="label">供应方</text><text class="value">{{ lessorName }}</text></view>
        <view class="row"><text class="label">需求方</text><text class="value">{{ lesseeName }}</text></view>
        <view class="row"><text class="label">服务内容</text><text class="value">{{ serviceName }}</text></view>
        <view class="row">
          <text class="label">服务时间</text>
          <text class="value">
            {{ dateStr(contract.serviceStartTime) }}
            <text v-if="contract.serviceEndTime"> 至 {{ dateStr(contract.serviceEndTime) }}</text>
          </text>
        </view>
        <view class="row" v-if="contract.totalPrice != null">
          <text class="label">预估总价</text>
          <text class="value">{{ Number(contract.totalPrice).toFixed(2) }} 元</text>
        </view>
        <view class="row" v-if="contract.priceUnit">
          <text class="label">价格单位</text>
          <text class="value">{{ contract.priceUnit }}</text>
        </view>
        <view class="row" v-if="contract.serviceLocation">
          <text class="label">服务地点</text>
          <text class="value">{{ contract.serviceLocation }}</text>
        </view>
        <view class="row" v-if="contract.demandRemark">
          <text class="label">备注</text>
          <text class="value">{{ contract.demandRemark }}</text>
        </view>
        <view class="row" v-if="contract.cancelReason">
          <text class="label">取消原因</text>
          <text class="value">{{ contract.cancelReason }}</text>
        </view>
      </view>
      <view class="card">
        <view class="section-title">订单说明</view>
        <view class="terms">
          <text>本订单仅作为供需双方的意向记录，不涉及在线支付和法律担保。</text>
          <text>请双方通过电话或微信进一步确认具体细节，并线下完成结算。</text>
        </view>
      </view>
      <view class="footer-bar">
        <button
          v-if="contract.status === 0 && isLessor"
          type="primary"
          class="btn"
          @click="handleConfirm"
        >确认接单</button>
        <button
          v-if="(contract.status === 0 || contract.status === 1) && (isLessor || isLessee)"
          type="default"
          class="btn"
          @click="handleCancel"
        >取消订单</button>
        <button
          v-if="contract.status === 1 && (isLessor || isLessee)"
          type="primary"
          class="btn btn-complete"
          @click="handleComplete"
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
      isLessor: false,
      isLessee: false,
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
    serviceName() {
      const info = this.contract.resourceInfo || {};
      const m = this.contract.machine;
      return info.model || (m && (m.model || m.brand)) || '—';
    },
  },
  onLoad(options) {
    if (options.id) this.fetchDetail(options.id);
    else this.loading = false;
  },
  methods: {
    fetchDetail(id) {
      this.loading = true;
      const userId = (appStore().state.userInfo || {}).id || uni.getStorageSync('userId');
      apiService
        .getContract(id)
        .then((res) => {
          const data = res?.data ?? res;
          this.contract = data || {};
          this.isLessor = userId && String(this.contract.lessorId) === String(userId);
          this.isLessee = userId && String(this.contract.lesseeId) === String(userId);
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
      const map = { 0: '待确认', 1: '待服务', 2: '已完成', 3: '已取消' };
      return map[status] ?? '未知';
    },
    // 供应方确认订单
    handleConfirm() {
      if (!this.isLessor) return;
      this.$tip.confirm('确认接单后，订单将进入待服务状态', true, {}, '确认接单').then(() => {
        this.$tip.loading('提交中...');
        apiService.confirmContract(this.contract.id).then(() => {
          this.$tip.loaded();
          this.contract.status = 1;
          this.$tip.success('已确认接单');
        }).catch((err) => {
          this.$tip.loaded();
          this.$tip.alert(err?.message || '操作失败');
        });
      }).catch(() => {});
    },
    // 任一方取消订单
    handleCancel() {
      this.$tip.prompt('请输入取消原因', '取消订单').then((reason) => {
        if (!reason) return;
        this.$tip.loading('提交中...');
        apiService.cancelContract(this.contract.id, reason).then(() => {
          this.$tip.loaded();
          this.contract.status = 3;
          this.contract.cancelReason = reason;
          this.$tip.success('已取消订单');
        }).catch((err) => {
          this.$tip.loaded();
          this.$tip.alert(err?.message || '操作失败');
        });
      }).catch(() => {});
    },
    // 任一方确认完成
    handleComplete() {
      this.$tip.confirm('确认已完成本次服务？', true, {}, '确认完成').then(() => {
        this.$tip.loading('提交中...');
        apiService.completeContract(this.contract.id).then(() => {
          this.$tip.loaded();
          this.contract.status = 2;
          this.$tip.success('已标记完成');
        }).catch((err) => {
          this.$tip.loaded();
          this.$tip.alert(err?.message || '操作失败');
        });
      }).catch(() => {});
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
