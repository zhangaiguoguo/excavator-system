<script>
	import apiService from '@/api/api.ts'
	import {
		ACCESS_TOKEN
	} from '@/common/util/constants.js'
	import appStore from './store/app';

	export default {
		onLaunch: async function() {
			console.log('App Launch')
			try {
				uni.showLoading({
					title: "正在获取用户资料..."
				})
				const token = uni.getStorageSync(ACCESS_TOKEN)
				if (!token) {
					await apiService.getTempToken().then(res => {
						const accessToken = res.data.access_token || (res.data && res.data.access_token);
						if (accessToken) {
							appStore().setToken(accessToken)
							console.log('Temp token set:', accessToken)
						}
					}).catch(err => {
						console.error('Failed to get temp token', err)
					})
				} else {
					appStore().setToken(token)
				}

				const user = uni.getStorageSync('userInfo');
				if (user) {
					await apiService.getUser(user.id).then(r => {
						if (!r.data) {
							this.$tip.error("登录异常，请重新登录")
						}
						appStore().setUser(r.data)
					})
				}
			} catch (e) {
				console.error(e)
			} finally {
				uni.hideLoading()
			}
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style lang="scss">
	/* 每个页面公共css */
	@import '@/uni_modules/uni-scss/index.scss';

	/* #ifndef APP-NVUE */
	@import '@/static/customicons.css';

	@import "@/plugin/main.css";

	/**
	 * 设计规范（电商风原型）
	 * - 背景 #F5F6F8 | 卡片 #FFF 圆角 16px 阴影 0 4px 12px rgba(0,0,0,0.05)
	 * - 搜索框 36px 高 圆角 18px 背景 #F1F2F4
	 * - 活动卡片使用 components/ActivityCard.vue，蓝/绿渐变
	 * - 提示统一使用 this.$tip (alert/success/error/confirm/loading/loaded)
	 */
	page {
		background-color: #F5F6F8;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
	}

	/* 示例 */
	.example-info {
		font-size: 14px;
		color: #333;
		padding: 10px;
	}

	/* 全局按钮颜色 - 工程黄 (更现代的色值) */
	.uni-btn-primary {
		background-color: #FFB800 !important;
		border-color: #FFB800 !important;
		color: #333 !important;
		/* 黑字对比度更好 */
		font-weight: 600;
	}

	/* 使用 uni-app 默认按钮样式，不自定义 border-radius 避免边框被裁切 */
	button[type=primary] {
		background-color: #FFB800 !important;
		color: #333 !important;
	}
	button::after {
		border: none;
	}

	/* 卡片通用样式 - 设计规范 */
	.card {
		background-color: #FFFFFF;
		border-radius: 16px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
		padding: 16px;
		margin-bottom: 16px;
		overflow: hidden;
	}

	/* 搜索框规范 */
	.search-box-style {
		height: 36px;
		border-radius: 18px;
		background: #F1F2F4;
		padding: 0 16px;
	}

	/* 价格高亮 */
	.price-text {
		color: #FF4D4F;
		/* 鲜艳红 */
		font-weight: 700;
		font-family: DIN, -apple-system, sans-serif;
		/* 数字优化字体 */
	}

	/* 通用容器 */
	.page-container {
		padding: 16px;
	}
</style>