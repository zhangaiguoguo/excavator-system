<template>
  <view class="upload-video">
    <view v-if="innerValue" class="video-wrap">
      <video :src="url" controls class="video-preview"></video>
      <view class="del" @click="clear">×</view>
    </view>
    <view v-else class="add-video" @click="chooseVideo">
      <text>选择视频</text>
      <text class="add-tip">选填，≤30秒</text>
    </view>
  </view>
</template>

<script>
import apiService, { patchNewFileViewPath } from '@/api/api';

export default {
  name: 'UploadVideo',
  props: {
    value: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      innerValue: this.value || '',
    };
  },
  computed: {
    url() {
      return this.innerValue ? patchNewFileViewPath(this.innerValue) : '';
    },
  },
  watch: {
    value(v) {
      this.innerValue = v || '';
    },
  },
  methods: {
    emitChange() {
      this.$emit('input', this.innerValue);
      this.$emit('change', this.innerValue);
    },
    async chooseVideo() {
      uni.chooseVideo({
        sourceType: ['album', 'camera'],
        maxDuration: 30,
        success: async (res) => {
          this.$tip && this.$tip.loading('上传中...');
          try {
            const { fileId } = await apiService.uploadFile(res.tempFilePath);
            this.innerValue = fileId || '';
            this.$tip && this.$tip.loaded();
            this.$tip && this.$tip.success('上传成功');
            this.emitChange();
          } catch (e) {
            this.$tip && this.$tip.loaded();
            this.$tip && this.$tip.alert(e?.message || '上传失败');
          }
        },
      });
    },
    clear() {
      this.innerValue = '';
      this.emitChange();
    },
  },
};
</script>

<style lang="scss" scoped>
.upload-video {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: flex-start;
}
.video-wrap {
  position: relative;
  width: 160px;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
}
.video-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.del {
  position: absolute;
  top: 0;
  right: 0;
  width: 22px;
  height: 22px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  text-align: center;
  line-height: 22px;
  font-size: 16px;
}
.add-video {
  width: 120px;
  height: 80px;
  border: 1px dashed #ccc;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 14px;
}
.add-video .add-tip {
  font-size: 12px;
  margin-top: 4px;
}
</style>

