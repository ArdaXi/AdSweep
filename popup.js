var disabled = false;
$(document).ready(function(){
	$("#disable").text(chrome.i18n.getMessage("disableSite")).click(disable);
	$("#enable").text(chrome.i18n.getMessage("enableSite")).click(enable);
	$("#disable2").text(chrome.i18n.getMessage("disable2")).click(disable2);
	$("#enable2").text(chrome.i18n.getMessage("enable2")).click(enable2);
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
			$("#xable").show();
		}
		else if(request.status == "disabled") {
			$("#disable").hide();
			$("#enable").show();
			$("#xable").show();
			disabled = true;
		}
		else if(request.status == "hdisabled") {
			$("#enable").hide();
			$("#disable").hide();
			$("#xable").hide();
			disabled = true;
		}
		if(request.live == "on") {
			$("#enable2").hide();
			$("#disable2").show();
		}
		else if(request.live == "off") {
			$("#disable2").hide();
			$("#enable2").show();
		}
	}
});
function disable() {
	chrome.extension.sendRequest({"purpose" : "disable"});
}
function enable() {
	chrome.extension.sendRequest({"purpose" : "enable"});
}
function disable2() {
	chrome.extension.sendRequest({"purpose" : "live","mode" : "off","disabled" : disabled});
}
function enable2() {
	chrome.extension.sendRequest({"purpose" : "live","mode" : "on","disabled" : disabled});
}
function download() {
	chrome.extension.sendRequest({"purpose" : "cache"});
}
function donate() {
	chrome.tabs.create({"url": "http://arienh4.net/donate"});
}