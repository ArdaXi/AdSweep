// ==UserScript==
// @name AdSweep
// @description An online ad-removal tool for your favorite web browser.
// @author arienh4, based on the original AdSweep by Charles L.
// @namespace http://www.adsweep.org
// @license MIT
// @version 2.0.1
// @run-at document-start
// ==/UserScript==
/*
	Copyright (c) 2009 Ariën Holthuizen

	Permission is hereby granted, free of charge, to any person
	obtaining a copy of this software and associated documentation
	files (the "Software"), to deal in the Software without
	restriction, including without limitation the rights to use,
	copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the
	Software is furnished to do so, subject to the following
	conditions:

	The above copyright notice and this permission notice shall be
	included in all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
	EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
	OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
	NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
	HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
	WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
	FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
	OTHER DEALINGS IN THE SOFTWARE.
*/

adsweep();

var version = '2.0.1', mainurl, commonurl, cssurl, domain; function $(ID) {return document.getElementById(ID);}

function adsweep(){
		if(location.href){
			window.adsweepVersion=version;
			window.ua=navigator.userAgent;
			window.URL = location.href;
			mainurl = "http://arienh4.net.nyud.net/";
			commonurl = mainurl + "common.ads";
			domain = document.domain.replace(/(?:.*\.)?(.*\..*)/g, "$1");
			cssurl = mainurl + "adengine.php?site="+domain;
			if(ua.match(/Chrom(ium|e)|Iron/)){
				var countTries=0;
				function checkDOM(){
					if(countTries<120){
						if(document.getElementsByTagName("HEAD")[0] && document.getElementsByTagName("BODY")[0]){
								adsweep_core();
								window.addEventListener("load", adsweep_removeAdNodes, false);
								window.addEventListener("load", adsweep_installCheck, false);
						} else {
							countTries++;
							window.setTimeout(checkDOM,250);
						}
					}
				}
				checkDOM();
			} else if(ua.match("Gecko")) {
				if(loaded)
					adsweep_core();
				window.addEventListener("load", function(){window.setTimeout(adsweep_removeAdNodes,1000);}, false);
				window.addEventListener("load", adsweep_installCheck, false);
			} else if(ua.match("Opera")) {
				if(loaded)
					adsweep_core();
				document.addEventListener("DOMContentLoaded", adsweep_removeAdNodes, false);
				document.addEventListener("DOMContentLoaded", adsweep_installCheck, false);
			}
		}
}

