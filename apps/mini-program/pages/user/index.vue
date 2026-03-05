<template>
  <view class="container">
    <!-- 头部信息卡片 -->
    <view class="user-header-card" @click="handleLogin" v-if="!userInfo.id">
      <view class="avatar-box">
        <image class="avatar" src="/static/logo.png" mode="aspectFill"></image>
      </view>
      <view class="info-box">
        <view class="name-row">
          <text class="nickname">点击登录</text>
        </view>
        <text class="subtitle">登录后享受更多服务</text>
      </view>
      <uni-icons type="right" size="18" color="#ccc"></uni-icons>
    </view>

    <!-- 已登录头部 -->
    <view class="user-header-card" v-else>
      <view class="avatar-box">
        <image class="avatar" :src="userInfo.avatar || '/static/logo.png'" mode="aspectFill"></image>
      </view>
      <view class="info-box">
        <view class="name-row">
          <text class="nickname">{{ userInfo.nickname }}</text>
          <uni-tag :text="getRoleName(userInfo.role)" type="warning" size="small" circle v-if="userInfo.role"></uni-tag>
        </view>
        <text class="subtitle">ID: {{ userInfo.id }}</text>
        <text class="subtitle" v-if="userInfo.phone">手机: {{ userInfo.phone }}</text>
        <!-- 手机号授权按钮 (如果没绑定手机号) -->
        <button v-if="!userInfo.phone || userInfo.phone === 'Unknown'" 
          class="phone-btn" 
          open-type="getPhoneNumber" 
          @getphonenumber="getPhoneNumber"
          size="mini"
        >
          绑定手机号
        </button>
      </view>
    </view>

    <!-- 常用功能区 -->
    <uni-section title="我的服务" type="line" titleFontSize="16px">
      <uni-grid :column="4" :show-border="false" :square="false" class="service-grid">
        <uni-grid-item v-for="(item, index) in services" :key="index" @click="handleServiceClick(item)">
          <view class="grid-item-box">
            <uni-icons :type="item.icon" size="28" :color="item.color"></uni-icons>
            <text class="text">{{ item.text }}</text>
          </view>
        </uni-grid-item>
      </uni-grid>
    </uni-section>

    <!-- 列表菜单 -->
    <view class="menu-list">
      <uni-list>
        <uni-list-item title="实名认证" showArrow to="/pages/user/auth" thumb="/static/c5.png" thumb-size="base">
          <template v-slot:footer>
            <text class="status-text">{{ userInfo.realNameStatus ? '已认证' : '未认证' }}</text>
          </template>
        </uni-list-item>
        <uni-list-item title="我的发布" showArrow to="/pages/user/publish" thumb="/static/c6.png" thumb-size="base"></uni-list-item>
        <uni-list-item title="联系客服" showArrow clickable @click="contactService" thumb="/static/c8.png" thumb-size="base"></uni-list-item>
        <uni-list-item title="关于我们" showArrow to="/pages/about/index" thumb="/static/c4.png" thumb-size="base"></uni-list-item>
      </uni-list>
    </view>

    <!-- 退出按钮 -->
    <view class="logout-box" v-if="userInfo.id">
      <button class="logout-btn" @click="logout">退出登录</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      userInfo: {},
      services: [
        { text: '我的合同', icon: 'paperclip', path: '/pages/contract/list', color: '#4CAF50' },
        { text: '我的账本', icon: 'wallet', path: '/pages/record/list', color: '#FF9800' },
        { text: '我的收藏', icon: 'star', path: '/pages/user/fav', color: '#FFC107' },
        { text: '消息通知', icon: 'chat', path: '/pages/user/msg', color: '#2196F3' }
      ]
    }
  },
  onShow() {
    const user = uni.getStorageSync('userInfo');
    if (user) {
      this.userInfo = user;
    }
  },
  methods: {
    getRoleName(role) {
      const roles = { 1: '机主', 2: '施工方', 3: '机手' };
      return roles[role] || '未知';
    },
    handleLogin() {
      if (this.userInfo.id) return;
      
      // 先尝试获取用户信息（模拟授权体验）
      // 注意：微信基础库 2.27.1+ uni.getUserProfile 返回的可能是灰色头像，但这是标准流程
      uni.getUserProfile({
        desc: '用于完善会员资料', // 必填，声明获取用途
        success: (profileRes) => {
          const { userInfo } = profileRes;
          console.log( profileRes)
          
          uni.showLoading({ title: '登录中...' });
          uni.login({
            provider: 'weixin',
            success: (loginRes) => {
              // 模拟后端请求，带上用户信息
              uni.request({
                url: 'http://localhost:3000/auth/login',
                method: 'POST',
                data: { 
                  code: loginRes.code,
                  userInfo: userInfo // 将授权获取的信息传给后端
                },
                success: (res) => {
                  uni.hideLoading();
                  if (res.statusCode === 201 || res.statusCode === 200) {
                    const { access_token, user } = res.data;
                    // 如果后端没有返回完整的用户信息，可以用前端获取的覆盖（实际项目以后端为准）
                    const finalUser = { ...user, ...userInfo };
                    
                    uni.setStorageSync('token', access_token);
                    uni.setStorageSync('userInfo', finalUser);
                    this.userInfo = finalUser;
                    uni.showToast({ title: '登录成功', icon: 'success' });
                  } else {
                    uni.showToast({ title: '登录失败', icon: 'none' });
                  }
                },
                fail: () => {
                  uni.hideLoading();
                  uni.showToast({ title: '网络请求失败', icon: 'none' });
                }
              });
            },
            fail: (err) => {
              uni.hideLoading();
              uni.showToast({ title: '微信登录失败', icon: 'none' });
            }
          });
        },
        fail: () => {
          uni.showToast({ title: '您取消了授权', icon: 'none' });
        }
      });
    },
    getPhoneNumber(e) {
      if (e.detail.code) {
        uni.showLoading({ title: '绑定中...' });
        // 再次登录以更新手机号，或者调用单独的绑定接口
        // 这里为了简单，我们复用登录接口逻辑，实际可能需要单独的 update-phone 接口
        uni.login({
          provider: 'weixin',
          success: (loginRes) => {
            uni.request({
              url: 'http://localhost:3000/auth/login',
              method: 'POST',
              data: { 
                code: loginRes.code,
                phoneCode: e.detail.code // 传给后端去解析手机号
              },
              success: (res) => {
                uni.hideLoading();
                if (res.statusCode === 201 || res.statusCode === 200) {
                  const { access_token, user } = res.data;
                  // 合并最新信息
                  const finalUser = { ...this.userInfo, ...user };
                  
                  uni.setStorageSync('token', access_token);
                  uni.setStorageSync('userInfo', finalUser);
                  this.userInfo = finalUser;
                  uni.showToast({ title: '绑定成功', icon: 'success' });
                } else {
                  uni.showToast({ title: '绑定失败', icon: 'none' });
                }
              },
              fail: () => {
                uni.hideLoading();
                uni.showToast({ title: '网络请求失败', icon: 'none' });
              }
            });
          }
        });
      } else {
        uni.showToast({ title: '获取手机号失败', icon: 'none' });
      }
    },
    handleServiceClick(item) {
      uni.navigateTo({ url: item.path });
    },
    contactService() {
      uni.makePhoneCall({ phoneNumber: '13800138000' });
    },
    logout() {
      uni.showModal({
        title: '提示',
        content: '确定要退出登录吗？',
        success: (res) => {
          if (res.confirm) {
            uni.removeStorageSync('userInfo');
            uni.removeStorageSync('token');
            this.userInfo = {};
            uni.showToast({ title: '已退出', icon: 'none' });
          }
        }
      });
    }
  }
}
</script>

