<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')
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
	// 设置整个项目的背景色
	page {
		background-color: #f5f5f5;
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
		color: #333 !important; /* 黑字对比度更好 */
		font-weight: 600;
	}
	
	button[type=primary] {
		background-color: #FFB800 !important;
		color: #333 !important;
	}

	/* 卡片通用样式 */
	.card {
		background-color: #fff;
		border-radius: 16px; /* 更圆润 */
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06); /* 更柔和的阴影 */
		margin-bottom: 16px;
		overflow: hidden;
	}
	
	/* 价格高亮 */
	.price-text {
		color: #FF4D4F; /* 鲜艳红 */
		font-weight: 700;
		font-family: DIN, -apple-system, sans-serif; /* 数字优化字体 */
	}
	
	/* 通用容器 */
	.page-container {
		padding: 16px;
	}
</style>
