<template>
  <view class="container">
    <view class="sticky-header">
      <uni-search-bar placeholder="搜索品牌/型号" @confirm="search" bgColor="#f5f5f5" radius="100"></uni-search-bar>
      
      <!-- 简单筛选栏 -->
      <view class="filter-bar">
        <view class="filter-item" @click="showFilter('brand')">
          <text>品牌</text>
          <uni-icons type="bottom" size="12" color="#666"></uni-icons>
        </view>
        <view class="filter-item" @click="showFilter('price')">
          <text>价格</text>
          <uni-icons type="bottom" size="12" color="#666"></uni-icons>
        </view>
        <view class="filter-item" @click="showFilter('area')">
          <text>地区</text>
          <uni-icons type="bottom" size="12" color="#666"></uni-icons>
        </view>
      </view>
    </view>
    
    <view class="list-container">
      <view class="machine-item" v-for="item in machines" :key="item.id" @click="goDetail(item.id)">
        <image class="item-img" :src="item.images[0] || '/static/default_machine.png'" mode="aspectFill"></image>
        <view class="item-content">
          <view class="item-header">
            <text class="item-title">{{ item.brand }} {{ item.model }}</text>
            <uni-tag text="置顶" type="error" size="mini" v-if="item.id === 1" circle></uni-tag>
          </view>
          
          <view class="item-desc-row">
            <uni-icons type="location-filled" size="14" color="#999"></uni-icons>
            <text class="location-text">{{ item.city }}</text>
            <text class="divider">|</text>
            <text class="work-hours">{{ item.workHours || 2000 }}小时</text>
          </view>
          
          <view class="item-footer">
            <view class="price-box">
              <text class="symbol">¥</text>
              <text class="price">{{ item.dailyRate }}</text>
              <text class="unit">/天</text>
            </view>
            <button class="contact-btn" @click.stop="contactOwner">联系机主</button>
          </view>
        </view>
      </view>
    </view>
    
    <uni-load-more :status="loading ? 'loading' : (machines.length > 0 ? 'more' : 'noMore')"></uni-load-more>
    
    <view class="empty-box" v-if="machines.length === 0 && !loading">
      <uni-icons type="info-filled" size="60" color="#ddd"></uni-icons>
      <text class="empty-text">暂无相关设备</text>
    </view>
    
    <view class="fab-btn" @click="goPublish">
      <uni-icons type="plusempty" size="26" color="#fff"></uni-icons>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      machines: [],
      loading: false,
      page: 1,
      keyword: ''
    }
  },
  onLoad() {
    this.fetchMachines();
  },
  methods: {
    fetchMachines() {
      this.loading = true;
      // Mock API call
      setTimeout(() => {
        this.machines = [
          { id: 1, brand: '三一', model: 'SY200', description: '车况良好，随时可租', dailyRate: 1800, province: '江苏', city: '南京', images: ['/static/c1.png'], workHours: 2000 },
          { id: 2, brand: '徐工', model: 'XE215', description: '刚做完保养，动力强劲', dailyRate: 1700, province: '浙江', city: '杭州', images: ['/static/c2.png'], workHours: 1500 },
          { id: 3, brand: '卡特', model: '320GC', description: '省油耐用，机手经验丰富', dailyRate: 2000, province: '安徽', city: '合肥', images: ['/static/c3.png'], workHours: 3000 },
          { id: 4, brand: '小松', model: 'PC200', description: '成色新，价格优惠', dailyRate: 1900, province: '上海', city: '闵行', images: ['/static/c4.png'], workHours: 1800 }
        ];
        this.loading = false;
      }, 500);
    },
    search(res) {
      this.keyword = res.value;
      this.fetchMachines();
    },
    goPublish() {
      uni.navigateTo({ url: '/pages/machine/add' });
    },
    goDetail(id) {
      uni.navigateTo({ url: '/pages/machine/detail?id=' + id });
    },
    contactOwner() {
      uni.makePhoneCall({ phoneNumber: '13800138000' });
    },
    showFilter(type) {
      uni.showToast({ title: '筛选功能开发中', icon: 'none' });
    }
  }
}
</script>

<style lang="scss">
.container {
  padding-bottom: 80px;
  background-color: #f8f8f8;
  min-height: 100vh;
}

.sticky-header {
  position: sticky;
  top: 0;
  z-index: 99;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
}

.filter-bar {
  display: flex;
  padding: 10px 0;
  border-top: 1px solid #f5f5f5;
  
  .filter-item {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 14px;
    color: #666;
    
    text { margin-right: 4px; }
  }
}

.list-container {
  padding: 10px;
}

.machine-item {
  display: flex;
  background-color: #fff;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.02);
  
  .item-img {
    width: 110px;
    height: 110px;
    border-radius: 8px;
    margin-right: 12px;
    background-color: #f5f5f5;
  }
  
  .item-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    
    .item-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      
      .item-title {
        font-size: 16px;
        font-weight: bold;
        color: #333;
        line-height: 1.4;
      }
    }
    
    .item-desc-row {
      display: flex;
      align-items: center;
      margin-top: 5px;
      
      .location-text {
        font-size: 12px;
        color: #999;
        margin-left: 2px;
      }
      
      .divider {
        margin: 0 8px;
        color: #eee;
        font-size: 10px;
      }
      
      .work-hours {
        font-size: 12px;
        color: #666;
        background-color: #f8f8f8;
        padding: 2px 6px;
        border-radius: 4px;
      }
    }
    
    .item-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 10px;
      
      .price-box {
        color: #ff5a5f;
        .symbol { font-size: 12px; font-weight: bold; }
        .price { font-size: 18px; font-weight: bold; }
        .unit { font-size: 12px; color: #999; }
      }
      
      .contact-btn {
        margin: 0;
        background: linear-gradient(90deg, #FFA500, #FF8F00);
        color: #fff;
        font-size: 12px;
        line-height: 28px;
        padding: 0 15px;
        border-radius: 14px;
        border: none;
      }
    }
  }
}

.empty-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 100px;
  
  .empty-text {
    font-size: 14px;
    color: #ccc;
    margin-top: 10px;
  }
}

.fab-btn {
  position: fixed;
  bottom: 30px;
  right: 20px;
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #FFA500, #FF8F00);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 4px 12px rgba(255, 165, 0, 0.4);
  z-index: 100;
}
</style>
