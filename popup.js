$(document).ready(function(){
	$("#disable").click(disable);
	$("#enable").click(enable);
	$("#download").click(download);
	$("#donate").click(donate);
	document.popup = true;
	chrome.extension.sendRequest({"purpose" : "status"});
});
chrome.extension.onRequest.addListener(function(request, sender, sendResponse) { 
	if(request.purpose == "popup")
		$("#result").text(request.message);
	else if(request.purpose == "pstatus")
	{
		if(request.status == "enabled") {
			$("#enable").hide();
			$("#disable").show();
		}
		else if(request.status == "disabled") {
			$("#disable").hide();
			$("#enable").show();
		}
	}
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