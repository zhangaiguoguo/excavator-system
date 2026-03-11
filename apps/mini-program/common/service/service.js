import Request from "@/common/luch-request/index.js";
import {
	ACCESS_TOKEN
} from "@/common/util/constants.js";
import configService from "./config.service.js";
import tip from "@/common/util/tip.js";
import {
	extend,
	has,
	JSONStringify
} from "../util/util";
import appStore from "@/store/app";

let apiUrl = configService.apiUrl;

export const getTokenStorage = () => {
	let token = "";
	try {
		token = uni.getStorageSync(ACCESS_TOKEN);
	} catch (e) {
		//TODO handle the exception
		console.log(`getTokenStorage -> ${e + ""}`, token);
	}
	return token;
};

const http = new Request();
http.setConfig((config) => {
	/* 设置全局配置 */
	config.baseUrl = apiUrl; /* 根域名不同 */
	config.header = {
		...config.header,
	};
	return config;
});

/**
 * 自定义验证器，如果返回true 则进入响应拦截器的响应成功函数(resolve)，否则进入响应拦截器的响应错误函数(reject)
 * @param { Number } statusCode - 请求响应体statusCode（只读）
 * @return { Boolean } 如果为true,则 resolve, 否则 reject
 */
// 有默认，非必写
http.validateStatus = (statusCode) => {
	return statusCode === 200 || statusCode === 201;;
};

const wordKeys = [
	"lastUpdateTime",
	"lastUpdateDate",
	"createTime",
	"createDate",
];

function filterWordKeys(data) {
	if (typeof data === "object" && data) {
		data = extend(data);
		for (let k in data) {
			if (wordKeys.some((ii) => ii === k)) {
				delete data[k];
			} else {
				data[k] = filterWordKeys(data[k]);
			}
		}
		return data;
	} else {
		return data;
	}
}

http.interceptor.request((config, cancel) => {
	/* 请求之前拦截器 */
	let token = getTokenStorage();
	if (!token) {
		// 如果没有token，尝试获取临时token，但这通常应该是异步的
		// 这里假设已经有逻辑在应用启动时获取临时token
	}
	config.header = {
		...config.header,
		"X-Access-Token": token,
		Authorization: `Bearer ${token}`,
	};
	let data = config.data;
	if (data && (!has(data.isFilterWordKey) || data.isFilterWordKey)) {
		data = filterWordKeys(data);
	}
	config.data = data;
	/*
	  if (!token) { // 如果token不存在，调用cancel 会取消本次请求，但是该函数的catch() 仍会执行
	    cancel('token 不存在') // 接收一个参数，会传给catch((err) => {}) err.errMsg === 'token 不存在'
	  }
	  */
	return config;
});

// 必须使用异步函数，注意
http.interceptor.response(
	async (response) => {
			if (response) {
				// response.data 是后端返回的 JSON { code: 200, msg: "...", data: ... }
				let data = response.data || {};
				const token = uni.getStorageSync(ACCESS_TOKEN);

				// 如果 http 状态码是 200，但业务 code 不是 200
				if (data.code !== 200) {
					switch (data.code) {
						case 201:
						break
						case 401:
							// 未授权，清除 token 并跳转登录（或静默处理）
							uni.removeStorageSync(ACCESS_TOKEN);
							appStore().outLogin()
							// 可以选择触发重新登录逻辑
							break;
						case 403:
							tip.error("拒绝访问");
							break;
						case 500:
							if (!token || data.msg == "Token失效，请重新登录") {
								uni.removeStorageSync(ACCESS_TOKEN);
							}
							tip.alert(data.msg || "系统错误，请联系负责人");
							break;
						default:
							tip.error(data.msg || data.message || "未知错误");
							break;
					}
					// 业务错误，返回 reject
					return Promise.reject(data);
				}

				// 业务成功 (code === 200)，直接返回 data 字段的内容，方便前端直接使用
				// 注意：这里修改了返回值，前端调用 api.then(res => ...) 拿到的 res 就是 data.data
				return data;
			}
			return Promise.reject(response);
		},
		(error) => {
			// HTTP 状态码非 2xx 的情况 (如网络错误，或者后端未捕获的异常)
			console.error('HTTP Error:', error);
			if (error.statusCode) {
				switch (error.statusCode) {
					case 401:
						uni.removeStorageSync(ACCESS_TOKEN);
						break;
					case 403:
						tip.error("拒绝访问");
						break;
					case 404:
						tip.error("资源不存在");
						break;
					case 500:
					case 502:
					case 503:
					default:
						tip.error("服务器错误");
						break;
				}
			} else {
				tip.error("网络连接失败");
			}
			return Promise.reject(error);
		}
);

export {
	http
};