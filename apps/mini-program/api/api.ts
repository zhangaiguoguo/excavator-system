import { http } from "@/common/service/service";
import configService from "@/common/service/config.service";
import { getToken, transformToUrlParam } from "@/common/util/util";
import area from "@/common/util/area";
import type { User } from "@excavator/types";

export const $uploadFileUrl = "/file/commom/Upload";
export const $viewFileUrl = "/file/commom/View/";

class ApiServer {
	//个人签名集合
	autoLogin(data : any) {
		return http.post("/auth/login", data);
	}

	getTempToken() {
		return http.get("/auth/temp-token");
	}

	getDictData(dictType : string) {
		return http.get('/system/dict/data/type/' + dictType)
	}

	getUser(id : string) {
		return http.get('/users/' + id);
	}

	updateUser(id : string, data : Partial<User>) {
		return http.post('/users/update', { ...data, id });
	}

	authorizeRealName(data : Partial<User>) {
		return http.post('/users/authorizeRealName', data);
	}

	getUploadUrl() {
		return configService.apiUrl + $uploadFileUrl;
	}

	/** 上传文件（图片/视频），返回 { fileId, fileName } 用于 JSON 存库，回显用 patchNewFileViewPath(fileName) */
	uploadFile(filePath: string): Promise<{ fileId: string; fileName: string; url: string }> {
		return new Promise((resolve, reject) => {
			const token = getToken();
			uni.uploadFile({
				url: configService.apiUrl + $uploadFileUrl,
				filePath,
				name: 'file',
				header: {
					'X-Access-Token': token || '',
					'Authorization': 'Bearer ' + (token || ''),
				},
				success: (res) => {
					if (res.statusCode === 200 || res.statusCode === 201) {
						try {
							const body = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
							const inner = body?.data || body || {};
							const url = inner.url || '';
							const pathVal = inner.fileName || inner.path || '';
							resolve({ fileId: pathVal, fileName: pathVal, url });
						} catch (e) {
							reject(e);
						}
					} else {
						reject(new Error((res.data as string) || '上传失败'));
					}
				},
				fail: (err) => reject(err),
			});
		});
	}

	/** 逆地理编码：经纬度 -> 省市区/完整地址（由后端请求高德） */
	regeoLocation(params : { longitude : number; latitude : number; extensions ?: 'base' | 'all' }) {
		return http.get('/geo/regeo', { params: params || {} });
	}

	// 设备模块 PRD 4.2.1
	getMachines(params ?: { type ?: string; condition ?: string; priceMin ?: string; priceMax ?: string; province ?: string; city ?: string; district ?: string; keyword ?: string; userId ?: string; latitude ?: number; longitude ?: number; sort ?: string; page ?: number; pageSize ?: number }) {
		return http.get('/machines', { params });
	}
	getMachine(id : string) {
		return http.get('/machines/' + id);
	}
	createMachine(data : any) {
		return http.post('/machines', data);
	}
	updateMachine(id : string, data : any) {
		return http.put('/machines/' + id, data);
	}
	removeMachine(id : string) {
		return http.delete('/machines/' + id);
	}

	// 需求模块 PRD 4.3
	getDemands(params ?: { type ?: string; province ?: string; city ?: string; district ?: string; budgetMin ?: string; budgetMax ?: string; keyword ?: string; userId ?: string; sort ?: string; page ?: number; pageSize ?: number }) {
		return http.get('/demands', { params });
	}
	getDemand(id : string) {
		return http.get('/demands/' + id);
	}
	createDemand(data : any) {
		return http.post('/demands', data);
	}
	updateDemand(id : string, data : any) {
		return http.put('/demands/' + id, data);
	}
	removeDemand(id : string) {
		return http.delete('/demands/' + id);
	}

	// 合同（接单后生成，关联需求+设备）
	getContracts(params ?: { userId ?: string; status ?: number; page ?: number; pageSize ?: number }) {
		return http.get('/contracts', { params: params || {} });
	}
	getContract(id : string) {
		return http.get('/contracts/' + id);
	}
	createContract(data : any) {
		return http.post('/contracts', data);
	}
	signContract(id : string, body : { userId : string; role : 'lessor' | 'lessee' }) {
		return http.put('/contracts/' + id + '/sign', body);
	}

	// 揽活模块 PRD 4.2.2
	getJobs(params ?: { experience ?: string; equipmentType ?: string; province ?: string; city ?: string; district ?: string; priceMin ?: string; priceMax ?: string; userId ?: string; sort ?: string }) {
		return http.get('/jobs', { params });
	}
	getJob(id : string) {
		return http.get('/jobs/' + id);
	}
	createJob(data : any) {
		return http.post('/jobs', data);
	}
	updateJob(id : string, data : any) {
		return http.put('/jobs/' + id, data);
	}
	removeJob(id : string) {
		return http.delete('/jobs/' + id);
	}

	// 收藏（使用字典 refType: machine | demand | job）
	getFavorites(userId : string) {
		return http.get('/favorites', { params: { userId } });
	}
	addFavorite(userId : string, refType : string, refId : string) {
		return http.post('/favorites', { userId, refType, refId });
	}
	removeFavorite(userId : string, refType : string, refId : string) {
		return http.delete('/favorites', { params: { userId, refType, refId } });
	}
	checkFavorite(userId : string, refType : string, refId : string) {
		return http.get('/favorites/check', { params: { userId, refType, refId } });
	}

	// 首页：猜你喜欢 & 最新需求
	getHomeRecommendations(params?: { limit?: number; latitude?: number; longitude?: number }) {
		return http.get('/home/recommendations', { params });
	}

	getHomeLatestDemands(params?: { page?: number; pageSize?: number }) {
		return http.get('/home/latest-demands', { params });
	}

	// 通知（需登录，后端从 token 取 userId）
	getNotifications(params ?: { page ?: number; pageSize ?: number; unreadOnly ?: boolean }) {
		const p: Record<string, string | number> = {};
		if (params?.page != null) p.page = params.page;
		if (params?.pageSize != null) p.pageSize = params.pageSize;
		if (params?.unreadOnly) p.unreadOnly = '1';
		return http.get('/notifications', { params: p });
	}
	markNotificationRead(id : string) {
		return http.put('/notifications/' + id + '/read');
	}
	markAllNotificationsRead() {
		return http.put('/notifications/read-all');
	}
}

const apiService = new ApiServer();
const baseUrl = configService.apiUrl + $viewFileUrl.slice(0, -1);

export function patchNewFileViewPath(fileName: string) {
	const safeName = encodeURIComponent(String(fileName || ''));
	const token = getToken() || '';
	const safeToken = token ? encodeURIComponent(token) : '';
	return baseUrl + `?fileName=${safeName}` + (safeToken ? `&token=${safeToken}` : '');
}

/** 兼容 string 或 { fileId, fileName }，返回用于回显的完整 URL */
export function getFileViewUrl(item: string | { fileId?: string; fileName?: string } | null | undefined): string {
	if (!item) return '';
	const name = typeof item === 'string' ? item : (item.fileName || item.fileId || '');
	return name ? patchNewFileViewPath(name) : '';
}

export default apiService;