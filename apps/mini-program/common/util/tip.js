/**
 * 提示与加载工具类
 */
export default class Tips {
	constructor() {
		this.isLoading = false;
	}

	/**
	 * 弹出提示框
	 */

	static success(title, duration = 1000) {
		if (typeof title === "string") {
			title = {
				title: title
			}
		}
		setTimeout(() => {
			uni.showToast({
				mask: true,
				...title,
				icon: "success",
				duration: duration
			});
		}, 300);
		if (duration > 0) {
			return new Promise((resolve, reject) => {
				setTimeout(() => {
					resolve();
				}, duration);
			});
		}
	}

	/**
	 * 弹出确认窗口
	 */
	static confirm(text, showCancel, payload = {}, title = "提示") {
		return new Promise((resolve, reject) => {
			uni.showModal({
				title: title,
				content: text,
				showCancel: showCancel,
				success: res => {
					if (res.confirm) {
						resolve(payload);
					} else if (res.cancel) {
						reject(payload);
					}
				},
				fail: res => {
					reject(payload);
				}
			});
		});
	}

	static toast(title, onHide, icon = "none") {
		setTimeout(() => {
			uni.showToast({
				title: title,
				icon: icon,
				mask: true,
				duration: 1000
			});
		}, 300);

		// 隐藏结束回调
		if (onHide) {
			setTimeout(() => {
				onHide();
			}, 500);
		}
	}

	static toast2(title, duration = 1500, icon = "none") {
		let res, rej;
		const result = uni.showToast({
			title: title,
			icon: icon,
			duration: duration,
			fail(res) {
				Promise.resolve().then(res)
			},
			success(res) {
				Promise.resolve().then(rej)
			}
		});
		if (typeof(result && result.then) === "function") {
			return result
		}
		return new Promise((resolve, reject) => {
			res = resolve
			rej = reject
		})
	}

	/**
	 * 警告框
	 */
	static alert(title) {
		uni.showToast({
			title: title,
			icon: "none",
			// image: "../../static/alert.png",
			mask: true,
			duration: 1500
		});
	}

	/**
	 * 错误框
	 */

	static error(title, onHide) {
		uni.showToast({
			title: title,
			mask: true,
			duration: 1500,
			icon: "error"
		});
		// 隐藏结束回调
		if (onHide) {
			setTimeout(() => {
				onHide();
			}, 500);
		}
	}

	/**
	 * 弹出加载提示
	 */
	static loading(title = "加载中") {
		if (Tips.isLoading) {
			return;
		}
		Tips.isLoading = true;
		uni.showLoading({
			title: title,
			mask: true
		});
	}

	/**
	 * 加载完毕
	 */
	static loaded() {
		if (Tips.isLoading) {
			Tips.isLoading = false;
			uni.hideLoading();
		}
	}
}

/**
 * 静态变量，是否加载中
 */
Tips.isLoading = false;