<template>
  <view class="container">
    <uni-card title="合同详情" :extra="getStatusText(contract.status)">
      <view class="row">
        <text class="label">合同编号：</text>
        <text class="value">{{ contract.contractNo }}</text>
      </view>
      <view class="row">
        <text class="label">签订日期：</text>
        <text class="value">{{ contract.createdAt }}</text>
      </view>
      <view class="divider"></view>
      <view class="row">
        <text class="label">甲方：</text>
        <text class="value">{{ contract.lessorName }}</text>
      </view>
      <view class="row">
        <text class="label">乙方：</text>
        <text class="value">{{ contract.lesseeName }}</text>
      </view>
      <view class="row">
        <text class="label">设备：</text>
        <text class="value">{{ contract.machineName }}</text>
      </view>
      <view class="row">
        <text class="label">租金：</text>
        <text class="value highlight">¥{{ contract.amount }}</text>
      </view>
      <view class="row">
        <text class="label">租期：</text>
        <text class="value">{{ contract.startDate }} 至 {{ contract.endDate }}</text>
      </view>
    </uni-card>
    
    <view class="preview-box">
      <text class="preview-text">合同条款预览...</text>
      <!-- In real app, this would be a PDF or detailed text -->
      <view class="terms">
        <text>第一条 租赁设备...</text>
        <text>第二条 租赁期限...</text>
        <text>第三条 租金及支付...</text>
      </view>
    </view>
    
    <view class="footer-btn">
      <button type="primary" @click="signContract" :disabled="contract.status !== 1">
        {{ contract.status === 1 ? '签署合同' : '已签署/不可签' }}
      </button>
      <button type="default" @click="downloadPdf">下载PDF</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      contract: {}
    }
  },
  onLoad(options) {
    this.fetchDetail(options.id);
  },
  methods: {
    fetchDetail(id) {
      // Mock API call
      setTimeout(() => {
        this.contract = {
          id: id,
          contractNo: 'HT202310010001',
          createdAt: '2023-10-01',
          status: 1, // Pending
          lessorName: '王老板',
          lesseeName: '李工',
          machineName: '三一 SY200',
          amount: '50000.00',
          startDate: '2023-10-02',
          endDate: '2023-11-02'
        };
      }, 300);
    },
    getStatusText(status) {
      const map = { 0: '草稿', 1: '待签署', 2: '已生效', 3: '已过期', 4: '已终止' };
      return map[status] || '未知';
    },
    signContract() {
      uni.showModal({
        title: '确认签署',
        content: '签署即代表您同意合同所有条款',
        success: (res) => {
          if (res.confirm) {
            uni.showLoading({ title: '签署中...' });
            setTimeout(() => {
              uni.hideLoading();
              this.contract.status = 2;
              uni.showToast({ title: '签署成功', icon: 'success' });
            }, 1000);
          }
        }
      });
    },
    downloadPdf() {
      uni.showToast({ title: '下载功能开发中', icon: 'none' });
    }
  }
}
</script>

<style>
.container {
  padding: 10px;
  padding-bottom: 80px;
}
.row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}
.label {
  color: #666;
  font-size: 14px;
}
.value {
  color: #333;
  font-size: 14px;
  font-weight: bold;
}
.highlight {
  color: #ff5a5f;
  font-size: 16px;
}
.divider {
  height: 1px;
  background-color: #eee;
  margin: 10px 0;
}
.preview-box {
  background-color: #fff;
  padding: 15px;
  margin-top: 10px;
  border-radius: 8px;
}
.preview-text {
  font-weight: bold;
  margin-bottom: 10px;
  display: block;
}
.terms text {
  display: block;
  font-size: 12px;
  color: #666;
  line-height: 1.8;
}
.footer-btn {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 10px;
  background-color: #fff;
  display: flex;
  gap: 10px;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
}
.footer-btn button {
  flex: 1;
}
</style>
