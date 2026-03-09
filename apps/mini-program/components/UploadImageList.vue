<template>
  <view class="upload-images">
    <view class="img-list">
      <view v-for="(id, i) in innerValue" :key="i" class="img-item" @click="preview(i)">
        <image :src="getUrl(id)" mode="aspectFill" />
        <view class="del" @click.stop="remove(i)">×</view>
      </view>
      <view v-if="innerValue.length < max" class="add-img" @click="chooseImages">
        <text>+</text>
        <text class="add-tip">添加图片</text>
      </view>
    </view>
    <text v-if="tip" class="upload-tip">{{ tip }}</text>
  </view>
</template>

<script>
import apiService, { patchNewFileViewPath } from '@/api/api';

export default {
  name: 'UploadImageList',
  props: {
    value: {
      type: Array,
      default: () => [],
    },
    max: {
      type: Number,
      default: 5,
    },
    tip: {
      type: String,
      default: '最少1张，最多5张',
    },
  },
  data() {
    return {
      innerValue: Array.isArray(this.value) ? [...this.value] : [],
    };
  },
  watch: {
    value: {
      deep: true,
      handler(v) {
        this.innerValue = Array.isArray(v) ? [...v] : [];
      },
    },
  },
  methods: {
    getUrl(id) {
      if (!id) return '';
      return patchNewFileViewPath(id);
    },
    emitChange() {
      this.$emit('input', [...this.innerValue]);
      this.$emit('change', [...this.innerValue]);
    },
    async chooseImages() {
      const remain = this.max - (this.innerValue || []).length;
      if (remain <= 0) {
        this.$tip && this.$tip.alert(`最多${this.max}张图片`);
        return;
      }
      uni.chooseImage({
        count: remain,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: async (res) => {
          this.$tip && this.$tip.loading('上传中...');
          try {
            for (const f of res.tempFilePaths) {
              const { fileId } = await apiService.uploadFile(f);
              if (fileId) this.innerValue.push(fileId);
            }
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
    remove(i) {
      this.innerValue.splice(i, 1);
      this.emitChange();
    },
    preview(index) {
      const urls = this.innerValue.map((id) => this.getUrl(id));
      if (!urls.length) return;
      uni.previewImage({
        current: urls[index],
        urls,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.upload-images .img-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: flex-start;
}
.upload-images .img-item {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
}
.upload-images .img-item image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.upload-images .img-item .del {
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
.add-img {
  width: 80px;
  height: 80px;
  border: 1px dashed #ccc;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 24px;
}
.add-img .add-tip {
  font-size: 12px;
  margin-top: 4px;
}
.upload-tip {
  display: block;
  margin-top: 6px;
  font-size: 12px;
  color: #999;
}
</style>

