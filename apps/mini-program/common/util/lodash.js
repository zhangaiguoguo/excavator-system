function orderBy(array, iteratees, orders) {
    if (!Array.isArray(array)) {
        throw new TypeError('The first argument must be an array');
    }

    if (!Array.isArray(iteratees)) {
        throw new TypeError('The second and third arguments must be arrays');
    }
    if (arguments.length === 3) {
        if (iteratees.length !== orders.length) {
            throw new Error('The iteratees and orders arrays must have the same length');
        }
    } else {
        orders = new Array(iteratees.length).fill("asc")
    }

    return array
        .map((item, index) => ({item, index, criteria: []})) // 创建中间对象
        .map(({item, index}) => {
            return {
                item,
                index,
                criteria: iteratees.map(iteratee => {
                    const value = typeof iteratee === 'function' ? iteratee(item) : getNestedValue(item, iteratee);
                    return normalizeValue(value);
                }),
            };
        })
        .sort((a, b) => {
            for (let i = 0; i < a.criteria.length; i++) {
                const order = orders[i].toLowerCase() === 'desc' ? -1 : 1;
                const aValue = a.criteria[i];
                const bValue = b.criteria[i];

                if (aValue !== bValue) {
                    return compareValues(aValue, bValue) * order;
                }
            }
            return a.index - b.index; // 如果所有条件都相等，则按原始索引排序
        })
        .map(({item}) => item); // 提取排序后的元素
}

// 获取嵌套对象的值
function getNestedValue(obj, path) {
    if (typeof path !== 'string') return undefined;

    const keys = path.split('.');
    let value = obj;

    for (const key of keys) {
        if (value == null || typeof value !== 'object' || !(key in value)) {
            return undefined;
        }
        value = value[key];
    }

    return value;
}

// 规范化值（处理特殊类型）
function normalizeValue(value) {
    if (value instanceof Date) {
        return value.getTime(); // 将日期转换为时间戳
    } else if (typeof value === 'string' && isDateString(value)) {
        return new Date(value).getTime(); // 将日期字符串转换为时间戳
    } else if (value == null) {
        return ''; // 将 null 或 undefined 转换为空字符串
    }
    return value;
}

// 判断是否为日期字符串
function isDateString(value) {
    if (typeof value !== 'string') return false;
    return !isNaN(new Date(value).getTime());
}

// 比较两个值
function compareValues(a, b) {
    if (a > b) return 1;
    if (a < b) return -1;
    return 0;
}

export default {
    orderBy
}