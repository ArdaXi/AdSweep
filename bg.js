chrome.extension.onConnect.addListener(function(port) {
// This anonymous function is called when a port is opened.
// A port is used for messaging.
	port.onMessage.addListener(function(msg) {
	// This function is called when a message is received.
		// The message is a JSON object, the nature is stored in purpose.
		
	});
});
var disDomain;
chrome.extension.onRequest.addListener(function(request, sender, sendResponse) { 
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
	else if(request.purpose == "cache") {
		chrome.extension.sendRequest({"purpose":"popup","message":"Downloading cache, please wait."});
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
			if(xhr.readyState == 4) {
				if(xhr.status == 200) {
					var object = JSON.parse(xhr.responseText);
					for( i in object.rules ) {
						var site = object.rules[i].site;
						var array = new Array(2);
						array[0] = object.rules[i].css;
						array[1] = object.rules[i].js;
						setLocal(array, site);
					}
					chrome.extension.sendRequest({"purpose":"popup","message":"Cache is updated."});
				}
				else {
					chrome.extension.sendRequest({"purpose":"popup","message":"Something went wrong updating the cache."});
				}
			}
		};
		// Retrieve all the rules.
		xhr.open("GET", "http://json.adsweep.org/adengine.php", true);
		xhr.send(null);
	}
	sendResponse({});
});
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

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	if(changeInfo.status != "loading") return;
	if(tab.url.substr(0,5) != "http:") return;
	var domain = tab2domain(tab);
	if(localStorage["exceptions"] && localStorage["exceptions"].indexOf(domain) != -1) return;
	if(localStorage['common'])
		var common = getLocal('common');
	if(localStorage[domain]) {
		var domrules = getLocal(domain);
		insertCode(tabId, domrules[0], domrules[1]);
	}
	if(common)
		insertCode(tabId, common[0], common[1]);
	
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if(xhr.readyState == 4 && xhr.status == 200)
		{
			var response = JSON.parse(xhr.responseText);
			var array = new Array(2);
			var common = new Array(2);
			setLocal(new Array(response.common, response.commonjs), 'common');
			insertCode(tabId, response.common, response.commonjs);
			if(!response.site || response.site == "") return;
			insertCode(tabId, response.css, response.js);
			setLocal(new Array(response.css, response.js), response.site);
		}
	};
	xhr.open("GET", "http://json.adsweep.org/adengine.php?domain="+domain, true);
	xhr.send(null);
});