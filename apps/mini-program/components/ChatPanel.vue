<template>
  <view class="chat-panel">
    <!-- 仅此区域可滚动，上下栏固定 -->
    <view class="chat-list-wrap">
      <scroll-view
        class="chat-list"
        scroll-y
        :scroll-into-view="scrollIntoId"
        :scroll-with-animation="true"
        :enable-back-to-top="false"
        @scrolltoupper="onScrollUpper"
      >
        <view class="list-inner">
        <view
          v-for="(m, idx) in messages"
          :key="'msg-' + idx"
          :id="'msg-' + idx"
          class="msg-row"
          :class="{ self: m.isSelf }"
        >
          <view class="msg-time" v-if="showTime(m, idx)">{{ msgDateStr(m.ts) }}</view>
          <view class="msg-body">
            <view class="avatar" v-if="!m.isSelf">
              <image v-if="otherUserAvatar" class="avatar-img" :src="otherUserAvatar" mode="aspectFill" />
              <text v-else class="avatar-txt">{{ (m.fromName || '对').slice(0, 1) }}</text>
            </view>
            <view class="bubble-wrap">
              <view class="bubble" :class="{ self: m.isSelf }">
                <!-- 位置消息 -->
                <template v-if="m.isLocation">
                  <view class="bubble-location">
                    <uni-icons type="location" size="18" color="#07c160" />
                    <text class="location-addr">{{ m.locationAddr || '位置' }}</text>
                  </view>
                </template>
                <!-- 语音消息（可点击播放） -->
                <template v-else-if="m.isVoice">
                  <view class="bubble-voice" @click="(m.voiceUrl || m._voiceUrl) ? playVoice(m.voiceUrl || m._voiceUrl, m) : null">
                    <uni-icons :type="m.playing ? 'pause' : 'mic'" size="20" color="#666" />
                    <text class="voice-dur">{{ m.voiceDuration || '' }}"</text>
                    <text v-if="(m.voiceUrl || m._voiceUrl) && !m.playing" class="voice-hint">点击播放</text>
                    <text v-else-if="m.playing" class="voice-hint">播放中</text>
                  </view>
                </template>
                <!-- 图片消息 -->
                <template v-else-if="m.isImage">
                  <image v-if="m.imageUrl" class="bubble-img" :src="m.imageUrl" mode="widthFix" @click="previewImage(m.imageUrl)" />
                  <text v-else class="bubble-text">{{ TAGS.IMAGE }}</text>
                </template>
                <!-- 视频消息 -->
                <template v-else-if="m.isVideo">
                  <view v-if="m.videoUrl" class="bubble-video-wrap">
                    <video class="bubble-video" :src="m.videoUrl" controls :show-center-play-btn="true" object-fit="contain" />
                  </view>
                  <text v-else class="bubble-text">{{ TAGS.VIDEO }}</text>
                </template>
                <!-- 文本 -->
                <text v-else class="bubble-text">{{ m.text }}</text>
              </view>
            </view>
            <view class="avatar self" v-if="m.isSelf">
              <image v-if="myAvatar" class="avatar-img" :src="myAvatar" mode="aspectFill" />
              <text v-else class="avatar-txt">{{ (m.fromName || '我').slice(0, 1) }}</text>
            </view>
          </view>
        </view>
        <view v-if="!messages.length" class="empty-tip">
          <text class="empty-main">暂无消息，发一句打个招呼吧</text>
          <text class="empty-hint">支持文字、图片、语音、视频、位置</text>
        </view>
        </view>
      </scroll-view>
    </view>

    <!-- 表情面板 -->
    <view class="emoji-panel" v-if="showEmoji">
      <scroll-view scroll-y class="emoji-scroll">
        <view class="emoji-grid">
          <view
            v-for="(e, i) in emojiList"
            :key="i"
            class="emoji-item"
            @click="insertEmoji(e)"
          >{{ e }}</view>
        </view>
      </scroll-view>
    </view>

    <!-- 更多面板：定位、相册、拍摄 -->
    <view class="more-panel" v-if="showMore">
      <view class="more-grid">
        <view class="more-item" @click="sendLocation">
          <view class="more-icon-wrap"><uni-icons type="location" size="28" color="#07c160" /></view>
          <text class="more-label">定位</text>
        </view>
        <view class="more-item" @click="chooseImage">
          <view class="more-icon-wrap"><uni-icons type="image" size="28" color="#07c160" /></view>
          <text class="more-label">相册</text>
        </view>
        <view class="more-item" @click="takePhoto">
          <view class="more-icon-wrap"><uni-icons type="camera" size="28" color="#07c160" /></view>
          <text class="more-label">拍摄</text>
        </view>
        <view class="more-item" @click="chooseVideo">
          <view class="more-icon-wrap"><uni-icons type="videocam" size="28" color="#07c160" /></view>
          <text class="more-label">视频</text>
        </view>
        <view class="more-item" @click="toggleLiveLocation">
          <view class="more-icon-wrap"><uni-icons type="location-filled" size="28" color="#07c160" /></view>
          <text class="more-label">共享实时位置</text>
        </view>
      </view>
    </view>

    <!-- 对方正在共享实时位置：地图浮层 -->
    <view class="live-location-overlay" v-if="otherUserLiveLocation && !isSharingLocation" @click.stop>
      <view class="live-location-header">
        <text class="live-location-title">{{ otherUserLiveLocation.fromName || '对方' }} 正在共享实时位置</text>
        <view class="live-location-close" @click="otherUserLiveLocation = null">×</view>
      </view>
      <map
        class="live-location-map"
        :latitude="otherUserLiveLocation.latitude"
        :longitude="otherUserLiveLocation.longitude"
        :markers="otherUserLiveMarkers"
        scale="16"
        show-location
      />
    </view>

    <!-- 自己正在共享：底部条 + 结束 -->
    <view class="live-location-bar" v-if="isSharingLocation">
      <text class="live-location-bar-text">正在共享实时位置</text>
      <button class="live-location-end-btn" @click="endLocationShare">结束</button>
    </view>

    <!-- 下：输入控制栏 -->
    <view class="input-bar">
      <view class="input-bar-main">
        <view class="icon-btn" @click="toggleVoice">
          <uni-icons :type="isVoiceMode ? 'compose' : 'mic'" size="24" color="#333" />
        </view>
        <!-- 语音模式：按住说话 -->
        <view v-if="isVoiceMode" class="voice-touch" @touchstart="onVoiceStart" @touchend="onVoiceEnd" @touchcancel="onVoiceEnd">
          <text>{{ voiceRecording ? '松开 发送' : '按住 说话' }}</text>
        </view>
        <!-- 文字输入 -->
        <view v-else class="input-wrap">
          <input
            class="text-inp"
            v-model="inputText"
            type="text"
            placeholder="请输入消息"
            placeholder-class="inp-placeholder"
            confirm-type="send"
            :adjust-position="true"
            :hold-keyboard="false"
            :focus="inputFocused"
            @focus="inputFocused = true; closePanels()"
            @blur="onInputBlur"
            @confirm="sendText"
          />
        </view>
        <view class="icon-btn icon-emoji" @click="toggleEmoji" title="表情">😀</view>
        <view class="icon-btn" @click="toggleMore">
          <uni-icons type="plusempty" size="24" color="#333" />
        </view>
        <button class="send-btn" :class="{ active: canSend }" :disabled="!canSend" @click="sendText">发送</button>
      </view>
    </view>
  </view>
