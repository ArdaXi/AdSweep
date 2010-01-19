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