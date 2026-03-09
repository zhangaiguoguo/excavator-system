import { ACCESS_TOKEN } from "./constants";;
import { formatDate } from "./fomatDate";
import { toValue } from "vue"
import { getTokenStorage } from "../service/service";


/** 判断是否是OAuth2APP环境 */
export function isOAuth2AppEnv() {
    // #ifdef H5
    return /wxwork|dingtalk/i.test(navigator.userAgent)
    // #endif
    return false;
}

// 获取url中的参数
export const getUrlParams = (url) => {
    let result = {
        url: '',
        params: {}
    };
    let list = url.split('?');
    result.url = list[0];
    let params = list[1];
    if (params) {
        let list = params.split('&');
        list.forEach(ele => {
            let dic = ele.split('=');
            let label = dic[0];
            let value = dic[1];
            result.params[label] = value;
        });
    }
    return result;
};

export function parseParamStrToObject(encodedData) {
    const urlDecodedString = decodeURIComponent(encodedData || "");
    return JSON.parse(urlDecodedString || null)
}

export function calculateDistanceByDelta(latitude1, longitude1, latitude2, longitude2) {
    const R = 6371000; // 地球半径（米）

    // 将经纬度转换为弧度
    const lat1Rad = latitude1 * Math.PI / 180;
    const lon1Rad = longitude1 * Math.PI / 180;
    const lat2Rad = latitude2 * Math.PI / 180;
    const lon2Rad = longitude2 * Math.PI / 180;

    // 计算经纬度差值
    const deltaLat = lat2Rad - lat1Rad;
    const deltaLon = lon2Rad - lon1Rad;

    // 使用勾股定理计算直线距离
    const distance = Math.sqrt(deltaLat * deltaLat + deltaLon * deltaLon) * R;

    return distance;
}

export function getToken() {
    return uni.getStorageSync(ACCESS_TOKEN)
}

export function split(value, symbol = ",") {
    if (isArray(value)) return value
    return typeof value === "string" ? value.split(symbol) : [value];
}

export function packingDictOptions(array, keys = "text-value") {
    const _keys = split(keys, "-");
    return array.map((ii) => {
        return {
            [_keys[0]]: ii,
            [_keys[1]]: ii,
            label: ii,
        };
    });
}

export function splitXG(value) {
    return split(value, "/");
}

export function join(value, symbol = ",") {
    return Array.isArray(value) ? value.join(symbol) : value;
}

export function joinXG(value) {
    return join(value, "/");
}

export function isEmpty(target) {
    return target == null || target === "";
}

/**
 * @param str 单词
 * @return 转换完成的内容
 * @constructor开头大写
 */
export function initialCapitalization(str) {
    return str[0].toUpperCase() + str.slice(1);
}

/***
 * 下划线转驼峰命名法
 * @param field 字段
 */
export function glideToHump(field) {
    return (field.match(new RegExp("[^\_]+", "g")) || []).map((item, index) => {
        return index ? initialCapitalization(item) : item;
    }).join("");
}

export function isArray(target) {
    return !!Array.isArray(target);
}

export function transformArray(target) {
    return isArray(target) ? target : [target];
}


export function transformNamingRules(target) {
    return transformArray(target).map((t) => glideToHump(t));
}

export function clearArray(target) {
    target.splice(0, target.length);
}

export function joinFilterNull(target) {
    return join(target.filter((ii) => !isEmpty(ii)));
}

export function isObject(target) {
    return typeof target === "object" && target !== null;
}

function createTransformDictValueProps(v, v2) {
    return {
        label: v,
        value: arguments.length > 1 ? v2 : v
    }
}

export function is(v, v2) {
    return Object.is(v, v2)
}

export function transformDictValue(value, options, props = createTransformDictValueProps('label', 'value')) {
    const _props = isArray(props) ? createTransformDictValueProps(...props) : props
    const row = toValue(options).find((item) => is(item[_props.value] + "", value + ""))
    return row ? row[_props.label] : value
}

export function transformDictValues(values, options, props) {
    return join(split(values).map((value) => transformDictValue(value, options, props)), dunhaoRef)
}

export const dunhaoRef = "、"

export function filterArrayItem(target) {
    if (!isArray(target)) {
        return [target]
    }
    return target.filter((i) => !isEmpty(i))
}

export function generateDeduplication(flag) {
    return flag ? deduplication : v => v;
}

