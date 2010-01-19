$(document).ready(function(){
	chrome.extension.onRequest.addListener(requestListener);
	chrome.tabs.onUpdated.addListener(onUpdated);
	if(localStorage["installed"] != "true") {
		localStorage["live"] = "off";
		$.getJSON("http://json.adsweep.org/adengine.php?callback=?", function(data){
			$.each(data.rules, function(i, item){
				var object = {};
				object.css = item.css;
				object.js = Base64.decode(item.js);
				localStorage[item.site] = JSON.stringify(object);
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
			if(localStorage["live"] == undefined)
				localStorage["live"] = "off";
			var domain = tab2domain(tab);
			if(localStorage["exceptions"] && localStorage["exceptions"].indexOf(domain) != -1)
				chrome.extension.sendRequest({"purpose":"pstatus","status":"disabled","live":localStorage["live"]});
			else
				chrome.extension.sendRequest({"purpose":"pstatus","status":"enabled","live":localStorage["live"]});
		});
	}
	else if(request.purpose == "cache") {
		chrome.extension.sendRequest({"purpose":"popup","message":"Downloading cache, please wait."});
		$.getJSON("http://json.adsweep.org/adengine.php?callback=?", function(data){
			$.each(data.rules, function(i, item){
				var object = {};
				object.css = item.css;
				object.js = Base64.decode(item.js);
				localStorage[item.site] = JSON.stringify(object);
			});
			chrome.extension.sendRequest({"purpose":"popup","message":"Cache is updated. "+data.count+" items downloaded."});
		});
	}
	else if(request.purpose == "live") {
		localStorage["live"] = request.mode;
		chrome.extension.sendRequest({"purpose":"pstatus","live":localStorage["live"]});
	}
	sendResponse({});
};
var onUpdated = function(tabId, changeInfo, tab) {
	if(changeInfo.status != "loading") return;
	var domain = tab2domain(tab);
	console.log(domain);
	if(localStorage["exceptions"] && localStorage["exceptions"].indexOf(domain) != -1 || tab.url.substr(0,5) != "http:") {
		chrome.browserAction.setIcon({"path":"icon32.gray.png","tabId":tabId});
		return;
	}
	var common;
	if(localStorage['common'])
		 common = JSON.parse(localStorage['common']);
	var domrules;
	if(localStorage[domain]) {
		domrules = JSON.parse(localStorage[domain]);
		insertCode(tabId, domrules.css, domrules.js);
	}
	if(common)
		insertCode(tabId, common.css, common.js);
	if(localStorage["live"] == "off") return;
	$.getJSON("http://json.adsweep.org/adengine.php?domain="+domain+"&callback=?", function(data){
		data.commonjs = Base64.decode(data.commonjs);
		data.js = Base64.decode(data.js);
		var css, js;
		if(common.css != data.common)
			css = data.common;
		if(common.js != data.commonjs)
			js = data.commonjs;
		insertCode(tabId, css, js);
		if(!data.site || data.site == "") return;
		if(domrules.css != data.css)
			css = data.css;
		if(domrules.js != data.js)
			js = data.js;
		insertCode(tabId, css, js);
		var common = {"css":data.common,"js":data.commonjs};
		localStorage["common"] = JSON.stringify(common);
		var site = {"css":data.css,"js":data.js};
		localStorage[data.site] = JSON.stringify(site);
	});
};
var onSelected = function(tabId, changeInfo, tab) {
	var domain = tab2domain(tab);
	if(localStorage["exceptions"] && localStorage["exceptions"].indexOf(domain) != -1)
		chrome.browserAction.setIcon({"path":"icon32.gray.png","tabId":tabId});
};