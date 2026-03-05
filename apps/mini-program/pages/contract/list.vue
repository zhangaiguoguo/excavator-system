<template>
  <view class="container">
    <uni-segmented-control :current="current" :values="items" @clickItem="onClickItem" styleType="text" activeColor="#007aff"></uni-segmented-control>
    
    <uni-list>
      <uni-list-item v-for="item in contracts" :key="item.id" 
        :title="'合同编号：' + item.contractNo"
        :note="item.createTime"
        :rightText="getStatusText(item.status)"
        link :to="'/pages/contract/detail?id=' + item.id">
        <template v-slot:header>
           <view class="icon-wrapper">
             <uni-icons type="paperclip" size="24" color="#999"></uni-icons>
           </view>
        </template>
      </uni-list-item>
    </uni-list>
    
    <view class="empty" v-if="contracts.length === 0">暂无合同</view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      current: 0,
      items: ['全部', '待签署', '已生效', '已过期'],
      contracts: []
    }
  },
  onShow() {
    this.fetchContracts();
  },
  methods: {
    onClickItem(e) {
      if (this.current !== e.currentIndex) {
        this.current = e.currentIndex;
        this.fetchContracts();
      }
    },
    fetchContracts() {
      // Mock data
      setTimeout(() => {
        const allContracts = [
          { id: 1, contractNo: 'HT202310010001', createTime: '2023-10-01', status: 1 }, // Pending
          { id: 2, contractNo: 'HT202309280002', createTime: '2023-09-28', status: 2 }, // Signed
          { id: 3, contractNo: 'HT202309150003', createTime: '2023-09-15', status: 3 }  // Expired
        ];
        
        if (this.current === 0) {
          this.contracts = allContracts;
        } else {
          this.contracts = allContracts.filter(c => c.status === this.current);
        }
      }, 300);
    },
    getStatusText(status) {
      const map = { 0: '草稿', 1: '待签署', 2: '已生效', 3: '已过期', 4: '已终止' };
      return map[status] || '未知';
    }
  }
}
</script>

<style>
.container {
  padding: 10px;
}
.icon-wrapper {
  margin-right: 10px;
  display: flex;
  align-items: center;
}
.empty {
  text-align: center;
  margin-top: 50px;
  color: #999;
}
</style>