export function transformUser(...target) {
    const s = filterArrayItem(target).map((i) => split(i)).flat();
    return join(deduplication(s.map((value) => {
        const ss = filterArrayItem(split(value))
        return join(deduplication(ss.map((value2) => transformDictValue(value2, useUserbyList()))),
            dunhaoRef)
    })), dunhaoRef)
}

export function validateCurrentTotal(num, total) {
    return getGlobalPublic().pageSize * (isEmpty(num) ? 1 : num) >= Number(total)
}

export function deduplication(target) {
    if (arguments.length > 1) {
        target = [...target]
    }
    return [...new Set(target)]
}

// // 测试示例
// const userLatitude = 40.7128; // 用户当前位置的纬度
// const userLongitude = -74.0060; // 用户当前位置的经度
// const targetLatitude = 40.7306; // 指定区域的纬度
// const targetLongitude = -73.9352; // 指定区域的经度
//
// const distance = calculateDistanceByDelta(userLatitude, userLongitude, targetLatitude, targetLongitude);
// console.log('距离（米）：', distance);

/**
 * @param target Object
 * @return String ?xxx=xx&xx=xx$...
 * */

export function transformToUrlParam(target, flag = true) {
    let query = ""
    for (let w in target) {
        if (flag && isEmpty(target[w])) continue
        query += ((query ? '&' : "?") + w + "=" + target[w])
    }
    return query
}

export function has(target, key) {
    try {
        return (key in target) || target.hasOwnProperty(key)
    } catch (e) {
    }
    return false
}

export function transformFormatDate(value, format) {
    const _value = transformArray(value)
    return join(filterArrayItem(_value.map((i) => {
        let l;
        if ((globalProperties.maxDateString || (globalProperties.maxDateString = formatDate(
            globalProperties.maxDate))) == (l = formatDate(i, format))) {
            return "/"
        }
        if ((globalProperties.maxDate2String || (globalProperties.maxDate2String = formatDate(
            globalProperties.maxDate2))) == l) {
            return "/"
        }
        return l || i
    })), dunhaoRef)
}

export function isString(target) {
    return typeof target === "string"
}

export function last(target) {
    return target[target.length - 1]
}

/**
 * @param target Object|Object[]
 * @param key String & key extends keyof target
 * @param type Number
 * @param options Number[] | string
 * @param isDedup Boolean
 * @description type = (default 1 : string , 2:dict , 3 : date , 4 : user )
 * @description isDedup default true
 * @returns String
 * */

export function joinTargets(target, key, type = 1, options = [], isDedup = true) {
    key = glideToHump(key)
    const _target = transformArray(target)
    const __ = generateDeduplication(isDedup)
    return join(__(filterArrayItem(_target.map((i) => {
        if (has(i, key)) {
            const value = i[key]
            if (type !== 1) {
                switch (type) {
                    case 2:
                        return transformDictValue(value, options)
                    case 3:
                        return transformFormatDate(value, isString(options) ? options : null)
                    case 4:
                        return transformUser(value)
                    case 5:
                        return transformSampleCategory(value)
                }
            }
            return value
        }
        return null
    }))), dunhaoRef)
}


export function joinTargetsDefault(...target) {
    const symbol = "/"
    return joinTargets(...target) || symbol
}

export function showTargetEmptyDefaultValue(target, defaultValue = "/") {
    return isEmpty(target) ? defaultValue : target
}

export function getTargetProtoType(target) {
    try {
        return target.prototype || target.__proto__
    } catch (e) {
    }
    return null
}

export function isFunction(target) {
    return typeof target === "function"
}

export function extend(target) {
    try {
        return Object.assign(new (target.constructor), target)
    } catch (e) {
    }
    return {
        ...target
    }
}

export function customJoin(target, callback) {
    return join(deduplication(target.map((row) => callback(row))), dunhaoRef)
}

export function JSONParse(...args) {
    if (typeof args[0] !== "string") return args[0]
    return JSON.parse(...args)
}

export function JSONStringify(...args) {
    if (typeof args[0] === "string") {
        return args[0]
    }
    return JSON.stringify(...args)
}

export function deepClone(target) {
    return JSONParse(JSONStringify(target))
}

export function setStringDateFormat(date) {
    if (isString(date)) {
        return date.replace(" ", "+")
    }
    return date
}

export function isMap(target) {
    return target instanceof Map
}

export function isSet(target) {
    return target instanceof Set
}

export function base64ToPdf(base64String, fileName) {
    // 将Base64字符串转换为Uint8Array
    const byteCharacters = atob(base64String);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);

    // 创建Blob对象
    const blob = new Blob([byteArray], {
        type: 'application/pdf'
    });

    // 创建URL并下载文件
    return URL.createObjectURL(blob);
}


