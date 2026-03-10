<template>
  <view class="upload-video">
    <!-- 单个视频 max=1 -->
    <template v-if="max === 1">
      <view v-if="innerSingle" class="video-wrap">
        <video :src="getUrl(innerSingle)" controls class="video-preview"></video>
        <view class="del" @click="clearSingle">×</view>
      </view>
      <view v-else class="add-video" @click="chooseVideo">
        <text>选择视频</text>
        <text class="add-tip">{{ tip || '选填，≤30秒' }}</text>
      </view>
    </template>
    <!-- 多个视频 max>1 -->
    <template v-else>
      <view v-for="(item, i) in innerList" :key="i" class="video-wrap">
        <video :src="getUrl(item)" controls class="video-preview"></video>
        <view class="del" @click="remove(i)">×</view>
      </view>
      <view v-if="innerList.length < max" class="add-video" @click="chooseVideo">
        <text>添加视频</text>
        <text class="add-tip">{{ tip || `最多${max}个，≤30秒` }}</text>
      </view>
      <text v-if="tip && innerList.length > 0" class="upload-tip">{{ tip }}</text>
    </template>
  </view>
</template>

<script>
import apiService, { patchNewFileViewPath } from '@/api/api';

function normalizeVideoItem(it) {
  if (!it) return null;
  if (typeof it === 'string') return { fileId: it, fileName: it };
  if (it.fileId || it.fileName) return { fileId: it.fileId || it.fileName, fileName: it.fileName || it.fileId };
  return null;
}

function normalizeVideoList(val) {
  if (!Array.isArray(val)) return [];
  return val.map(normalizeVideoItem).filter(Boolean);
}

export default {
  name: 'UploadVideo',
  props: {
    /** 单视频: { fileId, fileName } 或 ''；多视频: [{ fileId, fileName }, ...] */
    value: {
      type: [String, Object, Array],
      default: () => '',
    },
    max: {
      type: Number,
      default: 1,
    },
    tip: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      innerSingle: null,
      innerList: [],
    };
  },
  watch: {
    value: {
      immediate: true,
      handler(v) {
        if (this.max === 1) {
          this.innerSingle = normalizeVideoItem(v) || null;
        } else {
          this.innerList = normalizeVideoList(v);
        }
      },
    },
  },
  methods: {
    getUrl(item) {
      const name = item && (item.fileName || item.fileId);
      return name ? patchNewFileViewPath(name) : '';
    },
    emitChange() {
      if (this.max === 1) {
        const out = this.innerSingle ? { fileId: this.innerSingle.fileId, fileName: this.innerSingle.fileName } : '';
        this.$emit('input', out);
        this.$emit('update:modelValue', out);
        this.$emit('change', out);
      } else {
        const out = this.innerList.map((it) => ({ fileId: it.fileId, fileName: it.fileName }));
        this.$emit('input', out);
        this.$emit('update:modelValue', out);
        this.$emit('change', out);
      }
    },
    async chooseVideo() {
      if (this.max > 1 && this.innerList.length >= this.max) {
        this.$tip && this.$tip.alert(`最多上传${this.max}个视频`);
        return;
      }
      uni.chooseVideo({
        sourceType: ['album', 'camera'],
        maxDuration: 30,
        success: async (res) => {
          this.$tip && this.$tip.loading('上传中...');
          try {
            const { fileId, fileName } = await apiService.uploadFile(res.tempFilePath);
            const item = { fileId: fileId || fileName, fileName: fileName || fileId };
            if (this.max === 1) {
              this.innerSingle = item;
            } else {
              this.innerList.push(item);
            }
            this.emitChange();
            this.$tip && this.$tip.loaded();
            this.$tip && this.$tip.success('上传成功');
          } catch (e) {
            this.$tip && this.$tip.loaded();
            this.$tip && this.$tip.alert(e?.message || '上传失败');
          }
        },
      });
    },
    clearSingle() {
      this.innerSingle = null;
      this.emitChange();
    },
    remove(index) {
      this.innerList.splice(index, 1);
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
.upload-tip {
  display: block;
  width: 100%;
  margin-top: 6px;
  font-size: 12px;
  color: #999;
}
</style>
