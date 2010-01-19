$(document).ready(function(){
	$("#disable").text(chrome.i18n.getMessage("disableSite")).click(disable);
	$("#enable").text(chrome.i18n.getMessage("enableSite")).click(enable);
	$("#disableprivacy").text(chrome.i18n.getMessage("disablePrivacy")).click(disableprivacy);
	$("#enableprivacy").text(chrome.i18n.getMessage("enablePrivacy")).click(enableprivacy);
	$("#download").text(chrome.i18n.getMessage("updateCache")).click(download);
	$("#donate").text(chrome.i18n.getMessage("donateReq")).click(donate);
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
		if(request.privacy == "on") {
			$("#enableprivacy").hide();
			$("#disableprivacy").show();
		}
		else if(request.privacy == "off") {
			$("#disableprivacy").hide();
			$("#enableprivacy").show();
		}
	}
});
function disable() {
	chrome.extension.sendRequest({"purpose" : "disable"});
}
function enable() {
	chrome.extension.sendRequest({"purpose" : "enable"});
}
function disableprivacy() {
	chrome.extension.sendRequest({"purpose" : "privacy","mode" : "off"});
}
function enableprivacy() {
	chrome.extension.sendRequest({"purpose" : "privacy","mode" : "on"});
}
function download() {
	chrome.extension.sendRequest({"purpose" : "cache"});
}
function donate() {
	chrome.tabs.create({"url": "http://arienh4.net/donate"});
}