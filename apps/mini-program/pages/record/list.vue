<template>
  <view class="container">
    <uni-card title="收支统计" :extra="'本月结余：' + (income - expense) + '元'">
      <view class="stat-row">
        <view class="stat-item income">
          <text class="label">收入</text>
          <text class="value">¥{{ income }}</text>
        </view>
        <view class="stat-item expense">
          <text class="label">支出</text>
          <text class="value">¥{{ expense }}</text>
        </view>
      </view>
    </uni-card>
    
    <uni-list>
      <uni-list-item v-for="item in records" :key="item.id" 
        :title="item.category"
        :note="item.date"
        :rightText="(item.type === 1 ? '+' : '-') + item.amount"
        :rightTextColor="item.type === 1 ? '#09bb07' : '#e64340'">
        <template v-slot:header>
          <view class="icon-circle" :class="item.type === 1 ? 'bg-green' : 'bg-red'">
            <uni-icons :type="item.type === 1 ? 'arrow-up' : 'arrow-down'" size="20" color="#fff"></uni-icons>
          </view>
        </template>
      </uni-list-item>
    </uni-list>
    
    <view class="fab-btn" @click="goAdd">
      <uni-icons type="plus" size="30" color="#fff"></uni-icons>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      income: 0,
      expense: 0,
      records: []
    }
  },
  onShow() {
    this.fetchRecords();
  },
  methods: {
    fetchRecords() {
      // Mock data
      setTimeout(() => {
        this.records = [
          { id: 1, type: 1, category: '租金收入', amount: 5000, date: '2023-10-05' },
          { id: 2, type: 2, category: '加油费', amount: 800, date: '2023-10-04' },
          { id: 3, type: 2, category: '维修保养', amount: 1200, date: '2023-10-01' }
        ];
        this.calculateStats();
      }, 300);
    },
    calculateStats() {
      this.income = this.records.filter(r => r.type === 1).reduce((acc, cur) => acc + cur.amount, 0);
      this.expense = this.records.filter(r => r.type === 2).reduce((acc, cur) => acc + cur.amount, 0);
    },
    goAdd() {
      uni.navigateTo({ url: '/pages/record/add' });
    }
  }
}
</script>

<style>
.container {
  padding-bottom: 80px;
}
.stat-row {
  display: flex;
  justify-content: space-around;
  margin-top: 10px;
}
.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.stat-item .label {
  font-size: 12px;
  color: #666;
}
.stat-item .value {
  font-size: 20px;
  font-weight: bold;
}
.income .value { color: #09bb07; }
.expense .value { color: #e64340; }
.icon-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 10px;
}
.bg-green { background-color: #09bb07; }
.bg-red { background-color: #e64340; }
.fab-btn {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 60px;
  height: 60px;
  background-color: #007aff;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 4px 10px rgba(0,0,0,0.3);
}
</style>
