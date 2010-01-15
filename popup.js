var resultdiv;
window.onload = function() {
	document.getElementById('xable').onclick = disable;
	document.getElementById('download').onclick = download;
	document.getElementById('donate').onclick = donate;
	document.popup = true;
	resultdiv = document.getElementById('result');
};
chrome.extension.onRequest.addListener(function(request, sender, sendResponse) { 
	if(request.purpose == "popup")
		resultdiv.innerHTML = request.message;
});
function disable() {
	chrome.extension.sendRequest({"purpose" : "disable"});
}
function enable() {
	chrome.extension.sendRequest({"purpose" : "enable"});
}
function download() {
	chrome.extension.sendRequest({"purpose" : "cache"});
}
function donate() {
	chrome.tabs.create({"url": "http://arienh4.net/donate"});
}