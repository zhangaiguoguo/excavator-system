<template>
  <div class="app-container">
    <a-row :gutter="20">
      <a-col :span="6" :xs="24">
        <a-card class="box-card" title="个人信息">
          <div>
            <div class="text-center">
              <div class="user-avatar-box">
                <a-upload
                  name="avatar"
                  list-type="picture-card"
                  class="avatar-uploader"
                  :show-upload-list="false"
                  :before-upload="beforeUpload"
                >
                  <img v-if="imageUrl" :src="imageUrl" class="img-circle img-lg" />
                  <img v-else :src="userStore.avatar" class="img-circle img-lg" />
                  <div class="avatar-upload-trigger">
                    <CameraOutlined class="icon-camera" />
                  </div>
                </a-upload>
              </div>
            </div>
            <ul class="list-group list-group-unbordered">
              <li class="list-group-item">
                <span><UserOutlined class="icon" /> 用户名称</span>
                <div class="list-content">{{ userStore.name }}</div>
              </li>
              <li class="list-group-item">
                <span><PhoneOutlined class="icon" /> 手机号码</span>
                <div class="list-content">{{ user.phoneNumber }}</div>
              </li>
              <li class="list-group-item">
                <span><MailOutlined class="icon" /> 用户邮箱</span>
                <div class="list-content">{{ user.email }}</div>
              </li>
              <li class="list-group-item">
                <span><ApartmentOutlined class="icon" /> 所属部门</span>
                <div class="list-content">{{ user.deptName }}</div>
              </li>
              <li class="list-group-item">
                <span><TagOutlined class="icon" /> 所属角色</span>
                <div class="list-content">{{ userStore.roles.join(',') }}</div>
              </li>
              <li class="list-group-item">
                <span><CalendarOutlined class="icon" /> 创建日期</span>
                <div class="list-content">{{ user.createTime }}</div>
              </li>
            </ul>
          </div>
        </a-card>
      </a-col>
      <a-col :span="18" :xs="24">
        <a-card title="基本资料">
          <a-tabs v-model:activeKey="activeTab">
            <a-tab-pane key="userinfo" tab="基本资料">
              <a-form ref="userFormRef" :model="userForm" :rules="userRules" :label-col="{ span: 4 }" :wrapper-col="{ span: 14 }">
                <a-form-item label="用户昵称" name="nickName">
                  <a-input v-model:value="userForm.nickName" :maxlength="30" />
                </a-form-item>
                <a-form-item label="手机号码" name="phonenumber">
                  <a-input v-model:value="userForm.phonenumber" :maxlength="11" />
                </a-form-item>
                <a-form-item label="邮箱" name="email">
                  <a-input v-model:value="userForm.email" :maxlength="50" />
                </a-form-item>
                <a-form-item label="所属产线" name="productionLines">
                  <a-select
                    v-model:value="userForm.productionLines"
                    mode="tags"
                    style="width: 100%"
                    placeholder="请选择或输入所属产线"
                    :options="productionLineOptions"
                  ></a-select>
                </a-form-item>
                <a-form-item label="签名" name="signature">
                  <div class="signature-wrapper">
                    <a-button @click="openSignatureModal" class="signature-btn">
                      <EditOutlined /> 点击签名
                    </a-button>
                    <a-button @click="uploadLocalSignature" class="signature-btn" style="margin-left: 10px;">
                      <UploadOutlined /> 上传本地签名
                    </a-button>
                    <div class="signature-preview" v-if="signatureImage">
                      <img :src="signatureImage" alt="Signature Preview" />
                    </div>
                  </div>
                </a-form-item>
                <a-form-item label="性别" name="sex">
                  <a-radio-group v-model:value="userForm.sex">
                    <a-radio value="0">男</a-radio>
                    <a-radio value="1">女</a-radio>
                  </a-radio-group>
                </a-form-item>
                <a-form-item :wrapper-col="{ offset: 4, span: 14 }">
                  <a-button type="primary" @click="submitUserInfo">保存</a-button>
                  <a-button danger style="margin-left: 10px" @click="close">关闭</a-button>
                </a-form-item>
              </a-form>
            </a-tab-pane>
            <a-tab-pane key="resetPwd" tab="修改密码">
              <a-form ref="pwdFormRef" :model="pwdForm" :rules="pwdRules" :label-col="{ span: 4 }" :wrapper-col="{ span: 14 }">
                <a-form-item label="旧密码" name="oldPassword">
                  <a-input-password v-model:value="pwdForm.oldPassword" placeholder="请输入旧密码" />
                </a-form-item>
                <a-form-item label="新密码" name="newPassword">
                  <a-input-password v-model:value="pwdForm.newPassword" placeholder="请输入新密码" />
                </a-form-item>
                <a-form-item label="确认密码" name="confirmPassword">
                  <a-input-password v-model:value="pwdForm.confirmPassword" placeholder="请确认新密码" />
                </a-form-item>
                <a-form-item :wrapper-col="{ offset: 4, span: 14 }">
                  <a-button type="primary" @click="submitPwd">保存</a-button>
                  <a-button danger style="margin-left: 10px" @click="close">关闭</a-button>
                </a-form-item>
              </a-form>
            </a-tab-pane>
          </a-tabs>
        </a-card>
      </a-col>
    </a-row>

    <a-modal
      v-model:open="openCropper"
      title="修改头像"
      :width="800"
      @ok="uploadImg"
      okText="提交"
      cancelText="取消"
    >
      <a-row>
        <a-col :xs="24" :md="12" :style="{height: '350px'}">
          <vue-cropper
            ref="cropperRef"
            :img="options.img"
            :info="true"
            :autoCrop="options.autoCrop"
            :autoCropWidth="options.autoCropWidth"
            :autoCropHeight="options.autoCropHeight"
            :fixedBox="options.fixedBox"
            @realTime="realTime"
            :outputType="options.outputType"
          ></vue-cropper>
        </a-col>
        <a-col :xs="24" :md="12" :style="{height: '350px'}">
          <div class="avatar-upload-preview">
            <img :src="previews.url" :style="previews.img" />
          </div>
        </a-col>
      </a-row>
      <br />
      <a-row>
        <a-col :lg="2" :md="2">
          <a-upload
            name="file"
            :before-upload="beforeUpload"
            :show-upload-list="false"
          >
            <a-button>
              <template #icon><UploadOutlined /></template>
              选择
            </a-button>
          </a-upload>
        </a-col>
        <a-col :lg="{span: 1, offset: 2}" :md="2">
          <a-button @click="changeScale(1)">
            <template #icon><PlusOutlined /></template>
          </a-button>
        </a-col>
        <a-col :lg="{span: 1, offset: 1}" :md="2">
          <a-button @click="changeScale(-1)">
            <template #icon><MinusOutlined /></template>
          </a-button>
        </a-col>
        <a-col :lg="{span: 1, offset: 1}" :md="2">
          <a-button @click="rotateLeft">
            <template #icon><RotateLeftOutlined /></template>
          </a-button>
        </a-col>
        <a-col :lg="{span: 1, offset: 1}" :md="2">
          <a-button @click="rotateRight">
            <template #icon><RotateRightOutlined /></template>
          </a-button>
        </a-col>
      </a-row>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useUserStore } from '@/store/user'
