<template>
  <view class="container">
    <uni-segmented-control :current="type" :values="financeTypeLabels" @clickItem="onTypeChange" styleType="button" activeColor="#007aff"></uni-segmented-control>
    
    <uni-forms ref="form" :modelValue="formData" :rules="rules" style="margin-top: 20px;">
      <uni-forms-item label="金额" name="amount">
        <uni-easyinput type="number" v-model="formData.amount" placeholder="请输入金额"></uni-easyinput>
      </uni-forms-item>
      
      <uni-forms-item label="分类" name="category">
        <uni-data-select v-model="formData.category" :localdata="categoryOptions" placeholder="请选择分类"></uni-data-select>
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
import { useDictOne } from '@/hooks/useDict';

export default {
  data() {
    return {
      type: 0,
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
      },
      finance_type: useDictOne('finance_type'),
      finance_category: useDictOne('finance_category'),
    }
  },
  computed: {
    financeTypeLabels() {
      const arr = (this.finance_type && this.finance_type.value) || this.finance_type || [];
      return Array.isArray(arr) ? arr.map((i) => i.text || i.label) : [];
    },
    categoryOptions() {
      const arr = (this.finance_category && this.finance_category.value) || this.finance_category || [];
      const list = Array.isArray(arr) ? arr : [];
      if (this.type === 0) {
        return list.filter((i) => ['1', '5'].includes(String(i.value)));
      }
      return list.filter((i) => ['2', '3', '4', '5'].includes(String(i.value)));
    }
  },
  methods: {
    onTypeChange(e) {
      this.type = e.currentIndex;
      this.formData.category = '';
    },
    submit() {
      this.$refs.form.validate().then(res => {
        this.$tip.success('保存成功');
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
