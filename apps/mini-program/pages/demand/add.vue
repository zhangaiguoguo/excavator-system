<template>
	<view class="page">
		<view class="card form-card">
			<uni-forms ref="formRef" label-position="right" label-width="80px" :modelValue="form" :rules="rules">
				<uni-forms-item label="需求类型" name="type" required>
					<uni-data-select v-model="form.type" :localdata="typeOptions" placeholder="请选择"></uni-data-select>
				</uni-forms-item>
				<uni-forms-item label="所需设备/机型" name="machineTypes" required>
					<uni-data-checkbox v-model="form.machineTypes" :localdata="machineTypeOptionsFull" multiple
						@change="onMachineTypesChange"></uni-data-checkbox>
					<text class="tip">求租设备时多选所需类型，招聘机手时选可操作设备类型</text>
					<view v-if="hasMachineTypeOther" class="mt-2">
						<uni-easyinput v-model="form.machineTypeOther" placeholder="请输入其他设备/机型"></uni-easyinput>
					</view>
				</uni-forms-item>
				<uni-forms-item label="施工地址" required>
					<LocationPicker v-model="locationValue" />
				</uni-forms-item>
				<uni-forms-item label="需求时段" required>
					<uni-datetime-picker type="daterange" v-model="demandDateRange" range-separator="至"
						start-placeholder="开始日期" end-placeholder="结束日期" :clear-icon="false"
						@change="onDateRangeChange" />
					<view class="checkbox-row">
						<uni-data-checkbox v-model="isLongTerm" :localdata="[{ text: '时间不限', value: Constants.YES }]"
							@change="onLongTermChange"></uni-data-checkbox>
					</view>
				</uni-forms-item>
				<view class="form-row">
					<view class="flex1">
						<uni-forms-item label="预算下限(元)" name="budgetMin">
							<uni-easyinput type="number" v-model="form.budgetMin" placeholder="选填"></uni-easyinput>
						</uni-forms-item>
					</view>
					<view class="flex1">
						<uni-forms-item label="预算上限(元)" name="budgetMax">
							<uni-easyinput type="number" v-model="form.budgetMax" placeholder="选填"></uni-easyinput>
						</uni-forms-item>
					</view>
				</view>
				<uni-forms-item label="是否急聘" name="isUrgent">
					<view class="flex h-full align-center">
						<uni-data-checkbox v-model="form.isUrgent" :localdata="sys_yes_no"></uni-data-checkbox>
					</view>
				</uni-forms-item>
				<uni-forms-item label="需求图片" name="images" required>
					<UploadImageList v-model="form.images" :max="5" tip="最少1张，最多5张" />
				</uni-forms-item>
				<uni-forms-item label="需求视频" name="video">
					<UploadVideo v-model="form.video" />
				</uni-forms-item>
				<uni-forms-item label="需求描述" name="description" required>
					<uni-easyinput type="textarea" v-model="form.description"
						placeholder="详细描述工作内容、工期、要求等"></uni-easyinput>
				</uni-forms-item>
				<button type="primary" class="submit-btn" @click="submit">发布需求</button>
			</uni-forms>
		</view>
	</view>
</template>

