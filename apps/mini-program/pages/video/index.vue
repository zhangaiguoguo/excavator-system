<template>
  <view class="page">
    <view v-if="loading" class="loading-wrap">
      <uni-load-more status="loading" />
    </view>
    <view v-else-if="feedList.length === 0" class="empty">
      <text>暂无带视频的设备或需求</text>
    </view>
    <swiper
      v-else
      class="feed-swiper"
      vertical
      :current="currentIndex"
      @change="onSwiperChange"
    >
      <swiper-item v-for="(item, idx) in feedList" :key="item.key">
        <view class="feed-item">
          <video
            v-if="currentIndex === idx"
            class="feed-video"
            :src="item.videoUrl"
            autoplay
            muted
            controls
            :id="'video-' + idx"
            @click.stop
          />
          <image
            v-else
            class="feed-video feed-poster"
            :src="item.posterUrl || '/static/default_machine.png'"
            mode="aspectFill"
          />
          <view class="feed-overlay">
            <view class="feed-tag">{{ item.source === 'machine' ? '找设备' : '需求' }}</view>
            <view class="feed-title">{{ item.title }}</view>
            <view class="feed-meta">
              <text class="heat">热度 {{ item.heat }}</text>
              <text v-if="item.location" class="loc">{{ item.location }}</text>
            </view>
            <view class="feed-actions">
              <button class="btn-detail" @click="goDetail(item)">
                {{ item.source === 'machine' ? '看设备' : '看需求' }}
              </button>
            </view>
          </view>
        </view>
      </swiper-item>
    </swiper>
  </view>
</template>

<script>
import apiService, { getFileViewUrl } from '@/api/api';

export default {
  data() {
    return {
      loading: true,
      loadingMore: false,
      feedList: [],
      currentIndex: 0,
      machinePage: 1,
      demandPage: 1,
      pageSize: 6,
      hasMoreMachine: true,
      hasMoreDemand: true,
      location: {
        latitude: null,
        longitude: null,
      },
    };
  },
  onLoad() {
    this.initLocationAndLoad();
  },
  onUnload() {
    // 可选：停止视频
  },
  methods: {
    initLocationAndLoad() {
      this.loading = true;
      uni.getLocation({
        type: 'gcj02',
        success: (res) => {
          this.location = {
            latitude: res.latitude,
            longitude: res.longitude,
          };
          this.resetFeed();
          this.loadMoreFeed();
        },
        fail: () => {
          this.resetFeed();
          this.loadMoreFeed();
        },
      });
    },
    resetFeed() {
      this.feedList = [];
      this.currentIndex = 0;
      this.machinePage = 1;
      this.demandPage = 1;
      this.hasMoreMachine = true;
      this.hasMoreDemand = true;
    },
    loadMoreFeed() {
      if (this.loadingMore) return;

      const tasks = [];
      const paramsCommon = {
        pageSize: this.pageSize,
        sort: 'distance',
      };
      if (this.location.latitude != null) {
        paramsCommon.latitude = this.location.latitude;
        paramsCommon.longitude = this.location.longitude;
      }

      if (this.hasMoreMachine) {
        tasks.push(
          apiService.getMachines({ ...paramsCommon, page: this.machinePage }).then((res) => ({
            type: 'machine',
            res,
          })),
        );
      }
      if (this.hasMoreDemand) {
        tasks.push(
          apiService.getDemands({ ...paramsCommon, page: this.demandPage }).then((res) => ({
            type: 'demand',
            res,
          })),
        );
      }

      if (!tasks.length) {
        this.loading = false;
        return;
      }

      this.loadingMore = true;
      Promise.all(tasks)
        .then((results) => {
          const added = [];
          results.forEach((item) => {
            const data = item.res?.data ?? item.res;
            const list = data?.list ?? (Array.isArray(data) ? data : []);
            if (!list.length) {
              if (item.type === 'machine') this.hasMoreMachine = false;
              if (item.type === 'demand') this.hasMoreDemand = false;
              return;
            }

            if (list.length < this.pageSize) {
              if (item.type === 'machine') this.hasMoreMachine = false;
              if (item.type === 'demand') this.hasMoreDemand = false;
            } else {
              if (item.type === 'machine') this.machinePage += 1;
              if (item.type === 'demand') this.demandPage += 1;
            }

            list.forEach((raw) => {
              if (!raw || !raw.video) return;
              const heat = (raw.view_count || 0) + (raw.contact_count || 0);
              if (item.type === 'machine') {
                added.push({
                  key: 'm-' + raw.id,
                  source: 'machine',
                  id: raw.id,
                  raw,
                  title: raw.model || (raw.brand ? raw.brand + ' ' : '') || '挖机',
                  videoUrl: getFileViewUrl(raw.video),
                  posterUrl: raw.images && raw.images[0] ? getFileViewUrl(raw.images[0]) : '',
                  heat,
                  location: [raw.province, raw.city].filter(Boolean).join(' '),
                });
              } else {
                added.push({
                  key: 'd-' + raw.id,
                  source: 'demand',
                  id: raw.id,
                  raw,
                  title: (raw.description || '').slice(0, 30) || '需求',
                  videoUrl: getFileViewUrl(raw.video),
                  posterUrl: raw.images && raw.images[0] ? getFileViewUrl(raw.images[0]) : '',
                  heat,
                  location: [raw.province, raw.city].filter(Boolean).join(' '),
                });
              }
            });
          });

          const merged = this.feedList.concat(added);
          merged.sort((a, b) => {
            const da = a.raw && a.raw.distance != null ? a.raw.distance : Number.MAX_SAFE_INTEGER;
            const db = b.raw && b.raw.distance != null ? b.raw.distance : Number.MAX_SAFE_INTEGER;
            if (da !== db) return da - db;
            return (b.heat || 0) - (a.heat || 0);
          });
          this.feedList = merged;
        })
        .catch(() => {})
        .finally(() => {
          this.loading = false;
          this.loadingMore = false;
        });
    },
    onSwiperChange(e) {
      const next = e.detail.current;
      const prev = this.currentIndex;
      if (prev !== next && this.feedList[prev]) {
        const ctx = uni.createVideoContext('video-' + prev, this);
        if (ctx && ctx.pause) ctx.pause();
      }
      this.currentIndex = next;
      if (this.feedList.length - this.currentIndex <= 3) {
        this.loadMoreFeed();
      }
    },
    goDetail(item) {
      if (item.source === 'machine') {
        uni.navigateTo({ url: '/pages/machine/detail?id=' + item.id });
      } else {
        uni.navigateTo({ url: '/pages/demand/detail?id=' + item.id });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.page {
  width: 100vw;
  height: 100vh;
  background: #000;
}
.loading-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
.empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
  font-size: 14px;
}
.feed-swiper {
  width: 100%;
  height: 100%;
}
.feed-item {
  position: relative;
  width: 100%;
  height: 100%;
  background: #111;
}
.feed-video {
  width: 100%;
  height: 100%;
  display: block;
}
.feed-poster {
  background: #222;
}
.feed-overlay {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 24px 16px;
  padding-bottom: calc(24px + env(safe-area-inset-bottom));
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  color: #fff;
}
.feed-tag {
  display: inline-block;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  background: rgba(74, 177, 247, 0.9);
  color: #fff;
  margin-bottom: 8px;
}
.feed-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.feed-meta {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 12px;
}
.feed-meta .heat {
  margin-right: 12px;
}
.btn-detail {
  width: 100%;
  border-radius: 24px;
  background: #4AB1F7;
  color: #fff;
  border: none;
  font-size: 15px;
  line-height: 44px;
  height: 44px;
}
</style>
