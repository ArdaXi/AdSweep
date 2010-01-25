var icon;
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
	if(localStorage["live"] == "on")
		icon = "icons/icon32.live.png";
	else
		icon = "icons/icon32.png";
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
				chrome.extension.sendRequest({"purpose":"popup","message":"Disabled."});
				chrome.browserAction.setIcon({"path":"icons/icon32.gray.png","tabId":tab.id});
				chrome.tabs.update(tab.id, {"url":tab.url});
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
				chrome.browserAction.setIcon({"path":icon,"tabId":tab.id});
				chrome.extension.sendRequest({"purpose":"pstatus","status":"enabled"});
				chrome.extension.sendRequest({"purpose":"popup","message":"Re-enabled."});
				chrome.tabs.update(tab.id, {"url":tab.url});
			}
			else
				chrome.extension.sendRequest({"purpose":"popup","message":"Something went wrong, please try again."});
		});
	}
	else if(request.purpose == "status") {
		chrome.tabs.getSelected(null, function(tab) {
			if(localStorage["live"] == undefined)
				localStorage["live"] = "off";
			if(localStorage["js"] == undefined)
				localStorage["js"] = "off";
			var domain = tab2domain(tab);
			if(tab.url.substr(0,5) != "http:")
				chrome.extension.sendRequest({"purpose":"pstatus","status":"hdisabled","live":localStorage["live"],"js":localStorage["js"]});
			else if(localStorage["exceptions"] && localStorage["exceptions"].indexOf(domain) != -1)
				chrome.extension.sendRequest({"purpose":"pstatus","status":"disabled","live":localStorage["live"],"js":localStorage["js"]});
			else
				chrome.extension.sendRequest({"purpose":"pstatus","status":"enabled","live":localStorage["live"],"js":localStorage["js"]});
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
		if(request.disabled == true)
			return;
		if(localStorage["live"] == "on")
			icon = "icons/icon32.live.png";
		else
			icon = "icons/icon32.png";
		chrome.browserAction.setIcon({"path":icon});
	}
	else if(request.purpose == "js") {
		localStorage["js"] = request.mode;
		chrome.extension.sendRequest({"purpose":"pstatus","js":localStorage["js"]});
	}
	sendResponse({});
};
var onUpdated = function(tabId, changeInfo, tab) {
	if(changeInfo.status != "loading") return;
	var domain = tab2domain(tab);
	if(localStorage["exceptions"] && localStorage["exceptions"].indexOf(domain) != -1 || tab.url.substr(0,5) != "http:") {
		chrome.browserAction.setIcon({"path":"icons/icon32.gray.png","tabId":tabId});
		return;
	}
	chrome.browserAction.setIcon({"path":icon});
	var common;
	if(localStorage['common'])
		 common = JSON.parse(localStorage['common']);
	var domrules;
	if(localStorage[domain]) {
		domrules = JSON.parse(localStorage[domain]);
		domrules.js = (localStorage["js"] == "on") ? undefined : domrules.js;
		insertCode(tabId, domrules.css, domrules.js);
	}
	if(common) {
		chrome.tabs.insertCSS(tabId, {code:common.css});
		if(localStorage["js"] == "on")
			chrome.tabs.executeScript(tabId, {code:common.js});
	}
	if(localStorage["live"] == "off") return;
	$.getJSON("http://json.adsweep.org/adengine.php?domain="+domain+"&callback=?", function(data){
		data.commonjs = Base64.decode(data.commonjs);
		data.js = Base64.decode(data.js);
		var css, js;
		if(common == undefined || common.css != data.common)
			chrome.tabs.insertCSS(tabId, {code:data.common});
		if(common == undefined || common.js != data.commonjs && localStorage["js"] == "on")
			chrome.tabs.executeScript(tabId, {code:data.commonjs});
		if(!data.site || data.site == "") return;
		if(domrules.css != data.css)
			chrome.tabs.insertCSS(tabId, {code:data.css});
		if(domrules.js != data.js && localStorage["js"] == "on")
			chrome.tabs.executeScript(tabId, {code:data.js});
		var common = {"css":data.common,"js":data.commonjs};
		localStorage["common"] = JSON.stringify(common);
		var site = {"css":data.css,"js":data.js};
		localStorage[data.site] = JSON.stringify(site);
	});
};