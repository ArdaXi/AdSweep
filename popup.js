var resultdiv;
window.onload = function() {
	document.getElementById('disable').onclick = disable;
	document.getElementById('download').onclick = download;
	resultdiv = document.getElementById('result');
};
function disable() {
	chrome.extension.sendRequest({"purpose" : "disable"}, function(response) {
		if(response.result == "good")
			resultdiv.innerHTML = "Disabled. You need to refresh before it'll take effect.";
		else
			resultdiv.innerHTML = "Something went wrong, please try again.";
	});
}
function download() {
	var port = chrome.extension.connect();
	var count;
	port.postMessage({"purpose" : "cache"});
	resultdiv.innerHTML = "Updating cache, please wait.";
	port.onMessage.addListener(function(response) {
		if(response.content == "count") {
			count = response.count;
			resultdiv.innerHTML = "Downloading rules into cache.";
			return;
		}
		if(response.content == "progress") {
			resultdiv.innerHTML = "Downloading rules, "+response.progress+"/"+count+".";
			return;
		}
		if(response.result == "good") {
			resultdiv.innerHTML = "Cache is updated.";
			return;
		}
		resultdiv.innerHTML = "Something went wrong updating the cache.";
	});
}