import { message } from 'ant-design-vue'
import { 
  UserOutlined, 
  PhoneOutlined, 
  MailOutlined, 
  ApartmentOutlined, 
  TagOutlined, 
  CalendarOutlined, 
  CameraOutlined,
  UploadOutlined,
  PlusOutlined,
  MinusOutlined,
  RotateLeftOutlined,
  RotateRightOutlined,
  EditOutlined
} from '@ant-design/icons-vue'
import 'vue-cropper/dist/index.css'
import { VueCropper } from "vue-cropper";

const userStore = useUserStore()
const activeTab = ref('userinfo')

const user = reactive({
  phoneNumber: '15888888888',
  email: 'admin@163.com',
  deptName: '研发部门',
  createTime: '2024-03-05 10:00:00'
})

const userForm = reactive({
  nickName: userStore.name,
  phonenumber: user.phoneNumber,
  email: user.email,
  sex: '0',
  productionLines: [],
  signature: ''
})

const productionLineOptions = ref([
  { value: '公卫产线', label: '公卫产线' },
  { value: '化妆品产线', label: '化妆品产线' },
  { value: '食农产线', label: '食农产线' },
  { value: '消毒产线', label: '消毒产线' },
  { value: '职卫产线', label: '职卫产线' },
  { value: '涉水产线', label: '涉水产线' },
  { value: '保健食品产线', label: '保健食品产线' },
  { value: '医疗器械产线', label: '医疗器械产线' },
  { value: '塑料产线', label: '塑料产线' }
])

const signatureImage = ref('https://dummyimage.com/200x60/fff/000.png&text=admin') // Mock signature
const signatureModalVisible = ref(false)

const openSignatureModal = () => {
  // Ideally implement a canvas signature pad here
  message.info('打开签名板 (待实现)')
}

const uploadLocalSignature = () => {
  message.info('上传本地签名 (待实现)')
}

