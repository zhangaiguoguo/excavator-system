<template>
	<view class="page">
		<view class="card form-card">
			<uni-forms ref="formRef" label-position="right" label-width="80px" :modelValue="form" :rules="rules">
				<uni-forms-item label="设备类型" name="type" required>
					<uni-data-select v-model="typeSelect" :localdata="machineTypeOptions" placeholder="请选择"
						@change="form.type = $event==8?null:$event"></uni-data-select>
					<view v-if="typeSelect == 8" class="mt-2">
						<uni-easyinput v-model="form.type" placeholder="请输入设备类型"></uni-easyinput>
					</view>
				</uni-forms-item>
				<uni-forms-item label="设备型号" name="model" required>
					<uni-easyinput v-model="form.model" placeholder="如：三一 SY200、卡特 320GC"></uni-easyinput>
				</uni-forms-item>
				<uni-forms-item label="新旧程度" name="conditionType" required>
					<uni-data-select v-model="form.conditionType" :localdata="conditionOptions"
						placeholder="请选择"></uni-data-select>
				</uni-forms-item>
				<uni-forms-item label="租赁价格" name="rentAmount" required class="flex1 w-full">
					<view class="w-full flex">
						<view class="w-half">
							<uni-easyinput type="number" v-model="form.rentAmount" placeholder="请输入"></uni-easyinput>
						</view>
						<view class="w-half pl-2">
							<uni-data-select v-model="form.rentUnit" :localdata="rentUnitOptions"
								placeholder="单位"></uni-data-select>
						</view>
					</view>
				</uni-forms-item>
				<uni-forms-item label="可租赁时段" required>
					<uni-datetime-picker type="daterange" v-model="rentDateRange" range-separator="至"
						@change="form.isLongTerm = Constants.NO" start-placeholder="开始日期" end-placeholder="结束日期"
						:clear-icon="false" />
					<view class="checkbox-row">
						<uni-data-checkbox v-model="form.isLongTerm" @change="rentDateRange=[]"
							:localdata="[{ text: '长期可租', value: Constants.YES }]"></uni-data-checkbox>
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
	import appStore from '@/store/app';
	import {
		JSONStringify
	} from '../../common/util/util';
	import {
		setListRefreshHint
	} from '@/common/util/listRefresh.js';
	import {
		checkUserCanPublish
	} from '@/common/util/publishCheck.js';
	import {
		Constants
	} from '@excavator/types';

	export default {
		components: {
			LocationPicker,
			UploadImageList,
			UploadVideo
		},
		data() {
			return {
				Constants,
				machineId: '',
				isEdit: false,
				typeSelect: '',
				rentDateRange: [],
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
					isLongTerm: Constants.NO,
					province: '',
					city: '',
					district: '',
					address: '',
					description: '',
					images: [],
					video: ''
				},
				conditionOptions: useDictOne('machine_condition'),
				machineTypeDict: useDictOne('machine_type'),
				rentUnitOptions: useDictOne('work_hours_unit'),
				rules: {
					type: {
						rules: [{
							required: true,
							errorMessage: '请选择设备类型'
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
				}
			};
		},
		computed: {
			machineTypeOptions() {
				return this.machineTypeDict;
			},
			userInfo() {
				return appStore().state.userInfo;
			}
		},
		watch: {
			rentDateRange: {
				handler(arr) {
					const a = Array.isArray(arr) ? arr : [];
					this.form.rentStartDate = a[0] || '';
					this.form.rentEndDate = a[1] || '';
				},
				deep: true,
			},
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
		onLoad(options) {
			if (!this.userInfo?.id) {
				this.$tip.alert("您还未登录系统！");
				setTimeout(() => uni.navigateBack(), 1500);
				return;
			}
			if (options && options.id) {
				this.isEdit = true;
				this.machineId = options.id;
				this.loadDetail(options.id);
			}
		},
		methods: {
			loadDetail(id) {
				this.$tip.loading && this.$tip.loading('加载中...');
				apiService.getMachine(String(id))
					.then((res) => {
						const data = res?.data ?? res;
						if (!data) return;
						this.form = {
							...data
						}
						this.rentDateRange = [
							this.form.rentStartDate || '',
							this.form.rentEndDate || ''
						];
						this.locationValue = {
							province: this.form.province,
							city: this.form.city,
							district: this.form.district,
							address: this.form.address,
							latitude: data.latitude,
							longitude: data.longitude,
						};
						// 设备类型下拉：如果在字典里，用编码；否则视为“其他”
						const dictArr = (this.machineTypeDict ?? []) || [];
						const hit = Array.isArray(dictArr) && dictArr.find((x) => x.value === this.form.type);
						if (hit) this.typeSelect = this.form.type;
						else this.typeSelect = "8";
					})
					.finally(() => {
						this.$tip.loaded && this.$tip.loaded();
					});
			},
			submit() {
				const publishCheck = checkUserCanPublish(this.userInfo);
				if (!publishCheck.can) {
					this.$tip.alert(publishCheck.message);
					return;
				}
				this.$refs.formRef.validate().then(() => {
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
						userId: this.form.userId || this.userInfo.id,
						rentAmount: Number(this.form.rentAmount),
						rentStartDate: this.form.rentStartDate,
						rentEndDate: this.form.rentEndDate,
						images: (this.form.images),
						video: (this.form.video) || undefined
					};
					this.$tip.loading(this.isEdit ? '保存中...' : '发布中...');
					const req = this.isEdit && this.machineId ?
						apiService.updateMachine(String(this.machineId), payload) :
						apiService.createMachine(payload);
					req.then(() => {
						this.$tip.loaded();
						this.$tip.success(this.isEdit ? '保存成功' : '发布成功');
						setListRefreshHint('machine');
						setListRefreshHint('publish');
						setTimeout(() => uni.navigateBack(), 1500);
					}).catch(err => {
						this.$tip.loaded();
						this.$tip.alert(err?.message || (this.isEdit ? '保存失败' : '发布失败'));
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
	}
</style>