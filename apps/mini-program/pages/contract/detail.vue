<template>
  <view class="page">
    <view v-if="loading" class="loading-wrap"><uni-load-more status="loading" /></view>
    <template v-else-if="contract.id">
      <view class="card">
        <view class="card-head">
          <text class="contract-no">{{ contract.contractNo }}</text>
          <text class="status-tag">{{ getStatusText(contract.status) }}</text>
        </view>
        <view class="section-title">设备信息</view>
        <view class="row"><text class="label">设备名称</text><text class="value">{{ serviceName }}</text></view>
        <view class="row" v-if="unitPriceText"><text class="label">租赁价格</text><text class="value">{{ unitPriceText }}</text></view>
      </view>
      <view class="card">
        <view class="section-title">施工信息</view>
        <view class="row" v-if="contract.serviceLocation"><text class="label">施工地址</text><text class="value">{{ contract.serviceLocation }}</text></view>
        <view class="row" v-if="contract.projectContent"><text class="label">工程内容</text><text class="value">{{ contract.projectContent }}</text></view>
        <view class="row" v-if="contract.projectScale"><text class="label">工程规模</text><text class="value">{{ contract.projectScale }}</text></view>
      </view>
      <view class="card">
        <view class="section-title">时间信息</view>
        <view class="row">
          <text class="label">开始日期</text>
          <text class="value">{{ dateStr(contract.serviceStartTime) }}</text>
        </view>
        <view class="row">
          <text class="label">结束日期</text>
          <text class="value">{{ dateStr(contract.serviceEndTime) }}</text>
        </view>
      </view>
      <view class="card">
        <view class="section-title">联系人信息</view>
        <view class="row"><text class="label">需求方</text><text class="value">{{ lesseeName }}</text></view>
        <view class="row" v-if="contract.lessee && contract.lessee.phone"><text class="label">电话</text><text class="value">{{ contract.lessee.phone }}</text></view>
        <view class="row"><text class="label">供应方</text><text class="value">{{ lessorName }}</text></view>
        <view class="row" v-if="contract.lessor && contract.lessor.phone"><text class="label">电话</text><text class="value">{{ contract.lessor.phone }}</text></view>
      </view>
      <view class="card">
        <view class="section-title">费用信息</view>
        <view class="row" v-if="unitPriceText"><text class="label">单价</text><text class="value">{{ unitPriceText }}</text></view>
        <view class="row" v-if="rentalDays != null"><text class="label">租赁天数</text><text class="value">{{ rentalDays }} 天</text></view>
        <view class="row" v-if="contract.totalPrice != null">
          <text class="label">订单金额</text>
          <text class="value price">¥{{ Number(contract.totalPrice).toFixed(2) }}</text>
        </view>
      </view>
      <view class="card" v-if="contract.demandRemark">
        <view class="row"><text class="label">订单备注</text><text class="value">{{ contract.demandRemark }}</text></view>
      </view>
      <view class="card" v-if="contract.cancelReason">
        <view class="row"><text class="label">取消原因</text><text class="value">{{ contract.cancelReason }}</text></view>
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
        >开始施工</button>
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
        >完成订单</button>
      </view>
    </template>
    <view v-else class="empty">订单不存在</view>
    <view class="safe-bottom" />
  </view>
</template>

<script>
import apiService from '@/api/api';
import appStore from '@/store/app';
import { useDictOne } from '@/hooks/useDict';

export default {
  data() {
    return {
      contract: {},
      loading: true,
      demandCompleted: false,
      isLessor: false,
      isLessee: false,
      order_status: useDictOne('order_status'),
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
    unitPriceText() {
      const info = this.contract.resourceInfo || {};
      const u = (this.contract.priceUnit || '元/天').replace('元/', '');
      if (info.rentAmount != null) return '¥' + info.rentAmount + '/' + u;
      if (this.contract.totalPrice != null && this.rentalDays) return '¥' + (Number(this.contract.totalPrice) / this.rentalDays).toFixed(2) + '/' + u;
      if (this.contract.priceUnit) return this.contract.priceUnit;
      return '';
    },
    rentalDays() {
      const s = this.contract.serviceStartTime;
      const e = this.contract.serviceEndTime;
      if (!s || !e) return null;
      const start = new Date(String(s).slice(0, 10));
      const end = new Date(String(e).slice(0, 10));
      if (end < start) return 0;
      return Math.ceil((end - start) / (24 * 60 * 60 * 1000)) + 1;
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
      const arr = (this.order_status && this.order_status.value) || this.order_status || [];
      const list = Array.isArray(arr) ? arr : [];
      const item = list.find((i) => String(i.value) === String(status));
      return (item && (item.text || item.label)) || '未知';
    },
    handleConfirm() {
      if (!this.isLessor) return;
      this.$tip.confirm('确认开始施工后，订单将进入施工中状态', true, {}, '开始施工').then(() => {
        this.$tip.loading('提交中...');
        apiService.confirmContract(this.contract.id).then(() => {
          this.$tip.loaded();
          this.contract.status = 1;
          this.$tip.success('已开始施工');
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
.value.price { color: #FF4D4F; font-weight: 700; }
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