<style lang="scss">
.container {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding-bottom: 30px;
}

.user-header-card {
  background: linear-gradient(135deg, #FFB800, #FFD04F);
  margin: 16px;
  padding: 30px 24px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  box-shadow: 0 8px 20px rgba(255, 184, 0, 0.3);
  
  .avatar-box {
    margin-right: 16px;
    .avatar {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background-color: #fff;
      border: 3px solid rgba(255,255,255,0.8);
    }
  }
  
  .info-box {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    
    .name-row {
      display: flex;
      align-items: center;
      margin-bottom: 6px;
      
      .nickname {
        font-size: 20px;
        font-weight: 800;
        color: #333;
        margin-right: 8px;
      }
    }
    
    .subtitle {
      font-size: 13px;
      color: rgba(51,51,51,0.7);
      margin-bottom: 4px;
    }
    
    .phone-btn {
      background-color: #FFB800;
      color: #333;
      font-size: 12px;
      padding: 0 10px;
      line-height: 24px;
      border-radius: 12px;
      margin: 4px 0 0 0;
      align-self: flex-start;
      border: none;
      
      &::after { border: none; }
    }
  }
}

.service-grid {
  background-color: #fff;
  padding: 16px 0;
  border-radius: 16px;
  margin: 0 16px 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.04);
  
  .grid-item-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 80px;
    
    .text {
      font-size: 12px;
      color: #333;
      margin-top: 8px;
      font-weight: 500;
    }
  }
}

.menu-list {
  margin: 0 16px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.04);
  background-color: #fff;
  
  .status-text {
    font-size: 13px;
    color: #999;
    margin-right: 10px;
  }
}

.logout-box {
  margin: 40px 16px;
  
  .logout-btn {
    background-color: #fff;
    color: #FF4D4F;
    font-size: 16px;
    font-weight: 600;
    border-radius: 25px;
    border: none;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    height: 50px;
    line-height: 50px;
    
    &::after { border: none; }
    
    &:active {
      background-color: #fafafa;
    }
  }
}
</style>
