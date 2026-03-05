<template>
  <view class="container">
    <uni-forms ref="form" :modelValue="formData" :rules="rules">
      <uni-group title="甲方（出租方）" top="0">
        <uni-forms-item label="姓名" name="lessorName">
          <uni-easyinput v-model="formData.lessorName" placeholder="请输入甲方姓名"></uni-easyinput>
        </uni-forms-item>
        <uni-forms-item label="电话" name="lessorPhone">
          <uni-easyinput v-model="formData.lessorPhone" placeholder="请输入甲方电话"></uni-easyinput>
        </uni-forms-item>
      </uni-group>
      
      <uni-group title="乙方（承租方）">
        <uni-forms-item label="姓名" name="lesseeName">
          <uni-easyinput v-model="formData.lesseeName" placeholder="请输入乙方姓名"></uni-easyinput>
        </uni-forms-item>
        <uni-forms-item label="电话" name="lesseePhone">
          <uni-easyinput v-model="formData.lesseePhone" placeholder="请输入乙方电话"></uni-easyinput>
        </uni-forms-item>
      </uni-group>
      
      <uni-group title="租赁详情">
        <uni-forms-item label="设备" name="machineId">
          <uni-data-select v-model="formData.machineId" :localdata="machineOptions"></uni-data-select>
        </uni-forms-item>
        <uni-forms-item label="开始日期" name="startDate">
          <uni-datetime-picker type="date" v-model="formData.startDate"></uni-datetime-picker>
        </uni-forms-item>
        <uni-forms-item label="结束日期" name="endDate">
          <uni-datetime-picker type="date" v-model="formData.endDate"></uni-datetime-picker>
        </uni-forms-item>
        <uni-forms-item label="租金(元)" name="amount">
          <uni-easyinput type="number" v-model="formData.amount" placeholder="请输入总租金"></uni-easyinput>
        </uni-forms-item>
      </uni-group>
      
      <button type="primary" @click="submit">生成合同</button>
    </uni-forms>
  </view>
</template>

<script>
export default {
  data() {
    return {
      formData: {
        lessorName: '',
        lessorPhone: '',
        lesseeName: '',
        lesseePhone: '',
        machineId: '',
        startDate: '',
        endDate: '',
        amount: ''
      },
      machineOptions: [
        { value: 1, text: '三一 SY200' },
        { value: 2, text: '徐工 XE215' }
      ],
      rules: {
        lessorName: { rules: [{ required: true, errorMessage: '请输入甲方姓名' }] },
        lesseeName: { rules: [{ required: true, errorMessage: '请输入乙方姓名' }] },
        machineId: { rules: [{ required: true, errorMessage: '请选择设备' }] },
        startDate: { rules: [{ required: true, errorMessage: '请选择开始日期' }] },
        amount: { rules: [{ required: true, errorMessage: '请输入金额' }] }
      }
    }
  },
  onLoad(options) {
    if (options.machineId) {
      this.formData.machineId = Number(options.machineId);
    }
  },
  methods: {
    submit() {
      this.$refs.form.validate().then(res => {
        uni.showLoading({ title: '生成中...' });
        setTimeout(() => {
          uni.hideLoading();
          uni.showToast({ title: '合同已生成', icon: 'success' });
          setTimeout(() => {
            uni.redirectTo({ url: '/pages/contract/detail?id=1' });
          }, 1500);
        }, 1000);
      }).catch(err => {
        console.log('表单错误信息：', err);
      })
    }
  }
}
</script>

<style>
.container {
  padding: 10px;
  padding-bottom: 50px;
}
</style>
