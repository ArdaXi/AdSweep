function insertCode(tabId, css, js) {
	if(css) chrome.tabs.insertCSS(tabId, {code:css});
	if(js) chrome.tabs.executeScript(tabId, {code:js});
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
function cleanURL(str, bDeleteDomain) 
{ 
   if (str == null || str.length == 0) 
   //   return ""; 
       
   var i = str.indexOf("http://"); 
    
   if (i == 0) 
   { 
      str = str.substr(7); 
   } 
   else 
   { 
      i = str.indexOf("https://"); 
       
      if (i == 0) 
      { 
         str = str.substr(8); 
      } 
   } 
             
   i = str.indexOf("?"); 
   if ( i > -1 ) 
      str = str.substring(0,i); 
       
   i = str.indexOf("&"); 
   if ( i > -1 ) 
      str = str.substring(0,i); 

   for (;;) 
   { 
      i = str.lastIndexOf("/"); 
       
      if ( i == -1 || i < (str.length -1) ) 
         break; 
          
      str = str.substring(0,i);          
   } 
    
   while (str.indexOf("/") == 0) 
      str = str.substring(1); 
                               
   if (bDeleteDomain) 
   { 
      i = str.indexOf("/"); 
      if ( i > -1 ) 
      { 
         str = str.substring(i+1);    
      } 
   } 
       
   for (;;) 
   {    
      i = str.indexOf("//"); 
      if (i == -1) 
         break; 
      str = str.replace(/\/\//g, "/"); 
   } 
    
   return str; 
} 
function tab2domain(tab) {
	str = tab.url;
	if (str == null || str.length == 0) 
		return "";
	
	str = cleanURL(str).toLowerCase(); 
	 
	var i = str.indexOf("/"); 
	if (i > -1) 
		str = str.substring(0, i); 
		 
	var parts = str.split('.'); 
	 
	var len = parts.length; 
	 
	if (len < 3) 
		return str; 

	var lastPart = parts[len-1]; 
	var secondPart; 
			 
	secondPart = parts[len-2]; 
	 
	var two = 2; 
	 
	if (lastPart == "uk" && secondPart == "co") 
		++two; 
	 
	if (len >= 0) 
		return parts.splice(len-two, two).join('.'); 
	 
	return false; 
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