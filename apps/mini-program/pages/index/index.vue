<template>
	<view class="page">
		<!-- 未登录时默认显示的授权登录遮罩 -->
		<view v-if="showLoginOverlay" class="login-overlay">
			<view class="login-overlay-card">
				<image src="/static/logo.png" class="login-overlay-logo" mode="aspectFit" />
				<text class="login-overlay-title">欢迎使用挖掘机之家</text>
				<text class="login-overlay-desc">授权登录后可使用发布、收藏、合同等完整功能</text>
				<button class="login-overlay-btn primary" @click="doAuthLogin">微信授权登录</button>
				<view class="login-overlay-skip" @click="closeLoginOverlay">暂不登录</view>
			</view>
		</view>

		<!-- 顶部导航：标题 + 当前地址（如美团） -->
		<view class="top-bar">
			<view class="navbar">
				<view class="brand">
					<image src="/static/logo.png" class="nav-logo" mode="aspectFit" />
					<text class="brand-name">挖掘机之家</text>
				</view>
				<view class="addr-bar" @click="refreshAddress">
					<uni-icons type="location-filled" size="16" color="#4AB1F7" />
					<text class="addr-text">{{ currentAddress || '定位中...' }}</text>
					<uni-icons type="right" size="12" color="#999" />
				</view>
			</view>
		</view>

		<!-- 一级分类导航：横向滚动 -->
		<scroll-view scroll-x class="category-nav" show-scrollbar="false" :scroll-into-view="'cat-0'">
			<view v-for="(item, index) in categoryTabs" :id="'cat-' + index" :key="item.key" class="category-item"
				:class="{ active: categoryActive === item.key }" @click="onCategory(item)">
				{{ item.label }}
			</view>
		</scroll-view>

		<!-- Banner 轮播 -->
		<view class="banner-wrap card">
			<swiper class="banner-swiper" circular autoplay interval="4000" duration="500" indicator-dots
				indicator-active-color="#4AB1F7" indicator-color="rgba(255,255,255,0.5)">
				<swiper-item v-for="(item, i) in banners" :key="i">
					<view class="banner-item w-full h-full">
						<image :src="item" mode="aspectFill" class="banner-img" lazy-load />
					</view>
				</swiper-item>
			</swiper>
		</view>

		<!-- 快捷入口：uni-icons -->
		<view class="quick-section card" v-if="quickMenus.length">
			<view class="quick-grid">
				<view v-for="(item, index) in quickMenus" :key="index" class="quick-item" @click="handleMenuClick(item)"
					hover-class="quick-hover">
					<view class="quick-icon-wrap">
						<uni-icons :type="item.icon" :color="item.color || '#4AB1F7'" size="26" />
					</view>
					<text class="quick-text">{{ item.text }}</text>
				</view>
			</view>
		</view>

		<!-- 活动卡片区：两个渐变卡片（设计规范） -->
		<view class="activity-row">
			<ActivityCard title="热门设备" desc="优质好机 随时调配" theme="activity-blue" />
			<ActivityCard title="发布需求" desc="求租/招人 快速对接" theme="activity-green" />
		</view>

		<!-- 商品推荐区：猜你喜欢，两列 -->
		<view class="section card">
			<view class="section-head">
				<text class="section-title">猜你喜欢</text>
				<view class="section-more" @click="goMoreMachine">
					<text>更多</text>
					<uni-icons type="right" size="12" color="#999" />
				</view>
			</view>
			<view class="product-grid">
				<view v-for="item in recommendMachines" :key="item.id" class="product-card" @click="goDetail(item.id)">
					<view class="product-card-inner">
						<view class="product-img-wrap">
							<image :src="getFileViewUrl(item.images && item.images[0]) || '/static/default_machine.png'"
								mode="aspectFill" class="product-img" lazy-load />
							<view v-if="item.conditionType" class="product-tag">{{ conditionLabel(item.conditionType) }}
							</view>
						</view>
						<view class="product-info">
							<text class="product-name">{{ transformDictValue(item.type,machine_type) }} {{ item.model }}
								{{item.brand??""}}</text>
							<view class="product-meta">
								<uni-icons type="location-filled" size="12" color="#999" />
								<text>{{ item.province }}{{ item.city||""}}{{ item.district ||""}}</text>
							</view>
							<view class="product-price">
								<text class="sym">¥</text>
								<text class="amount">{{ item.rentAmount || '—' }}</text>
								<text class="unit">/{{ rentUnitLabel(item.rentUnit) }}</text>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 最新需求 -->
		<view class="section card">
			<view class="section-head">
				<text class="section-title">最新需求</text>
				<view class="section-more" @click="goDemandList">
					<text>更多</text>
					<uni-icons type="right" size="12" color="#999" />
				</view>
			</view>
			<view class="demand-list">
				<view v-for="item in latestDemands" :key="item.id" class="demand-row" @click="goDemandDetail(item.id)">
					<view class="demand-left">
						<text class="demand-type">{{ transformDictValue(item.type,demand_type) }}</text>
						<text class="demand-equipment">{{ demandEquipmentText(item) }}</text>
						<text class="demand-desc mt-2">{{ descSlice(item.description) }}</text>
					</view>
					<view class="demand-right">
						<text class="demand-budget">{{ budgetText(item) }}</text>
					</view>
				</view>
			</view>
		</view>
		<view class="safe-bottom" />
	</view>