const userRules = {
  nickName: [{ required: true, message: '用户昵称不能为空', trigger: 'blur' }],
  phonenumber: [
    { required: true, message: '手机号码不能为空', trigger: 'blur' },
    { pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '邮箱地址不能为空', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
  ]
}

const pwdForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const pwdRules = {
  oldPassword: [{ required: true, message: '旧密码不能为空', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '新密码不能为空', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '确认密码不能为空', trigger: 'blur' },
    {
      validator: async (rule, value) => {
        if (value !== pwdForm.newPassword) {
          return Promise.reject('两次输入的密码不一致')
        }
        return Promise.resolve()
      },
      trigger: 'blur'
    }
  ]
}

const userFormRef = ref(null)
const pwdFormRef = ref(null)

const submitUserInfo = () => {
  userFormRef.value.validate().then(() => {
    message.success('修改成功')
  }).catch(() => {})
}

const submitPwd = () => {
  pwdFormRef.value.validate().then(() => {
    message.success('修改成功')
  }).catch(() => {})
}

const close = () => {
  // Logic to close current tab or go back
}

// Avatar Upload & Cropping Logic
const imageUrl = ref('')
const openCropper = ref(false)
const cropperRef = ref(null)
const options = reactive({
  img: '', // 裁剪图片的地址
  autoCrop: true, // 是否默认生成截图框
  autoCropWidth: 200, // 默认生成截图框宽度
  autoCropHeight: 200, // 默认生成截图框高度
  fixedBox: true, // 固定截图框大小 不允许改变
  outputType: 'png' // 默认生成截图为PNG格式
})
const previews = ref({})

const beforeUpload = (file) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
  if (!isJpgOrPng) {
    message.error('请上传 JPG/PNG 格式的图片!')
    return false
  }
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    message.error('图片大小不能超过 2MB!')
    return false
  }

  // Convert to base64 and open cropper
  const reader = new FileReader()
  reader.readAsDataURL(file)
  reader.onload = () => {
    options.img = reader.result
    openCropper.value = true
  }
  
  return false // Prevent auto upload
}

const changeScale = (num) => {
  num = num || 1
  cropperRef.value.changeScale(num)
}

const rotateLeft = () => {
  cropperRef.value.rotateLeft()
}

const rotateRight = () => {
  cropperRef.value.rotateRight()
}

const realTime = (data) => {
  previews.value = data
}

const uploadImg = () => {
  cropperRef.value.getCropBlob((data) => {
    // Here you would upload the 'data' (Blob) to your server
    // For now, we simulate success and update the avatar
    const blobUrl = window.URL.createObjectURL(data)
    imageUrl.value = blobUrl
    // userStore.setAvatar(blobUrl) // If you have this action
    openCropper.value = false
    message.success('头像上传成功')
  })
}
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;
}

.box-card {
  margin-bottom: 20px;
}

.text-center {
  text-align: center;
  margin-bottom: 20px;
}

.user-avatar-box {
  position: relative;
  display: inline-block;
  cursor: pointer;
  
  /* Ant Design Upload Component Styles Overlay */
  :deep(.ant-upload) {
    width: 120px !important;
    height: 120px !important;
    padding: 0 !important;
    border-radius: 50% !important;
    overflow: hidden;
    border: 2px dashed #d9d9d9 !important; /* Dashed border as requested */
    position: relative;
    transition: border-color 0.3s;

    &:hover {
      border-color: #1890ff !important;
    }
  }
  
  :deep(.ant-upload-list) {
    display: none;
  }
  
  &:hover .avatar-upload-trigger {
    opacity: 1;
  }
}

.img-circle {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.img-lg {
  width: 120px;
  height: 120px;
}

.avatar-upload-trigger {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
  font-size: 24px;
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none; /* Let clicks pass through to upload component */
}

.list-group {
  padding-left: 0;
  list-style: none;
}

.list-group-item {
  border-bottom: 1px solid #e7eaec;
  border-top: 1px solid #e7eaec;
  margin-bottom: -1px;
  padding: 11px 0;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: space-between; /* Flexbox alignment */
  
  .icon {
    margin-right: 5px;
    font-size: 14px;
    color: #999;
  }
}

.list-content {
  color: #666;
}

.avatar-upload-preview {
  position: absolute;
  top: 50%;
  transform: translate(50%, -50%);
  width: 200px;
  height: 200px;
  border-radius: 50%;
  box-shadow: 0 0 4px #ccc;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
  }
}

.signature-wrapper {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.signature-preview {
  margin-left: 20px;
  border: 1px solid #d9d9d9;
  padding: 4px;
  border-radius: 4px;
  
  img {
    max-height: 60px;
    display: block;
  }
}
</style>