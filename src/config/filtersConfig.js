import envConfig from './envConfig.js'

/**
 * 过滤图片路径
 * @return 绝对路径
 */
let fullPath = function(value) {
	if(!value) {
		return '';
	}
	var result = "";
	if(value && value.search('files/') == -1 || value.search('http') != -1){
		result = value;
	}else{
		result = envConfig.serviceUrl + '/' + value;
	}
	return result;
}

/**
 * 图片懒加载过滤器
 * @return 绝对路径
 */
let lazyLoad = function(value) {
	value.src = envConfig.serviceUrl + value
}



let money = (value, style) => { //  货币格式
	/**
	 * style: 
	 *      currency：货币
	 *      number： 数字格式
	 */
	if (style == 'number') { // 数字格式
		return parseFloat(value.replace(/[^\d\.-]/g, ""));
	} else { // 货币格式, 并保留2位小数
		var n = 2;
		value = parseFloat((value + "").replace(/[^\d\.-]/g, "")).toFixed(n) + "";
		var l = value.split(".")[0].split("").reverse(),
			r = value.split(".")[1];
		var t = "";
		for (var i = 0; i < l.length; i++) {
			t += l[i] + ((i + 1) % 3 == 0 && (i + 1) != l.length ? "," : "");
		}
		return t.split("").reverse().join("") + "." + r;
	}
}
// 将字符串转换数组
let split = function(value) {
	
	let data = value.split(',')
	console.log(data);
	if(value.length<1){
		return value
	}
	return data
}

export {
	fullPath,
	lazyLoad,
	money,
	split
};
