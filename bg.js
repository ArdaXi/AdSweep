$(document).ready(function(){
	chrome.extension.onRequest.addListener(requestListener);
	chrome.tabs.onUpdated.addListener(onUpdated);
});
var disDomain;
var requestListener = function(request, sender, sendResponse) { 
	if(request.purpose == "disable") {
		chrome.tabs.getSelected(null, function(tab) {
			var disDomain = tab2domain(tab);
			if(!localStorage["exceptions"])
				localStorage["exceptions"] = disDomain;
			else
				localStorage["exceptions"] += ","+disDomain;
			if(localStorage["exceptions"] && localStorage["exceptions"].indexOf(disDomain) != -1)
				chrome.extension.sendRequest({"purpose":"popup","message":"Disabled. You need to refresh before it'll take effect."});
			else
				chrome.extension.sendRequest({"purpose":"popup","message":"Something went wrong, please try again."});
		});
	}
	else if(request.purpose == "enable") {
		chrome.tabs.getSelected(null, function(tab) {
			var site = tab2domain(tab);
			var array = localStorage["exceptions"].split(",");
			localStorage["exceptions"] = removeItem(array, site).join();
			if(localStorage["exceptions"] && localStorage["exceptions"].indexOf(disDomain) == -1)
				chrome.extension.sendRequest({"purpose":"popup","message":"Re-enabled. You need to refresh before it'll take effect."});
			else
				chrome.extension.sendRequest({"purpose":"popup","message":"Something went wrong, please try again."});
		});
	}
	else if(request.purpose == "cache") {
		chrome.extension.sendRequest({"purpose":"popup","message":"Downloading cache, please wait."});
		$.getJSON("http://json.adsweep.org/adengine.php?callback=?", function(data){
			$.each(data.rules, function(i, item){
				var array = new Array(2);
				array[0] = item.css;
				array[1] = base64.decode(item.js);
				setLocal(array, item.site);
			});
			chrome.extension.sendRequest({"purpose":"popup","message":"Cache is updated. "+data.count+" items downloaded."});
		});
	}
	sendResponse({});
};
function insertCode(tabId, css, js) {
	if(css) chrome.tabs.insertCSS(tabId, {code:css});
	if(js) chrome.tabs.executeScript(tabId, {code:js});
}
function getLocal(key) {
//Getter function for arrays in localStorage.
	var array = localStorage[key].split("@");
	//Take the string and split it into an array.
	for(x in array)
		if(array[x].indexOf("`") != -1)
		//If the item contains an `, it's an array
			array[x] = array[x].split("`");
			//Split it then
	return array;
}
function setLocal(array, key) {
//Setter function for arrays in localStorage
	for (var i=0, l=array.length; i<l; i++){
		if (array[i] instanceof Array){
			array[i] = array[i].join("`");
		}
	}
	var string = array.join("@");
	localStorage[key] = string;
}
function tab2domain(tab) {
	if(tab.url == null)
		return "undefined";
	var regex = /\b(https?|ftp):\/\/(?:www\.)?([\-A-Z0-9.]+)(\/[\-A-Z0-9+&@#\/%=~_|!:,.;]*)?(\?[A-Z0-9+&@#\/%=~_|!:,.;]*)?/ig;
	var match = regex.exec(tab.url);
	if(match == null) return "undefined";
	return match[2];
}
function removeItem(array, item) {
	var i = 0;
	while (i < array.length) {
		if (array[i] == item) {
				array.splice(i, 1);
			} else {
				i++;
			}
		}
	return array;
}
var onUpdated = function(tabId, changeInfo, tab) {
	if(changeInfo.status != "loading") return;
	if(tab.url.substr(0,4) != "http") return;
	var domain = tab2domain(tab);
	if(localStorage["exceptions"] && localStorage["exceptions"].indexOf(domain) != -1) return;
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
	$.getJSON("http://json.adsweep.org/adengine.php?domain="+domain+"&callback=?", function(data){
		data.commonjs = base64.decode(data.commonjs);
		data.js = base64.decode(data.js);
		setLocal(new Array(data.common, data.commonjs), 'common');
		if(common != getLocal('common'))
			insertCode(tabId, data.common, data.commonjs);
		if(!data.site || data.site == "") return;
		var array = new Array(data.css, data.js);
		if(array != domrules) {
			insertCode(tabId, data.css, data.js);
			setLocal(array, response.site);
		}
	});
};