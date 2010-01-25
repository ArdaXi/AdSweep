var disabled = false;
$(document).ready(function(){
	$("#download").text(chrome.i18n.getMessage("updateCache")).click(download);
	$("#donate").text(chrome.i18n.getMessage("donateReq")).click(donate);
	$("#faq").text(chrome.i18n.getMessage("faq")).click(faq);
	document.popup = true;
	chrome.extension.sendRequest({"purpose" : "status"});
});
chrome.extension.onRequest.addListener(function(request, sender, sendResponse) { 
	if(request.purpose == "popup")
		$("#result").html(request.message);
	else if(request.purpose == "pstatus")
	{
		if(request.status == "enabled") {
			$("#site").text(chrome.i18n.getMessage("disableSite")).click(disable);
			$("#xable").show();
			disabled = false;
		}
		else if(request.status == "disabled") {
			$("#site").text(chrome.i18n.getMessage("enableSite")).click(enable);
			$("#xable").show();
			disabled = true;
		}
		else if(request.status == "hdisabled") {
			$("#site").hide();
			$("#xable").hide();
			disabled = true;
		}
		if(request.live == "on") {
			$("#privacy").text(chrome.i18n.getMessage("disable2")).click(disable2);
		}
		else if(request.live == "off") {
			$("#privacy").text(chrome.i18n.getMessage("enable2")).click(enable2);
		}
		if(request.js == "on") {
			$("#javascript").text(chrome.i18n.getMessage("disablejs")).click(disablejs);
		}
		else if(request.js == "off") {
			$("#javascript").text(chrome.i18n.getMessage("enablejs")).click(enablejs);
		}
	}
});
function disable() {
	chrome.extension.sendRequest({"purpose" : "disable"});
	window.close();
}
function enable() {
	chrome.extension.sendRequest({"purpose" : "enable"});
	window.close();
}
function disable2() {
	chrome.extension.sendRequest({"purpose" : "live","mode" : "off","disabled" : disabled});
	window.close();
}
function enable2() {
	chrome.extension.sendRequest({"purpose" : "live","mode" : "on","disabled" : disabled});
	window.close();
}
function disablejs() {
	chrome.extension.sendRequest({"purpose" : "js","mode" : "off","disabled" : disabled});
	window.close();
}
function enablejs() {
	chrome.extension.sendRequest({"purpose" : "js","mode" : "on","disabled" : disabled});
	window.close();
}
function download() {
	chrome.extension.sendRequest({"purpose" : "cache"});
}
function donate() {
	chrome.tabs.create({"url": "http://arienh4.net/donate"});
}
function faq() {
	chrome.tabs.create({"url": "http://arienh4.net/adsweep"});
}