function adsweep_core(){
	function createLink(url)
	{
		var link = document.createElement('link');
		link.rel = "stylesheet";
		link.type = "text/css";
		link.href = url;
		document.getElementsByTagName("head")[0].appendChild(link);
	}
	createLink(commonurl)
	createLink(cssurl);
}
function adsweep_removeAdNodes()
{
	adsweep_YouTube();
	window.setTimeout(function()
	{		
		// AdBrite
		if(document.getElementsByTagName("A")){var anchorTags=document.getElementsByTagName("A");for(var a=0;a<anchorTags.length;a++){for(var x=0;x<anchorTags[a].attributes.length;x++){if(anchorTags[a].attributes[x].nodeName.toLowerCase()=='id'){if(anchorTags[a].attributes[x].nodeValue.indexOf("AdBriteInlineAd")!=-1){var textString=anchorTags[a].innerHTML;var newNode=document.createElement('SPAN');newNode.innerHTML=textString;anchorTags[a].parentNode.insertBefore(newNode,anchorTags[a]);}}}}}
		
		// Infolinks
		if(document.getElementsByTagName("SPAN")){var spanTags=document.getElementsByTagName("SPAN");for(var a=0;a<spanTags.length;a++){for(var x=0;x<spanTags[a].attributes.length;x++){if(spanTags[a].attributes[x].nodeName.toLowerCase()=='class'){if(spanTags[a].attributes[x].nodeValue=='IL_LINK_STYLE'){var textString=spanTags[a].innerHTML;var newNode=document.createElement('LABEL');newNode.innerHTML=textString;spanTags[a].parentNode.insertBefore(newNode,spanTags[a]);spanTags[a].parentNode.removeChild(spanTags[a]);}}}}}
	
		// Kontera
		if(document.getElementsByTagName("A")){var anchorTags=document.getElementsByTagName("A");for(var a=0;a<anchorTags.length;a++){for(var x=0;x<anchorTags[a].attributes.length;x++){if(anchorTags[a].attributes[x].nodeName.toLowerCase()=='class') {if(anchorTags[a].attributes[x].nodeValue=='kLink'){var textString=anchorTags[a].childNodes[0].childNodes[0].innerHTML;var newNode=document.createElement('SPAN');newNode.innerHTML=textString;anchorTags[a].parentNode.insertBefore(newNode,anchorTags[a]);anchorTags[a].parentNode.removeChild(anchorTags[a]);}}}}}
	
		// VibrantMedia
		if(document.getElementsByTagName("A")){var anchorTags=document.getElementsByTagName("A");for(var a=0;a<anchorTags.length;a++){for(var x=0;x<anchorTags[a].attributes.length;x++){if(anchorTags[a].attributes[x].nodeName.toLowerCase()=='class') {if(anchorTags[a].attributes[x].nodeValue=='iAs'){var textString=anchorTags[a].innerHTML;var newNode=document.createElement('SPAN');newNode.innerHTML=textString;anchorTags[a].parentNode.insertBefore(newNode,anchorTags[a]);anchorTags[a].parentNode.removeChild(anchorTags[a]);}}}}}
	},50);
	
		// Hide content using Javascript on specific sites once the page is loaded
	
		if(URL.match("distrowatch.com")){ if(document.getElementsByTagName("TABLE")){ if(document.getElementsByTagName("TABLE")[0].nextSibling){ if(document.getElementsByTagName("TABLE")[0].nextSibling.nextSibling){ var tbTag=document.getElementsByTagName("TABLE")[0].nextSibling.nextSibling; if(tbTag.innerHTML){ if(tbTag.innerHTML.match("pagead2")){ if(tbTag.tagName){ tbTag.style.display='none'; } } } } } } if(document.getElementsByTagName("TD")){ var tdTag=document.getElementsByTagName("TD"); for(a=0;a<tdTag.length;a++){ if(tdTag[a].innerHTML){ if(tdTag[a].innerHTML.match(/^Sponsored Message$|^???????????? ??????$|^????????? ?????$|^?????????? ???????????$|^Wiadomosc sponsorowana$|^Pesan Sponsor$|^?????? ????? ????$|^????$|^Remeju Žinute$|^?????? ?????$|^Sponzorji - sporocila$|^Gesponsord Bericht$|^Message de pub$|^Mensaje patrocinado$|^Sponsorennachricht$|^Sponsoroitu viesti$|^???????????? ?????????$|^????$|^Sponsorun Mesaji$|^Missatge patrocinat$|^???????? ??????$|^????µa ???????$|^???????????? ????????$|^Szponzorált üzenet$|^???? ?? ?????$|^Mensagem de Publicidade$|^Sponsoreeritud teade$|^Sponsoreret Besked$|^???? ????????$|^???????????? ????????????$|^Messaggio sponsorizzato$|^Sponzorske poruke$/)){ if(tdTag[a].parentNode){ if(tdTag[a].parentNode.parentNode){ if(tdTag[a].parentNode.parentNode.parentNode){ if(tdTag[a].parentNode.parentNode.parentNode.parentNode){ if(tdTag[a].parentNode.parentNode.parentNode.parentNode.parentNode){ var hideTag=tdTag[a].parentNode.parentNode.parentNode.parentNode.parentNode; if(hideTag.tagName){ hideTag.style.display='none'; } } } } } } } } } } if(document.getElementsByTagName("TH")){ var thTags=document.getElementsByTagName("TH"); for(a=0;a<thTags.length;a++){ if(thTags[a].innerHTML.match(/^Linux Netbooks$|^???????????$|^????????$|^Advertisement$|^??????????$|^Reklamy$|^Iklan$|^??????$|^??$|^Reklam$|^?????$|^Reklama$|^Advertentie$|^Oglaševanje$|^Advertisement$|^Anuncions$|^Annonce$|^Werbung$|^Mainos$|^Anunci$|^??af?µ?s?$|^Hirdetés$|^???????$|^??$|^Publicidade$|^????????$|^Reklaam$|^??????$|^?????????$|^Reklame$|^???????$|^???????$|^Pubblicità$|^Oglas$/)){ if(thTags[a].parentNode){ if(thTags[a].parentNode.parentNode){ var hideTag=thTags[a].parentNode.parentNode; if(hideTag.tagName){ hideTag.style.display='none'; } } } } } } if(document.getElementsByTagName("A")){ var aTags=document.getElementsByTagName("A"); for(var a=0;a<aTags.length;a++){ if(aTags[a].innerHTML.match(/vpslink|osdisc|3cx|Acunetix/)){ if(aTags[a].parentNode){ if(aTags[a].parentNode.parentNode){ if(aTags[a].parentNode.parentNode.parentNode){ if(aTags[a].parentNode.parentNode.parentNode.parentNode){ var hideTag=aTags[a].parentNode.parentNode.parentNode.parentNode; if(hideTag.tagName){ hideTag.style.display='none'; } if(hideTag.nextSibling){ if(hideTag.nextSibling.nextSibling){ var hideTag2=hideTag.nextSibling.nextSibling; if(hideTag2.tagName){ hideTag2.style.display='none'; } } } } } } } } if(aTags[a].innerHTML){ if(aTags[a].innerHTML.match(/linuxidentity|linuxcd/)){ if(aTags[a].parentNode){ if(aTags[a].parentNode.parentNode){ if(aTags[a].parentNode.parentNode.parentNode){ if(aTags[a].parentNode.parentNode.parentNode.parentNode){ var hideTag=aTags[a].parentNode.parentNode.parentNode.parentNode; hideTag.style.display='none'; if(hideTag.nextSibling){ if(hideTag.nextSibling.tagName){ var hideTag2=hideTag.nextSibling; hideTag2.style.display='none'; } } } } } } } } } } if(document.getElementsByTagName("FORM")){ var formTags=document.getElementsByTagName("FORM"); for(a=0;a<formTags.length;a++){ for(var x=0;x<formTags[a].attributes.length;x++){ if(formTags[a].attributes[x].nodeName.toLowerCase()=='name') { if(formTags[a].attributes[x].nodeValue=='Dataspan'){ if(formTags[a].parentNode){ if(formTags[a].parentNode.parentNode){ if(formTags[a].parentNode.parentNode.parentNode){ if(formTags[a].parentNode.parentNode.parentNode.parentNode){ if(formTags[a].parentNode.parentNode.parentNode.parentNode.previousSibling){ if(formTags[a].parentNode.parentNode.parentNode.parentNode.previousSibling.previousSibling){ hideTag=formTags[a].parentNode.parentNode.parentNode.parentNode.previousSibling.previousSibling; if(hideTag.tagName){ hideTag.style.display='none'; } } } } } } } } } } } } document.getElementsByTagName("BODY")[0].style.display='block'; }
		if(URL.match("forums.futura-sciences.com")){var nodes=document.getElementsByClassName("page");for(var i=0;i<nodes.length;i++){if(nodes[i].innerHTML){if(nodes[i].innerHTML.match('Liens sponsoris')){nodes[i].parentNode.removeChild(nodes[i]);}}} var nodes=document.getElementsByTagName("TD");for(var i=0;i<nodes.length;i++){if(nodes[i].innerHTML){if(nodes[i].innerHTML.match('Futura Sciences n\'est pas responsable du contenu de ces publicit')){var node=nodes[i].parentNode.parentNode.parentNode.parentNode.parentNode.getElementsByTagName("DIV")[0];node.parentNode.removeChild(node);}}}}
		if(URL.match("mashable.com")){if(document.getElementsByTagName("H3")){ var h3Tags=document.getElementsByTagName("H3"); for(var a=0;a<h3Tags.length;a++){ if(h3Tags[a].innerHTML=="Mashable Partners"){ var hideElement=h3Tags[a].parentNode.parentNode; hideElement.parentNode.removeChild(hideElement); } } } if(document.getElementsByTagName("H3")){ var h3Tags=document.getElementsByTagName("H3"); for(var a=0;a<h3Tags.length;a++){ if(h3Tags[a].innerHTML=="Sun Startup Essentials"){ var hideElement=h3Tags[a].parentNode.parentNode; hideElement.parentNode.removeChild(hideElement); } } } if(document.getElementsByTagName("P")){ var pTags=document.getElementsByTagName("P"); for(var a=0;a<pTags.length;a++){ if(pTags[a].innerHTML=="Sponsored By:"){ pTags[a].parentNode.removeChild(pTags[a]); } } } if(document.getElementsByTagName("A")){ var aTags=document.getElementsByTagName("A"); for(var a=0;a<aTags.length;a++){ if(aTags[a].innerHTML=="Advertise Here"){ var hideElement=aTags[a].parentNode.parentNode.parentNode; hideElement.parentNode.removeChild(hideElement); } } } if(document.getElementsByTagName("STRONG")){ var strongTags=document.getElementsByTagName("STRONG"); for(var a=0;a<strongTags.length;a++){ if(strongTags[a].innerHTML=="Twitter Brand Sponsors"){ var hideElement=strongTags[a].parentNode.parentNode.parentNode.parentNode.parentNode; hideElement.parentNode.removeChild(hideElement);}}}}
		if(URL.match("my.opera.com/community/forums")){if(document.getElementsByClassName('fpost')){var posts = document.getElementsByClassName('fpost');for(var a=0;a<posts.length;a++){if(posts[a].innerHTML.match("882703")){$('content').removeChild(posts[a]);}}}}
		if(URL.match("pcwelt.de")){if(document.getElementsByTagName("A")){ var anchorTags=document.getElementsByTagName("A"); for(var a=0;a<anchorTags.length;a++){ if(anchorTags[a].innerHTML.match("mentasys")){ var hideTag=anchorTags[a].parentNode.parentNode.parentNode.parentNode.parentNode; hideTag.parentNode.removeChild(hideTag); } } } if(document.getElementsByTagName("SPAN")){ var sTags=document.getElementsByTagName("SPAN"); for(var a=0;a<sTags.length;a++){ if(sTags[a].innerHTML.match("Office Anwendung-Software")){ var hideTag=sTags[a].parentNode; hideTag.parentNode.removeChild(hideTag); } } } if(document.getElementsByTagName("SPAN")){ var sTags=document.getElementsByTagName("SPAN"); for(var a=0;a<sTags.length;a++){ if(sTags[a].innerHTML.match("Ligatus")){ var hideTag=sTags[a].parentNode; hideTag.parentNode.removeChild(hideTag); } } } if(document.getElementsByTagName("H1")){ var h1Tags=document.getElementsByTagName("H1"); for(var a=0;a<h1Tags.length;a++){ if(h1Tags[a].innerHTML.match(/^Ligatus/)){ var hideTag=h1Tags[a].parentNode.parentNode.parentNode.parentNode; hideTag.parentNode.removeChild(hideTag); } } } }
		if(URL.match("squidoo.com")){window.setTimeout(function(){if(document.getElementsByTagName("H2")){var hTags=document.getElementsByTagName("H2");for(var a=0;a<hTags.length;a++){if(hTags[a].innerHTML.match("Great Stuff on Amazon")){hTags[a].parentNode.parentNode.removeChild(hTags[a].parentNode);}}}},50);}
		if(URL.match(/lifehacker\.com\/$/m)){if(document.getElementsByTagName("link")){var tag=document.getElementsByTagName("link")[1];var tagC = tag.cloneNode(true);tagC.href="http://tags.lifehacker.com/assets/minify.php?files=/assets/g4.lifehacker.com/css/style.css";tag.parentNode.replaceChild(tagC, tag);}}
		if(URL.match("facepunch.com")){var body=document.getElementsByTagName("body")[1];var tag=body.getElementsByTagName("script")[0];if(tag.src="http://facepunchcom.skimlinks.com/api/skimlinks.js"){tag.parentNode.removeChild(tag);}}
}
function adsweep_YouTube(){
	// Hide YouTube ads, taken from http://userscripts.org/scripts/show/49366
	String.prototype.setVar = function(q, v) {
	var regex = new RegExp("([\&\?])?"+q+"=[^\&\#]*", "g");
	return regex.test(this) ? this.replace(regex, "$1"+q+"="+v) : this+"&"+q+"="+v;
	}

	var mp = $("movie_player");
	if (mp)
	{
		var mpC = mp.cloneNode(true),
			regex = {
					ads:/[\&\?]?(ad_|infringe|invideo|watermark)([^=]*)?=[^\&]*/gi,
					begin_end:/(^[\&\?]*)|([\&\?]*$)/g
					},
			fv = mpC.getAttribute("flashvars").setVar("autoplay", "1").setVar("enablejsapi", "1");
		if(fv.search(regex["ads"]) != -1)
		{
			fv = fv.replace(regex["ads"],"")+"&invideo=false";
			mpC.setAttribute("flashvars", fv.replace(regex["begin_end"],""));
			mp.parentNode.replaceChild(mpC, mp);
		}
	}
}

function adsweep_installCheck(){if((URL.match(/^http:\/\/(www.)?adsweep.org\/$/))){document.getElementsByTagName("BODY")[0].innerHTML += '<div style="position:absolute;top:0;right:0;background:#c00;color:#fff;display:inline;padding:2px 5px">Your AdSweep is currently active (v.'+version+')</div>';}}