</template>

<script>
import appStore from '@/store/app';
import apiService, { getFileViewUrl } from '@/api/api';
import configService from '@/common/service/config.service';
import realtime from '@/common/service/realtime.js';
import {
  TAGS,
  MSG_TYPE,
  buildContent,
  parseContent,
} from '@/common/util/chatMessageTypes.js';

const EMOJI_ARR = ['😀','😃','😄','😁','😅','😂','🤣','😊','😇','🙂','😉','😍','🥰','😘','😋','😛','😜','🤪','😝','🤗','🤭','🤔','😐','😏','😣','😢','😭','😱','😤','😡','🥳','😎','🤓','😕','😟','🙁','☹️','😮','😯','😲','😳','🥺','😢','😭','😱','😖','😣','👍','👎','👏','🙌','🤝','🙏','❤️','💪','🔥','⭐','✨'];

export default {
  name: 'ChatPanel',
  props: {
    refType: { type: String, required: true },
    refId: { type: [String, Number], required: true },
    otherUserId: { type: String, default: '' },
  },
  data() {
    return {
      TAGS,
      messages: [],
      inputText: '',
      inputFocused: false,
      showEmoji: false,
      showMore: false,
      isVoiceMode: false,
      voiceRecording: false,
      recorderManager: null,
      voiceFilePath: '',
      offRealtime: null,
      scrollIntoId: '',
      emojiList: EMOJI_ARR,
      voiceAudio: null,
      otherUserAvatar: '',
      isSharingLocation: false,
      locationShareTimer: null,
      otherUserLiveLocation: null,
    };
  },
  computed: {
    otherUserLiveMarkers() {
      const o = this.otherUserLiveLocation;
      if (!o || o.latitude == null || o.longitude == null) return [];
      return [{
        id: 1,
        latitude: o.latitude,
        longitude: o.longitude,
        width: 24,
        height: 24,
        callout: { content: (o.fromName || '对方') + ' 实时位置', display: 'ALWAYS', padding: 4, borderRadius: 4 },
      }];
    },
    canSend() {
      return (this.inputText || '').trim().length > 0;
    },
    myAvatar() {
      const store = appStore();
      const user = (store.state && store.state.userInfo) || {};
      const avatar = user.avatar;
      return (typeof avatar === 'string' && avatar.trim()) ? avatar : '';
    },
  },
  watch: {
    otherUserId: {
      immediate: true,
      handler(id) {
        if (!id) { this.otherUserAvatar = ''; return; }
        apiService.getUser(id).then((res) => {
          const d = res?.data ?? res;
          const avatar = d && d.avatar;
          this.otherUserAvatar = (typeof avatar === 'string' && avatar.trim()) ? avatar : '';
        }).catch(() => { this.otherUserAvatar = ''; });
      },
    },
  },
  mounted() {
    this.fetchHistory();
    this.offRealtime = realtime.on((event, data) => {
      if (event === 'chat_message') {
        if (!data || String(data.refType) !== this.refType || String(data.refId) !== String(this.refId)) return;
        const store = appStore();
        const myId = (store.state && store.state.userInfo && store.state.userInfo.id) || uni.getStorageSync('userId');
        const isSelf = myId && data.fromUserId && String(myId) === String(data.fromUserId);
        if (isSelf) return;
        this.pushMessage(data);
        this.$nextTick(() => this.scrollToBottom());
        return;
      }
      if (event === 'location_share') {
        if (!data || String(data.refType) !== this.refType || String(data.refId) !== String(this.refId)) return;
        const store = appStore();
        const myId = (store.state && store.state.userInfo && store.state.userInfo.id) || uni.getStorageSync('userId');
        if (data.fromUserId && String(data.fromUserId) === String(myId)) return;
        this.otherUserLiveLocation = {
          latitude: data.latitude,
          longitude: data.longitude,
          fromUserId: data.fromUserId,
          fromName: data.fromName || '对方',
          timestamp: data.timestamp,
        };
        return;
      }
      if (event === 'location_share_end') {
        if (!data || String(data.refType) !== this.refType || String(data.refId) !== String(this.refId)) return;
        if (this.otherUserLiveLocation && data.fromUserId && String(this.otherUserLiveLocation.fromUserId) === String(data.fromUserId)) {
          this.otherUserLiveLocation = null;
        }
      }
    });
    realtime.subscribe(this.refType, this.refId);
  },
  beforeUnmount() {
    this.endLocationShare();
    if (this.offRealtime) this.offRealtime();
    this.offRealtime = null;
    realtime.unsubscribe(this.refType, this.refId);
    if (this.recorderManager) {
      try { this.recorderManager.stop(); } catch (e) {}
    }
    if (this.voiceAudio) {
      try { this.voiceAudio.stop(); this.voiceAudio.destroy(); } catch (e) {}
      this.voiceAudio = null;
    }
  },
  methods: {
    /** 语音/媒体 URL 转为可播放的绝对地址（小程序 InnerAudioContext 需完整 URL） */
    ensureAbsoluteUrl(url) {
      if (!url || typeof url !== 'string') return '';
      const u = url.trim();
      if (/^https?:\/\//i.test(u)) return u;
      const base = (configService && configService.apiUrl) || '';
      if (!base) return u;
      return u.startsWith('/') ? base.replace(/\/$/, '') + u : base + '/' + u;
    },
    pushMessage(data, opts = {}) {
      const content = data.text || data.content || '';
      const parsed = parseContent(content);
      const msg = {
        text: parsed.text,
        fromName: data.fromName || '用户',
        fromUserId: data.fromUserId,
        ts: data.ts || new Date().toISOString(),
        isSelf: opts.isSelf || false,
        ...parsed,
      };
      if (msg.isVoice && msg.voiceUrl) {
        msg._voiceUrl = this.ensureAbsoluteUrl(msg.voiceUrl);
        msg.voiceUrl = msg._voiceUrl || msg.voiceUrl;
      }
      this.messages.push(msg);
    },
    showTime(msg, idx) {
      if (idx === 0) return true;
      const prev = this.messages[idx - 1];
      if (!prev || !prev.ts || !msg.ts) return false;
      return new Date(msg.ts).getTime() - new Date(prev.ts).getTime() > 5 * 60 * 1000;
    },
    msgDateStr(ts) {
      if (!ts) return '';
      const d = new Date(ts);
      if (Number.isNaN(d.getTime())) return '';
      const now = new Date();
      const isToday = d.toDateString() === now.toDateString();
      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      if (isToday) return `${hh}:${mm}`;
      const md = `${d.getMonth() + 1}/${d.getDate()}`;
      return `${md} ${hh}:${mm}`;
    },
    closePanels() {
      this.showEmoji = false;
      this.showMore = false;
    },
    onInputBlur() {
      setTimeout(() => { this.inputFocused = false; }, 100);
    },
    toggleVoice() {
      this.isVoiceMode = !this.isVoiceMode;
      this.closePanels();
    },
    toggleEmoji() {
      this.showEmoji = !this.showEmoji;
      this.showMore = false;
      if (this.showEmoji) this.inputFocused = false;
    },
    toggleMore() {
      this.showMore = !this.showMore;
      this.showEmoji = false;
      if (this.showMore) this.inputFocused = false;
    },
    insertEmoji(e) {
      this.inputText = (this.inputText || '') + e;
    },
    onVoiceStart() {
      if (this.voiceRecording) return;
      this.voiceRecording = true;
      this.startRecord();
    },
    onVoiceEnd() {
      if (!this.voiceRecording) return;
      this.voiceRecording = false;
      this.stopRecord();
    },
    startRecord() {
      this.recorderManager = uni.getRecorderManager();
      this.recorderManager.start({ duration: 60000, sampleRate: 16000, format: 'mp3' });
      this.recorderManager.onStop((res) => {
        const duration = Math.round((res.duration || 0) / 1000);
        if (duration > 0 && res.tempFilePath) {
          this.sendVoice(res.tempFilePath, duration);
        } else {
          this.$tip && this.$tip.alert('录音时间太短');
        }
      });
    },
    stopRecord() {
      if (this.recorderManager) {
        try { this.recorderManager.stop(); } catch (e) {}
      }
    },
    sendVoice(filePath, duration) {
      const store = appStore();
      const user = (store.state && store.state.userInfo) || {};
      const userId = user.id || uni.getStorageSync('userId');
      if (!userId) { this.$tip && this.$tip.alert('请先登录'); return; }
      this.$tip && this.$tip.loading && this.$tip.loading('上传中...');
      apiService.uploadFile(filePath).then((up) => {
        this.$tip && this.$tip.loaded && this.$tip.loaded();
        const rawUrl = up.url || (up.fileName ? getFileViewUrl(up.fileName) : '');
        const url = rawUrl && !/^https?:\/\//i.test(rawUrl) ? getFileViewUrl(up.fileName) : rawUrl;
        const content = buildContent(MSG_TYPE.VOICE, { duration, url: url || rawUrl });
        this.pushMessage({
          text: content,
          fromName: user.nickname || '我',
          fromUserId: String(userId),
          ts: new Date().toISOString(),
        }, { isSelf: true });
        this.$nextTick(() => this.scrollToBottom());
        realtime.send('chat_message', {
          refType: this.refType,
          refId: String(this.refId),
          text: content,
          fromUserId: String(userId),
          fromName: user.nickname || '我',
          toUserId: this.otherUserId || undefined,
        });
      }).catch(() => {
        this.$tip && this.$tip.loaded && this.$tip.loaded();
        const content = buildContent(MSG_TYPE.VOICE, { duration });
        this.pushMessage({
          text: content,
          fromName: user.nickname || '我',
          fromUserId: String(userId),
          ts: new Date().toISOString(),
        }, { isSelf: true });
        this.$nextTick(() => this.scrollToBottom());
        realtime.send('chat_message', {
          refType: this.refType,
          refId: String(this.refId),
          text: content,
          fromUserId: String(userId),
          fromName: user.nickname || '我',
          toUserId: this.otherUserId || undefined,
        });
      });
    },
    playVoice(url, msg) {
      const playUrl = this.ensureAbsoluteUrl(url || (msg && (msg.voiceUrl || msg._voiceUrl)));
      if (!playUrl) return;
      if (this.voiceAudio) {
        this.voiceAudio.stop();
        this.voiceAudio.destroy();
        this.voiceAudio = null;
        this.messages.forEach((m) => { m.playing = false; });
      }
      this.voiceAudio = uni.createInnerAudioContext();
      this.voiceAudio.src = playUrl;
      this.voiceAudio.onPlay(() => { if (msg) msg.playing = true; });
      this.voiceAudio.onStop(() => { if (msg) msg.playing = false; });
      this.voiceAudio.onEnded(() => {
        if (msg) msg.playing = false;
        if (this.voiceAudio) { this.voiceAudio.destroy(); this.voiceAudio = null; }
      });
      this.voiceAudio.onError(() => {
        if (msg) msg.playing = false;
        this.$tip && this.$tip.alert('播放失败');
        if (this.voiceAudio) { this.voiceAudio.destroy(); this.voiceAudio = null; }
      });
      this.voiceAudio.play();
    },
    chooseVideo() {
      this.showMore = false;
      uni.chooseMedia({
        count: 1,
        mediaType: ['video'],
        sourceType: ['album', 'camera'],
        maxDuration: 60,
        success: (res) => {
          const path = res.tempFiles[0]?.tempFilePath || res.tempFiles[0]?.filePath;
          if (path) this.uploadAndSendVideo(path);
        },
      });
    },
    uploadAndSendVideo(filePath) {
      const store = appStore();
      const userId = (store.state && store.state.userInfo || {}).id || uni.getStorageSync('userId');
      if (!userId) { this.$tip && this.$tip.alert('请先登录'); return; }
      this.$tip && this.$tip.loading && this.$tip.loading('上传中...');
      apiService.uploadFile(filePath).then((up) => {
        this.$tip && this.$tip.loaded && this.$tip.loaded();
        const url = up.url || (up.fileName ? getFileViewUrl(up.fileName) : '');
        this.doSend(buildContent(MSG_TYPE.VIDEO, { url }));
      }).catch(() => {
        this.$tip && this.$tip.loaded && this.$tip.loaded();
        this.doSend(buildContent(MSG_TYPE.VIDEO, {}));
      });
    },
    sendLocation() {
      this.showMore = false;
      uni.chooseLocation({
        success: (res) => {
          const addr = (res.address || res.name || '').trim() || (res.latitude + ',' + res.longitude);
          this.doSend(buildContent(MSG_TYPE.LOCATION, {
            address: addr,
            longitude: res.longitude,
            latitude: res.latitude,
          }));
        },
        fail: (err) => {
          if (err.errMsg && !err.errMsg.includes('cancel')) {
            uni.getLocation({
              type: 'gcj02',
              success: (loc) => {
                apiService.regeoLocation({ longitude: loc.longitude, latitude: loc.latitude, extensions: 'base' }).then((r) => {
                  const d = r?.data ?? r;
                  const addr = [d?.city, d?.district].filter(Boolean).join('') || d?.province || '当前定位';
                  this.doSend(buildContent(MSG_TYPE.LOCATION, { address: addr, longitude: loc.longitude, latitude: loc.latitude }));
                }).catch(() => {
                  this.doSend(buildContent(MSG_TYPE.LOCATION, { address: '坐标', longitude: loc.longitude, latitude: loc.latitude }));
                });
              },
              fail: () => { this.$tip && this.$tip.alert('无法获取位置'); },
            });
          }
        },
      });
    },
    toggleLiveLocation() {
      this.showMore = false;
      if (this.isSharingLocation) {
        this.endLocationShare();
        return;
      }
      this.startLocationShare();
    },
    startLocationShare() {
      const store = appStore();
      const user = (store.state && store.state.userInfo) || {};
      const userId = user.id || uni.getStorageSync('userId');
      if (!userId) {
        this.$tip && this.$tip.alert('请先登录');
        return;
      }
      const doSendLocation = () => {
        uni.getLocation({
          type: 'gcj02',
          success: (loc) => {
            realtime.send('location_share', {
              refType: this.refType,
              refId: String(this.refId),
              latitude: loc.latitude,
              longitude: loc.longitude,
              fromUserId: String(userId),
              fromName: user.nickname || '我',
              timestamp: Date.now(),
            });
          },
          fail: () => {},
        });
      };
      doSendLocation();
      this.locationShareTimer = setInterval(doSendLocation, 4000);
      this.isSharingLocation = true;
    },
    endLocationShare() {
      if (this.locationShareTimer) {
        clearInterval(this.locationShareTimer);
        this.locationShareTimer = null;
      }
      if (!this.isSharingLocation) return;
      const store = appStore();
      const userId = (store.state && store.state.userInfo || {}).id || uni.getStorageSync('userId');
      if (userId) {
        realtime.send('location_share_end', {
          refType: this.refType,
          refId: String(this.refId),
          fromUserId: String(userId),
        });
      }
      this.isSharingLocation = false;
    },
    chooseImage() {
      this.showMore = false;
      uni.chooseImage({
        count: 1,
        success: (res) => {
          const path = res.tempFilePaths[0];
          this.uploadAndSendImage(path);
        },
      });
    },
    takePhoto() {
      this.showMore = false;
      uni.chooseMedia({
        count: 1,
        mediaType: ['image'],
        sourceType: ['camera'],
        success: (res) => {
          const path = res.tempFiles[0]?.tempFilePath || res.tempFiles[0]?.filePath;
          if (path) this.uploadAndSendImage(path);
        },
      });
    },
    uploadAndSendImage(filePath) {
      const store = appStore();
      const userId = (store.state && store.state.userInfo || {}).id || uni.getStorageSync('userId');
      if (!userId) { this.$tip && this.$tip.alert('请先登录'); return; }
      this.$tip && this.$tip.loading && this.$tip.loading('上传中...');
      apiService.uploadFile(filePath).then((up) => {
        this.$tip && this.$tip.loaded && this.$tip.loaded();
        const url = up.url || (up.fileName ? getFileViewUrl(up.fileName) : '');
        this.doSend(buildContent(MSG_TYPE.IMAGE, { url }));
      }).catch(() => {
        this.$tip && this.$tip.loaded && this.$tip.loaded();
        this.doSend(buildContent(MSG_TYPE.IMAGE, {}));
      });
    },
    previewImage(url) {
      if (url) uni.previewImage({ urls: [url], current: url });
    },
    doSend(content, opts = {}) {
      const store = appStore();
      const user = (store.state && store.state.userInfo) || {};
      const userId = user.id || uni.getStorageSync('userId');
      if (!userId) { this.$tip && this.$tip.alert('请先登录'); return; }
      const parsed = parseContent(content);
      this.messages.push({
        text: parsed.text,
        fromName: user.nickname || '我',
        fromUserId: String(userId),
        ts: new Date().toISOString(),
        isSelf: true,
        ...parsed,
      });
      this.$nextTick(() => this.scrollToBottom());
      realtime.send('chat_message', {
        refType: this.refType,
        refId: String(this.refId),
        text: content,
        fromUserId: String(userId),
        fromName: user.nickname || '我',
        toUserId: this.otherUserId || undefined,
      });
    },
    sendText() {
      const text = (this.inputText || '').trim();
      if (!text) return;
      this.inputText = '';
      this.doSend(buildContent(MSG_TYPE.TEXT, { text }));
    },
    fetchHistory() {
      const store = appStore();
      const myId = (store.state && store.state.userInfo && store.state.userInfo.id) || uni.getStorageSync('userId');
      if (!myId) return;
      apiService.getChatMessages({ refType: this.refType, refId: this.refId, otherUserId: this.otherUserId || undefined })
        .then((res) => {
          const data = res?.data ?? res;
          const list = data?.list ?? (Array.isArray(data) ? data : []);
          this.messages = list.map((m) => {
            const content = m.content || m.text || '';
            const parsed = parseContent(content);
            const msg = {
              text: parsed.text,
              fromName: '',
              fromUserId: String(m.fromUserId),
              ts: m.createTime,
              isSelf: String(myId) === String(m.fromUserId),
              ...parsed,
            };
            if (msg.isVoice && msg.voiceUrl) {
              msg._voiceUrl = this.ensureAbsoluteUrl(msg.voiceUrl);
              msg.voiceUrl = msg._voiceUrl || msg.voiceUrl;
            }
            return msg;
          });
          this.$nextTick(() => this.scrollToBottom());
        })
        .catch(() => {});
    },
    onScrollUpper() {},
    scrollToBottom() {
      if (!this.messages.length) return;
      this.scrollIntoId = 'msg-' + (this.messages.length - 1);
    },
  },
};
</script>

<style lang="scss" scoped>
.chat-panel {
  height: 100%;
  min-height: 0;
  position: relative;
  display: flex;
  flex-direction: column;
  background: #ededed;
  box-sizing: border-box;
  overflow: hidden;
}

/* 仅消息列表区域可滚动：用绝对定位给 scroll-view 明确高度（小程序里 flex+100% 常不生效） */
.chat-list-wrap {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  overflow: hidden;
}

.chat-list {
  height: 100%;
  width: 100%;
  box-sizing: border-box;
  padding: 12px 12px 16px;
  padding-bottom: 80px;
  padding-bottom: calc(80px + env(safe-area-inset-bottom));
}

.list-inner {
  min-height: 100%;
  width: 100%;
  box-sizing: border-box;
}

.msg-row {
  margin-bottom: 16px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.msg-row.self {
  align-items: flex-end;
}

/* 时间居中（微信样式：整行居中，独立一行） */
.msg-time {
  width: 100%;
  text-align: center;
  font-size: 12px;
  color: #999;
  margin-bottom: 8px;
  flex-shrink: 0;
}

/* 对方：头像左 + 内容右，整行靠左 */
.msg-body {
  display: flex;
  align-items: flex-start;
  flex-direction: row;
  justify-content: flex-start;
  max-width: 85%;
}

/* 自己：内容左 + 头像右，整行靠右（微信样式） */
.msg-row.self .msg-body {
  flex-direction: row;
  justify-content: flex-end;
}

.msg-body .avatar {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  background: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-right: 10px;
}

.msg-body .avatar.self {
  margin-right: 0;
  margin-left: 10px;
  background: #07c160;
}

.avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 4px;
  display: block;
  background: #e0e0e0;
}

.avatar-txt {
  color: #fff;
  font-size: 16px;
  font-weight: 600;
}

.bubble-wrap {
  max-width: 70%;
  min-width: 60px;
}


.bubble {
  padding: 10px 14px;
  border-radius: 4px;
  font-size: 16px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(0,0,0,0.06);
}

.bubble.self {
  background: #95ec69;
}

.bubble-text {
  color: #1a1a1a;
  word-break: break-all;
  line-height: 1.5;
}

.bubble-location {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #07c160;
}

.location-addr {
  font-size: 14px;
  color: #333;
  flex: 1;
}

.bubble-voice {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #666;
}

.voice-dur {
  font-size: 14px;
}

.bubble-img {
  max-width: 200px;
  max-height: 200px;
  border-radius: 4px;
  display: block;
}

.bubble-video-wrap {
  max-width: 200px;
  max-height: 180px;
  border-radius: 4px;
  overflow: hidden;
  background: #000;
}
.bubble-video {
  width: 100%;
  height: 100%;
  display: block;
}

.voice-hint {
  font-size: 11px;
  color: #999;
  margin-left: 4px;
}

.empty-tip {
  text-align: center;
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.empty-main {
  color: #666;
  font-size: 15px;
}
.empty-hint {
  color: #999;
  font-size: 12px;
}

/* 表情面板 */
.emoji-panel {
  flex-shrink: 0;
  height: 260px;
  background: #f7f7f7;
  border-top: 1px solid #e7e7e7;
  padding: 8px 0;
  padding-bottom: calc(8px + env(safe-area-inset-bottom));
}

.emoji-scroll {
  height: 100%;
}

.emoji-grid {
  display: flex;
  flex-wrap: wrap;
  padding: 0 8px;
}

.emoji-item {
  width: 12.5%;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

/* 更多面板：留出固定输入栏高度，避免被遮挡 */
.more-panel {
  flex-shrink: 0;
  min-height: 200px;
  background: #f7f7f7;
  border-top: 1px solid #e7e7e7;
  padding: 16px 12px;
  padding-bottom: calc(16px + 52px + env(safe-area-inset-bottom));
  box-sizing: border-box;
}

.more-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20px 24px;
  justify-content: flex-start;
  align-content: flex-start;
}

.more-item {
  width: 72px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.more-icon-wrap {
  width: 56px;
  height: 56px;
  border-radius: 8px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
}

.more-label {
  font-size: 12px;
  color: #666;
  line-height: 1.2;
}

/* 输入栏：固定贴底，留出安全区 */
.input-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  flex-shrink: 0;
  background: #f7f7f7;
  border-top: 1px solid #e7e7e7;
  padding: 8px 12px;
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}

.input-bar-main {
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.icon-emoji {
  font-size: 22px;
  line-height: 1;
}

.voice-touch {
  flex: 1;
  height: 36px;
  line-height: 36px;
  text-align: center;
  font-size: 15px;
  color: #333;
  background: #fff;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
}

.input-wrap {
  flex: 1;
  min-width: 0;
  height: 36px;
  background: #fff;
  border-radius: 4px;
  padding: 0 12px;
  border: 1px solid #e0e0e0;
}

.text-inp {
  width: 100%;
  height: 100%;
  font-size: 16px;
  color: #333;
}

.inp-placeholder {
  color: #b2b2b2;
}

.send-btn {
  flex-shrink: 0;
  margin: 0;
  padding: 0 14px;
  height: 36px;
  line-height: 36px;
  font-size: 15px;
  color: #fff;
  background: #c6c6c6;
  border-radius: 4px;
  border: none;
}

.send-btn::after {
  border: none;
}

.send-btn.active {
  background: #07c160;
}

/* 对方实时位置浮层 */
.live-location-overlay {
  position: fixed;
  left: 12px;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  height: 320px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  z-index: 1000;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.live-location-header {
  flex-shrink: 0;
  padding: 12px 12px 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.live-location-title {
  font-size: 14px;
  color: #333;
}
.live-location-close {
  width: 28px;
  height: 28px;
  text-align: center;
  line-height: 28px;
  font-size: 22px;
  color: #999;
}
.live-location-map {
  flex: 1;
  width: 100%;
  min-height: 260px;
}

/* 自己正在共享：底部条 */
.live-location-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 10px 12px;
  padding-bottom: calc(10px + env(safe-area-inset-bottom));
  background: #07c160;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 999;
}
.live-location-bar-text {
  font-size: 15px;
}
.live-location-end-btn {
  padding: 6px 16px;
  font-size: 14px;
  color: #07c160;
  background: #fff;
  border: none;
  border-radius: 4px;
}
.live-location-end-btn::after {
  border: none;
}
</style>
