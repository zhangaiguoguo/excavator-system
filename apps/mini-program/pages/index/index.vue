<template>
  <view class="container">
    <!-- Custom Navbar -->
    <view class="custom-navbar">
      <view class="navbar-content">
        <view class="navbar-title">
          <image src="/static/logo.png" class="nav-logo" mode="aspectFit"></image>
          <text class="brand-name">挖掘机租赁</text>
        </view>
        <!-- Search Bar in Navbar -->
        <view class="search-box-nav" @click="goSearch">
          <uni-icons type="search" size="16" color="#999"></uni-icons>
          <text class="placeholder">搜索挖机、找活...</text>
        </view>
      </view>
    </view>
    
    <!-- Body Content -->
    <view class="body-content">
      <!-- Banner -->
      <view class="banner-wrapper">
        <swiper class="swiper" circular autoplay interval="4000" duration="500" indicator-dots indicator-active-color="#FFB800" indicator-color="rgba(255,255,255,0.6)">
        <swiper-item v-for="(item, index) in banners" :key="index">
          <view class="swiper-item">
            <image :src="item" mode="aspectFill" class="banner-img" lazy-load></image>
            <view class="banner-overlay"></view>
          </view>
        </swiper-item>
      </swiper>
      </view>

      <!-- King Kong Menu -->
      <view class="menu-section card">
        <view class="menu-grid">
          <view class="menu-item" v-for="(item, index) in menus" :key="index" @click="handleMenuClick(item)" hover-class="hover-opacity">
            <view class="icon-box">
              <image :src="item.image" mode="aspectFit" class="menu-icon-img"></image>
            </view>
            <text class="menu-text">{{ item.text }}</text>
          </view>
        </view>
      </view>

      <!-- Notification Bar -->
      <view class="notice-bar card">
        <view class="notice-icon">
          <uni-icons type="sound-filled" size="20" color="#FFB800"></uni-icons>
        </view>
        <swiper class="notice-swiper" vertical autoplay circular interval="3000">
          <swiper-item v-for="(item, index) in notices" :key="index">
            <text class="notice-text">{{ item }}</text>
          </swiper-item>
        </swiper>
        <uni-icons type="right" size="14" color="#ccc"></uni-icons>
      </view>

      <!-- Recommended Machines -->
      <view class="section-header">
        <view class="title-box">
          <text class="section-title">热门设备</text>
          <text class="section-subtitle">优质好机 随时调配</text>
        </view>
        <view class="more-btn" @click="goMoreMachine">
          <text>全部</text>
          <uni-icons type="right" size="12" color="#999"></uni-icons>
        </view>
      </view>

      <scroll-view scroll-x class="machine-scroll" show-scrollbar="false">
        <view class="machine-card" v-for="item in recommendMachines" :key="item.id" @click="goDetail(item.id)">
          <view class="image-wrapper">
            <image :src="item.image" mode="aspectFill" class="machine-img" lazy-load></image>
            <view class="status-tag">闲置中</view>
          </view>
          <view class="card-body">
            <text class="machine-name">{{ item.brand }} {{ item.model }}</text>
            <view class="tags-row">
              <text class="tag location">{{ item.province }}</text>
              <text class="tag hours">{{ item.workHours }}h</text>
            </view>
            <view class="price-row">
              <text class="currency">¥</text>
              <text class="amount">{{ item.price }}</text>
              <text class="unit">/天</text>
            </view>
          </view>
        </view>
      </scroll-view>

      <!-- Latest Demands -->
      <view class="section-header mt-30">
        <view class="title-box">
          <text class="section-title">最新需求</text>
          <text class="section-subtitle">海量订单 等你来接</text>
        </view>
      </view>
      
      <view class="demand-list">
        <view class="demand-item card" v-for="item in demands" :key="item.id" hover-class="hover-bg">
          <view class="demand-header">
            <text class="demand-title">{{ item.title }}</text>
            <text class="budget">¥{{ item.budget }}</text>
          </view>
          <view class="demand-body">
            <view class="info-row">
              <view class="info-item">
                <uni-icons type="location-filled" size="14" color="#999"></uni-icons>
                <text>{{ item.location }}</text>
              </view>
              <view class="info-item">
                <uni-icons type="calendar-filled" size="14" color="#999"></uni-icons>
                <text>{{ item.duration }}</text>
              </view>
            </view>
            <button class="contact-btn" size="mini">立即接单</button>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      banners: [
        'https://images.unsplash.com/photo-1541625602330-2277a4c46182?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=60', // Optimized size
        'https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=60'
      ],
      menus: [
        { text: '发布设备', image: 'https://cdn-icons-png.flaticon.com/512/2942/2942821.png', path: '/pages/machine/add' }, 
        { text: '发布需求', image: 'https://cdn-icons-png.flaticon.com/512/2942/2942883.png', path: '/pages/demand/add' }, 
        { text: '我的合同', image: 'https://cdn-icons-png.flaticon.com/512/2942/2942907.png', path: '/pages/contract/list' }, 
        { text: '记账本', image: 'https://cdn-icons-png.flaticon.com/512/2942/2942859.png', path: '/pages/record/list' } 
      ],
      notices: [
        '张师傅刚刚发布了新的挖掘机需求',
        '李老板刚刚出租了一台三一SY75',
        '系统升级通知：新增电子合同功能'
      ],
      recommendMachines: [
        { id: 1, brand: '三一重工', model: 'SY215C', price: '2200', province: '江苏', workHours: 1200, image: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=60' },
        { id: 2, brand: '徐工', model: 'XE215DA', price: '2000', province: '浙江', workHours: 850, image: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=60' },
        { id: 3, brand: '卡特彼勒', model: '320 GC', price: '2600', province: '上海', workHours: 500, image: 'https://images.unsplash.com/photo-1626262973898-074479901d3f?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=60' }
      ],
      demands: [
        { id: 1, title: '急需200型挖掘机2台', location: '南京江宁', duration: '30天', budget: '2000/天' },
        { id: 2, title: '土方工程找机手3名', location: '苏州吴中', duration: '长期', budget: '9000/月' }
      ]
    }
  },
  methods: {
    goSearch() {
      uni.navigateTo({ url: '/pages/machine/list?focus=true' });
    },
    handleMenuClick(item) {
      uni.navigateTo({ url: item.path });
    },
    goMoreMachine() {
      uni.switchTab({ url: '/pages/machine/list' });
    },
    goDetail(id) {
      uni.navigateTo({ url: '/pages/machine/detail?id=' + id });
    }
  }
}
</script>

