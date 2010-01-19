$(document).ready(function(){
	chrome.extension.onRequest.addListener(requestListener);
	chrome.tabs.onUpdated.addListener(onUpdated);
	if(localStorage["installed"] != "true") {
		$.getJSON("http://json.adsweep.org/adengine.php?callback=?", function(data){
			$.each(data.rules, function(i, item){
				var array = new Array(2);
				array[0] = item.css;
				array[1] = Base64.decode(item.js);
				setLocal(array, item.site);
			});
		});
		localStorage["installed"] = "true";
	}
});
var requestListener = function(request, sender, sendResponse) { 
	if(request.purpose == "disable") {
		chrome.tabs.getSelected(null, function(tab) {
			var site = tab2domain(tab);
			if(!localStorage["exceptions"])
				localStorage["exceptions"] = site;
			else
				localStorage["exceptions"] += ","+site;
			if(localStorage["exceptions"] && localStorage["exceptions"].indexOf(site) != -1)
			{
				chrome.extension.sendRequest({"purpose":"pstatus","status":"disabled"});
				chrome.extension.sendRequest({"purpose":"popup","message":"Disabled. You need to refresh before it'll take effect."});
				chrome.browserAction.setIcon({"path":"icon32.gray.png","tabId":tab.id});
			}
			else
				chrome.extension.sendRequest({"purpose":"popup","message":"Something went wrong, please try again."});
		});
	}
	else if(request.purpose == "enable") {
		chrome.tabs.getSelected(null, function(tab) {
			var site = tab2domain(tab);
			var array = localStorage["exceptions"].split(",");
			localStorage["exceptions"] = removeItem(array, site).join();
			if(localStorage["exceptions"] && localStorage["exceptions"].indexOf(site) == -1)
			{
				chrome.extension.sendRequest({"purpose":"pstatus","status":"enabled"});
				chrome.extension.sendRequest({"purpose":"popup","message":"Re-enabled. You'll need to refresh before it'll take effect."});
				chrome.browserAction.setIcon({"path":"icon32.png","tabId":tab.id});
			}
			else
				chrome.extension.sendRequest({"purpose":"popup","message":"Something went wrong, please try again."});
		});
	}
	else if(request.purpose == "status") {
		chrome.tabs.getSelected(null, function(tab) {
			if(localStorage["privacy"] == undefined)
				localStorage["privacy"] = "off";
			var domain = tab2domain(tab);
			if(localStorage["exceptions"] && localStorage["exceptions"].indexOf(domain) != -1)
				chrome.extension.sendRequest({"purpose":"pstatus","status":"disabled","privacy":localStorage["privacy"]});
			else
				chrome.extension.sendRequest({"purpose":"pstatus","status":"enabled","privacy":localStorage["privacy"]});
		});
	}
	else if(request.purpose == "cache") {
		chrome.extension.sendRequest({"purpose":"popup","message":"Downloading cache, please wait."});
		$.getJSON("http://json.adsweep.org/adengine.php?callback=?", function(data){
			$.each(data.rules, function(i, item){
				var array = new Array(2);
				array[0] = item.css;
				array[1] = Base64.decode(item.js);
				setLocal(array, item.site);
				var x = Math.round((i / data.count)*100);
				chrome.extension.sendRequest({"purpose":"popup","message":"Downloading cache, "+x+"%"});
			});
			chrome.extension.sendRequest({"purpose":"popup","message":"Cache is updated. "+data.count+" items downloaded."});
		});
	}
	else if(request.purpose == "privacy") {
		localStorage["privacy"] = request.mode;
		chrome.extension.sendRequest({"purpose":"pstatus","privacy":localStorage["privacy"]});
	}
	sendResponse({});
};
var onUpdated = function(tabId, changeInfo, tab) {
	if(changeInfo.status != "loading") return;
	if(tab.url.substr(0,5) != "http:") return;
	var domain = tab2domain(tab);
	console.log(domain);
	if(localStorage["exceptions"] && localStorage["exceptions"].indexOf(domain) != -1) {
		chrome.browserAction.setIcon({"path":"icon32.gray.png","tabId":tabId});
		return;
	}
	var common;
	if(localStorage['common'])
		 common = getLocal('common');
	var domrules;
	if(localStorage[domain]) {
		domrules = getLocal(domain);
		insertCode(tabId, domrules[0], domrules[1]);
	}
	if(common)
		insertCode(tabId, common[0], common[1]);
	if(localStorage["privacy"] == "on") return;
	$.getJSON("http://json.adsweep.org/adengine.php?domain="+domain+"&callback=?", function(data){
		data.commonjs = Base64.decode(data.commonjs);
		data.js = Base64.decode(data.js);
		var css, js;
		if(common[0] != data.common)
			css = data.common;
		if(common[1] != data.commonjs)
			js = data.commonjs;
		insertCode(tabId, css, js);
		if(!data.site || data.site == "") return;
		var array = new Array(data.css, data.js);
		if(domrules[0] != data.css)
			css = data.css;
		if(domrules[1] != data.js)
			js = data.js;
		insertCode(tabId, css, js);
		setLocal(new Array(data.common, data.commonjs), 'common');
		setLocal(array, data.site);
	});
};
var onSelected = function(tabId, changeInfo, tab) {
	var domain = tab2domain(tab);
	if(localStorage["exceptions"] && localStorage["exceptions"].indexOf(domain) != -1)
		chrome.browserAction.setIcon({"path":"icon32.gray.png","tabId":tabId});
};