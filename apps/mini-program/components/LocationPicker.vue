<template>
	<view class="location-picker">
		<view class="location-actions">
			<button class="btn-location" type="default" size="mini" @click="onMapPick">
				<uni-icons type="location-filled" size="16" color="#4AB1F7" />
				地图选点
			</button>
			<button class="btn-location" type="default" size="mini" @click="onCurrentLocation">
				当前定位
			</button>
		</view>
		<view class="location-desc">选点不限于当前位置，可在地图中搜索或移动选点</view>
		<view class="form-row">
			<uni-easyinput v-model="local.province" placeholder="省" @input="emitChange" />
			<uni-easyinput v-model="local.city" placeholder="市" @input="emitChange" />
			<uni-easyinput v-model="local.district" placeholder="区/县" @input="emitChange" />
		</view>
		<view class="mt-2">
			<uni-easyinput v-model="local.address" placeholder="详细地址（街道、门牌等）" class="addr-input mt-2"
				@input="emitChange" />
		</view>
	</view>
</template>

<script>
	import apiService from '@/api/api';
	export default {
		name: 'LocationPicker',
		props: {
			value: {
				type: Object,
				default: () => ({}),
			},
		},
		data() {
			return {
				local: {
					province: '',
					city: '',
					district: '',
					address: '',
					latitude: undefined,
					longitude: undefined,
				},
			};
		},
		watch: {
			value: {
				immediate: true,
				handler(v) {
					this.local = v;
			},
		},
	},
	methods: {
		async fillByRegeo(longitude, latitude) {
			if (longitude == null || latitude == null) return;
			try {
				uni.showLoading({
					title: "位置加载中..."
				})
				const res = await apiService.regeoLocation({
					longitude: Number(longitude),
					latitude: Number(latitude)
				});
				const g = res?.data || {};
				if (g.province) this.local.province = g.province;
				if (g.city) this.local.city = g.city;
				if (g.district) this.local.district = g.district;
				if (g.formattedAddress) this.local.address = g.formattedAddress;
				this.local.latitude = Number(latitude);
				this.local.longitude = Number(longitude);
				console.log(this.local);
				this.$nextTick(() => this.emitChange());
			} catch (e) {
				console.log(e)
				this.$tip.error("位置识别失败！")
				// 后端未配置 AMAP_KEY 或网络异常时，保留 chooseLocation 的结果即可
			} finally {
				uni.hideLoading()
			}
		},
		emitChange() {
			this.$emit('change', this.local);
			this.$emit("update:modelValue", this.local);
		},
		onMapPick() {
			uni.chooseLocation({
				success: (res) => {
					// 用经纬度再向后端请求高德，补全省市区（更准确）
					this.fillByRegeo(res.longitude, res.latitude).then(r => {});
				},
				fail: (err) => {
					console.log(err);
					if (err.errMsg && err.errMsg.indexOf('cancel') === -1) {
						this.$tip.alert('选点失败，请检查定位权限或手动填写地址');
					}
				},
			});
		},
		onCurrentLocation() {
			uni.getLocation({
				type: 'gcj02',
				success: (r) => {
					this.fillByRegeo(r.longitude, r.latitude).then(res => {});
				},
				fail: () => {
					this.$tip.alert('获取位置失败，请使用地图选点或手动填写');
				},
			});
		},
	},
	};
</script>

<style lang="scss" scoped>
	.location-picker {
		width: 100%;
	}

	.location-actions {
		display: flex;
		gap: 12px;
		margin-bottom: 8px;
	}

	.btn-location {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		font-size: 13px;
		padding: 0 12px;
		line-height: 32px;
		border-radius: 16px;
		background: #F1F2F4;
		border: none;
		margin: 0;
	}

	.location-desc {
		font-size: 12px;
		color: #999;
		margin-bottom: 12px;
	}

	.form-row {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
	}

	.form-row uni-easyinput {
		flex: 1;
		min-width: 80px;
	}

	.addr-input {
		margin-top: 8px;
	}
</style>