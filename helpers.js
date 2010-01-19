/**
 * Inserts code into given tab.
 * @param tabId The id corresponding to the tab to insert into.
 * @param css A string containing CSS code to inject.
 * @param js A string containing Javascript code to inject.
 */
function insertCode(tabId, css, js) {
	if(typeof css == "string") chrome.tabs.insertCSS(tabId, {code:css});
	if(typeof js == "string") chrome.tabs.executeScript(tabId, {code:js});
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
/**
 * Retrieves just the hostname of a given tab.
 * @param tab The tab from which to extract the hostname.
 * @return A string containing the hostname for the given tab.
 */
function tab2domain(tab) {
	var myregexp = /[a-z][a-z0-9+\-.]*:\/\/(www\.)?([a-z0-9\-_.~%]*)/i;
	var match = myregexp.exec(tab.url);
	if (match != null) {
		result = match[2];
	} else {
		result = false;
	}
	return result;
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