</template>

<script>
	import apiService, {
		getFileViewUrl
	} from '@/api/api';
	import {
		useDictOne
	} from '@/hooks/useDict';
	import ActivityCard from '@/components/ActivityCard.vue';
	import {
		transformDictValue,
		formatDemandMachineTypes
	} from "@/common/util/util"
	import appStore from '@/store/app';
	import brannerBImg from "@/static/swiper/2.png";
	import brannerCImg from "@/static/swiper/3.png";

	export default {
		components: {
			ActivityCard
		},
		data() {
			return {
				showLoginOverlay: false,
				categoryActive: 'home',
				currentAddress: '',
				categoryTabs: [{
						key: 'home',
						label: '首页'
					},
					{
						key: '/pages/user/publish',
						label: '我的发布'
					},
					{
						key: '/pages/user/fav',
						label: '收藏'
					},
					{
						key: '/pages/video/index',
						label: '视频'
					},
				],
				banners: [
					brannerBImg, brannerCImg
				],
				quickMenus: [],
				recommendMachines: [],
				latestDemands: [],
				work_hours_unit: useDictOne('work_hours_unit'),
				machine_condition: useDictOne('machine_condition'),
				machine_type: useDictOne('machine_type'),
				machine_types: useDictOne('machine_types'),
				demand_type: useDictOne('demand_type'),
			};
		},
		onLoad() {
			this.currentAddress = (appStore().state && appStore().state.currentAddress) || uni.getStorageSync('currentAddress') || '';
			this.fetchLocation();
			this.fetchRecommend();
			this.fetchDemands();
		},
		onShow() {
			const addr = (appStore().state && appStore().state.currentAddress) || uni.getStorageSync('currentAddress') || '';
			if (addr) this.currentAddress = addr;
			// 仅对从未授权过的用户显示登录遮罩，已授权过的不再弹出
			try {
				const state = appStore().state;
				const userInfo = state && state.userInfo;
				const hasAuthorizedBefore = uni.getStorageSync('hasAuthorizedBefore');
				const isLoggedIn = !!(userInfo && userInfo.id);
				this.showLoginOverlay = !isLoggedIn && !hasAuthorizedBefore;
			} catch (e) {
				this.showLoginOverlay = false;
			}
		},
		onPullDownRefresh() {
			Promise.all([this.fetchRecommend(), this.fetchDemands()]).finally(() =>
				uni.stopPullDownRefresh()
			);
		},
		methods: {
			transformDictValue,
			getFileViewUrl,
			fetchRecommend() {
				return apiService
					.getMachines({
						sort: 'latest',
						page: 1,
						pageSize: 6
					})
					.then((res) => {
						const data = res?.data ?? res;
						const list = data?.list ?? (Array.isArray(data) ? data : []);
						this.recommendMachines = list;
					})
					.catch(() => {
						this.recommendMachines = [];
					});
			},
			fetchDemands() {
				return apiService
					.getDemands({
						sort: 'latest',
						page: 1,
						pageSize: 4
					})
					.then((res) => {
						const data = res?.data ?? res;
						const list = data?.list ?? (Array.isArray(data) ? data : []);
						this.latestDemands = list;
					})
					.catch(() => {
						this.latestDemands = [];
					});
			},
			onCategory(item) {
				if (item.key === 'home') return;
				uni.navigateTo({
					url: item.key
				});
			},
			handleMenuClick(item) {
				uni.navigateTo({
					url: item.path
				});
			},
			goMoreMachine() {
				uni.switchTab({
					url: '/pages/machine/list'
				});
			},
			goDemandAdd() {
				uni.navigateTo({
					url: '/pages/demand/add'
				});
			},
			goDemandList() {
				uni.switchTab({
					url: '/pages/demand/list'
				});
			},
			goDetail(id) {
				uni.navigateTo({
					url: '/pages/machine/detail?id=' + id
				});
			},
			goDemandDetail(id) {
				uni.navigateTo({
					url: '/pages/demand/detail?id=' + id
				});
			},
			rentUnitLabel(v) {
				const arr = this.work_hours_unit?.value ?? this.work_hours_unit ?? [];
				const o = arr.find((d) => d.value === v);
				return o ? o.text : '天';
			},
			conditionLabel(v) {
				const arr = this.machine_condition?.value ?? this.machine_condition ?? [];
				const o = arr.find((x) => x.value === v);
				return o ? o.text : v || '';
			},
			demandEquipmentText(item) {
				return formatDemandMachineTypes(item.machineTypes, item.machineTypeOther, this.machine_types);
			},
			fetchLocation() {
				uni.getLocation({
					type: 'gcj02',
					success: (res) => {
						apiService
							.regeoLocation({
								longitude: res.longitude,
								latitude: res.latitude,
								extensions: 'base'
							})
							.then((r) => {
								const data = r?.data ?? r;
								const addr = [data?.city, data?.district].filter(Boolean).join('·') || data?.province || '当前定位';
								const store = appStore();
								store.setCurrentAddress && store.setCurrentAddress(addr);
								this.currentAddress = addr;
							})
							.catch(() => {
								this.currentAddress = '定位失败';
							});
					},
					fail: () => {
						this.currentAddress = (appStore().state && appStore().state.currentAddress) || '未授权定位';
					}
				});
			},
			refreshAddress() {
				this.currentAddress = '定位中...';
				this.fetchLocation();
			},
			descSlice(s) {
				if (!s) return '需求';
				return s.length > 24 ? s.slice(0, 24) + '...' : s;
			},
			budgetUnitLabel(item) {
				const u = item && item.budgetUnit;
				if (!u) return '元';
				const arr = (this.work_hours_unit && this.work_hours_unit.value) || this.work_hours_unit || [];
				const o = Array.isArray(arr) ? arr.find((d) => String(d.value) === String(u)) : null;
				return o ? (o.text || o.label || '元') : '元';
			},
			budgetText(item) {
				const unit = this.budgetUnitLabel(item);
				if (item.budgetMin != null && item.budgetMax != null)
					return item.budgetMin + '-' + item.budgetMax + unit;
				if (item.budgetMin != null) return item.budgetMin + unit + '起';
				if (item.budgetMax != null) return '≤' + item.budgetMax + unit;
				return '面议';
			},
			closeLoginOverlay() {
				this.showLoginOverlay = false;
			},
			doAuthLogin() {
				const that = this;
				uni.showLoading({ title: '授权中...' });
				uni.getUserProfile({
					desc: '用于完善会员资料',
					success: (profileRes) => {
						const userInfo = profileRes && profileRes.userInfo;
						if (!userInfo) {
							uni.hideLoading();
							that.$tip && that.$tip.alert('未获取到用户信息');
							return;
						}
						uni.showLoading({ title: '登录中...' });
						uni.login({
							provider: 'weixin',
							success: (loginRes) => {
								apiService.autoLogin({
									code: loginRes.code,
									userInfo: userInfo
								}).then((res) => {
									uni.hideLoading();
									const data = (res && res.data) !== undefined ? res.data : res;
									const access_token = data && data.access_token;
									const user = data && data.user;
									if (!access_token || !user) {
										that.$tip && that.$tip.error('登录失败，请重试');
										return;
									}
									const finalUser = { ...user };
									appStore().setToken(access_token);
									appStore().setUser(finalUser);
									if (finalUser && finalUser.id) uni.setStorageSync('userId', finalUser.id);
									uni.setStorageSync('hasAuthorizedBefore', true);
									that.showLoginOverlay = false;
									that.$tip && that.$tip.success('登录成功');
									// 授权成功后刷新当前界面数据
									that.fetchRecommend();
									that.fetchDemands();
								}).catch((err) => {
									console.error(err);
									uni.hideLoading();
									that.$tip && that.$tip.error('登录失败，请重试');
								});
							},
							fail: () => {
								uni.hideLoading();
								that.$tip && that.$tip.error('微信登录失败');
							}
						});
					},
					fail: () => {
						uni.hideLoading();
						that.$tip && that.$tip.alert('您取消了授权');
					}
				});
			},
		},
	};