export function compareVersion(v1 = '0', v2 = '0') {
    v1 = String(v1).split('.')
    v2 = String(v2).split('.')
    const minVersionLens = Math.min(v1.length, v2.length)

    let result = 0
    for (let i = 0; i < minVersionLens; i++) {
        const curV1 = Number(v1[i])
        const curV2 = Number(v2[i])

        if (curV1 > curV2) {
            result = 1
            break
        } else if (curV1 < curV2) {
            result = -1
            break
        }
    }

    if (result === 0 && (v1.length !== v2.length)) {
        const v1BiggerThenv2 = v1.length > v2.length
        const maxLensVersion = v1BiggerThenv2 ? v1 : v2
        for (let i = minVersionLens; i < maxLensVersion.length; i++) {
            const curVersion = Number(maxLensVersion[i])
            if (curVersion > 0) {
                v1BiggerThenv2 ? result = 1 : result = -1
                break
            }
        }
    }

    return result
}

export function replaceAll(str, find, replace) {
    if (typeof String.prototype.replaceAll === "function") {
        return str.replaceAll(...[...arguments].slice(1))
    }
    // 使用全局搜索的正则表达式（'g' 标志）
    return str.replace(new RegExp(find, 'g'), replace);
}

export function patchCountMax(value, maxValue = 99) {
    if (+value !== value) {
        return value
    }
    return +value > maxValue ? '99+' : value
}

export function antiShakeHandler(fn, timer = 50) {
    let time;
    return function (...args) {
        clearTimeout(time)
        time = setTimeout(() => {
            fn.apply(this, args);
        }, timer)
    }
}

export function NOOP() { }

const CacheType = {
    o: {}
}

export function transFormDicts(arr, callback = NOOP) {
    return arr.map(ii => ({
        text: ii.label,
        value: ii.value,
        ...callback(ii) || CacheType.o,
    }))
}

export function transFormDicts2(arr) {
    return arr.map(ii => ({
        text: ii.label,
        value: ii.value,
        children: ii.children
    }))
}

export function downloadPicture(url) {
    uni.downloadFile({
        url: url, //下载地址接口返回
        header: {
            'Authorization': `Bearer ${getTokenStorage()}`
        },
        success: (data) => {
            if (data.statusCode === 200) {
                //文件保存到本地
                appSaveFileAndOpenFile(data.tempFilePath)
            }
        },
        fail: (err) => {
            console.log(err);
            uni.showToast({
                icon: 'none',
                mask: true,
                title: '失败请重新下载',
            });
        },
    });
}

export function base64ToBlob(base64Data, contentType = '') {
    // 移除 Base64 编码字符串的头部（data:image/png;base64,）
    const binaryString = atob(base64Data.split(',')[1]);
    const length = binaryString.length;
    const bytes = new Uint8Array(length);

    // 将每个字符转换为字节
    for (let i = 0; i < length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }

    // 创建 Blob 对象
    return new Blob([bytes], {
        type: contentType
    });
}

function appSaveFileAndOpenFile(tempFilePath) {
    return new Promise((reslove, reject) => {
        uni.saveFile({
            fail(e) {
                reject(e)
            },
            tempFilePath: tempFilePath, //临时路径
            success: function (res) {
                uni.showToast({
                    icon: 'none',
                    mask: true,
                    title: '文件已保存：' + res.savedFilePath, //保存路径
                    duration: 2000,
                });
                reslove()
                setTimeout(() => {
                    //打开文档查看
                    uni.openDocument({
                        filePath: res.savedFilePath,
                        success: function (res) {
                            console.log('打开文档成功');
                        }
                    });
                }, 500)
            }
        })
    })
}

export function pushDeupArrayItem(arr, v) {
    if (!arr) return
    if (!arr.some((ii) => ii === v)) {
        arr.push(v)
    }
}


export function fillArray(arr, key = "children", callback) {
    if (isArray(arr)) {
        for (let w in arr) {
            this.push(callback(arr[w]));
            fillArray.apply(this, [arr[w][key], key, callback]);
        }
    }
}

export function fillTreeToArray(treeList) {
    const options = [];
    fillArray.apply(options, [treeList, "children", (v) => {
        return extend(v, {
            label: v.positionName,
            value: v.id
        });
    }]);
    return options
}

