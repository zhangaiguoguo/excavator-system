<template>
	<view class="page">
		<view class="card form-card">
			<uni-forms ref="formRef" label-position="right" label-width="80px" :modelValue="form" :rules="rules">
				<uni-forms-item label="设备类型" name="type" required>
					<uni-easyinput v-model="form.type" placeholder="如：挖掘机整机、挖斗、炮头"></uni-easyinput>
				</uni-forms-item>
				<uni-forms-item label="设备型号" name="model" required>
					<uni-easyinput v-model="form.model" placeholder="如：三一 SY200、卡特 320GC"></uni-easyinput>
				</uni-forms-item>
				<uni-forms-item label="新旧程度" name="conditionType" required>
					<uni-data-select v-model="form.conditionType" :localdata="conditionOptions"
						placeholder="请选择"></uni-data-select>
				</uni-forms-item>
				<view class="form-row">
					<uni-forms-item label="租赁价格" name="rentAmount" required class="flex1">
						<view class="w-half">
							<uni-easyinput type="number" v-model="form.rentAmount" placeholder="请输入"></uni-easyinput>
						</view>
						<view class="w-half">
							<uni-data-select v-model="form.rentUnit" :localdata="rentUnitOptions"
								placeholder="单位"></uni-data-select>
						</view>
					</uni-forms-item>
				</view>
				<uni-forms-item label="可租赁时段" required>
					<view class="date-row">
						<uni-easyinput type="date" v-model="form.rentStartDate" placeholder="开始日期"></uni-easyinput>
						<text class="to">至</text>
						<uni-easyinput type="date" v-model="form.rentEndDate" placeholder="结束日期"></uni-easyinput>
					</view>
					<view class="checkbox-row">
						<uni-data-checkbox v-model="form.isLongTerm"
							:localdata="[{ text: '长期可租', value: 'Y' }]"></uni-data-checkbox>
					</view>
				</uni-forms-item>
				<uni-forms-item label="设备位置" required>
					<LocationPicker v-model="locationValue" />
				</uni-forms-item>
				<uni-forms-item label="设备实拍图" name="images" required>
					<UploadImageList v-model="form.images" :max="5" tip="最少1张，最多5张" />
				</uni-forms-item>
				<uni-forms-item label="设备视频" name="video">
					<UploadVideo v-model="form.video" />
				</uni-forms-item>
				<uni-forms-item label="备注" name="description">
					<uni-easyinput type="textarea" v-model="form.description" placeholder="设备使用情况、额外服务等，最多500字"
						:maxlength="500"></uni-easyinput>
				</uni-forms-item>
				<button type="primary" class="submit-btn" @click="submit">发布设备</button>
			</uni-forms>
		</view>
	</view>
</template>

<script>
	import apiService from '@/api/api';
	import {
		useDictOne
	} from '@/hooks/useDict';
	import LocationPicker from '@/components/LocationPicker.vue';
	import UploadImageList from '@/components/UploadImageList.vue';
	import UploadVideo from '@/components/UploadVideo.vue';

	export default {
		components: {
			LocationPicker,
			UploadImageList,
			UploadVideo
		},
		data() {
			return {
				locationValue: {
					province: '',
					city: '',
					district: '',
					address: ''
				},
				form: {
					userId: '',
					type: '',
					model: '',
					conditionType: '',
					rentAmount: '',
					rentUnit: '',
					rentStartDate: '',
					rentEndDate: '',
					isLongTerm: 'N',
					province: '',
					city: '',
					district: '',
					address: '',
					description: '',
					images: [],
					video: ''
				},
				conditionOptions: useDictOne('machine_condition'),
				rentUnitOptions: useDictOne('work_hours_unit'),
				rules: {
					type: {
						rules: [{
							required: true,
							errorMessage: '请输入设备类型'
						}]
					},
					model: {
						rules: [{
							required: true,
							errorMessage: '请输入设备型号'
						}]
					},
					conditionType: {
						rules: [{
							required: true,
							errorMessage: '请选择新旧程度'
						}]
					},
					rentAmount: {
						rules: [{
							required: true,
							errorMessage: '请输入租赁价格'
						}]
					},
					rentUnit: {
						rules: [{
							required: true,
							errorMessage: '请选择单位'
						}]
					},
					rentStartDate: {
						rules: [{
							required: true,
							errorMessage: '请选择开始日期'
						}]
					},
					rentEndDate: {
						rules: [{
							required: true,
							errorMessage: '请选择结束日期'
						}]
					},
					province: {
						rules: [{
							required: true,
							errorMessage: '请填写省份'
						}]
					},
					city: {
						rules: [{
							required: true,
							errorMessage: '请填写城市'
						}]
					},
					address: {
						rules: [{
							required: true,
							errorMessage: '请填写详细地址'
						}]
					},
					images: {
						rules: [{
							required: true,
							errorMessage: '请至少上传1张图片'
						}]
					}
				}
			};
		},
		watch: {
			locationValue: {
				deep: true,
				handler(v) {
					if (v) {
						this.form.province = v.province || '';
						this.form.city = v.city || '';
						this.form.district = v.district || '';
						this.form.address = v.address || '';
						this.form.latitude = v.latitude;
						this.form.longitude = v.longitude;
					}
				},
			},
		},
		onLoad() {
			this.form.userId = uni.getStorageSync('userId') || '';
		},
		methods: {
			submit() {
				this.$refs.formRef.validate().then(() => {
					if (!this.form.userId) {
						this.$tip.alert('请先登录');
						return;
					}
					if (!this.form.images || this.form.images.length === 0) {
						this.$tip.alert('请至少上传1张图片');
						return;
					}
					if (this.form.images.length > 5) {
						this.$tip.alert('最多5张图片');
						return;
					}
					const payload = {
						...this.form,
						rentAmount: Number(this.form.rentAmount),
						rentStartDate: this.form.rentStartDate,
						rentEndDate: this.form.rentEndDate,
						images: this.form.images,
						video: this.form.video || undefined
					};
					this.$tip.loading('发布中...');
					apiService.createMachine(payload).then(() => {
						this.$tip.loaded();
						this.$tip.success('发布成功');
						setTimeout(() => uni.navigateBack(), 1500);
					}).catch(err => {
						this.$tip.loaded();
						this.$tip.alert(err?.message || '发布失败');
					});
				}).catch(() => {});
			}
		}
	};
</script>

<style lang="scss" scoped>
	.page {
		min-height: 100vh;
		background: #F5F6F8;
		padding: 16px;
		padding-bottom: 40px;
	}

	.form-card {
		padding: 16px;
	}

	.form-row {
		display: flex;
		gap: 12px;
	}

	.flex1 {
		flex: 1;
	}

	.date-row {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 8px;
	}

	.date-row .to {
		color: #999;
		font-size: 14px;
	}

	.checkbox-row {
		margin-top: 8px;
	}

	.submit-btn {
		margin-top: 24px;
		width: 100%;
		border-radius: 24px;
	}
</style>