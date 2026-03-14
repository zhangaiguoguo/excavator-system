<template>
  <view class="page">
    <view class="about-card">
      <image src="/static/logo.png" class="logo" mode="aspectFit" />
      <text class="app-name">挖掘机之家</text>
      <text class="slogan">找设备 · 找活 · 找人</text>
      <text class="version">版本 {{ version }}</text>
    </view>
    <view class="intro-card">
      <text class="intro-title">关于我们</text>
      <text class="intro-text">{{ intro }}</text>
    </view>
    <view class="contact-card" v-if="customerPhone">
      <view class="contact-row" @click="callService">
        <uni-icons type="phone" size="20" color="#4AB1F7" />
        <text class="contact-label">客服电话</text>
        <text class="contact-value">{{ customerPhone }}</text>
        <uni-icons type="right" size="14" color="#999" />
      </view>
    </view>
  </view>
</template>

<script>
import configService from '@/common/service/config.service.js';

export default {
  data() {
    return {
      version: '1.0.0',
      intro: '挖掘机之家致力于为机主与施工方提供设备租赁、需求对接、订单管理等服务，助力工程高效对接。',
      customerPhone: (configService && configService.customerServicePhone) || '',
    };
  },
  methods: {
    callService() {
      if (!this.customerPhone) return;
      uni.makePhoneCall({ phoneNumber: String(this.customerPhone).replace(/-/g, '') });
    },
  },
};
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #f5f6f8;
  padding: 24px 16px;
}
.about-card {
  background: #fff;
  border-radius: 16px;
  padding: 32px 24px;
  text-align: center;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}
.logo {
  width: 80px;
  height: 80px;
  display: block;
  margin: 0 auto 16px;
}
.app-name {
  display: block;
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}
.slogan {
  display: block;
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}
.version {
  display: block;
  font-size: 12px;
  color: #999;
}
.intro-card {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}
.intro-title {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}
.intro-text {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}
.contact-card {
  background: #fff;
  border-radius: 16px;
  padding: 0 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}
.contact-row {
  display: flex;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
}
.contact-row:last-child {
  border-bottom: none;
}
.contact-label {
  font-size: 15px;
  color: #333;
  margin-left: 10px;
  flex: 1;
}
.contact-value {
  font-size: 15px;
  color: #4AB1F7;
  margin-right: 8px;
}
</style>