<script>
	import apiService from '@/api/api';
	import {
		useDictOne
	} from '@/hooks/useDict';
	import {
		setListRefreshHint
	} from '@/common/util/listRefresh.js';
	import {
		checkUserCanPublish
	} from '@/common/util/publishCheck.js';
	import appStore from '@/store/app';
	import LocationPicker from '@/components/LocationPicker.vue';
	import UploadImageList from '@/components/UploadImageList.vue';
	import UploadVideo from '@/components/UploadVideo.vue';
	import {
		Constants
	} from '@excavator/types';
	import {
		DemandDateUnlimited
	} from '@excavator/utils';

	export default {
		components: {
			LocationPicker,
			UploadImageList,
			UploadVideo
		},
		data() {
			return {
				Constants,
				demandId: '',
				isEdit: false,
				isLongTerm: Constants.NO,
				locationValue: {
					province: '',
					city: '',
					district: '',
					address: ''
				},
				form: {
					userId: '',
					type: '1',
					machineTypes: [],
					machineTypeOther: '',
					province: '',
					city: '',
					district: '',
					address: '',
					startDate: '',
					endDate: '',
					budgetMin: '',
					budgetMax: '',
					description: '',
					images: [],
					video: '',
					isUrgent: 'N'
				},
				typeOptions: useDictOne('demand_type'),
				machineTypeOptions: useDictOne('machine_types'),
				// 补全设备类型：与后端 init.sql 一致，避免接口返回不全
				defaultMachineTypeOptions: [],
				sys_yes_no: useDictOne('sys_yes_no'),
				rules: {
					type: {
						rules: [{
							required: true,
							errorMessage: '请选择需求类型'
						}]
					},
					machineTypes: {
						rules: [{
							required: true,
							errorMessage: '请选择所需设备/机型'
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
					startDate: {
						rules: [{
							required: true,
							errorMessage: '请选择开始日期'
						}]
					},
					endDate: {
						rules: [{
							required: true,
							errorMessage: '请选择结束日期'
						}]
					},
					images: {
						rules: [{
							required: true,
							errorMessage: '请至少上传1张图片'
						}]
					},
					description: {
						rules: [{
							required: true,
							errorMessage: '请填写需求描述'
						}]
					}
				}
			};
		},
		computed: {
			demandDateRange: {
				get() {
					if (this.isLongTerm === Constants.YES) {
						return []
					}
					return [this.form.startDate, this.form.endDate].filter(Boolean);
				},
				set(arr) {
					const a = Array.isArray(arr) ? arr : [];
					this.form.startDate = (a[0]);
					this.form.endDate = (a[1]);
				}
			},
			userInfo() {
				return (appStore().state && appStore().state.userInfo) || {};
			},
			// 合并接口数据与默认项，保证选项完整
			machineTypeOptionsFull() {
				const fromApi = Array.isArray(this.machineTypeOptions) ? this.machineTypeOptions : [];
				const values = new Set(fromApi.map((o) => o.value));
				const merged = fromApi.slice();
				for (const opt of this.defaultMachineTypeOptions) {
					if (!values.has(opt.value)) {
						merged.push({
							text: opt.text,
							value: opt.value
						});
						values.add(opt.value);
					}
				}
				return merged.sort((a, b) => Number(a.value) - Number(b.value));
			},
			hasMachineTypeOther() {
				const arr = Array.isArray(this.form.machineTypes) ? this.form.machineTypes : [];
				return arr.includes('8');
			},
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
		onLoad(options) {
			const store = appStore();
			this.form.userId = (store.state && store.state.userInfo && store.state.userInfo.id) || uni.getStorageSync(
				'userId') || '';
			if (options && options.id) {
				this.isEdit = true;
				this.demandId = options.id;
				this.loadDetail(options.id);
			}
		},
		methods: {
			onMachineTypesChange() {
				// 取消「其他」时清空其他输入
				if (!this.hasMachineTypeOther) this.form.machineTypeOther = '';
			},
			onDateRangeChange() {
				// 使用日期框选择时取消「时间不限」，保证互斥
				this.isLongTerm = Constants.NO;
			},
			onLongTermChange({
				detail: {
					value
				}
			}) {
				if (value === Constants.YES) {
					this.demandDateRange = [DemandDateUnlimited.START, DemandDateUnlimited.END];
				} else {
					this.demandDateRange = []
				}
			},
			loadDetail(id) {
				this.$tip.loading && this.$tip.loading('加载中...');
				apiService
					.getDemand(String(id))
					.then((res) => {
						const data = res?.data ?? res;
						if (!data) return;
						this.form.userId = data.userId || this.form.userId;
						this.form.type = String(data.type || '1');
						this.form.machineTypes = data.machineTypes || [];
						this.form.province = data.province || '';
						this.form.city = data.city || '';
						this.form.district = data.district || '';
						this.form.address = data.address || '';
						this.form.startDate = data.startDate ? String(data.startDate).slice(0, 10) : '';
						this.form.endDate = data.endDate ? String(data.endDate).slice(0, 10) : '';
						this.form.budgetMin = data.budgetMin != null ? String(data.budgetMin) : '';
						this.form.budgetMax = data.budgetMax != null ? String(data.budgetMax) : '';
						let desc = data.description || '';
						this.form.machineTypeOther = data.machineTypeOther;
						this.form.description = desc;
						this.form.images = data.images || [];
						this.form.video = data.video || '';
						this.form.isUrgent = data.isUrgent || 'N';
						this.demandDateRange = [
							this.form.startDate || '',
							this.form.endDate || '',
						];
						this.isLongTerm = (this.form.startDate === DemandDateUnlimited.START && this.form.endDate ===
								DemandDateUnlimited.END) ?
							Constants.YES :
							Constants.NO;
						this.locationValue = {
							province: this.form.province,
							city: this.form.city,
							district: this.form.district,
							address: this.form.address,
							longitude: this.form.longitude,
							latitude: this.form.latitude,
						};
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
					if (!this.form.userId) {
						this.$tip.alert('请先登录');
						return;
					}
					const machineTypes = Array.isArray(this.form.machineTypes) ? this.form.machineTypes : [this
						.form.machineTypes
					].filter(Boolean);
					if (machineTypes.length === 0) {
						this.$tip.alert('请选择所需设备/机型');
						return;
					}
					if (machineTypes.includes('8') && !(this.form.machineTypeOther || '').trim()) {
						this.$tip.alert('请填写其他设备/机型');
						return;
					}
					if (!this.form.images || this.form.images.length === 0) {
						this.$tip.alert('请至少上传1张图片');
						return;
					}
					const payload = {
						userId: this.form.userId,
						type: String(this.form.type),
						machineTypes,
						machineTypeOther: (this.form.machineTypeOther || '').trim() || undefined,
						province: this.form.province,
						city: this.form.city,
						district: this.form.district || '',
						address: this.form.address,
						latitude: this.form.latitude,
						longitude: this.form.longitude,
						startDate: this.form.startDate,
						endDate: this.form.endDate,
						budgetMin: this.form.budgetMin ? Number(this.form.budgetMin) : undefined,
						budgetMax: this.form.budgetMax ? Number(this.form.budgetMax) : undefined,
						description: this.form.description,
						images: this.form.images,
						video: this.form.video || undefined,
						isUrgent: this.form.isUrgent || 'N'
					};
					this.$tip.loading(this.isEdit ? '保存中...' : '发布中...');
					const req = this.isEdit && this.demandId ?
						apiService.updateDemand(String(this.demandId), payload) :
						apiService.createDemand(payload);
					req.then(() => {
						this.$tip.loaded();
						this.$tip.success(this.isEdit ? '保存成功' : '发布成功');
						setListRefreshHint('demand');
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

	.mt-2 {
		margin-top: 8px;
	}

	.tip {
		font-size: 12px;
		color: #999;
		margin-top: 4px;
		display: block;
	}

	.submit-btn {
		margin-top: 24px;
		width: 100%;
	}
</style>