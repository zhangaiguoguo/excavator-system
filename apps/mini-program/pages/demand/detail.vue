<template>
  <view class="container">
    <uni-card :title="demand.title" :extra="demand.budget">
      <view class="tag-row">
        <uni-tag :text="demand.type === 1 ? '找设备' : '找机手'" type="primary" size="small"></uni-tag>
        <uni-tag :text="getStatusText(demand.status)" :type="demand.status === 1 ? 'success' : 'default'" size="small" style="margin-left: 10px;"></uni-tag>
      </view>
      
      <view class="info-row">
        <uni-icons type="location" size="16" color="#666"></uni-icons>
        <text class="info-text">{{ demand.location }}</text>
      </view>
      <view class="info-row">
        <uni-icons type="calendar" size="16" color="#666"></uni-icons>
        <text class="info-text">工期：{{ demand.duration }}</text>
      </view>
      <view class="info-row">
        <uni-icons type="person" size="16" color="#666"></uni-icons>
        <text class="info-text">发布人：{{ demand.contactName }}</text>
      </view>
      
      <view class="desc-box">
        <text class="desc-title">详细描述</text>
        <text class="desc-content">{{ demand.description }}</text>
      </view>
    </uni-card>
    
    <view class="footer-bar">
      <button type="primary" @click="contactUser">联系对方</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      demand: {}
    }
  },
  onLoad(options) {
    this.fetchDetail(options.id);
  },
  methods: {
    fetchDetail(id) {
      // Mock data
      setTimeout(() => {
        this.demand = {
          id: id,
          type: 1,
          title: '急需 200 型挖掘机 2 台',
          location: '南京市江宁区麒麟街道',
          duration: '30天',
          budget: '2000元/天',
          status: 1,
          contactName: '李经理',
          description: '工地土方作业，要求车况良好，带破碎锤。包吃住，结账爽快。'
        };
      }, 300);
    },
    getStatusText(status) {
      return status === 1 ? '进行中' : '已结束';
    },
    contactUser() {
      uni.makePhoneCall({ phoneNumber: '13900139000' });
    }
  }
}
</script>

<style>
.container {
  padding: 10px;
}
.tag-row {
  margin-bottom: 15px;
}
.info-row {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
.info-text {
  margin-left: 5px;
  color: #333;
  font-size: 14px;
}
.desc-box {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #eee;
}
.desc-title {
  font-weight: bold;
  font-size: 15px;
  margin-bottom: 10px;
  display: block;
}
.desc-content {
  color: #666;
  font-size: 14px;
  line-height: 1.6;
}
.footer-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 15px;
  background-color: #fff;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
}
</style>
