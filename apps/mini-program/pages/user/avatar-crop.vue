<template>
	<view class="crop-page">
		<view class="crop-tip">拖动图片调整位置</view>
		<view class="crop-wrap" @touchstart="onTouchStart" @touchmove="onTouchMove" @touchend="onTouchEnd">
			<view class="crop-mask">
				<view class="crop-circle"></view>
			</view>
			<view class="crop-image-wrap" :style="{
					width: imageStyle.w + 'px',
					height: imageStyle.h + 'px',
					left: imageStyle.x + 'px',
					top: imageStyle.y + 'px'
				}">
				<image class="crop-image" :src="imagePath" mode="aspectFill" @load="onImageLoad" />
			</view>
		</view>
		<canvas canvas-id="cropCanvas" :id="canvasId" class="crop-canvas"
			:style="{ width: cropSize + 'px', height: cropSize + 'px' }"></canvas>
		<view class="crop-actions">
			<button class="btn-cancel" @click="cancel">取消</button>
			<button type="primary" class="btn-confirm" @click="confirm">确定</button>
		</view>
	</view>
</template>

<script>
	const CROP_SIZE = 300; // 输出头像边长（像素）

	export default {
		data() {
			return {
				imagePath: '',
				cropSize: CROP_SIZE,
				canvasId: 'cropCanvas',
				imageInfo: {
					width: 0,
					height: 0
				},
				scale: 1,
				imageStyle: {
					w: 0,
					h: 0,
					x: 0,
					y: 0
				},
				touchStart: {
					x: 0,
					y: 0
				},
				imageStart: {
					x: 0,
					y: 0
				}
			};
		},
		onUnload() {
			uni.$off(this.options.event_id)
		},
		onLoad(options) {
			this.options = options;
			const raw = options.path || options.imagePath;
			if (!raw) {
				this.$tip.alert('缺少图片参数');
				setTimeout(() => uni.navigateBack(), 1500);
				return;
			}
			// 若为编码后的 URL（如 http%3A%2F%2F...），需解码，否则小程序会当成本地路径拼接成 /pages/user/http%3A%2F...
			try {
				this.imagePath = raw.includes('%') ? decodeURIComponent(raw) : raw;
			} catch {
				this.imagePath = raw;
			}
			uni.getImageInfo({
				src: this.imagePath,
				success: (res) => {
					this.imageInfo = {
						width: res.width,
						height: res.height
					};
					this.computeImageStyle();
				},
				fail: () => {
					this.$tip.alert('图片加载失败');
					setTimeout(() => uni.navigateBack(), 1500);
				}
			});
		},
		methods: {
			onImageLoad() {
				// 若 getImageInfo 先于 image load，这里再算一次
				if (this.imageStyle.w === 0 && this.imageInfo.width) {
					this.computeImageStyle();
				}
			},
			computeImageStyle() {
				const {
					width: nw,
					height: nh
				} = this.imageInfo;
				if (!nw || !nh) return;
				const size = this.cropSize;
				this.scale = Math.max(size / nw, size / nh);
				const w = nw * this.scale;
				const h = nh * this.scale;
				this.imageStyle = {
					w,
					h,
					x: (size - w) / 2,
					y: (size - h) / 2
				};
			},
			onTouchStart(e) {
				if (!e.touches || !e.touches[0]) return;
				this.touchStart = {
					x: e.touches[0].clientX,
					y: e.touches[0].clientY
				};
				this.imageStart = {
					x: this.imageStyle.x,
					y: this.imageStyle.y
				};
			},
			onTouchMove(e) {
				if (!e.touches || !e.touches[0]) return;
				const dx = e.touches[0].clientX - this.touchStart.x;
				const dy = e.touches[0].clientY - this.touchStart.y;
				const size = this.cropSize;
				const maxX = Math.max(0, this.imageStyle.w - size);
				const maxY = Math.max(0, this.imageStyle.h - size);
				let x = this.imageStart.x + dx;
				let y = this.imageStart.y + dy;
				x = Math.max(-maxX, Math.min(0, x));
				y = Math.max(-maxY, Math.min(0, y));
				this.imageStyle.x = x;
				this.imageStyle.y = y;
			},
			onTouchEnd() {},
			cancel() {
				uni.navigateBack();
			},
			confirm() {
				const {
					width: nw,
					height: nh
				} = this.imageInfo;
				if (!nw || !nh) {
					this.$tip.alert('图片未就绪');
					return;
				}
				uni.showLoading({
					title: '生成中...'
				});
				const size = this.cropSize;
				const ctx = uni.createCanvasContext(this.canvasId, this);
				
				// 圆形裁剪
				ctx.beginPath();
				ctx.arc(size / 2, size / 2, size / 2, 0, 2 * Math.PI);
				ctx.clip();
				
				// 计算裁剪区域
				const sx = -this.imageStyle.x / this.scale;
				const sy = -this.imageStyle.y / this.scale;
				const sWidth = size / this.scale;
				const sHeight = size / this.scale;
				
				ctx.drawImage(
					this.imagePath,
					sx,
					sy,
					sWidth,
					sHeight,
					0,
					0,
					size,
					size
				);
				
				ctx.draw(false, () => {
					setTimeout(() => {
						uni.canvasToTempFilePath({
							canvasId: this.canvasId,
							destWidth: size,
							destHeight: size,
							fileType: 'jpg',
							quality: 1,
							success: (res) => {
								const tempFilePath = res.tempFilePath;
								// 若为本地路径，直接读成 base64 回传，避免 info 页 pathToBase64 对 http://tmp 等路径报错
								if (typeof wx === 'object' && wx.canIUse('getFileSystemManager') && tempFilePath && tempFilePath.indexOf('http') !== 0) {
									wx.getFileSystemManager().readFile({
										filePath: tempFilePath,
										encoding: 'base64',
										success: (readRes) => {
											uni.$emit(this.options.event_id, { tempFilePath, base64: 'data:image/jpeg;base64,' + readRes.data });
											uni.hideLoading();
											uni.navigateBack();
										},
										fail: () => {
											uni.$emit(this.options.event_id, res);
											uni.hideLoading();
											uni.navigateBack();
										}
									});
								} else {
									uni.$emit(this.options.event_id, res);
									uni.hideLoading();
									uni.navigateBack();
								}
							},
						}, this);
					}, 200);
				});
			}
		}
	};