<style lang="scss">
.container {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding-bottom: 20px;
}

.custom-navbar {
  background: #fff;
  padding: 44px 16px 10px; // Adjust for status bar
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255,255,255,0.98);
  backdrop-filter: blur(10px);
  box-shadow: 0 1px 0 rgba(0,0,0,0.05);
  
  .navbar-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    
    .navbar-title {
      display: flex;
      align-items: center;
      
      .nav-logo {
        width: 28px;
        height: 28px;
        margin-right: 8px;
      }
      
      .brand-name {
        font-size: 18px;
        font-weight: 800;
        color: #333;
      }
    }
    
    .search-box-nav {
      flex: 1;
      margin-left: 16px;
      background: #f5f6f8;
      height: 32px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      padding: 0 12px;
      
      .placeholder {
        font-size: 13px;
        color: #999;
        margin-left: 6px;
      }
    }
  }
}

.body-content {
  padding: 12px 16px;
}

.banner-wrapper {
  margin-bottom: 16px;
  
  .swiper {
    height: 160px;
    border-radius: 16px;
    overflow: hidden;
    transform: translateY(0); 
    box-shadow: 0 8px 20px rgba(0,0,0,0.1);
    
    .swiper-item {
      position: relative;
      width: 100%;
      height: 100%;
      
      .banner-img {
        width: 100%;
        height: 100%;
      }
      
      .banner-overlay {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 40px;
        background: linear-gradient(to top, rgba(0,0,0,0.3), transparent);
      }
    }
  }
}

