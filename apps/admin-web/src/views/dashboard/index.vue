<template>
  <div class="dashboard-container">
    <div class="welcome-header">
      <div class="welcome-text">
        <h2>早安，Admin！</h2>
        <p>今天是 {{ currentDate }}，祝您开心每一天！</p>
      </div>
      <div class="header-image">
        <!-- Optional: Add an illustration here -->
      </div>
    </div>

    <a-row :gutter="24" class="panel-group">
      <a-col :xs="24" :sm="12" :lg="6" class="card-panel-col">
        <div class="card-panel">
          <div class="card-panel-icon-wrapper icon-people">
            <UserOutlined class="card-panel-icon" />
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">用户总数</div>
            <div class="card-panel-num">1,024</div>
            <div class="card-panel-trend up">
              <span>+12%</span> <ArrowUpOutlined />
            </div>
          </div>
        </div>
      </a-col>
      <a-col :xs="24" :sm="12" :lg="6" class="card-panel-col">
        <div class="card-panel">
          <div class="card-panel-icon-wrapper icon-message">
            <MessageOutlined class="card-panel-icon" />
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">消息通知</div>
            <div class="card-panel-num">812</div>
            <div class="card-panel-trend down">
              <span>-5%</span> <ArrowDownOutlined />
            </div>
          </div>
        </div>
      </a-col>
      <a-col :xs="24" :sm="12" :lg="6" class="card-panel-col">
        <div class="card-panel">
          <div class="card-panel-icon-wrapper icon-money">
            <PayCircleOutlined class="card-panel-icon" />
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">总成交额</div>
            <div class="card-panel-num">¥ 9,280</div>
            <div class="card-panel-trend up">
              <span>+25%</span> <ArrowUpOutlined />
            </div>
          </div>
        </div>
      </a-col>
      <a-col :xs="24" :sm="12" :lg="6" class="card-panel-col">
        <div class="card-panel">
          <div class="card-panel-icon-wrapper icon-shopping">
            <ShoppingCartOutlined class="card-panel-icon" />
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">订单数量</div>
            <div class="card-panel-num">13,600</div>
            <div class="card-panel-trend up">
              <span>+8%</span> <ArrowUpOutlined />
            </div>
          </div>
        </div>
      </a-col>
    </a-row>

    <!-- Charts Section Placeholder -->
    <a-row :gutter="24" class="chart-container">
      <a-col :span="16">
        <a-card class="chart-card" :bordered="false" hoverable>
          <template #title>
            <div class="chart-header">
              <span>租赁趋势</span>
              <a-tag color="blue">近7天</a-tag>
            </div>
          </template>
          <div class="chart-placeholder">
            <!-- Integrate ECharts here later -->
            <div class="mock-chart-bar" v-for="i in 7" :key="i" :style="{height: Math.random() * 100 + '%'}"></div>
          </div>
        </a-card>
      </a-col>
      <a-col :span="8">
        <a-card class="chart-card" :bordered="false" hoverable>
          <template #title>
            <div class="chart-header">
              <span>设备分布</span>
            </div>
          </template>
          <div class="chart-placeholder pie-chart">
            <div class="mock-pie"></div>
          </div>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { 
  UserOutlined, 
  MessageOutlined, 
  PayCircleOutlined, 
  ShoppingCartOutlined, 
  ArrowUpOutlined, 
  ArrowDownOutlined 
} from '@ant-design/icons-vue'

const currentDate = computed(() => {
  const date = new Date()
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
})
</script>

<style lang="scss" scoped>
.dashboard-container {
  padding: 24px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 84px);
  
  .welcome-header {
    background: #fff;
    padding: 24px;
    border-radius: 12px;
    margin-bottom: 24px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    display: flex;
    justify-content: space-between;
    align-items: center;

    h2 {
      margin: 0 0 8px;
      font-size: 24px;
      color: #303133;
    }

    p {
      margin: 0;
      color: #909399;
    }
  }

  .panel-group {
    margin-bottom: 24px;

    .card-panel-col {
      margin-bottom: 24px;
    }

    .card-panel {
      height: 120px;
      background: #fff;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      display: flex;
      align-items: center;
      transition: all 0.3s;
      cursor: pointer;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
      }

      .card-panel-icon-wrapper {
        width: 64px;
        height: 64px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 20px;
        transition: all 0.3s;

        .card-panel-icon {
          font-size: 32px;
        }

        &.icon-people {
          background: #e6f7ff;
          color: #1890ff;
        }

        &.icon-message {
          background: #fff7e6;
          color: #faad14;
        }

        &.icon-money {
          background: #fff1f0;
          color: #f5222d;
        }

        &.icon-shopping {
          background: #f6ffed;
          color: #52c41a;
        }
      }

      &:hover {
        .icon-people { background: #1890ff; color: #fff; }
        .icon-message { background: #faad14; color: #fff; }
        .icon-money { background: #f5222d; color: #fff; }
        .icon-shopping { background: #52c41a; color: #fff; }
      }

      .card-panel-description {
        flex: 1;

        .card-panel-text {
          color: #909399;
          font-size: 14px;
          margin-bottom: 8px;
        }

        .card-panel-num {
          font-size: 24px;
          font-weight: bold;
          color: #303133;
          margin-bottom: 8px;
        }
        
        .card-panel-trend {
          font-size: 12px;
          display: flex;
          align-items: center;
          
          &.up { color: #52c41a; }
          &.down { color: #f5222d; }
          
          .anticon { margin-left: 4px; }
        }
      }
    }
  }

  .chart-card {
    border-radius: 12px;
    border: none;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    margin-bottom: 24px;

    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .chart-placeholder {
      height: 300px;
      display: flex;
      align-items: flex-end;
      justify-content: space-around;
      padding: 20px;
      background: #fcfcfc;
      border-radius: 8px;

      .mock-chart-bar {
        width: 30px;
        background: #1890ff;
        border-radius: 4px 4px 0 0;
        opacity: 0.8;
        transition: height 0.5s ease;
      }
      
      &.pie-chart {
        align-items: center;
        justify-content: center;
        
        .mock-pie {
          width: 200px;
          height: 200px;
          border-radius: 50%;
          background: conic-gradient(#1890ff 0% 25%, #36cfc9 25% 60%, #faad14 60% 85%, #f5222d 85% 100%);
        }
      }
    }
  }
}
</style>
