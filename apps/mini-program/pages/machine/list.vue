<template>
	<view class="page">
		<!-- 搜索与筛选栏 -->
		<view class="header">
			<view class="search-row">
				<uni-search-bar v-model="keyword" placeholder="搜索品牌/型号/描述" bgColor="#f0f2f5" radius="20"
					@confirm="onSearch" @clear="onSearch" />
				<view class="locate-btn" @click="onLocate">
					<uni-icons type="location-filled" size="22" color="#FF8F00"></uni-icons>
					<text>定位</text>
				</view>
			</view>
			<view class="filter-row">
				<view v-for="item in filterTabs" :key="item.key" class="filter-tab"
					:class="{ active: filterActive === item.key }" @click="openFilter(item.key)">
					<text>{{ item.label }}</text>
					<uni-icons type="bottom" size="12"
						:color="filterActive === item.key ? '#FF8F00' : '#666'"></uni-icons>
				</view>
			</view>
		</view>

		<!-- 筛选弹窗：使用字典 -->
		<uni-popup ref="filterPopup" type="bottom" background-color="#fff" border-radius="16 16 0 0">
			<view class="popup-content">
				<view class="popup-title">{{ filterTabs.find(t => t.key === filterActive)?.label || '筛选' }}</view>
				<!-- 设备类型 -->
				<view v-if="filterActive === 'type'" class="popup-section">
					<view class="section-label">设备类型</view>
					<view class="dict-options">
						<view v-for="opt in dictOptions.machine_type" :key="opt.value" class="dict-option"
							:class="{ on: filter.type === opt.value }" @click="filter.type = opt.value">
							{{ opt.text }}
						</view>
					</view>
				</view>
				<!-- 新旧程度 -->
				<view v-else-if="filterActive === 'condition'" class="popup-section">
					<view class="section-label">新旧程度</view>
					<view class="dict-options">
						<view v-for="opt in dictOptions.machine_condition" :key="opt.value" class="dict-option"
							:class="{ on: filter.condition === opt.value }" @click="filter.condition = opt.value">
							{{ opt.text }}
						</view>
					</view>
				</view>
				<!-- 价格 -->
				<view v-else-if="filterActive === 'price'" class="popup-section">
					<view class="section-label">价格区间（元）</view>
					<view class="input-row">
						<uni-easyinput v-model="filter.priceMin" type="number" placeholder="最低价"></uni-easyinput>
						<text class="to">-</text>
						<uni-easyinput v-model="filter.priceMax" type="number" placeholder="最高价"></uni-easyinput>
					</view>
				</view>
				<!-- 地区 -->
				<view v-else-if="filterActive === 'area'" class="popup-section">
					<view class="section-label">省份</view>
					<uni-easyinput v-model="filter.province" placeholder="如：湖南省"></uni-easyinput>
					<view class="section-label">城市</view>
					<uni-easyinput v-model="filter.city" placeholder="如：长沙市"></uni-easyinput>
					<view class="section-label">区县</view>
					<uni-easyinput v-model="filter.district" placeholder="选填"></uni-easyinput>
				</view>
				<!-- 排序 -->
				<view v-else-if="filterActive === 'sort'" class="popup-section">
					<view class="dict-options">
						<view v-for="opt in sortOptions" :key="opt.value" class="dict-option"
							:class="{ on: filter.sort === opt.value }" @click="filter.sort = opt.value">
							{{ opt.text }}
						</view>
					</view>
				</view>
				<view class="popup-actions">
					<button class="btn-reset" @click="resetFilter">重置</button>
					<button class="btn-confirm" @click="applyFilter">确定</button>
				</view>
			</view>
		</uni-popup>

		<!-- 列表 -->
		<view class="list">
			<view v-for="item in machines" :key="item.id" class="card" @click="goDetail(item.id)">
				<image class="card-img" :src="(item.images && item.images[0]) || '/static/default_machine.png'"
					mode="aspectFill" />
				<view class="card-body">
					<view class="card-title-row">
						<text
							class="card-title">{{ item.model || (item.brand && item.brand + ' ') || '' }}{{ item.model }}</text>
						<uni-tag v-if="item.isTop === 'Y'" text="置顶" type="error" size="mini" circle />
					</view>
					<view class="card-meta">
						<uni-icons type="location-filled" size="14" color="#999" />
						<text>{{ item.province }} {{ item.city }}</text>
						<text class="dot">·</text>
						<text>{{ conditionLabel(item.conditionType) }}</text>
					</view>
					<view class="card-footer">
						<view class="price">
							<text class="sym">¥</text>
							<text class="num">{{ item.rentAmount }}</text>
							<text class="unit">/{{ rentUnitLabel(item.rentUnit) }}</text>
						</view>
						<button class="btn-call" @click.stop="contactOwner(item)">联系机主</button>
					</view>
				</view>
			</view>
		</view>

		<uni-load-more :status="loading ? 'loading' : (loadingMore ? 'loading' : (machines.length >= total && total > 0 ? 'noMore' : (machines.length > 0 ? 'more' : 'noMore')))" />
		<view v-if="machines.length === 0 && !loading" class="empty">
			<uni-icons type="info-filled" size="64" color="#ddd" />
			<text>暂无相关设备</text>
		</view>

		<view class="fab" @click="goPublish">
			<uni-icons type="plusempty" size="28" color="#fff" />
		</view>
	</view>
