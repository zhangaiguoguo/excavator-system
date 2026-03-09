let BACKEND_BASEURL = "http://192.168.0.115:3000";

if (process.env.NODE_ENV === 'development') {
	BACKEND_BASEURL = "http://192.168.0.115:3000";
} else {
	// 生产环境地址
	BACKEND_BASEURL = "https://your-production-url.com";
}

let staticDomainURL = BACKEND_BASEURL + '/sys/common/static';

const configService = {
	apiUrl: BACKEND_BASEURL,
	staticDomainURL: staticDomainURL
};
export default configService