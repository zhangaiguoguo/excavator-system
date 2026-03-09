<template>
	<view class="container">

		<uni-forms ref="formRef" label-align="right" :modelValue="form" :rules="rules">

			<view class="form-card">

				<!-- 头像 -->
				<uni-forms-item name="avatar" label="头像">
					<view class="form-item avatar-item flex justify-end">
						<view></view>
						<view class="avatar-wrap" @click="chooseAvatar">
							<image class="avatar" :src="form.avatar || '/static/default_avatar.png'" mode="aspectFill">
							</image>

							<view class="avatar-mask">
								<uni-icons type="camera" size="24" color="#fff"></uni-icons>
								<text class="mask-text">更换</text>
							</view>
						</view>

					</view>
				</uni-forms-item>

				<!-- 昵称 -->
				<uni-forms-item name="nickname" label="昵称" required>
					<view class="form-item">
						<uni-easyinput v-model="form.nickname" placeholder="请输入昵称" :clearable="true">
						</uni-easyinput>
					</view>
				</uni-forms-item>

				<!-- 手机号 -->
				<uni-forms-item name="phone" label="手机号" required>
					<view class="form-item">
						<uni-easyinput v-model="form.phone" placeholder="请输入手机号">
						</uni-easyinput>
					</view>
				</uni-forms-item>

				<!-- 性别 -->
				<uni-forms-item name="gender" label="性别">
					<view class="form-item mt-2">
						<uni-data-checkbox v-model="form.gender" :localdata="genderOptions">
						</uni-data-checkbox>
					</view>
				</uni-forms-item>

				<!-- 角色 -->
				<uni-forms-item name="role" required label="角色">
					<view class="form-item mt-2">
						<uni-data-checkbox v-model="form.role" :localdata="user_role.filter(i =>i.value>0)">
						</uni-data-checkbox>
					</view>
				</uni-forms-item>
			</view>

		</uni-forms>


		<!-- 保存按钮 -->
		<view class="save-area">
			<button type="primary" class="save-btn" @click="submit">
				保存
			</button>
		</view>

	</view>
</template>