</script>

<style lang="scss" scoped>
	.crop-page {
		min-height: 100vh;
		background: #1a1a1a;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 24rpx 0 0;
		box-sizing: border-box;
	}

	.crop-tip {
		font-size: 26rpx;
		color: rgba(255, 255, 255, 0.7);
		margin-bottom: 24rpx;
	}

	.crop-wrap {
		position: relative;
		width: 300px;
		height: 300px;
		overflow: hidden;
	}

	.crop-mask {
		position: absolute;
		left: 0;
		top: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		z-index: 2;
		pointer-events: none;
	}

	.crop-circle {
		position: absolute;
		left: 50%;
		top: 50%;
		width: 300px;
		height: 300px;
		margin-left: -150px;
		margin-top: -150px;
		border-radius: 50%;
		background: transparent;
		box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
	}

	.crop-image-wrap {
		position: absolute;
		z-index: 1;
		left: 0;
		top: 0;
	}

	.crop-image {
		display: block;
		width: 100%;
		height: 100%;
	}

	.crop-canvas {
		position: fixed;
		left: -9999px;
		top: -9999px;
		width: 300px;
		height: 300px;
	}

	.crop-actions {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 32rpx;
		margin-top: 48rpx;
		padding: 0 32rpx;
	}

	.btn-cancel,
	.btn-confirm {
		width: 220rpx;
		height: 80rpx;
		line-height: 80rpx;
		border-radius: 40rpx;
		font-size: 30rpx;
		font-weight: 600;
	}

	.btn-cancel {
		background: rgba(255, 255, 255, 0.15);
		color: #fff;
		border: none;
	}

	.btn-cancel::after {
		border: none;
	}

	.btn-confirm {
		background: #ffb800;
		color: #333;
		border: none;
	}

	.btn-confirm::after {
		border: none;
	}
</style>