</script>

<style lang="scss" scoped>
	.login-overlay {
		position: fixed;
		left: 0;
		right: 0;
		top: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		z-index: 999;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 32px;
	}
	.login-overlay-card {
		background: #fff;
		border-radius: 20px;
		padding: 36px 28px;
		width: 100%;
		max-width: 320px;
		text-align: center;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
	}
	.login-overlay-logo {
		width: 64px;
		height: 64px;
		margin-bottom: 16px;
	}
	.login-overlay-title {
		display: block;
		font-size: 18px;
		font-weight: 700;
		color: #333;
		margin-bottom: 8px;
	}
	.login-overlay-desc {
		display: block;
		font-size: 13px;
		color: #666;
		line-height: 1.5;
		margin-bottom: 24px;
	}
	.login-overlay-btn {
		width: 100%;
		height: 44px;
		line-height: 44px;
		border-radius: 22px;
		font-size: 16px;
		font-weight: 600;
		background: #07c160;
		color: #fff;
		border: none;
	}
	.login-overlay-btn::after {
		border: none;
	}
	.login-overlay-skip {
		margin-top: 16px;
		font-size: 14px;
		color: #999;
	}
	.page {
		min-height: 100vh;
		background: #F5F6F8;
		padding-bottom: 24px;
	}

	.top-bar {
		background: #fff;
		padding: 44px 16px 12px 16px;
		padding-top: calc(44px + constant(safe-area-inset-top));
		padding-top: calc(44px + env(safe-area-inset-top));
	}

	.navbar .brand {
		display: flex;
		align-items: center;
		margin-bottom: 12px;

		.nav-logo {
			width: 28px;
			height: 28px;
			margin-right: 8px;
		}

		.brand-name {
			font-size: 18px;
			font-weight: 800;
			color: #333;
		}
	}

	.addr-bar {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 8px 12px;
		background: #F5F6F8;
		border-radius: 20px;
		max-width: 240px;
	}
	.addr-text {
		font-size: 13px;
		color: #333;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		flex: 1;
	}

	.search-wrap {
		height: 36px;
		border-radius: 18px;
		background: #F1F2F4;
		padding: 0 16px;
		display: flex;
		align-items: center;

		.search-placeholder {
			font-size: 14px;
			color: #999;
			margin-left: 8px;
		}
	}

	/* 一级分类导航 */
	.category-nav {
		white-space: nowrap;
		padding: 12px 16px;
		background: #fff;
		margin-bottom: 12px;
	}

	.category-item {
		display: inline-block;
		font-size: 14px;
		color: #999;
		margin-right: 20px;
		padding: 4px 0;

		&.active {
			color: #333;
			font-weight: 600;
		}
	}

	/* Banner */
	.banner-wrap {
		padding: 0;
		margin: 0 16px 16px;
		border-radius: 16px;
		overflow: hidden;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
	}

	.banner-swiper {
		height: 180px;
		border-radius: 16px;
	}

	.banner-item .banner-img {
		width: 100%;
		height: 100%;
	}

	/* 快捷入口 */
	.quick-section {
		margin: 0 16px 16px;
		padding: 20px 12px;
	}

	.quick-grid {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-start;
		gap: 24px 8px;
	}

	.quick-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: calc((100% - 40px) / 6);
		min-width: 0;
	}

	.quick-icon-wrap {
		width: 44px;
		height: 44px;
		border-radius: 50%;
		background: linear-gradient(135deg, #e8f4fd 0%, #d6ebfa 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 8px;
	}

	.quick-text {
		font-size: 11px;
		color: #666;
		text-align: center;
		line-height: 1.3;
	}

	.quick-hover {
		opacity: 0.85;
	}

	/* 活动卡片区 */
	.activity-row {
		display: flex;
		gap: 12px;
		padding: 0 16px 16px;
	}

	/* 商品区 */
	.section {
		margin: 0 16px 16px;
	}

	.section-head {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 12px;
	}

	.section-title {
		font-size: 17px;
		font-weight: 700;
		color: #333;
	}

	.section-more {
		display: flex;
		align-items: center;
		font-size: 13px;
		color: #999;
	}

	.product-grid {
		display: flex;
		flex-wrap: wrap;
		margin: 0 -6px;
	}

	.product-card {
		width: 50%;
		padding: 0 6px 12px;
		box-sizing: border-box;
	}

	.product-card-inner {
		background: #fff;
		border-radius: 14px;
		padding: 8px;
		box-shadow: 0 4px 12px rgba(15, 23, 42, 0.06);
		border: 1px solid #eef0f4;
		transition: transform 0.15s ease-out, box-shadow 0.15s ease-out;
	}

	.product-card-inner:active {
		transform: translateY(1px);
		box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
	}

	.product-img-wrap {
		position: relative;
		width: 100%;
		padding-bottom: 100%;
		border-radius: 12px;
		overflow: hidden;
		background: #f0f2f5;
	}

	.product-img {
		position: absolute;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
	}

	.product-tag {
		position: absolute;
		top: 8px;
		left: 8px;
		background: rgba(0, 0, 0, 0.5);
		color: #fff;
		font-size: 10px;
		padding: 2px 6px;
		border-radius: 4px;
	}

	.product-info {
		padding: 8px 0 0;
	}

	.product-name {
		font-size: 14px;
		font-weight: 600;
		color: #333;
		display: block;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.product-meta {
		font-size: 11px;
		color: #999;
		margin-top: 4px;
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.product-price {
		margin-top: 6px;
		color: #FF4D4F;

		.sym {
			font-size: 12px;
			font-weight: 700;
		}

		.amount {
			font-size: 16px;
			font-weight: 800;
			margin: 0 2px;
		}

		.unit {
			font-size: 11px;
			color: #999;
			font-weight: normal;
		}
	}

	.demand-list {
		padding: 0;
	}

	.demand-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 12px 12px;
		margin-bottom: 10px;
		border-radius: 12px;
		background: #fff;
		box-shadow: 0 4px 12px rgba(15, 23, 42, 0.06);
		border: 1px solid #eef0f4;

		.demand-left {
			flex: 1;
			min-width: 0;
			display: flex;
			flex-direction: column;
		}

		.demand-equipment {
			font-size: 12px;
			color: #666;
			margin-top: 4px;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}

		.demand-right {
			flex-shrink: 0;
			margin-left: 8px;
		}

		&:last-child {
			margin-bottom: 0;
		}
	}

	.demand-desc {
		font-size: 14px;
		color: #333;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		margin-right: 8px;
	}

	.demand-budget {
		font-size: 14px;
		font-weight: 600;
		color: #FF4D4F;
		flex-shrink: 0;
	}

	.safe-bottom {
		height: constant(safe-area-inset-bottom);
		height: env(safe-area-inset-bottom);
	}
</style>