</template>

<script>
	import apiService from '@/api/api';
	import {
		useDictOne
	} from '@/hooks/useDict';

	export default {
		data() {
			return {
				keyword: '',
				machines: [],
				loading: false,
				loadingMore: false,
				page: 1,
				pageSize: 10,
				total: 0,
				filterActive: '',
				filter: {
					type: '',
					condition: '',
					priceMin: '',
					priceMax: '',
					province: '',
					city: '',
					district: '',
					sort: 'latest',
				},
				location: {
					latitude: null,
					longitude: null
				},
				filterTabs: [{
						key: 'type',
						label: '类型'
					},
					{
						key: 'condition',
						label: '新旧'
					},
					{
						key: 'price',
						label: '价格'
					},
					{
						key: 'area',
						label: '地区'
					},
					{
						key: 'sort',
						label: '排序'
					},
				],
				sortOptions: [{
						text: '最新发布',
						value: 'latest'
					},
					{
						text: '价格从低到高',
						value: 'price_asc'
					},
					{
						text: '价格从高到低',
						value: 'price_desc'
					},
					{
						text: '距离优先',
						value: 'distance'
					},
				],
				dictOptions: {
					machine_type: useDictOne('machine_type'),
					machine_condition: useDictOne('machine_condition'),
					work_hours_unit: useDictOne('work_hours_unit'),
				},
			};
		},
		onLoad() {
			this.fetchMachines(true);
		},
		onReachBottom() {
			this.loadMore();
		},
		onPullDownRefresh() {
			this.fetchMachines(true).finally(() => uni.stopPullDownRefresh());
		},
		methods: {
			conditionLabel(v) {
				const arr = this.dictOptions.machine_condition?.value ?? this.dictOptions.machine_condition ?? [];
				const o = arr.find(x => x.value === v);
				return o ? o.text : (v || '');
			},
			rentUnitLabel(v) {
				const arr = this.dictOptions.work_hours_unit?.value ?? this.dictOptions.work_hours_unit ?? [];
				const o = arr.find(x => x.value === v);
				return o ? o.text : '天';
			},
			onSearch() {
				this.fetchMachines();
			},
			onLocate() {
				uni.getLocation({
					type: 'gcj02',
					success: (res) => {
						this.location = {
							latitude: res.latitude,
							longitude: res.longitude
						};
						this.filter.sort = 'distance';
						this.fetchMachines();
						this.$tip.success("已按距离排序")
					},
					fail: (err) => {
						console.log(err);
						this.$tip.error("请授权位置信息")
					},
				});
			},
			openFilter(key) {
				this.filterActive = key;
				this.$refs.filterPopup.open();
			},
			resetFilter() {
				if (this.filterActive === 'type') this.filter.type = '';
				else if (this.filterActive === 'condition') this.filter.condition = '';
				else if (this.filterActive === 'price') this.filter.priceMin = this.filter.priceMax = '';
				else if (this.filterActive === 'area') this.filter.province = this.filter.city = this.filter.district = '';
				else if (this.filterActive === 'sort') this.filter.sort = 'latest';
			},
			applyFilter() {
				this.$refs.filterPopup.close();
				this.fetchMachines();
			},
			fetchMachines(reset = true) {
				if (reset) {
					this.page = 1;
					this.loading = true;
				} else {
					this.loadingMore = true;
				}
				const params = { page: this.page, pageSize: this.pageSize };
				if (this.filter.type) params.type = this.filter.type;
				if (this.filter.condition) params.condition = this.filter.condition;
				if (this.filter.priceMin) params.priceMin = this.filter.priceMin;
				if (this.filter.priceMax) params.priceMax = this.filter.priceMax;
				if (this.filter.province) params.province = this.filter.province;
				if (this.filter.city) params.city = this.filter.city;
				if (this.filter.district) params.district = this.filter.district;
				if (this.keyword) params.keyword = this.keyword;
				if (this.filter.sort) params.sort = this.filter.sort;
				if (this.filter.sort === 'distance' && this.location.latitude != null) {
					params.latitude = this.location.latitude;
					params.longitude = this.location.longitude;
				}
				return apiService.getMachines(params).then((res) => {
					const data = res?.data ?? res;
					const list = data?.list ?? (Array.isArray(data) ? data : []);
					const total = data?.total ?? list.length;
					if (reset) this.machines = list;
					else this.machines = this.machines.concat(list);
					this.total = total;
				}).catch(() => {
					if (reset) this.machines = [];
				}).finally(() => {
					this.loading = false;
					this.loadingMore = false;
				});
			},
			loadMore() {
				if (this.loading || this.loadingMore) return;
				if (this.machines.length >= this.total) return;
				this.page++;
				this.fetchMachines(false);
			},
			goDetail(id) {
				uni.navigateTo({
					url: '/pages/machine/detail?id=' + id
				});
			},
			goPublish() {
				uni.navigateTo({
					url: '/pages/machine/add'
				});
			},
			contactOwner(item) {
				const phone = item?.user?.phone || '13800138000';
				if (phone) uni.makePhoneCall({
					phoneNumber: String(phone)
				});
			},
		},
	};
