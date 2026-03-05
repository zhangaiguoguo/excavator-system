<template>
  <view class="container">
    <!-- 顶部轮播 -->
    <swiper class="banner" indicator-dots autoplay circular>
      <swiper-item v-for="(item, index) in machine.images" :key="index">
        <image :src="item" mode="aspectFill" class="banner-img" @click="previewImage(index)"></image>
      </swiper-item>
    </swiper>
    
    <!-- 标题价格卡片 -->
    <view class="info-card">
      <view class="price-row">
        <view class="price-box">
          <text class="symbol">¥</text>
          <text class="price">{{ machine.dailyRate }}</text>
          <text class="unit">/天</text>
        </view>
        <view class="fav-box" @click="toggleFav">
          <uni-icons :type="isFav ? 'star-filled' : 'star'" size="24" :color="isFav ? '#FFC107' : '#999'"></uni-icons>
          <text class="fav-text">{{ isFav ? '已收藏' : '收藏' }}</text>
        </view>
      </view>
      <text class="title">{{ machine.brand }} {{ machine.model }}</text>
      <view class="tag-row">
        <uni-tag :text="machine.province" type="primary" size="small" inverted></uni-tag>
        <uni-tag :text="machine.workHours + '小时'" type="warning" size="small" inverted style="margin-left: 8px;"></uni-tag>
      </view>
    </view>
    
    <!-- 详细参数 -->
    <uni-section title="基本信息" type="line">
      <uni-list>
        <uni-list-item title="品牌型号" :rightText="machine.brand + ' ' + machine.model"></uni-list-item>
        <uni-list-item title="出厂年份" :rightText="machine.year + '年'"></uni-list-item>
        <uni-list-item title="当前位置" :rightText="machine.province + ' ' + machine.city + ' ' + machine.district"></uni-list-item>
        <uni-list-item title="工作时长" :rightText="machine.workHours + '小时'"></uni-list-item>
      </uni-list>
    </uni-section>
    
    <!-- 描述 -->
    <uni-section title="设备描述" type="line">
      <view class="desc-box">
        <text class="desc-text">{{ machine.description || '暂无描述' }}</text>
      </view>
    </uni-section>
    
    <!-- 机主信息 -->
    <uni-section title="机主信息" type="line">
      <uni-list>
        <uni-list-item title="王老板" note="实名认证用户" thumb="/static/logo.png" thumb-size="base" rightText="信用极好"></uni-list-item>
      </uni-list>
    </uni-section>
    
    <!-- 底部导航 -->
    <view class="goods-nav">
      <uni-goods-nav :options="navOptions" :buttonGroup="navButtons" @click="onClickNav" @buttonClick="onClickButton"></uni-goods-nav>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      machine: {},
      isFav: false,
      navOptions: [
        { icon: 'chat', text: '客服' },
        { icon: 'shop', text: '店铺' }
      ],
      navButtons: [
        { text: '发起合同', backgroundColor: '#FFA500', color: '#fff' },
        { text: '立即联系', backgroundColor: '#FF5722', color: '#fff' }
      ]
    }
  },
  onLoad(options) {
    this.fetchDetail(options.id);
  },
  methods: {
    fetchDetail(id) {
      // Mock API call
      setTimeout(() => {
        this.machine = {
          id: id,
          brand: '三一',
          model: 'SY200',
          dailyRate: 1800,
          year: 2020,
          workHours: 2500,
          province: '江苏',
          city: '南京',
          district: '江宁区',
          description: '自家设备，保养非常到位，没有任何暗病，带破碎锤管路，空调冻头。价格可谈，欢迎看车。',
          images: ['/static/c1.png', '/static/c2.png', '/static/c3.png']
        };
      }, 300);
    },
    previewImage(index) {
      uni.previewImage({
        urls: this.machine.images,
        current: index
      });
    },
    toggleFav() {
      this.isFav = !this.isFav;
      uni.showToast({ title: this.isFav ? '收藏成功' : '取消收藏', icon: 'none' });
    },
    onClickNav(e) {
      if (e.index === 0) {
        uni.makePhoneCall({ phoneNumber: '13800138000' });
      } else {
        uni.showToast({ title: '店铺功能开发中', icon: 'none' });
      }
    },
    onClickButton(e) {
      if (e.index === 0) {
        uni.navigateTo({ url: '/pages/contract/create?machineId=' + this.machine.id });
      } else {
        uni.makePhoneCall({ phoneNumber: '13800138000' });
      }
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

.banner {
  width: 100%;
  height: 250px;
  
  .banner-img {
    width: 100%;
    height: 100%;
  }
}

.info-card {
  background-color: #fff;
  padding: 15px;
  margin-bottom: 10px;
  
  .price-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    
    .price-box {
      color: #ff5a5f;
      display: flex;
      align-items: baseline;
      
      .symbol { font-size: 14px; font-weight: bold; }
      .price { font-size: 24px; font-weight: bold; margin: 0 2px; }
      .unit { font-size: 12px; color: #999; }
    }
    
    .fav-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      
      .fav-text {
        font-size: 10px;
        color: #999;
      }
    }
  }
  
  .title {
    font-size: 18px;
    font-weight: bold;
    color: #333;
    margin-bottom: 10px;
    display: block;
  }
  
  .tag-row {
    display: flex;
    gap: 8px;
  }
}

.desc-box {
  padding: 10px 15px;
  background-color: #fff;
  
  .desc-text {
    font-size: 14px;
    color: #666;
    line-height: 1.6;
  }
}

.goods-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
