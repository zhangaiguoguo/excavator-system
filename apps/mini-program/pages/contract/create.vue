<template>
  <view class="page">
    <view class="card form-card">
      <!-- 从设备详情进入：展示设备信息 -->
      <view v-if="machineId && machine.id" class="device-brief card-inner">
        <text class="brief-title">设备信息</text>
        <text class="device-name">{{ machine.model || '设备' }} {{ machine.brand || '' }}</text>
        <text class="device-price">租赁价格：¥{{ machine.rentAmount || '—' }}/{{ rentUnitLabel(machine.rentUnit) }}</text>
      </view>
      <!-- 从需求进入：展示关联需求 -->
      <view v-if="demandId && demand.id && !machineId" class="demand-brief card-inner">
        <text class="brief-title">关联需求</text>
        <text class="brief-desc">{{ demand.description ? (demand.description.slice(0, 40) + (demand.description.length > 40 ? '...' : '')) : '—' }}</text>
        <text class="brief-addr">{{ demand.province }}{{ demand.city }}{{ demand.district || '' }}</text>
      </view>

      <uni-forms ref="form" :modelValue="formData" :rules="rules">
        <!-- 从需求进入：选择我的设备 -->
        <uni-forms-item v-if="demandId && !machineId" label="我的设备" name="machineId" required>
          <uni-data-select v-model="formData.machineId" :localdata="machineOptions" placeholder="请选择要出租的设备"></uni-data-select>
        </uni-forms-item>

        <uni-forms-item label="开始日期" name="startDate" required>
          <uni-datetime-picker type="date" v-model="formData.startDate" @change="onDateChange"></uni-datetime-picker>
        </uni-forms-item>
        <uni-forms-item label="结束日期" name="endDate" required>
          <uni-datetime-picker type="date" v-model="formData.endDate" @change="onDateChange"></uni-datetime-picker>
        </uni-forms-item>
        <!-- 从设备进入：自动计算租赁天数和订单金额 -->
        <view v-if="machineId && machine.id" class="form-row computed-row">
          <text class="label">租赁天数</text>
          <text class="value">{{ rentalDays }} 天</text>
        </view>
        <view v-if="machineId && machine.id" class="form-row computed-row">
          <text class="label">订单金额</text>
          <text class="value price">¥{{ orderAmount }}</text>
        </view>
        <!-- 从需求进入：手动填预估总价 -->
        <uni-forms-item v-if="demandId && !machineId" label="预估总价(元)" name="amount" required>
          <uni-easyinput type="number" v-model="formData.amount" placeholder="请输入预估总价，仅供参考"></uni-easyinput>
        </uni-forms-item>

        <!-- 从设备进入：施工信息、联系人、备注 -->
        <template v-if="machineId && machine.id">
          <uni-forms-item label="施工地址" required>
            <LocationPicker v-model="locationValue" />
          </uni-forms-item>
          <uni-forms-item label="工程内容" name="projectContent">
            <uni-easyinput type="textarea" v-model="formData.projectContent" placeholder="选填"></uni-easyinput>
          </uni-forms-item>
          <uni-forms-item label="工程规模" name="projectScale">
            <uni-easyinput v-model="formData.projectScale" placeholder="选填，如：土方量、工期等"></uni-easyinput>
          </uni-forms-item>
          <uni-forms-item label="联系人" name="contactName" required>
            <uni-easyinput v-model="formData.contactName" placeholder="请输入联系人姓名"></uni-easyinput>
          </uni-forms-item>
          <uni-forms-item label="联系电话" name="contactPhone" required>
            <uni-easyinput type="number" v-model="formData.contactPhone" placeholder="请输入联系电话"></uni-easyinput>
          </uni-forms-item>
          <uni-forms-item label="订单备注" name="demandRemark">
            <uni-easyinput type="textarea" v-model="formData.demandRemark" placeholder="选填"></uni-easyinput>
          </uni-forms-item>
        </template>

        <button type="primary" class="submit-btn" @click="submit">{{ machineId ? '提交订单' : '生成订单（确认接单）' }}</button>
      </uni-forms>
    </view>
  </view>
</template>

<script>
import apiService from '@/api/api';
import appStore from '@/store/app';
import { ServiceType } from '@excavator/types';
import { useDictOne } from '@/hooks/useDict';
import LocationPicker from '@/components/LocationPicker.vue';
import { checkUserCanPublish } from '@/common/util/publishCheck.js';