export function numberShortened(v, v2) {
    const _ = (v) => {
        let i = (v).indexOf(".");
        if (i === -1) {
            i = (v).length;
        }
        return (v).slice(i + 1).length;
    };
    const pw = Math.max(_(v + ""), _(v2 + ""));
    const pws = Math.pow(10, pw);
    return (parseInt(String(v * pws)) - parseInt(String(v2 * pws))) / pws;
}

export function ValidateSameTypeDataFlag(listArray, validateFormatHandle) {

    listArray = transformArray(listArray);

    let prevRow;

    const rowKey = validateFormatHandle;

    let flag = 0;

    if (typeof validateFormatHandle !== "function") {
        validateFormatHandle = (row) => row[rowKey] === prevRow[rowKey];
    } else {
        flag = 1;
    }
    for (let row of listArray) {
        if (prevRow || flag === 1) {
            // @ts-ignore
            if (!validateFormatHandle(row, prevRow)) {
                return row;
            }
        }
        prevRow = row;
    }
}

export function floatingPointNumber(a, b) {
    return floatingPointNumberHandler(a, b);
}

export function toString(target) {
    return toString != null ? String(target) : "";
}

function floatingPointNumberHandler(a, b) {
    //转换为字符串进行解析
    const _a = toString(a);
    const _b = toString(b);
    //查看是否是小数
    const _aArs = _a.split(".");
    const _bArs = _b.split(".");

    //对相加的数值进行补位
    function _run(v, v2) {
        function __(...args) {
            //获取两个数值最大的长度 （有可能为小数）
            const maxLen = Math.max(v.length, v2.length);
            for (let w = 0; w < args.length; w++) {
                if (w > 2) break;
                //数组位数补位
                if (args[w].length < maxLen) {
                    args[w].push("");
                }
                try {
                    //小数位数补位
                    const item_ars = [v[w].length, v2[w].length];
                    const maxLen_ = Math.max(...item_ars);
                    if (v[w].length < maxLen_) {
                        //整数补位
                        let val = v[w] + ("0".repeat(maxLen_ - v[w].length));
                        if (!w) {
                            //小数补位
                            val = ("0".repeat(maxLen_ - v[w].length)) + v[w];
                        }
                        v.splice(w, 1, val);
                    }
                    if (v2[w].length < maxLen_) {
                        let val = v2[w] + ("0".repeat(maxLen_ - v2[w].length));
                        if (!w) {
                            val = ("0".repeat(maxLen_ - v2[w].length)) + v2[w];
                        }
                        v2.splice(w, 1, val);
                    }
                } catch (e) {
                }
            }
        }

        //对数值数组进行加工
        __(...arguments);
        const v___ = v.join("."),
            v2___ = v2.join(".");
        let result = "",
            schedule = 0;
        //数值相加
        for (let w = v___.length - 1; w >= 0; w--) {
            if (!new RegExp("[\\d]+").test(v___[w])) {
                result += v___[w];
                continue;
            }
            let _result = +v___[w] + +v2___[w] + schedule;
            if (_result > 9) {
                schedule = Math.floor(_result / 9);
                _result -= Math.floor(_result / 10) * 10;
            } else {
                schedule = 0;
            }
            result += _result;
        }
        result = result.split("").reverse().join("");
        if (schedule) {
            result = toString(schedule) + result;
        }
        return result;
    }

    return _run(_aArs, _bArs);
}

export function ArrayGroupBy(list, groupByHandle, mapHandler) {
    const mps = new Map();
    for (let w of list) {
        let l;
        if (!mps.has(l = groupByHandle(w))) {
            mps.set(l, []);
        }
        mapHandler && mapHandler(w, mps);
        mps.get(l).push(w);
    }
    return mps;
}

export function ArrayGroupByMap(list, groupByHandle, mapHandler) {
    const mps = new Map();
    for (let w of list) {
        const l = groupByHandle(w);
        mapHandler && mapHandler(w, mps);
        mps.set(l, w);
    }
    return mps;
}

export function pushArrayDuplicate(arr, pushValue, leaveFlag = true) {
    if (isArray(arr))
        if (!arr.some((ii) => leaveFlag ? ii === pushValue : ii == pushValue)) {
            arr.push(pushValue);
        }
}

export function timeDifference(value, currentDate) {
    const now = currentDate || new Date();

    // 获取输入日期时间
    const inputDate = new Date(value); // 假设 inputDateString 是输入的日期字符串

    // 计算两个日期之间的时间差
    const timeDifference = Math.abs(now - inputDate);

    // 将时间差转换为天、小时、分钟
    const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));

    // 输出结果
    return `${days ? days + "天" : ""}${hours ? hours + "小时" : ""}${minutes}分钟`;
}