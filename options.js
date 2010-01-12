window.onload = function() {
	restore_options();
	document.getElementById('download').onclick = download;
	document.getElementById('disable').onclick = disable;
	document.getElementById('enable').onclick = enable;
};

function status(text) {
	var status = document.getElementById("status");
	status.innerHTML = text;
	setTimeout(function() { status.innerHTML = ""; }, 1000);
}

function download() {
	status.innerHTML = "Downloading cache...";
	chrome.extension.sendRequest({"purpose" : "cache"});
}

function disable() {
	var input = document.getElementById("addsite");
	var site = input.value;
	if(!localStorage["exceptions"]) {
		localStorage["exceptions"] = site;
	} else {
		localStorage["exceptions"] += ","+site;
	}
	// Update status to let user know options were saved.
	status("Site disabled.");
	
	var y = document.createElement('option');
	y.text=site;
	document.getElementById("remsite").add(y, null);
	remove.style.visibility="visible";
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

function enable() {
	var site = document.getElementById("remsite").value;
	var array = localStorage["exceptions"].split(",");
	localStorage["exceptions"] = removeItem(array, site).join();
}

// Restores select box state to saved value from localStorage.
function restore_options() {
	var sites = localStorage["exceptions"];
	var remove = document.getElementById("remove");
	if (!sites) {
		remove.style.visibility="hidden";
		return;
	}
	remove.style.visibility="visible";
	var array = sites.split(",");
	var select = document.getElementById("remsite");
	for ( x in array ) {
		var y = document.createElement('option');
	y.text=array[x];
		select.add(y, null);
	}
}