export default {
  components: { LocationPicker },
  data() {
    return {
      machineId: '',
      demandId: '',
      machine: {},
      demand: {},
      locationValue: { province: '', city: '', district: '', address: '' },
      formData: {
        machineId: '',
        startDate: '',
        endDate: '',
        amount: '',
        serviceLocation: '',
        projectContent: '',
        projectScale: '',
        contactName: '',
        contactPhone: '',
        demandRemark: '',
      },
      machineOptions: [],
      work_hours_unit: useDictOne('work_hours_unit'),
      rules: {
        machineId: { rules: [{ required: true, errorMessage: '请选择设备' }] },
        startDate: { rules: [{ required: true, errorMessage: '请选择开始日期' }] },
        endDate: { rules: [{ required: true, errorMessage: '请选择结束日期' }] },
        amount: { rules: [{ required: true, errorMessage: '请输入金额' }] },
        contactName: { rules: [{ required: true, errorMessage: '请输入联系人' }] },
        contactPhone: { rules: [{ required: true, errorMessage: '请输入联系电话' }] },
      },
    };
  },
  computed: {
    rentalDays() {
      const s = this.formData.startDate;
      const e = this.formData.endDate;
      if (!s || !e) return 0;
      const start = new Date(String(s).slice(0, 10));
      const end = new Date(String(e).slice(0, 10));
      if (end < start) return 0;
      return Math.ceil((end - start) / (24 * 60 * 60 * 1000)) + 1;
    },
    orderAmount() {
      if (!this.machine.id || !this.machine.rentAmount) return '0.00';
      const days = this.rentalDays;
      const price = Number(this.machine.rentAmount);
      return (days * price).toFixed(2);
    },
  },
  onLoad(options) {
    this.machineId = options.machineId || '';
    this.demandId = options.demandId || '';
    if (options.machineId) {
      this.formData.machineId = String(options.machineId);
      this.fetchMachine(options.machineId);
    }
    if (this.demandId) this.fetchDemand(this.demandId);
    if (!this.machineId) this.fetchMyMachines();
    const userInfo = (appStore().state && appStore().state.userInfo) || {};
    if (this.machineId && userInfo.nickname) this.formData.contactName = userInfo.nickname;
    if (this.machineId && userInfo.phone && userInfo.phone !== 'Unknown') this.formData.contactPhone = userInfo.phone;
  },
  watch: {
    locationValue: {
      deep: true,
      handler(v) {
        if (v && this.machineId) {
          this.formData.serviceLocation = [v.province, v.city, v.district, v.address].filter(Boolean).join(' ');
        }
      },
    },
  },
  methods: {
    rentUnitLabel(v) {
      const arr = (this.work_hours_unit && this.work_hours_unit.value) || this.work_hours_unit || [];
      const o = Array.isArray(arr) ? arr.find((d) => d.value === v) : null;
      return o ? o.text : '天';
    },
    onDateChange() {
      this.$forceUpdate();
    },
    fetchMachine(id) {
      apiService.getMachine(String(id)).then((res) => {
        const data = res?.data ?? res;
        this.machine = data || {};
      }).catch(() => { this.machine = {}; });
    },
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
      const userInfo = (appStore().state && appStore().state.userInfo) || {};
      const publishCheck = checkUserCanPublish(userInfo);
      if (!publishCheck.can) {
        this.$tip.confirm(publishCheck.message + '，是否前往设置？', true, {}, '提示').then(() => {
          if (publishCheck.redirectPath) uni.navigateTo({ url: publishCheck.redirectPath });
        }).catch(() => {});
        return;
      }
      const userId = userInfo.id || uni.getStorageSync('userId');
      if (!userId) {
        this.$tip.alert('请先登录');
        return;
      }

      if (this.machineId && this.machine.id) {
        this.$refs.form.validate().then(() => {
          const startStr = String(this.formData.startDate || '').slice(0, 10);
          const endStr = String(this.formData.endDate || '').slice(0, 10);
          if (!startStr || !endStr || new Date(endStr) < new Date(startStr)) {
            this.$tip.alert('请选择有效的开始、结束日期');
            return;
          }
          const payload = {
            machineId: this.machine.id,
            lesseeId: userId,
            lessorId: this.machine.userId || this.machine.user?.id,
            serviceType: ServiceType.MACHINE_RENT,
            resourceId: this.machine.id,
            resourceInfo: {
              model: this.machine.model,
              brand: this.machine.brand,
              rentAmount: this.machine.rentAmount,
              rentUnit: this.machine.rentUnit,
            },
            priceUnit: this.machine.rentUnit ? (this.rentUnitLabel(this.machine.rentUnit) === '天' ? '元/天' : '元/小时') : '元/天',
            serviceStartTime: startStr,
            serviceEndTime: endStr,
            totalPrice: this.orderAmount ? Number(this.orderAmount) : undefined,
            serviceLocation: this.formData.serviceLocation || [this.locationValue.province, this.locationValue.city, this.locationValue.district, this.locationValue.address].filter(Boolean).join(' ') || undefined,
            projectContent: (this.formData.projectContent || '').trim() || undefined,
            projectScale: (this.formData.projectScale || '').trim() || undefined,
            demandRemark: [
              this.formData.contactName ? '联系人：' + this.formData.contactName : '',
              this.formData.contactPhone ? '联系电话：' + this.formData.contactPhone : '',
              (this.formData.demandRemark || '').trim(),
            ].filter(Boolean).join('\n') || undefined,
          };
          if (!payload.serviceLocation) {
            this.$tip.alert('请填写施工地址');
            return;
          }
          this.$tip.loading('提交中...');
          apiService.createContract(payload).then((res) => {
            const data = res?.data ?? res;
            const id = data?.id || data?.id;
            this.$tip.loaded();
            this.$tip.success('订单已提交，等待机主接单');
            setTimeout(() => {
              uni.redirectTo({ url: '/pages/contract/detail?id=' + (id || '') });
            }, 1500);
          }).catch((err) => {
            this.$tip.loaded();
            this.$tip.alert(err?.message || '提交失败');
          });
        }).catch(() => {});
        return;
      }

      this.$refs.form.validate().then(() => {
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
.card-inner { margin-bottom: 16px; padding: 12px; background: #f8fafc; border-radius: 12px; }
.brief-title { font-size: 12px; color: #999; display: block; margin-bottom: 4px; }
.device-name { font-size: 15px; font-weight: 600; color: #333; display: block; margin-bottom: 4px; }
.device-price { font-size: 14px; color: #FF4D4F; }
.demand-desc { font-size: 14px; color: #333; display: block; margin-bottom: 4px; }
.brief-addr { font-size: 12px; color: #666; }
.form-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; font-size: 14px; }
.computed-row .label { color: #666; }
.computed-row .value.price { color: #FF4D4F; font-weight: 700; }
.submit-btn { margin-top: 24px; width: 100%; border-radius: 24px; }
</style>
