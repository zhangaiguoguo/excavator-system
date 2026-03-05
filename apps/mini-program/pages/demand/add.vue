<template>
  <view class="container">
    <uni-forms ref="form" :modelValue="formData" :rules="rules">
      <uni-forms-item label="需求类型" name="type">
        <uni-data-checkbox v-model="formData.type" :localdata="typeOptions"></uni-data-checkbox>
      </uni-forms-item>
      
      <uni-forms-item label="标题" name="title">
        <uni-easyinput v-model="formData.title" placeholder="如：急需 200 型挖掘机"></uni-easyinput>
      </uni-forms-item>
      
      <uni-forms-item label="地点" name="location">
        <uni-easyinput v-model="formData.location" placeholder="施工地点"></uni-easyinput>
      </uni-forms-item>
      
      <uni-forms-item label="工期" name="duration">
        <uni-easyinput v-model="formData.duration" placeholder="如：30天"></uni-easyinput>
      </uni-forms-item>
      
      <uni-forms-item label="预算" name="budget">
        <uni-easyinput v-model="formData.budget" placeholder="如：2000元/天"></uni-easyinput>
      </uni-forms-item>
      
      <uni-forms-item label="描述" name="description">
        <uni-easyinput type="textarea" v-model="formData.description" placeholder="详细描述工作内容"></uni-easyinput>
      </uni-forms-item>
      
      <button type="primary" @click="submit">发布需求</button>
    </uni-forms>
  </view>
</template>

<script>
export default {
  data() {
    return {
      formData: {
        type: 1,
        title: '',
        location: '',
        duration: '',
        budget: '',
        description: ''
      },
      typeOptions: [
        { text: '找设备', value: 1 },
        { text: '找机手', value: 2 }
      ],
      rules: {
        title: { rules: [{ required: true, errorMessage: '请输入标题' }] },
        location: { rules: [{ required: true, errorMessage: '请输入地点' }] }
      }
    }
  },
  methods: {
    submit() {
      this.$refs.form.validate().then(res => {
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
