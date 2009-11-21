// ==UserScript==
// @name AdSweep
// @description An online ad-removal tool for your favorite web browser.
// @author arienh4, based on the original AdSweep by Charles L.
// @namespace http://www.adsweep.org
// @license MIT
// @version 2.0.2
// @run-at document-start
// ==/UserScript==
/*
	Copyright (c) 2009 Ariën Holthuizen, and Dusan B. Jovanovic

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
//-------------------------------------------------------------------------------------
//
// A micro set of simple utilities
// NOTE! Keep them short and sweet
//
//-------------------------------------------------------------------------------------
// Copyright (c) 2009-2010 by DBJ.ORG
//     Usage is hereby granted to the authors of AdSweep CHROME extensions
//     to be used only inside it, and nowhere else.
//
// micro-engine for simpler AND faster page queries
//
// NOTE! this works in all browser supported by this extension
//       since its using querySelectorAll() method
// NOTE! here error checks are *minimal*, and there are no exceptions whatsoever.
// NOTE! this caches the results and thus works ONLY if you do not 
//       add or remove or change nodes you have been searching for. 
//       if you have use Q.FLUSH() ... see below
//       Which makes it ideal for CHROME extensions
//       2009.OCT.27 dbjdbj@gmail.com  Created
(function () {
 // cache is array indexed by container objects
 var cache = [] ;
 // each cache element is: {  "_container_" : container , "selector" : staticNodeList, ... }
 function cached_selections ( cont )
 {
   // return saved selections for the cont(ainer) or make it if not in the cache
   return cache[cont] || (cache[cont] = { "_container_" : cont }) ;
 }
 // ss is individual cache [] element 
 function cached_result ( ss, sel )
 {
  // take the result or make it and store it if not made
  return ss[sel] = ss[sel] || (ss[sel] = ss._container_.querySelectorAll( sel ));
 }
// the Q method is visible on the level of extension aka "globaly"
// selector is any valid CSS "like" selector
// container method is optional
// returns: always an list of matched elements, with a "length" property
//          no result will return null
Q = function ( selector, container )
{
  var list = [] ;
  if ("string" !== typeof selector  ) return list ;
  if ("object" !== typeof (container || document))  return list ;
      list = cached_result( cached_selections ( container || document ), selector ) ;
  return list.length > 0 ? list : null ;
}
// flush the cache
// the whole 
// or  for the container if given
// and for the selector if given
Q.FLUSH = function ( container, selector ) {  
   if ( container ) {
       if ( ! selector ) {
            cache[container] = null ;
            delete cache[container] ;
            // above leaves 'holes' in the cache 
        }
        else {
            delete cache[container][selector] ;
        }
   } else
       cache = [] ; 
}
// helper : query by ID only, 
// return the first element found by id given
// returns null if no element found
Q.ID = function ( id_string ) 
{
   var list = Q( "#" + id_string, document ) ;
   return list.length > 0 ? list[0] : null ;
}
// use this to replace getElementByClassName
Q.CLASS = function ( class_name )
{
   var list = Q( "." + id_string, document ) ;
   return list.length > 0 ? list[0] : null ;
}
// helper: return true if query has result,
// otherwise null
Q.NULL = function ( selector, container )
{
  return Q(selector, container ).length > 0 ;
}
// for each element found call the function given
Q.EACH = function ( method, selector, container )
{
  if ( "function" !== typeof method ) return ;
  var list = Q( selector, container );
  if ( list )
  for (var j = list.length ; j < list.length; j++ ){
          method( list[j] ) ; // element found is passed as first argument
  }
  
}

})(); // end of Q closure
//-------------------------------------------------------------------------------------
/*
* Author: dbjdbj@gmail.com
* Copyright (c) 2009 by DBJ.ORG
* MIT Licence
*
* Based on :
* http://javascript.nwbox.com/ContentLoaded/
* http://dean.edwards.name/weblog/2006/06/again/
*
*/
function on_content_loaded(FP) 
{
// FP	:   function reference
    var w = window, d = w.document,
		D = 'DOMContentLoaded',
		u = w.navigator.userAgent.toLowerCase(),
		v = parseFloat(u.match(/.+(?:rv|it|ml|ra|ie)[\/: ]([\d.]+)/)[1]);

    function init(e) {
        if (!document.loaded) {
            document.loaded = true;
            // pass a fake event if needed
            FP((e.type && e.type == D) ? e : {
                type: D,
                target: d,
                eventPhase: 0,
                currentTarget: d,
                timeStamp: +new Date,
                eventType: e.type || e
            });
        }
    }

    if (d.addEventListener &&
		(/opera\//.test(u) && v > 9) ||
		(/gecko\//.test(u) && v >= 1.8) ||
		(/khtml\//.test(u) && v >= 4.0) ||
		(/webkit\//.test(u) && v >= 525.13)) {

        d.addEventListener(D,
			function(e) {
			    d.removeEventListener(D, arguments.callee, false);
			    init(e);
			}, false
		);
    } else {
    w.alert("AdSweep ERROR: Unsupported browser!\b" + u + 
        "\n\nSupported hosts are:\n--------------------------------------\n" +
		"\nopera, v > 9" +
		"\ngecko, v >= 1.8" +
		"\nkhtml, v >= 4.0" +
		"\nwebkit, v >= 525.13" );
    }
} // eof on_content_loaded()
//-------------------------------------------------------------------------------------
(function () { // begin adsweep closure
//-------------------------------------------------------------------------------------
var _DEBUG  = true ; // DBJ added

var adsweep = {
    version     :  "2.0.2" ,
    ua          :  navigator.userAgent ,
    url         :  location.href ,
    mainurl     :  "http://arienh4.net.nyud.net/" 
    } ;
    adsweep.commonurl   =  adsweep.mainurl + "common.ads" ;
    adsweep.domain      =  document.domain.replace(/(?:.*\.)?(.*\..*)/g, "$1") ;
    adsweep.cssurl      =  adsweep.mainurl + "adengine.php?site : "+ adsweep.domain ;
    
    adsweep.core        = function (){ function createLink(url_) {
		                var link = document.createElement('link');
		                link.rel = "stylesheet";
		                link.type = "text/css";
		                link.href = url_;
		                document.documentElement.firstChild.appendChild(link);
	                }
	                createLink( adsweep.commonurl)
	                createLink( adsweep.cssurl   );
                } ;
   adsweep.installCheck    = function (){
    if((adsweep.url.match(/^http:\/\/(www.)?adsweep.org\/$/))){
           document.body.innerHTML += 
           '<div style="position:absolute;top:0;right:0;background:#c00;color:#fff;display:inline;padding:2px 5px">Your AdSweep is currently active (v.'
           + adsweep.version +
           ')</div>';
           }
    }                
    
//------------------------------------------------------------------------------------------
 if ( _DEBUG ) {
 window.ADSWEEP = adsweep;
 }
//------------------------------------------------------------------------------------------

// DBJ: only this should be enough for a proper startup
   on_content_loaded( function () {
            try {
                adsweep.core();
	            adsweep.installCheck();
	            // the two above ahould be one function and also a renamed function
	            // for example : adsweep.init()
	            var tid = setTimeout( function () {
	                clearTimeout(tid); delete tid;
	                adsweep_removeAdNodes();
	            },10);
            } catch(x) {
               alert("Exception in adsweep constructor:\n\n" + x ) ;
            }
	    } 
	) ;
/*	
if(adsweep.ua.match(/Chrom(ium|e)|Iron/)){
	var countTries=0;
	function checkDOM(){
		if(countTries<120){
			if(Q("HEAD") && Q("BODY")){
				adsweep.core();
				window.addEventListener("load", adsweep_removeAdNodes, false);
				window.addEventListener("load", adsweep.installCheck, false);
			} else {
				countTries++;
				window.setTimeout(checkDOM,250);
			}
		}
	}
	checkDOM();
} else if(adsweep.ua.match("Gecko")) {
	if(loaded) // DBJ: where is this variable comming from ?
		adsweep.core();
	window.addEventListener("load", function(){window.setTimeout(adsweep_removeAdNodes,1000);}, false);
	window.addEventListener("load", adsweep.installCheck, false);
} else if(adsweep.ua.match("Opera")) {
	if(loaded)
		adsweep.core();
	document.addEventListener("DOMContentLoaded", adsweep_removeAdNodes, false);
	document.addEventListener("DOMContentLoaded", adsweep.installCheck, false);
}
*/

//--------------------------------------------------------------------------------------------------
function adsweep_removeAdNodes()
{
    if ( Q("#movie_player", document.body ) ) // DBJ: added
	    adsweep_YouTube();
//  DBJ: above 'movie_player' is very common ID, so this will sweep possibly many other movie players ?	    
//  DBJ: the whole call to adsweep_removeAdNodes() is inside separate timeout
//	window.setTimeout(function()
//	{		
		// AdBrite
		Q.EACH( 
		function ( anchor ) {
		   if ( (! anchor ) || (! anchor.parentNode)) return ;
           var textString=anchor.innerHTML,
               newNode=document.createElement('SPAN');
               newNode.innerHTML=textString;
               anchor.parentNode.insertBefore(newNode,anchor);
		}
		,"a[id='AdBriteInlineAd']", document.body ) ;
		
		// Infolinks
		if(Q("SPAN")){var spanTags=Q("SPAN");for(var a=0;a<spanTags.length;a++){for(var x=0;x<spanTags[a].attributes.length;x++){if(spanTags[a].attributes[x].nodeName.toLowerCase()=='class'){if(spanTags[a].attributes[x].nodeValue=='IL_LINK_STYLE'){var textString=spanTags[a].innerHTML;var newNode=document.createElement('LABEL');newNode.innerHTML=textString;spanTags[a].parentNode.insertBefore(newNode,spanTags[a]);spanTags[a].parentNode.removeChild(spanTags[a]);}}}}}
	
		// Kontera
		if(Q("A")){var anchorTags=Q("A");for(var a=0;a<anchorTags.length;a++){for(var x=0;x<anchorTags[a].attributes.length;x++){if(anchorTags[a].attributes[x].nodeName.toLowerCase()=='class') {if(anchorTags[a].attributes[x].nodeValue=='kLink'){var textString=anchorTags[a].childNodes[0].childNodes[0].innerHTML;var newNode=document.createElement('SPAN');newNode.innerHTML=textString;anchorTags[a].parentNode.insertBefore(newNode,anchorTags[a]);anchorTags[a].parentNode.removeChild(anchorTags[a]);}}}}}
	
		// VibrantMedia
		if(Q("A")){var anchorTags=Q("A");for(var a=0;a<anchorTags.length;a++){for(var x=0;x<anchorTags[a].attributes.length;x++){if(anchorTags[a].attributes[x].nodeName.toLowerCase()=='class') {if(anchorTags[a].attributes[x].nodeValue=='iAs'){var textString=anchorTags[a].innerHTML;var newNode=document.createElement('SPAN');newNode.innerHTML=textString;anchorTags[a].parentNode.insertBefore(newNode,anchorTags[a]);anchorTags[a].parentNode.removeChild(anchorTags[a]);}}}}}

//	},50);
	
		// Hide content using Javascript on specific sites once the page is loaded
	
		if(adsweep.url.match("distrowatch.com")){ if(Q("TABLE")){ if(Q("TABLE")[0].nextSibling){ if(Q("TABLE")[0].nextSibling.nextSibling){ var tbTag=Q("TABLE")[0].nextSibling.nextSibling; if(tbTag.innerHTML){ if(tbTag.innerHTML.match("pagead2")){ if(tbTag.tagName){ tbTag.style.display='none'; } } } } } } if(Q("TD")){ var tdTag=Q("TD"); for(a=0;a<tdTag.length;a++){ if(tdTag[a].innerHTML){ if(tdTag[a].innerHTML.match(/^Sponsored Message$|^???????????? ??????$|^????????? ?????$|^?????????? ???????????$|^Wiadomosc sponsorowana$|^Pesan Sponsor$|^?????? ????? ????$|^????$|^Remeju Žinute$|^?????? ?????$|^Sponzorji - sporocila$|^Gesponsord Bericht$|^Message de pub$|^Mensaje patrocinado$|^Sponsorennachricht$|^Sponsoroitu viesti$|^???????????? ?????????$|^????$|^Sponsorun Mesaji$|^Missatge patrocinat$|^???????? ??????$|^????µa ???????$|^???????????? ????????$|^Szponzorált üzenet$|^???? ?? ?????$|^Mensagem de Publicidade$|^Sponsoreeritud teade$|^Sponsoreret Besked$|^???? ????????$|^???????????? ????????????$|^Messaggio sponsorizzato$|^Sponzorske poruke$/)){ if(tdTag[a].parentNode){ if(tdTag[a].parentNode.parentNode){ if(tdTag[a].parentNode.parentNode.parentNode){ if(tdTag[a].parentNode.parentNode.parentNode.parentNode){ if(tdTag[a].parentNode.parentNode.parentNode.parentNode.parentNode){ var hideTag=tdTag[a].parentNode.parentNode.parentNode.parentNode.parentNode; if(hideTag.tagName){ hideTag.style.display='none'; } } } } } } } } } } if(Q("TH")){ var thTags=Q("TH"); for(a=0;a<thTags.length;a++){ if(thTags[a].innerHTML.match(/^Linux Netbooks$|^???????????$|^????????$|^Advertisement$|^??????????$|^Reklamy$|^Iklan$|^??????$|^??$|^Reklam$|^?????$|^Reklama$|^Advertentie$|^Oglaševanje$|^Advertisement$|^Anuncions$|^Annonce$|^Werbung$|^Mainos$|^Anunci$|^??af?µ?s?$|^Hirdetés$|^???????$|^??$|^Publicidade$|^????????$|^Reklaam$|^??????$|^?????????$|^Reklame$|^???????$|^???????$|^Pubblicità$|^Oglas$/)){ if(thTags[a].parentNode){ if(thTags[a].parentNode.parentNode){ var hideTag=thTags[a].parentNode.parentNode; if(hideTag.tagName){ hideTag.style.display='none'; } } } } } } if(Q("A")){ var aTags=Q("A"); for(var a=0;a<aTags.length;a++){ if(aTags[a].innerHTML.match(/vpslink|osdisc|3cx|Acunetix/)){ if(aTags[a].parentNode){ if(aTags[a].parentNode.parentNode){ if(aTags[a].parentNode.parentNode.parentNode){ if(aTags[a].parentNode.parentNode.parentNode.parentNode){ var hideTag=aTags[a].parentNode.parentNode.parentNode.parentNode; if(hideTag.tagName){ hideTag.style.display='none'; } if(hideTag.nextSibling){ if(hideTag.nextSibling.nextSibling){ var hideTag2=hideTag.nextSibling.nextSibling; if(hideTag2.tagName){ hideTag2.style.display='none'; } } } } } } } } if(aTags[a].innerHTML){ if(aTags[a].innerHTML.match(/linuxidentity|linuxcd/)){ if(aTags[a].parentNode){ if(aTags[a].parentNode.parentNode){ if(aTags[a].parentNode.parentNode.parentNode){ if(aTags[a].parentNode.parentNode.parentNode.parentNode){ var hideTag=aTags[a].parentNode.parentNode.parentNode.parentNode; hideTag.style.display='none'; if(hideTag.nextSibling){ if(hideTag.nextSibling.tagName){ var hideTag2=hideTag.nextSibling; hideTag2.style.display='none'; } } } } } } } } } } if(Q("FORM")){ var formTags=Q("FORM"); for(a=0;a<formTags.length;a++){ for(var x=0;x<formTags[a].attributes.length;x++){ if(formTags[a].attributes[x].nodeName.toLowerCase()=='name') { if(formTags[a].attributes[x].nodeValue=='Dataspan'){ if(formTags[a].parentNode){ if(formTags[a].parentNode.parentNode){ if(formTags[a].parentNode.parentNode.parentNode){ if(formTags[a].parentNode.parentNode.parentNode.parentNode){ if(formTags[a].parentNode.parentNode.parentNode.parentNode.previousSibling){ if(formTags[a].parentNode.parentNode.parentNode.parentNode.previousSibling.previousSibling){ hideTag=formTags[a].parentNode.parentNode.parentNode.parentNode.previousSibling.previousSibling; if(hideTag.tagName){ hideTag.style.display='none'; } } } } } } } } } } } } Q("BODY")[0].style.display='block'; }
		if(adsweep.url.match("forums.futura-sciences.com")){var nodes=Q.CLASS("page");for(var i=0;i<nodes.length;i++){if(nodes[i].innerHTML){if(nodes[i].innerHTML.match('Liens sponsoris')){nodes[i].parentNode.removeChild(nodes[i]);}}} var nodes=Q("TD");for(var i=0;i<nodes.length;i++){if(nodes[i].innerHTML){if(nodes[i].innerHTML.match('Futura Sciences n\'est pas responsable du contenu de ces publicit')){var node=nodes[i].parentNode.parentNode.parentNode.parentNode.parentNode.getElementsByTagName("DIV")[0];node.parentNode.removeChild(node);}}}}
		if(adsweep.url.match("mashable.com")){if(Q("H3")){ var h3Tags=Q("H3"); for(var a=0;a<h3Tags.length;a++){ if(h3Tags[a].innerHTML=="Mashable Partners"){ var hideElement=h3Tags[a].parentNode.parentNode; hideElement.parentNode.removeChild(hideElement); } } } if(Q("H3")){ var h3Tags=Q("H3"); for(var a=0;a<h3Tags.length;a++){ if(h3Tags[a].innerHTML=="Sun Startup Essentials"){ var hideElement=h3Tags[a].parentNode.parentNode; hideElement.parentNode.removeChild(hideElement); } } } if(Q("P")){ var pTags=Q("P"); for(var a=0;a<pTags.length;a++){ if(pTags[a].innerHTML=="Sponsored By:"){ pTags[a].parentNode.removeChild(pTags[a]); } } } if(Q("A")){ var aTags=Q("A"); for(var a=0;a<aTags.length;a++){ if(aTags[a].innerHTML=="Advertise Here"){ var hideElement=aTags[a].parentNode.parentNode.parentNode; hideElement.parentNode.removeChild(hideElement); } } } if(Q("STRONG")){ var strongTags=Q("STRONG"); for(var a=0;a<strongTags.length;a++){ if(strongTags[a].innerHTML=="Twitter Brand Sponsors"){ var hideElement=strongTags[a].parentNode.parentNode.parentNode.parentNode.parentNode; hideElement.parentNode.removeChild(hideElement);}}}}
		if(adsweep.url.match("my.opera.com/community/forums")){if(Q.CLASS('fpost')){var posts = Q.CLASS('fpost');for(var a=0;a<posts.length;a++){if(posts[a].innerHTML.match("882703")){$('content').removeChild(posts[a]);}}}}
		if(adsweep.url.match("pcwelt.de")){if(Q("A")){ var anchorTags=Q("A"); for(var a=0;a<anchorTags.length;a++){ if(anchorTags[a].innerHTML.match("mentasys")){ var hideTag=anchorTags[a].parentNode.parentNode.parentNode.parentNode.parentNode; hideTag.parentNode.removeChild(hideTag); } } } if(Q("SPAN")){ var sTags=Q("SPAN"); for(var a=0;a<sTags.length;a++){ if(sTags[a].innerHTML.match("Office Anwendung-Software")){ var hideTag=sTags[a].parentNode; hideTag.parentNode.removeChild(hideTag); } } } if(Q("SPAN")){ var sTags=Q("SPAN"); for(var a=0;a<sTags.length;a++){ if(sTags[a].innerHTML.match("Ligatus")){ var hideTag=sTags[a].parentNode; hideTag.parentNode.removeChild(hideTag); } } } if(Q("H1")){ var h1Tags=Q("H1"); for(var a=0;a<h1Tags.length;a++){ if(h1Tags[a].innerHTML.match(/^Ligatus/)){ var hideTag=h1Tags[a].parentNode.parentNode.parentNode.parentNode; hideTag.parentNode.removeChild(hideTag); } } } }
		if(adsweep.url.match("squidoo.com")){window.setTimeout(function(){if(Q("H2")){var hTags=Q("H2");for(var a=0;a<hTags.length;a++){if(hTags[a].innerHTML.match("Great Stuff on Amazon")){hTags[a].parentNode.parentNode.removeChild(hTags[a].parentNode);}}}},50);}
		if(adsweep.url.match(/lifehacker\.com\/$/m)){if(Q("link")){var tag=Q("link")[1];var tagC = tag.cloneNode(true);tagC.href="http://tags.lifehacker.com/assets/minify.php?files=/assets/g4.lifehacker.com/css/style.css";tag.parentNode.replaceChild(tagC, tag);}}
		if(adsweep.url.match("facepunch.com"))
		{
		  var  tag=Q("script[src='http://facepunchcom.skimlinks.com/api/skimlinks.js']");
		  if ( tag ) {
		       tag[0].parentNode.removeChild(tag[0]);
		  }
		}
}
function adsweep_YouTube(){
	// Hide YouTube ads, taken from http://userscripts.org/scripts/show/49366
	String.prototype.setVar = function(q, v) {
	var regex = new RegExp("([\&\?])?"+q+"=[^\&\#]*", "g");
	return regex.test(this) ? this.replace(regex, "$1"+q+"="+v) : this+"&"+q+"="+v;
	}
	
	var mp = Q("#movie_player", document.body ) ;
	if (mp)
	{
	    mp = mp[0] ; // DBJ
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
		// here we flush the cache for only the element 'mp' replaced above with 'mpC'
		Q.FLUSH( document.body, "#movie_player" ) ;
	}
}



//-------------------------------------------------------------------------------------
})();  // end of main AdSweep closure
//-------------------------------------------------------------------------------------
