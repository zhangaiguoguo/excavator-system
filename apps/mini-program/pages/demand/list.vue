<template>
  <view class="container">
    <uni-list>
      <uni-list-item v-for="item in demands" :key="item.id" 
        :title="item.title"
        :note="item.location + ' | ' + item.duration"
        :rightText="item.budget"
        link :to="'/pages/demand/detail?id=' + item.id">
        <template v-slot:header>
          <view class="icon-box">
            <text class="type-tag">{{ item.type === 1 ? '求租' : '招人' }}</text>
          </view>
        </template>
      </uni-list-item>
    </uni-list>
    
    <view class="fab-btn" @click="goPublish">
      <uni-icons type="plus" size="30" color="#fff"></uni-icons>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      demands: []
    }
  },
  onShow() {
    this.fetchDemands();
  },
  methods: {
    fetchDemands() {
      // Mock data
      setTimeout(() => {
        this.demands = [
          { id: 1, type: 1, title: '急需 200 型挖掘机 2 台', location: '南京江宁', duration: '30天', budget: '2000/天' },
          { id: 2, type: 2, title: '招熟练机手 1 名', location: '苏州吴中', duration: '长期', budget: '8000/月' }
        ];
      }, 300);
    },
    goPublish() {
      uni.navigateTo({ url: '/pages/demand/add' });
    }
  }
}
</script>

<style>
.container {
  padding-bottom: 80px;
}
.icon-box {
  margin-right: 10px;
  display: flex;
  align-items: center;
}
.type-tag {
  background-color: #007aff;
  color: #fff;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
}
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
