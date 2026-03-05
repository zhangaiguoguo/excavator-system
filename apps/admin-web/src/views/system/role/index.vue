<template>
  <div class="app-container">
    <a-card>
      <template #title>
        <div class="card-header">
          <span>角色管理</span>
          <a-button type="primary" size="small">新增角色</a-button>
        </div>
      </template>
      <a-table :dataSource="tableData" :columns="columns">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-switch v-model:checked="record.status" />
          </template>
          <template v-else-if="column.key === 'action'">
            <a-button size="small" style="margin-right: 8px">编辑</a-button>
            <a-button size="small" danger>删除</a-button>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup>
import { reactive } from 'vue'

const columns = [
  {
    title: '角色名称',
    dataIndex: 'roleName',
    key: 'roleName',
    width: 180,
  },
  {
    title: '角色标识',
    dataIndex: 'roleKey',
    key: 'roleKey',
    width: 180,
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
  },
  {
    title: '操作',
    key: 'action',
  },
]

const tableData = reactive([
  {
    key: '1',
    roleName: '超级管理员',
    roleKey: 'admin',
    status: true
  },
  {
    key: '2',
    roleName: '普通用户',
    roleKey: 'common',
    status: true
  }
])
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
