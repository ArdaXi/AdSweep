chrome.extension.onConnect.addListener(function(port) {
	port.onMessage.addListener(function(msg) {
		if(msg.purpose == "cache") {
			var xhr = new XMLHttpRequest();
			xhr.onreadystatechange = function() {
				if(xhr.readyState == 4) {
					if(xhr.status == 200) {
						var object = JSON.parse(xhr.responseText);
						port.postMessage({"content" : "count", "count" : object.count});
						for( i in object.rules ) {
							var site = object.rules[i].site;
							var array = new Array(2);
							array[0] = object.rules[i].css;
							array[1] = object.rules[i].js;
							setLocal(array, site);
							port.postMessage({"content": "progress", "progress" : i});
						}
						port.postMessage({"content": "result", "result" : "good"});
					}
					else {
						port.postMessage({"content": "result", "result" : "bad"});
					}
				}
			};
			xhr.open("GET", "http://json.adsweep.org/adengine.php", true);
			xhr.send(null);
		}
	});
});
var disDomain;
chrome.extension.onRequest.addListener(listener);
function listener(request, sender, sendResponse) { 
	if(request.purpose == "cache") {
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
						console.log(site);
					}
					sendResponse({"result" : "good"});
				}
				else {
					sendResponse({"result" : "bad"});
				}
			}
		};
		xhr.open("GET", "http://json.adsweep.org/adengine.php", true);
		xhr.send(null);
	}
	if(request.purpose == "disable") {
		chrome.tabs.getSelected(null, function(tab) {
			var disDomain = exDomain(tab.url);
			console.log("Disabling "+disDomain);
			if(!localStorage["exceptions"])
				localStorage["exceptions"] = disDomain;
			else
				localStorage["exceptions"] += ","+disDomain;
			if(localStorage["exceptions"] && localStorage["exceptions"].indexOf(disDomain) != -1)
				sendResponse({"result" : "good"});
			else
				sendResponse({"result" : "bad"});
		});
	}
}
function insertCode(tabId, css, js) {
	if(css) chrome.tabs.insertCSS(tabId, {code:css});
	if(js) chrome.tabs.executeScript(tabId, {code:js});
}
function getLocal(key) {
	var array = localStorage[key].split("\\a");
	for(x in array)
		if(array[x].indexOf("\\c") != -1)
			array[x] = array[x].split("`");
	return array;
}
function setLocal(array, key) {
	for (var i=0, l=array.length; i<l; i++){
		if (array[i] instanceof Array){
			array[i] = array[i].join("`");
		}
	}
	var string = array.join("@");
	localStorage[key] = string;
}
function exDomain(url) {
	var regex = /\b(https?|ftp):\/\/(?:www\.)?([\-A-Z0-9.]+)(\/[\-A-Z0-9+&@#\/%=~_|!:,.;]*)?(\?[A-Z0-9+&@#\/%=~_|!:,.;]*)?/ig;
	var match = regex.exec(url);
	return match[2];
}
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	if(changeInfo.status != "loading") return;
	if(tab.url.substr(0,5) != "http:") return;
	var domain = exDomain(tab.url);
	console.log("Removing for "+domain);
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