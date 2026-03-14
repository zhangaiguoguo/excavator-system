let BACKEND_BASEURL = "http://192.168.0.115:3000";

if (process.env.NODE_ENV === 'development') {
	BACKEND_BASEURL = "http://192.168.5.110:3000";
} else {
	// 生产环境地址
	BACKEND_BASEURL = "https://your-production-url.com";
}

let staticDomainURL = BACKEND_BASEURL + '/sys/common/static';

/** 客服电话（联系客服时拨打，可随环境配置） */
const CUSTOMER_SERVICE_PHONE = '400-xxx-xxxx';

const configService = {
	apiUrl: BACKEND_BASEURL,
	staticDomainURL: staticDomainURL,
	/** 我的客服 - 联系电话 */
	customerServicePhone: CUSTOMER_SERVICE_PHONE,
};
export default configService