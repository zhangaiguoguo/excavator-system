<template>
  <view class="comment-panel">
    <view class="section-title">评论 ({{ list.length }})</view>
    <view class="comment-list" v-if="list.length">
      <view v-for="c in list" :key="c.id" class="comment-item">
        <image
          class="comment-avatar"
          :src="avatarUrl(c.user)"
          mode="aspectFill"
        />
        <view class="comment-body">
          <view class="comment-head">
            <text class="comment-user">{{ (c.user && c.user.nickname) || '用户' }}</text>
            <text class="comment-time">{{ timeStr(c.createTime) }}</text>
          </view>
          <text class="comment-content">{{ c.content }}</text>
          <view class="comment-actions flex justify-end">
            <view class="like-wrap" @click="toggleLike(c)">
              <uni-icons :type="c.liked ? 'hand-up-filled' : 'hand-up'" size="16" :color="c.liked ? '#ff4d4f' : '#999'" />
              <text class="like-num" :class="{ liked: c.liked }">{{ c.likeCount || 0 }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>
    <view v-else class="comment-empty">暂无评论，来说两句吧~</view>
    <view class="comment-input-row">
      <uni-easyinput
        v-model="inputContent"
        type="textarea"
        placeholder="说点什么..."
        :maxlength="500"
        class="comment-input"
      />
      <button type="primary" class="btn-send" size="mini" :disabled="sending" @click="submit">发送</button>
    </view>
  </view>
</template>

<script>
import apiService from '@/api/api';
import appStore from '@/store/app';

export default {
  name: 'CommentPanel',
  props: {
    refType: { type: String, required: true },
    refId: { type: [String, Number], required: true },
  },
  data() {
    return {
      list: [],
      inputContent: '',
      sending: false,
    };
  },
  watch: {
    refId: {
      immediate: true,
      handler() {
        if (this.refType && this.refId) this.fetchList();
      },
    },
  },
  methods: {
    avatarUrl(user) {
      if (!user || !user.avatar) return '/static/default_avatar.png';
      const a = user.avatar;
      // 头像字段已存完整 URL（后端直接返回），无需拼接预览地址
      if (typeof a === 'string' && a.trim()) return a;
      return '/static/default_avatar.png';
    },
    fetchList() {
      apiService.getComments(this.refType, String(this.refId)).then((res) => {
        const data = res?.data ?? res;
        this.list = Array.isArray(data) ? data : [];
      }).catch(() => { this.list = []; });
    },
    timeStr(d) {
      if (!d) return '';
      const date = typeof d === 'string' ? new Date(d) : d;
      if (Number.isNaN(date.getTime())) return '';
      const now = new Date();
      const diff = (now - date) / 1000;
      if (diff < 60) return '刚刚';
      if (diff < 3600) return Math.floor(diff / 60) + '分钟前';
      if (diff < 86400) return Math.floor(diff / 3600) + '小时前';
      if (diff < 86400 * 7) return Math.floor(diff / 86400) + '天前';
      return date.toLocaleDateString();
    },
    toggleLike(c) {
      const userId = (appStore().state && appStore().state.userInfo && appStore().state.userInfo.id) || uni.getStorageSync('userId');
      if (!userId) {
        this.$tip && this.$tip.alert('请先登录');
        return;
      }
      apiService.toggleCommentLike(c.id).then((res) => {
        const data = res?.data ?? res;
        c.likeCount = data.likeCount != null ? data.likeCount : c.likeCount + (c.liked ? -1 : 1);
        c.liked = !!data.liked;
      }).catch(() => {});
    },
    submit() {
      const content = (this.inputContent || '').trim();
      if (!content) {
        this.$tip && this.$tip.alert('请输入评论内容');
        return;
      }
      const userId = (appStore().state && appStore().state.userInfo && appStore().state.userInfo.id) || uni.getStorageSync('userId');
      if (!userId) {
        this.$tip && this.$tip.alert('请先登录');
        return;
      }
      this.sending = true;
      apiService.createComment(this.refType, String(this.refId), content).then(() => {
        this.inputContent = '';
        this.fetchList();
        this.$tip && this.$tip.success('发送成功');
      }).catch((e) => {
        this.$tip && this.$tip.alert(e?.message || '发送失败');
      }).finally(() => { this.sending = false; });
    },
  },
};
</script>

<style lang="scss" scoped>
.comment-panel {
  padding: 12px 0;
}
.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}
.comment-list {
  max-height: 280px;
  overflow-y: auto;
}
.comment-item {
  display: flex;
  align-items: flex-start;
  padding: 12px 0;
  border-bottom: 1px solid #f0f2f5;
  &:last-child {
    border-bottom: none;
  }
}
.comment-avatar {
  width: 40px;
  height: 40px;
  border-radius: 20px;
  flex-shrink: 0;
  background: #f0f2f5;
}
.comment-body {
  flex: 1;
  min-width: 0;
  margin-left: 12px;
}
.comment-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}
.comment-user {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}
.comment-time {
  font-size: 11px;
  color: #999;
  flex-shrink: 0;
}
.comment-content {
  font-size: 14px;
  color: #555;
  line-height: 1.5;
  word-break: break-all;
}
.comment-actions {
  margin-top: 8px;
}
.like-wrap {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 12px;
  background: #f5f6f8;
  .like-num {
    font-size: 12px;
    color: #999;
    &.liked {
      color: #ff4d4f;
    }
  }
}
.comment-empty {
  font-size: 13px;
  color: #999;
  padding: 20px 0;
  text-align: center;
}
.comment-input-row {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  margin-top: 14px;
}
.comment-input {
  flex: 1;
  min-height: 36px;
}
.btn-send {
  flex-shrink: 0;
  margin: 0;
  padding: 0 16px;
  height: 36px;
  line-height: 36px;
}
</style>
