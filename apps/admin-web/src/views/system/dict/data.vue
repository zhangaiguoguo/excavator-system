<template>
  <div class="app-container p-4">
    <a-card class="mb-4" :bordered="false">
      <a-form layout="inline" :model="queryParams">
        <a-form-item label="字典类型">
          <a-input v-model:value="queryParams.dictType" disabled />
        </a-form-item>
        <a-form-item label="字典标签">
          <a-input v-model:value="queryParams.dictLabel" placeholder="请输入字典标签" allow-clear />
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

    <div class="mb-4">
      <a-button type="primary" @click="handleAdd">新增</a-button>
      <a-button class="ml-2" @click="handleBack">返回</a-button>
    </div>

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
        <a-form-item label="字典类型">
          <a-input v-model:value="form.dictType" disabled />
        </a-form-item>
        <a-form-item label="数据标签" required>
          <a-input v-model:value="form.dictLabel" placeholder="请输入数据标签" />
        </a-form-item>
        <a-form-item label="数据键值" required>
          <a-input v-model:value="form.dictValue" placeholder="请输入数据键值" />
        </a-form-item>
        <a-form-item label="显示排序" required>
          <a-input-number v-model:value="form.dictSort" :min="0" />
        </a-form-item>
        <a-form-item label="样式属性">
          <a-input v-model:value="form.cssClass" placeholder="请输入样式属性" />
        </a-form-item>
        <a-form-item label="回显样式">
          <a-select v-model:value="form.listClass">
            <a-select-option value="">默认</a-select-option>
            <a-select-option value="primary">Primary</a-select-option>
            <a-select-option value="success">Success</a-select-option>
            <a-select-option value="info">Info</a-select-option>
            <a-select-option value="warning">Warning</a-select-option>
            <a-select-option value="danger">Danger</a-select-option>
          </a-select>
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
import { useRoute, useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import { listData, getData, addData, updateData, delData } from '@/api/dict';
import type { DictData } from '@excavator/types';
import { useListRefresh } from '@/hooks/useListRefresh';

const route = useRoute();
const router = useRouter();
const dictType = ref(route.params.dictType as string);

const loading = ref(false);
const dictList = ref<DictData[]>([]);
const open = ref(false);
const title = ref('');
const submitLoading = ref(false);

const queryParams = reactive({
  dictType: dictType.value,
  dictLabel: '',
  status: undefined
});

const form = reactive<Partial<DictData>>({
  id: undefined,
  dictLabel: '',
  dictValue: '',
  dictSort: 0,
  status: 0,
  remark: ''
});

const columns = [
  { title: '字典标签', dataIndex: 'dictLabel', key: 'dictLabel' },
  { title: '字典键值', dataIndex: 'dictValue', key: 'dictValue' },
  { title: '排序', dataIndex: 'dictSort', key: 'dictSort' },
  { title: '状态', dataIndex: 'status', key: 'status' },
  { title: '备注', dataIndex: 'remark', key: 'remark' },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime' },
  { title: '操作', key: 'action', width: 200 }
];

function getList() {
  loading.value = true;
  listData(queryParams).then((res: any) => {
    dictList.value = res;
    loading.value = false;
  });
}
const refreshList = useListRefresh(getList);

function handleQuery() {
  queryParams.dictType = dictType.value;
  getList();
}

function resetQuery() {
  queryParams.dictLabel = '';
  queryParams.status = undefined;
  handleQuery();
}

function resetForm() {
  form.id = undefined;
  form.dictLabel = '';
  form.dictValue = '';
  form.dictSort = 0;
  form.status = 0;
  form.remark = '';
  form.cssClass = '';
  form.listClass = '';
  form.dictType = dictType.value;
}

function handleAdd() {
  resetForm();
  open.value = true;
  title.value = '添加字典数据';
}

function handleEdit(row: DictData) {
  resetForm();
  form.id = row.id;
  form.dictLabel = row.dictLabel;
  form.dictValue = row.dictValue;
  form.dictSort = row.dictSort;
  form.status = row.status;
  form.remark = row.remark;
  form.cssClass = row.cssClass;
  form.listClass = row.listClass;
  form.dictType = row.dictType;
  open.value = true;
  title.value = '修改字典数据';
}

function submitForm() {
  submitLoading.value = true;
  if (form.id) {
    updateData(form).then(() => {
      message.success('修改成功');
      open.value = false;
      refreshList();
    }).finally(() => {
      submitLoading.value = false;
    });
  } else {
    addData(form).then(() => {
      message.success('新增成功');
      open.value = false;
      refreshList();
    }).finally(() => {
      submitLoading.value = false;
    });
  }
}

function handleDelete(row: DictData) {
  delData(row.id).then(() => {
    message.success('删除成功');
    refreshList();
  });
}

function handleBack() {
  router.push({ path: '/system/dict' });
}

onMounted(() => {
  getList();
});
</script>
