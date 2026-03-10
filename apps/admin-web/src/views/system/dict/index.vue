<template>
  <div class="app-container p-4">
    <!-- 搜索栏 -->
    <a-card class="mb-4" :bordered="false">
      <a-form layout="inline" :model="queryParams">
        <a-form-item label="字典名称">
          <a-input v-model:value="queryParams.dictName" placeholder="请输入字典名称" allow-clear />
        </a-form-item>
        <a-form-item label="字典类型">
          <a-input v-model:value="queryParams.dictType" placeholder="请输入字典类型" allow-clear />
        </a-form-item>
        <a-form-item label="状态">
          <a-select v-model:value="queryParams.status" placeholder="请选择状态" allow-clear style="width: 120px">
            <a-select-option :value="0">正常</a-select-option>
            <a-select-option :value="1">停用</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="handleQuery">搜索</a-button>
          <a-button class="ml-2" @click="resetQuery">重置</a-button>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 操作栏 -->
    <div class="mb-4">
      <a-button type="primary" @click="handleAdd">新增</a-button>
    </div>

    <!-- 表格 -->
    <a-table :columns="columns" :data-source="dictList" :loading="loading" row-key="id" :pagination="false">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'status'">
          <a-tag :color="record.status === 0 ? 'green' : 'red'">
            {{ record.status === 0 ? '正常' : '停用' }}
          </a-tag>
        </template>
        <template v-if="column.key === 'action'">
          <a-space>
            <a @click="handleEdit(record)">修改</a>
            <a @click="handleData(record)">数据</a>
            <a-popconfirm title="确定删除吗？" @confirm="handleDelete(record)">
              <a class="text-red-500">删除</a>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>

    <!-- 新增/修改对话框 -->
    <a-modal
      v-model:open="open"
      :title="title"
      @ok="submitForm"
      :confirmLoading="submitLoading"
    >
      <a-form :model="form" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <a-form-item label="字典名称" required>
          <a-input v-model:value="form.dictName" placeholder="请输入字典名称" />
        </a-form-item>
        <a-form-item label="字典类型" required>
          <a-input v-model:value="form.dictType" placeholder="请输入字典类型" />
        </a-form-item>
        <a-form-item label="状态">
          <a-radio-group v-model:value="form.status">
            <a-radio :value="0">正常</a-radio>
            <a-radio :value="1">停用</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="备注">
          <a-textarea v-model:value="form.remark" placeholder="请输入备注" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import { listType, getType, addType, updateType, delType } from '@/api/dict';
import type { DictType } from '@excavator/types';
import { useRouter } from 'vue-router';
import { useListRefresh } from '@/hooks/useListRefresh';

const router = useRouter();
const loading = ref(false);
const dictList = ref<DictType[]>([]);
const open = ref(false);
const title = ref('');
const submitLoading = ref(false);

const queryParams = reactive({
  dictName: '',
  dictType: '',
  status: undefined
});

const form = reactive<Partial<DictType>>({
  id: undefined,
  dictName: '',
  dictType: '',
  status: 0,
  remark: ''
});

const columns = [
  { title: '字典名称', dataIndex: 'dictName', key: 'dictName' },
  { title: '字典类型', dataIndex: 'dictType', key: 'dictType' },
  { title: '状态', dataIndex: 'status', key: 'status' },
  { title: '备注', dataIndex: 'remark', key: 'remark' },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime' },
  { title: '操作', key: 'action', width: 200 }
];

function getList() {
  loading.value = true;
  listType(queryParams).then((res: any) => {
    dictList.value = res;
    loading.value = false;
  });
}
const refreshList = useListRefresh(getList);

function handleQuery() {
  getList();
}

function resetQuery() {
  queryParams.dictName = '';
  queryParams.dictType = '';
  queryParams.status = undefined;
  handleQuery();
}

function resetForm() {
  form.id = undefined;
  form.dictName = '';
  form.dictType = '';
  form.status = 0;
  form.remark = '';
}

function handleAdd() {
  resetForm();
  open.value = true;
  title.value = '添加字典类型';
}

function handleEdit(row: DictType) {
  resetForm();
  form.id = row.id;
  form.dictName = row.dictName;
  form.dictType = row.dictType;
  form.status = row.status;
  form.remark = row.remark;
  open.value = true;
  title.value = '修改字典类型';
}

function submitForm() {
  submitLoading.value = true;
  if (form.id) {
    updateType(form).then(() => {
      message.success('修改成功');
      open.value = false;
      refreshList();
    }).finally(() => {
      submitLoading.value = false;
    });
  } else {
    addType(form).then(() => {
      message.success('新增成功');
      open.value = false;
      refreshList();
    }).finally(() => {
      submitLoading.value = false;
    });
  }
}

function handleDelete(row: DictType) {
  delType(row.id).then(() => {
    message.success('删除成功');
    refreshList();
  });
}

function handleData(row: DictType) {
  router.push({ path: `/system/dict-data/${row.dictType}` });
}

onMounted(() => {
  getList();
});
</script>
