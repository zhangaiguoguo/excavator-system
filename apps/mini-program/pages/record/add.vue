<template>
  <view class="container">
    <uni-segmented-control :current="type" :values="['收入', '支出']" @clickItem="onTypeChange" styleType="button" activeColor="#007aff"></uni-segmented-control>
    
    <uni-forms ref="form" :modelValue="formData" :rules="rules" style="margin-top: 20px;">
      <uni-forms-item label="金额" name="amount">
        <uni-easyinput type="number" v-model="formData.amount" placeholder="请输入金额"></uni-easyinput>
      </uni-forms-item>
      
      <uni-forms-item label="分类" name="category">
        <uni-data-select v-model="formData.category" :localdata="categoryOptions"></uni-data-select>
      </uni-forms-item>
      
      <uni-forms-item label="日期" name="date">
        <uni-datetime-picker type="date" v-model="formData.date"></uni-datetime-picker>
      </uni-forms-item>
      
      <uni-forms-item label="备注" name="remark">
        <uni-easyinput type="textarea" v-model="formData.remark" placeholder="备注信息"></uni-easyinput>
      </uni-forms-item>
      
      <button type="primary" @click="submit">保存</button>
    </uni-forms>
  </view>
</template>

<script>
export default {
  data() {
    return {
      type: 0, // 0: Income, 1: Expense
      formData: {
        amount: '',
        category: '',
        date: '',
        remark: ''
      },
      rules: {
        amount: { rules: [{ required: true, errorMessage: '请输入金额' }] },
        category: { rules: [{ required: true, errorMessage: '请选择分类' }] },
        date: { rules: [{ required: true, errorMessage: '请选择日期' }] }
      }
    }
  },
  computed: {
    categoryOptions() {
      if (this.type === 0) {
        return [{ value: 1, text: '租金' }, { value: 5, text: '其他' }];
      } else {
        return [
          { value: 2, text: '油费' },
          { value: 3, text: '维修' },
          { value: 4, text: '工资' },
          { value: 5, text: '其他' }
        ];
      }
    }
  },
  methods: {
    onTypeChange(e) {
      this.type = e.currentIndex;
      this.formData.category = '';
    },
    submit() {
      this.$refs.form.validate().then(res => {
        uni.showToast({ title: '保存成功', icon: 'success' });
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
