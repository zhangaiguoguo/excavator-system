<template>
  <view class="page">
    <view class="card form-card">
      <view v-if="demandId && demand.id" class="demand-brief card-inner">
        <text class="brief-title">关联需求</text>
        <text class="brief-desc">{{ demand.description ? (demand.description.slice(0, 40) + (demand.description.length > 40 ? '...' : '')) : '—' }}</text>
        <text class="brief-addr">{{ demand.province }}{{ demand.city }}{{ demand.district || '' }}</text>
      </view>
      <uni-forms ref="form" :modelValue="formData" :rules="rules">
        <uni-forms-item label="我的设备" name="machineId" required>
          <uni-data-select v-model="formData.machineId" :localdata="machineOptions" placeholder="请选择要出租的设备"></uni-data-select>
        </uni-forms-item>
        <uni-forms-item label="开始日期" name="startDate" required>
          <uni-datetime-picker type="date" v-model="formData.startDate"></uni-datetime-picker>
        </uni-forms-item>
        <uni-forms-item label="结束日期" name="endDate" required>
          <uni-datetime-picker type="date" v-model="formData.endDate"></uni-datetime-picker>
        </uni-forms-item>
        <uni-forms-item label="预估总价(元)" name="amount" required>
          <uni-easyinput type="number" v-model="formData.amount" placeholder="请输入预估总价，仅供参考"></uni-easyinput>
        </uni-forms-item>
        <button type="primary" class="submit-btn" @click="submit">生成订单（确认接单）</button>
      </uni-forms>
    </view>
  </view>
</template>

<script>
import apiService from '@/api/api';
import appStore from '@/store/app';
import { ServiceType } from '@excavator/types';

export default {
  data() {
    return {
      demandId: '',
      demand: {},
      formData: {
        machineId: '',
        startDate: '',
        endDate: '',
        amount: '',
      },
      machineOptions: [],
      rules: {
        machineId: { rules: [{ required: true, errorMessage: '请选择设备' }] },
        startDate: { rules: [{ required: true, errorMessage: '请选择开始日期' }] },
        endDate: { rules: [{ required: true, errorMessage: '请选择结束日期' }] },
        amount: { rules: [{ required: true, errorMessage: '请输入金额' }] },
      },
    };
  },
  onLoad(options) {
    this.demandId = options.demandId || '';
    if (options.machineId) this.formData.machineId = String(options.machineId);
    if (this.demandId) this.fetchDemand(this.demandId);
    this.fetchMyMachines();
  },
  methods: {
    fetchDemand(id) {
      apiService.getDemand(id).then((res) => {
        const data = res?.data ?? res;
        this.demand = data || {};
      }).catch(() => { this.demand = {}; });
    },
    fetchMyMachines() {
      const userId = (appStore().state.userInfo || {}).id || uni.getStorageSync('userId');
      if (!userId) return;
      apiService.getMachines({ userId, page: 1, pageSize: 100 }).then((res) => {
        const data = res?.data ?? res;
        const list = data?.list ?? (Array.isArray(data) ? data : []);
        const arr = Array.isArray(list) ? list : [];
        this.machineOptions = arr.map((m) => ({
          value: String(m.id),
          text: (m.model || m.brand || '') + (m.rentAmount ? ' ¥' + m.rentAmount + '/天' : ''),
        }));
      }).catch(() => { this.machineOptions = []; });
    },
    submit() {
      this.$refs.form.validate().then(() => {
        const userId = (appStore().state.userInfo || {}).id || uni.getStorageSync('userId');
        if (!userId) {
          this.$tip.alert('请先登录');
          return;
        }
        const lesseeId = this.demand.userId || this.demand.user?.id;
        const payload = {
          machineId: this.formData.machineId,
          demandId: this.demandId || undefined,
          serviceStartTime: this.formData.startDate || undefined,
          serviceEndTime: this.formData.endDate || undefined,
          totalPrice: this.formData.amount ? Number(this.formData.amount) : undefined,
          lessorId: userId,
          lesseeId: lesseeId || userId,
          serviceType: ServiceType.MACHINE_RENT,
          resourceId: this.formData.machineId,
          resourceInfo: {
            model: this.demand.machineModel || this.demand.model || '',
            brand: this.demand.brand || '',
          },
        };
        this.$tip.loading('生成中...');
        apiService.createContract(payload).then((res) => {
          const data = res?.data ?? res;
          const id = data?.id || data?.id;
          this.$tip.loaded();
          this.$tip.success('订单已生成，等待对方确认');
          setTimeout(() => {
            uni.redirectTo({ url: '/pages/contract/detail?id=' + (id || '') });
          }, 1500);
        }).catch((err) => {
          this.$tip.loaded();
          this.$tip.alert(err?.message || '生成失败');
        });
      }).catch(() => {});
    },
  },
};
</script>

<style lang="scss" scoped>
.page { min-height: 100vh; background: #F5F6F8; padding: 16px; padding-bottom: 40px; }
.form-card { padding: 16px; }
.demand-brief { margin-bottom: 16px; padding: 12px; background: #f8fafc; }
.brief-title { font-size: 12px; color: #999; display: block; margin-bottom: 4px; }
.brief-desc { font-size: 14px; color: #333; display: block; margin-bottom: 4px; }
.brief-addr { font-size: 12px; color: #666; }
.submit-btn { margin-top: 24px; width: 100%; border-radius: 24px; }
</style>