<script>
	import {
		ACCESS_TOKEN
	} from '@/common/util/constants'
	import apiService from '@/api/api'
	import appStore from '@/store/app'
	import {
		useDictOne
	} from '@/hooks/useDict'
	import {
		pathToBase64
	} from '@/common/util/image-tools'
	import {
		Constants
	} from '@excavator/types'

	export default {

		data() {
			return {
				form: {
					nickname: '',
					avatar: '',
					phone: '',
					gender: "0",
					role: "0"
				},
				genderOptions: useDictOne("sys_user_sex"),
				user_role: useDictOne('user_role'),
				rules: {

					avatar: {
						rules: [{
							required: true,
							errorMessage: '请上传头像'
						}]
					},

					nickname: {
						rules: [{
							required: true,
							errorMessage: '请输入昵称'
						}]
					},

					phone: {
						rules: [{
								required: true,
								errorMessage: '请输入手机号'
							},
							{
								pattern: /^1\d{10}$/,
								errorMessage: '手机号格式不正确'
							}
						]
					},

					gender: {
						rules: [{
							required: true,
							errorMessage: '请选择性别'
						}]
					},
					role: {
						rules: [{
							required: true,
							errorMessage: '请选择角色'
						}]
					}

				}

			}

		},

		computed: {

			userInfo() {
				return appStore().state.userInfo || {}
			}

		},

		onLoad() {
			this.loadUser()
		},

		methods: {

			loadUser() {

				if (!this.userInfo.id) {

					this.$tip.alert('请先登录')

					setTimeout(() => {
						uni.navigateBack()
					}, 1500)

					return
				}

				this.form = {
					nickname: this.userInfo.nickname || '',
					avatar: this.userInfo.avatar || '',
					phone: Constants.DEFAULT_PHOTO === this.userInfo.phone ? '' : this.userInfo.phone || '',
					gender: (this.userInfo.gender ?? 0) + "",
					role: (this.userInfo.role ?? 0) + ""
				}

			},

			chooseAvatar() {

				uni.chooseImage({

					count: 1,
					sizeType: ['original'],
					sourceType: ['album', 'camera'],

					success: (res) => {

						const path = res.tempFilePaths[0]

						const eventId = Date.now() + "_uni_$once"

						uni.$once(eventId, (v) => {
							// 裁剪页可能直接传回 base64，避免对 http://tmp 等临时路径做 pathToBase64 报错
							const pathOrBase64 = v.base64 || v.tempFilePath;
							if (!pathOrBase64) {
								this.$tip.error('未获取到图片');
								return;
							}
							if (pathOrBase64.indexOf('data:image/') === 0) {
								this.form.avatar = pathOrBase64;
								this.$refs.formRef.validateField('avatar');
								return;
							}
							pathToBase64(pathOrBase64).then(r => {
								this.form.avatar = r;
								this.$refs.formRef.validateField('avatar');
							}).catch((err) => {
								console.log(err);
								this.$tip.error('图片转换失败');
							});
						})

						uni.navigateTo({

							url: '/pages/user/avatar-crop?path=' +
								encodeURIComponent(path) +
								"&event_id=" + eventId

						})

					}

				})

			},

			submit() {

				this.$refs.formRef.validate().then(() => {

					uni.showLoading({
						title: '保存中...'
					})

					apiService.updateUser(this.userInfo.id, {
						nickname: this.form.nickname.trim(),
						avatar: this.form.avatar,
						gender: +this.form.gender,
						phone: this.form.phone,
						role: this.form.role
					}).then(res => {

						uni.hideLoading()

						const user = res.data || res

						appStore().setUser({
							...this.userInfo,
							...user
						})

						this.$tip.success({
							title: '保存成功'
						})

						setTimeout(() => {
							uni.navigateBack()
						}, 1200)

					}).catch(() => {

						uni.hideLoading()

					})

				}).catch(err => {

					console.log("表单校验失败", err)

				})

			}

		}

	}
</script>



<style lang="scss" scoped>
	.container {
		min-height: 100vh;
		background: #f5f7fa;
		padding: 16px;
		padding-bottom: 120rpx;
	}

	.form-card {
		background: #fff;
		border-radius: 16px;
		padding: 20px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
		margin-bottom: 24px;
	}

	.form-item {
		margin-bottom: 14px;

	}

	.avatar-item {

		.avatar-wrap {

			position: relative;
			width: 72px;
			height: 72px;
			border-radius: 50%;
			overflow: hidden;

			.avatar {
				width: 100%;
				height: 100%;
				background: #f0f0f0;
			}

			.avatar-mask {

				position: absolute;
				inset: 0;
				background: rgba(0, 0, 0, 0.4);

				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: center;

				opacity: 0;
				transition: opacity .2s;

				.mask-text {
					font-size: 12px;
					color: #fff;
					margin-top: 2px;
				}

			}

			&:active .avatar-mask {
				opacity: 1;
			}

		}

	}

	.save-area {

		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;

		padding: 0 16px;

		padding-bottom: calc(env(safe-area-inset-bottom) + 24rpx);
		padding-top: 24rpx;

		background: linear-gradient(to top, #f5f7fa 60%, transparent);

	}

	.save-btn {

		width: 100%;
		height: 96rpx;
		line-height: 96rpx;

		border-radius: 48rpx;

		font-size: 32rpx;
		font-weight: 600;

		background: linear-gradient(135deg, #ffb800 0%, #ffd04f 100%);
		color: #333;

		box-shadow: 0 8rpx 24rpx rgba(255, 184, 0, 0.35);

		border: none;

	}

	.save-btn::after {
		border: none;
	}

	.save-btn:active {
		opacity: .9;
	}
</style>