<template>
  <view class="container">
    <uni-forms ref="form" :modelValue="formData" :rules="rules">
      <uni-forms-item label="品牌" name="brand">
        <uni-easyinput v-model="formData.brand" placeholder="请输入品牌"></uni-easyinput>
      </uni-forms-item>
      
      <uni-forms-item label="型号" name="model">
        <uni-easyinput v-model="formData.model" placeholder="请输入型号"></uni-easyinput>
      </uni-forms-item>
      
      <uni-forms-item label="日租金" name="dailyRate">
        <uni-easyinput type="number" v-model="formData.dailyRate" placeholder="请输入日租金"></uni-easyinput>
      </uni-forms-item>
      
      <uni-forms-item label="所在地区" name="address">
        <uni-easyinput v-model="formData.address" placeholder="请输入详细地址"></uni-easyinput>
      </uni-forms-item>
      
      <uni-forms-item label="描述" name="description">
        <uni-easyinput type="textarea" v-model="formData.description" placeholder="请输入设备描述"></uni-easyinput>
      </uni-forms-item>
      
      <button type="primary" @click="submit">发布</button>
    </uni-forms>
  </view>
</template>

<script>
export default {
  data() {
    return {
      formData: {
        brand: '',
        model: '',
        dailyRate: '',
        address: '',
        description: ''
      },
      rules: {
        brand: { rules: [{ required: true, errorMessage: '请输入品牌' }] },
        model: { rules: [{ required: true, errorMessage: '请输入型号' }] },
        dailyRate: { rules: [{ required: true, errorMessage: '请输入租金' }] }
      }
    }
  },
  methods: {
    submit() {
      this.$refs.form.validate().then(res => {
        console.log('表单数据信息：', res);
        uni.showToast({ title: '发布成功', icon: 'success' });
        setTimeout(() => uni.navigateBack(), 1500);
      }).catch(err => {
        console.log('表单错误信息：', err);
      })
    }
  }
}
</script>

<style>
.container {
  padding: 20px;
}
</style>
