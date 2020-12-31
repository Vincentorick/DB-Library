'use strict';

exports.html = {
	begin: '<html><head><META HTTP-EQUIV="Content-Type" Content="text-html; charset=utf-8"></head><body>',
	end: '</body></html>',
	success: "<html><body><div id='result' style='display:none'>0</div>成功</body></html>",
	inputError: "<html><body><div id='result' style='display:none'>2</div>提交的参数有误</body></html>"
};

exports.regEx = {
	posInt: /^[1-9]\d*$/,
	date: /^(?:(?!0000)[0-9]{4}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1[0-9]|2[0-8])|(?:0[13-9]|1[0-2])-(?:29|30)|(?:0[13578]|1[02])-31)|(?:[0-9]{2}(?:0[48]|[2468][048]|[13579][26])|(?:0[48]|[2468][048]|[13579][26])00)-02-29)$/
}