.menu-section {
  padding: 20px 10px;
  background: #fff;
  
  .menu-grid {
    display: flex;
    justify-content: space-between;
    
    .menu-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 25%;
      
      .icon-box {
        width: 52px;
        height: 52px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 8px;
        background: #f9fafe;
        border-radius: 16px;
        
        .menu-icon-img {
          width: 36px;
          height: 36px;
        }
      }
      
      .menu-text {
        font-size: 13px;
        color: #333;
        font-weight: 600;
      }
    }
  }
}

.notice-bar {
  background: #fff;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  
  .notice-icon {
    margin-right: 10px;
  }
  
  .notice-swiper {
    height: 20px;
    flex: 1;
    
    .notice-text {
      font-size: 13px;
      color: #555;
      line-height: 20px;
      display: block;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin: 24px 0 16px;
  padding: 0 4px;
  
  &.mt-30 {
    margin-top: 30px;
  }
  
  .title-box {
    display: flex;
    align-items: baseline;
    
    .section-title {
      font-size: 18px;
      font-weight: 800;
      color: #333;
      margin-right: 8px;
    }
    
    .section-subtitle {
      font-size: 12px;
      color: #999;
    }
  }
  
  .more-btn {
    display: flex;
    align-items: center;
    font-size: 13px;
    color: #666;
  }
}

.machine-scroll {
  white-space: nowrap;
  margin: 0 -16px; // Negative margin to allow full bleed scroll
  width: calc(100% + 32px);
  padding: 0 16px;
  box-sizing: border-box;
  
  .machine-card {
    display: inline-block;
    width: 220px;
    background: #fff;
    border-radius: 12px;
    overflow: hidden;
    margin-right: 16px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.06);
    vertical-align: top;
    
    .image-wrapper {
      position: relative;
      height: 140px;
      
      .machine-img {
        width: 100%;
        height: 100%;
      }
      
      .status-tag {
        position: absolute;
        top: 8px;
        left: 8px;
        background: rgba(0,0,0,0.6);
        color: #fff;
        font-size: 10px;
        padding: 4px 8px;
        border-radius: 4px;
        backdrop-filter: blur(4px);
      }
    }
    
    .card-body {
      padding: 12px;
      
      .machine-name {
        font-size: 15px;
        font-weight: 700;
        color: #333;
        display: block;
        margin-bottom: 8px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      
      .tags-row {
        margin-bottom: 12px;
        
        .tag {
          font-size: 10px;
          padding: 2px 6px;
          border-radius: 4px;
          margin-right: 6px;
          
          &.location {
            color: #1890ff;
            background: #e6f7ff;
          }
          
          &.hours {
            color: #faad14;
            background: #fffbe6;
          }
        }
      }
      
      .price-row {
        color: #FF4D4F;
        display: flex;
        align-items: baseline;
        
        .currency { font-size: 12px; font-weight: bold; }
        .amount { font-size: 20px; font-weight: 800; font-family: DIN; margin: 0 2px; }
        .unit { font-size: 11px; color: #999; font-weight: normal; }
      }
    }
  }
}

.demand-list {
  .demand-item {
    background: #fff;
    padding: 16px;
    display: flex;
    flex-direction: column;
    
    .demand-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      
      .demand-title {
        font-size: 16px;
        font-weight: 700;
        color: #333;
      }
      
      .budget {
        color: #FF4D4F;
        font-weight: 700;
        font-size: 16px;
        font-family: DIN;
      }
    }
    
    .demand-body {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .info-row {
        display: flex;
        gap: 16px;
        
        .info-item {
          display: flex;
          align-items: center;
          font-size: 12px;
          color: #666;
          
          uni-icons {
            margin-right: 4px;
          }
        }
      }
      
      .contact-btn {
        background: #FFB800;
        color: #333;
        font-size: 13px;
        font-weight: 600;
        border-radius: 18px;
        padding: 0 20px;
        line-height: 32px;
        border: none;
        margin: 0;
      }
    }
  }
}

.hover-opacity {
  opacity: 0.8;
}

.hover-bg {
  background-color: #fafafa;
}
</style>
