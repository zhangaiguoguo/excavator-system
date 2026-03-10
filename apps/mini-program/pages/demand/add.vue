<template>
  <view class="page">
    <view class="card form-card">
    <uni-forms ref="formRef" label-position="right" label-width="80px" :modelValue="form" :rules="rules">
      <uni-forms-item label="需求类型" name="type" required>
        <uni-data-select v-model="form.type" :localdata="typeOptions" placeholder="请选择"></uni-data-select>
      </uni-forms-item>
      <uni-forms-item label="所需设备/机型" name="machineTypes" required>
        <uni-data-checkbox v-model="form.machineTypes" :localdata="machineTypeOptions" multiple></uni-data-checkbox>
        <text class="tip">求租设备时多选所需类型，招聘机手时选可操作设备类型</text>
      </uni-forms-item>
      <uni-forms-item label="施工地址" required>
        <LocationPicker v-model="locationValue" />
      </uni-forms-item>
      <uni-forms-item label="需求时段" required>
        <uni-datetime-picker
          type="daterange"
          v-model="demandDateRange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :clear-icon="false"
        />
      </uni-forms-item>
      <view class="form-row">
        <uni-forms-item label="预算下限(元)" name="budgetMin" class="flex1">
          <uni-easyinput type="number" v-model="form.budgetMin" placeholder="选填"></uni-easyinput>
        </uni-forms-item>
        <uni-forms-item label="预算上限(元)" name="budgetMax" class="flex1">
          <uni-easyinput type="number" v-model="form.budgetMax" placeholder="选填"></uni-easyinput>
        </uni-forms-item>
      </view>
      <uni-forms-item label="是否急聘" name="isUrgent">
        <uni-data-checkbox v-model="form.isUrgent" :localdata="[{ text: '急聘', value: 'Y' }]"></uni-data-checkbox>
      </uni-forms-item>
      <uni-forms-item label="需求图片" name="images" required>
        <UploadImageList v-model="form.images" :max="5" tip="最少1张，最多5张" />
      </uni-forms-item>
      <uni-forms-item label="需求视频" name="video">
        <UploadVideo v-model="form.video" />
      </uni-forms-item>
      <uni-forms-item label="需求描述" name="description" required>
        <uni-easyinput type="textarea" v-model="form.description" placeholder="详细描述工作内容、工期、要求等"></uni-easyinput>
      </uni-forms-item>
      <button type="primary" class="submit-btn" @click="submit">发布需求</button>
    </uni-forms>
    </view>
  </view>
</template>

<script>
import apiService from '@/api/api';
import { useDictOne } from '@/hooks/useDict';
import { setListRefreshHint } from '@/common/util/listRefresh.js';
import { checkUserCanPublish } from '@/common/util/publishCheck.js';
import appStore from '@/store/app';
import LocationPicker from '@/components/LocationPicker.vue';
import UploadImageList from '@/components/UploadImageList.vue';
import UploadVideo from '@/components/UploadVideo.vue';

export default {
  components: { LocationPicker, UploadImageList, UploadVideo },
  data() {
    return {
      demandDateRange: [],
      locationValue: { province: '', city: '', district: '', address: '' },
      form: {
        userId: '',
        type: '1',
        machineTypes: [],
        province: '',
        city: '',
        district: '',
        address: '',
        startDate: '',
        endDate: '',
        budgetMin: '',
        budgetMax: '',
        description: '',
        images: [],
        video: '',
        isUrgent: 'N'
      },
      typeOptions: [
        { text: '求租设备', value: '1' },
        { text: '招聘机手', value: '2' }
      ],
      machineTypeOptions: useDictOne('machine_type'),
      rules: {
        type: { rules: [{ required: true, errorMessage: '请选择需求类型' }] },
        machineTypes: { rules: [{ required: true, errorMessage: '请选择所需设备/机型' }] },
        province: { rules: [{ required: true, errorMessage: '请填写省份' }] },
        city: { rules: [{ required: true, errorMessage: '请填写城市' }] },
        address: { rules: [{ required: true, errorMessage: '请填写详细地址' }] },
        startDate: { rules: [{ required: true, errorMessage: '请选择开始日期' }] },
        endDate: { rules: [{ required: true, errorMessage: '请选择结束日期' }] },
        images: { rules: [{ required: true, errorMessage: '请至少上传1张图片' }] },
        description: { rules: [{ required: true, errorMessage: '请填写需求描述' }] }
      }
    };
  },
  computed: {
    userInfo() {
      return (appStore().state && appStore().state.userInfo) || {};
    },
  },
  watch: {
    demandDateRange: {
      handler(arr) {
        const a = Array.isArray(arr) ? arr : [];
        this.form.startDate = a[0] || '';
        this.form.endDate = a[1] || '';
      },
      deep: true,
    },
    locationValue: {
      deep: true,
      handler(v) {
        if (v) {
          this.form.province = v.province || '';
          this.form.city = v.city || '';
          this.form.district = v.district || '';
          this.form.address = v.address || '';
        }
      },
    },
  },
  onLoad() {
    const store = appStore();
    this.form.userId = (store.state && store.state.userInfo && store.state.userInfo.id) || uni.getStorageSync('userId') || '';
  },
  methods: {
    submit() {
      const publishCheck = checkUserCanPublish(this.userInfo);
      if (!publishCheck.can) {
        this.$tip.alert(publishCheck.message);
        return;
      }
      this.$refs.formRef.validate().then(() => {
        if (!this.form.userId) {
          this.$tip.alert('请先登录');
          return;
        }
        const machineTypes = Array.isArray(this.form.machineTypes) ? this.form.machineTypes : [this.form.machineTypes].filter(Boolean);
        if (machineTypes.length === 0) {
          this.$tip.alert('请选择所需设备/机型');
          return;
        }
        if (!this.form.images || this.form.images.length === 0) {
          this.$tip.alert('请至少上传1张图片');
          return;
        }
        const payload = {
          userId: this.form.userId,
          type: String(this.form.type),
          machineTypes,
          province: this.form.province,
          city: this.form.city,
          district: this.form.district || '',
          address: this.form.address,
          startDate: this.form.startDate,
          endDate: this.form.endDate,
          budgetMin: this.form.budgetMin ? Number(this.form.budgetMin) : undefined,
          budgetMax: this.form.budgetMax ? Number(this.form.budgetMax) : undefined,
          description: this.form.description,
          images: this.form.images,
          video: this.form.video || undefined,
          isUrgent: this.form.isUrgent || 'N'
        };
        this.$tip.loading('发布中...');
        apiService.createDemand(payload).then(() => {
          this.$tip.loaded();
          this.$tip.success('发布成功');
          setListRefreshHint('demand');
          setListRefreshHint('publish');
          setTimeout(() => uni.navigateBack(), 1500);
        }).catch(err => {
          this.$tip.loaded();
          this.$tip.alert(err?.message || '发布失败');
        });
      }).catch(() => {});
    }
  }
};
</script>

<style lang="scss" scoped>
.page { min-height: 100vh; background: #F5F6F8; padding: 16px; padding-bottom: 40px; }
.form-card { padding: 16px; }
.form-row { display: flex; gap: 12px; }
.flex1 { flex: 1; }
.date-row { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; }
.date-row .to { color: #999; font-size: 14px; }
.tip { font-size: 12px; color: #999; margin-top: 4px; display: block; }
.submit-btn { margin-top: 24px; width: 100%; border-radius: 24px; }
</style>