</script>

<style lang="scss" scoped>
	.page {
		min-height: 100vh;
		background: #f5f6f8;
		padding-bottom: 90px;
	}

	.header {
		position: sticky;
		top: 0;
		z-index: 10;
		background: #fff;
		padding: 12px 16px;
		box-shadow: 0 1px 0 rgba(0, 0, 0, 0.06);
	}

	.search-row {
		display: flex;
		align-items: center;
		gap: 10px;

		.locate-btn {
			display: flex;
			flex-direction: column;
			align-items: center;
			font-size: 11px;
			color: #FF8F00;
		}
	}

	.filter-row {
		display: flex;
		margin-top: 12px;
		gap: 8px;
	}

	.filter-tab {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 4px;
		font-size: 13px;
		color: #666;
		padding: 8px 0;
		border-radius: 8px;

		&.active {
			color: #FF8F00;
			background: rgba(255, 143, 0, 0.08);
		}
	}

	.popup-content {
		padding: 20px 16px 40px;
		max-height: 70vh;
		overflow-y: auto;
	}

	.popup-title {
		font-size: 17px;
		font-weight: 600;
		margin-bottom: 16px;
	}

	.popup-section {
		margin-bottom: 16px;

		.section-label {
			font-size: 13px;
			color: #666;
			margin-bottom: 8px;
		}

		.input-row {
			display: flex;
			align-items: center;
			gap: 12px;

			.to {
				color: #999;
			}
		}
	}

	.dict-options {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
	}

	.dict-option {
		padding: 8px 16px;
		font-size: 14px;
		color: #333;
		background: #f0f2f5;
		border-radius: 20px;

		&.on {
			background: rgba(255, 143, 0, 0.15);
			color: #FF8F00;
		}
	}

	.popup-actions {
		display: flex;
		gap: 12px;
		margin-top: 24px;

		.btn-reset,
		.btn-confirm {
			flex: 1;
			height: 44px;
			line-height: 44px;
			border-radius: 22px;
			font-size: 15px;
			border: none;
		}

		.btn-reset {
			background: #f0f2f5;
			color: #666;
		}

		.btn-confirm {
			background: linear-gradient(90deg, #FFA500, #FF8F00);
			color: #fff;
		}
	}

	.list {
		padding: 12px 16px;
	}

	.card {
		display: flex;
		background: #fff;
		border-radius: 12px;
		overflow: hidden;
		margin-bottom: 12px;
		box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
	}

	.card-img {
		width: 120px;
		height: 120px;
		flex-shrink: 0;
		background: #f0f2f5;
	}

	.card-body {
		flex: 1;
		padding: 12px 14px;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}

	.card-title-row {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 8px;
	}

	.card-title {
		font-size: 16px;
		font-weight: 600;
		color: #1a1a1a;
		line-height: 1.3;
	}

	.card-meta {
		display: flex;
		align-items: center;
		gap: 4px;
		font-size: 12px;
		color: #999;

		.dot {
			margin: 0 2px;
		}
	}

	.card-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-top: 8px;
	}

	.price {
		.sym {
			font-size: 12px;
			color: #ff5a5f;
			font-weight: 600;
		}

		.num {
			font-size: 18px;
			color: #ff5a5f;
			font-weight: 700;
		}

		.unit {
			font-size: 12px;
			color: #999;
		}
	}

	.btn-call {
		margin: 0;
		padding: 0 14px;
		height: 32px;
		line-height: 32px;
		font-size: 13px;
		background: linear-gradient(90deg, #FFA500, #FF8F00);
		color: #fff;
		border-radius: 16px;
		border: none;
	}

	.empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding-top: 80px;
		color: #999;
		font-size: 14px;
	}

	.fab {
		position: fixed;
		right: 20px;
		bottom: 100px;
		width: 56px;
		height: 56px;
		border-radius: 28px;
		background: linear-gradient(135deg, #FFA500, #FF8F00);
		box-shadow: 0 4px 16px rgba(255, 143, 0, 0.4);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 9;
	}
</style>