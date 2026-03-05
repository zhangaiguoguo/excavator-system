<template>
  <div class="app-container">
    <a-card>
      <template #title>
        <div class="card-header">
          <span>用户管理</span>
          <a-button type="primary" size="small">新增用户</a-button>
        </div>
      </template>
      <a-table :dataSource="tableData" :columns="columns">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="record.status === '启用' ? 'success' : 'error'">{{ record.status }}</a-tag>
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
const columns = [
  {
    title: '创建日期',
    dataIndex: 'date',
    key: 'date',
    width: 180,
  },
  {
    title: '姓名',
    dataIndex: 'name',
    key: 'name',
    width: 180,
  },
  {
    title: '角色',
    dataIndex: 'role',
    key: 'role',
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

const tableData = [
  {
    key: '1',
    date: '2024-01-01',
    name: 'Admin',
    role: '管理员',
    status: '启用'
  },
  {
    key: '2',
    date: '2024-01-02',
    name: 'User',
    role: '普通用户',
    status: '启用'
  }
]
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
