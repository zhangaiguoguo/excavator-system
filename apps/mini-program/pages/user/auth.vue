<template>
	<view class="container">
		<!-- 认证状态提示 -->
		<view class="status-card" :class="statusClass">
			<view class="status-icon">
				<uni-icons v-if="userInfo.realNameStatus === 2" type="checkmarkempty" size="48" color="#22c55e" />
				<uni-icons v-else-if="userInfo.realNameStatus === 1" type="loop" size="48" color="#f59e0b" />
				<uni-icons v-else type="contact" size="48" color="#94a3b8" />
			</view>
			<text class="status-title">{{ statusText }}</text>
			<text class="status-desc">{{ statusDesc }}</text>
		</view>

		<!-- 已认证展示 -->
		<view v-if="userInfo.realNameStatus === 2" class="info-card">
			<view class="info-row">
				<text class="info-label">真实姓名</text>
				<text class="info-value">{{ userInfo.realName }}</text>
			</view>
			<view class="info-row">
				<text class="info-label">身份证号</text>
				<text class="info-value">{{ maskIdCard(userInfo.idCard) }}</text>
			</view>
			<view class="info-row" v-if="userInfo.companyName">
				<text class="info-label">企业名称</text>
				<text class="info-value">{{ userInfo.companyName }}</text>
			</view>
		</view>

		<!-- 未认证/审核中 - uni-forms 表单 -->
		<view v-else>
			<view class="form-card">
				<uni-forms ref="form" label-align="right" label-width="75px" :modelValue="form" :rules="rules">
					<uni-forms-item label="真实姓名" name="realName" required>
						<uni-easyinput v-model="form.realName" placeholder="请输入真实姓名" />
					</uni-forms-item>

					<uni-forms-item label="身份证号" name="idCard" required>
						<uni-easyinput v-model="form.idCard" placeholder="请输入18位身份证号" :maxlength="18" />
					</uni-forms-item>

					<uni-forms-item label="企业名称" name="companyName">
						<uni-easyinput v-model="form.companyName" placeholder="选填，企业认证需填写" />
					</uni-forms-item>

					<uni-forms-item label="统一社会信用代码" name="creditCode">
						<uni-easyinput v-model="form.creditCode" placeholder="选填，企业认证需填写" :maxlength="18" />
					</uni-forms-item>
				</uni-forms>
			</view>

			<button type="primary" class="submit-btn mt-4s" @click="submit" :disabled="userInfo.realNameStatus === 1">
				{{ userInfo.realNameStatus === 1 ? '审核中，请耐心等待' : '提交认证' }}
			</button>
		</view>
	</view>
</template>

<script>
	import apiService from '@/api/api';
	import appStore from '@/store/app';
	import {
		UserRealNameStatus
	} from '@excavator/types';

	export default {
		data() {
			return {
				form: {
					realName: '',
					idCard: '',
					companyName: '',
					creditCode: ''
				},
				rules: {
					realName: {
						rules: [{
							required: true,
							errorMessage: '请输入真实姓名'
						}]
					},
					idCard: {
						rules: [{
								required: true,
								errorMessage: '请输入身份证号'
							},
							{
								pattern: /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/,
								errorMessage: '请输入正确的18位身份证号'
							}
						]
					}
				}
			};
		},
		computed: {
			userInfo() {
				return appStore().state.userInfo || {};
			},
			statusClass() {
				if (this.userInfo.realNameStatus === 2) return 'status--success';
				if (this.userInfo.realNameStatus === 1) return 'status--pending';
				return 'status--none';
			},
			statusText() {
				const map = {
					[UserRealNameStatus.APPROVED]: '已实名认证',
					[UserRealNameStatus.PENDING]: '审核中',
					[UserRealNameStatus.REJECTED]: '认证未通过',
					[UserRealNameStatus.NOT_SUBMITTED]: '未实名认证'
				};
				return map[this.userInfo.realNameStatus] || '未实名认证';
			},
			statusDesc() {
				const map = {
					[UserRealNameStatus.APPROVED]: '您已完成实名认证，可正常使用全部功能',
					[UserRealNameStatus.PENDING]: '您的认证信息正在审核中，请耐心等待',
					[UserRealNameStatus.REJECTED]: '请重新提交认证信息',
					[UserRealNameStatus.NOT_SUBMITTED]: '实名认证后可发布设备、签订合同等'
				};
				return map[this.userInfo.realNameStatus] || '实名认证后可发布设备、签订合同等';
			}
		},
		onLoad() {
			if (!this.userInfo.id) {
				this.$tip.alert('请先登录');
				setTimeout(() => uni.navigateBack(), 1500);
				return;
			}
			if (this.userInfo.realNameStatus !== 2 && this.userInfo.realNameStatus !== 1) {
				this.form = {
					realName: this.userInfo.realName || '',
					idCard: this.userInfo.idCard || '',
					companyName: this.userInfo.companyName || '',
					creditCode: this.userInfo.creditCode || ''
				};
			}
		},
		methods: {
			maskIdCard(idCard) {
				if (!idCard || idCard.length < 8) return idCard || '';
				return idCard.slice(0, 4) + '**********' + idCard.slice(-4);
			},
			submit() {
				this.$refs.form.validate().then(() => {
					uni.showLoading({
						title: '提交中...'
					});
					apiService
						.authorizeRealName({
							id: this.userInfo.id,
							realName: this.form.realName.trim(),
							idCard: this.form.idCard.trim(),
							companyName: this.form.companyName?.trim() || undefined,
							creditCode: this.form.creditCode?.trim() || undefined,
							realNameStatus: UserRealNameStatus.PENDING
						})
						.then(res => {
							uni.hideLoading();
							const user = res.data || res;
							appStore().setUser({
								...this.userInfo,
								...user
							});
							this.$tip.success('提交成功，请等待审核');
							setTimeout(() => uni.navigateBack(), 1500);
						})
						.catch(() => {
							uni.hideLoading();
						});
				}).catch(() => {});
			}
		}
	};
</script>

<style lang="scss" scoped>
	.container {
		min-height: 100vh;
		background-color: #f5f7fa;
		padding: 16px;
	}

	.status-card {
		background: #fff;
		border-radius: 16px;
		padding: 32px;
		text-align: center;
		margin-bottom: 16px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);

		&.status--success {
			border-left: 4px solid #22c55e;
		}

		&.status--pending {
			border-left: 4px solid #f59e0b;
		}

		&.status--none {
			border-left: 4px solid #94a3b8;
		}

		.status-icon {
			margin-bottom: 12px;
		}

		.status-title {
			display: block;
			font-size: 18px;
			font-weight: 600;
			color: #333;
			margin-bottom: 8px;
		}

		.status-desc {
			font-size: 13px;
			color: #666;
			line-height: 1.5;
		}
	}

	.info-card {
		background: #fff;
		border-radius: 16px;
		padding: 20px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);

		.info-row {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 14px 0;
			border-bottom: 1px solid #f0f0f0;

			&:last-child {
				border-bottom: none;
			}

			.info-label {
				font-size: 14px;
				color: #666;
			}

			.info-value {
				font-size: 14px;
				color: #333;
				font-weight: 500;
			}
		}
	}

	.form-card {
		background: #fff;
		border-radius: 16px;
		padding: 20px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
	}

	.submit-btn {
		margin-top: 24px;
		border-radius: 12px;
		height: 48px;
		line-height: 48px;
		font-weight: 600;

		&::after {
			border: none;
		}

		&[disabled] {
			opacity: 0.7;
		}
	}
</style>