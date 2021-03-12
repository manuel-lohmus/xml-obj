# xml-obj: XML library for browser and node.js

[![npm-version](https://badgen.net/npm/v/xml-obj)](https://www.npmjs.com/package/xml-obj)
[![npm-total-downloads](https://badgen.net/npm/dw/xml-obj)](https://www.npmjs.com/package/xml-obj)

'xml-obj' is a simple to use. 
Converting XML to an object is available in the browser and node.js.
XML.querySelector() is supported. 

## Installing

`npm install xml-obj`

## Usage example for node.js

```js
'use strict';

var XML = require('xml-obj');

var strXml = `
<?xml version="1.0" encoding="utf-8" ?>
<root id="abc &lt;&quot;&amp;&apos;&gt;">
	<et>Eesti</et>
	text	
	<![CDATA[123]]>
</root>
<!-- comment nodes may appear almost anywhere -->
`;
var objXml = XML.parse(strXml);

var val = objXml.querySelector('et');
console.log('val: ' + val);

var strJson = JSON.stringify(objXml, null, 2);
console.log('strJson: ' + strJson);
```

output:
```console
val: Eesti
strJson: {
  "@innerXML": [
    {
      "root": {
        "@innerXML": [
          {
            "et": "Eesti"
          },
          {
            "@text": "\ttext\t\n\t"
          },
          {
            "@cdata": "123"
          }
        ],
        "-id": "abc <\"&'>"
      }
    },
    {
      "@comment": " comment nodes may appear almost anywhere "
    }
  ],
  "-version": "1.0",
  "-encoding": "utf-8"
}
```

## Usage example for browser

```html
<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta charset="utf-8" />
    <title>XML Test Page</title>
    <script type="text/javascript">
/** XML-OBJ functions for JavaScript and node.js. @preserve Copyright (c) 2020 Manuel Lõhmus.*/
(function(n){function i(n){var t,i,r;if(typeof n=="string"){for(t="",i=0;i<n.length;i++){r=n.charCodeAt(i);switch(r){case 34:t+="&quot;";break;case 38:t+="&amp;";break;case 39:t+="&apos;";break;case 60:t+="&lt;";break;case 62:t+="&gt;";break;default:t+=n.charAt(i)}}return t}return n}function t(n){var i,t,u,f,r;if(typeof n=="string"){for(i="",t=0;t<n.length;t++)if(u=n.charAt(t),u==="&"){for(f="",r=t;++r<n.length&&f.length<16&&n.charAt(r)!==";";)f+=n.charAt(r);switch(f){case"nbsp":i+=" ";t=r;break;case"quot":i+='"';t=r;break;case"amp":i+="&";t=r;break;case"apos":i+="'";t=r;break;case"lt":i+="<";t=r;break;case"gt":i+=">";t=r;break;default:i+=u}}else i+=u;return i}return n}function s(n,t){var i=null,f;return typeof n=="string"&&(f=h(n,t),f&&(i=u(f))),i.querySelector=function(n){return o(i,n)},i.querySelectorAll=function(n){return r(i,n)},i}function u(n){var t=null,e,r,i,o,f;if(n&&n.name){if(e=n.children?n.children.filter(function(n){return n&&n.name[0]==="@"}):[],e.length===1&&n.children.length===1)n.attributes&&n.attributes.length?(t={},t[n.children[0].name]=n.children[0].value):n.children[0].name==="@text"?t=n.children[0].value:(t={},t[n.children[0].name]=n.children[0].value);else if(n.isEmpty)t="";else if(n.children&&n.children.length)for(t={},r=0;r<n.children.length;r++)i=n.children[r].name,e.length>0?(t["@innerXML"]||(t["@innerXML"]=[]),i?(o={},o[i]=u(n.children[r]),t["@innerXML"].push(o)):t["@innerXML"].push(n.children[r])):t[i]?Array.isArray(t[i])?t[i].push(u(n.children[r])):(t[i]=[t[i]],t[i].push(u(n.children[r]))):t[i]=u(n.children[r]);else n.value&&(t={},t=n.value);if(n.attributes&&n.attributes.length>0)for(t&&typeof t=="object"||(t={}),f=0;f<n.attributes.length;f++)t["-"+n.attributes[f].name]=n.attributes[f].value}return t}function h(n,t){var i;return i=w(n),i||(i=c(n),i||(i=l(n),i||(i=a(n,t)))),i}function w(n){var f,u,r;if(n&&(f=n.indexOf("<")-1,f<-1&&(f=n.length-1),f>-1&&(u=n.substr(0,f+1),u=t(u),u&&u.trim()))){function e(n){while(n[0]==="\n"||n[0]==="\r")n=n.substr(1);while(n.length&&(n[n.length-1]==="\n"||n[n.length-1]==="\r"))n=n.substr(0,n.length-1);return n}return r={name:"@text",value:e(u)},Object.defineProperty(r,"innerXml",{get:function(){return i(r.value)},set:function(n){r.value=t(n)}}),Object.defineProperty(r,"outerXml",{get:function(){return i(r.value)},set:function(n){r.value=t(n)}}),r.followingXml=function(){var t=n.indexOf("<");return t>-1?n.substr(t):""},r}}function c(n){var r,e,t;if(n&&(r=n.indexOf("<"),r>-1&&n.substr(r,9)==="<![CDATA[")){var f=n.indexOf("]\]>"),i=r+9,u=n.indexOf("]\]>")-i;if(u=f<0?n.length-1-i:f-i,i+u+2<n.length)return e=n.substr(i,u),t={name:"@cdata",value:e},Object.defineProperty(t,"innerXml",{get:function(){return t.value},set:function(n){t.value=n}}),Object.defineProperty(t,"outerXml",{get:function(){return"<![CDATA["+t.value+"]\]>"},set:function(n){t.value=new c(n).value}}),t.followingXml=function(){var t=n.indexOf("]\]>");return t<0?"":n.substr(t+3)},t}}function l(n){var i,e,t;if(n&&(i=n.indexOf("<"),i>-1&&n.substr(i,4)==="<!--")){var u=n.indexOf("-->"),r=i+4,f=u<0?n.length-1-r:u-r;if(r+f+2<n.length)return e=n.substr(r,f),t={name:"@comment",value:e},Object.defineProperty(t,"innerXml",{get:function(){return t.value},set:function(n){t.value=n}}),Object.defineProperty(t,"outerXml",{get:function(){return"<!--"+t.value+"-->"},set:function(n){t.value=new l(n).value}}),t.followingXml=function(){var t=n.indexOf("-->");return t<0?"":n.substr(t+3)},t}}function a(n,t){var i,o,u,f,s,r,c,e;return n&&(o=n.indexOf("<"),u=n.indexOf(">",o),u>-1&&(i={},f=n.substr(o,u-o+1).trim(),i.isEmpty=f.substr(f.length-2)==="/>",f=b(f),s=f.split(" "),i.name=s.shift(),i.attributes=k(s.join(" ")),i.isEmpty||(c=v(n,i.name),i.name==="?xml"?r=n.substr(u+1):c>-1?(r=n.substr(u+1,c-u-1),i.isEmpty=!r):i.isEmpty=null),Object.defineProperty(i,"innerXml",{get:function(){for(var t="",n=0;n<i.children.length;n++)t+=i.children[n].outerXml;return t},set:function(n){n!==r&&(r=n,e=undefined)}}),Object.defineProperty(i,"outerXml",{get:function(){var n="",t,u,r,f;if(i.name==="xml"){for(n+="<?"+i.name,t=0;t<i.attributes.length;t++)n+=" "+i.attributes[t].name+'="'+i.attributes[t].value+'"';for(n+="?>",u=0;u<i.children.length;u++)n+=i.children[u].outerXml}else{for(n+="<"+i.name,r=0;r<i.attributes.length;r++)n+=" "+i.attributes[r].name+'="'+i.attributes[r].value+'"';if(i.isEmpty===null)n+=">";else if(i.isEmpty)n+="/>";else{for(n+=">",f=0;f<i.children.length;f++)n+=i.children[f].outerXml;n+="<\/"+i.name+">"}}return n},set:function(n){var t=a(n);t&&(i.name=t.name,i.attributes=t.attributes,i.innerXml=t.innerXml)}}),Object.defineProperty(i,"children",{get:function(){if(!e){e=[];for(var n;r&&(n=h(r));)n.name==="@comment"&&t||(n.parent=i,e.push(n)),r=n.followingXml()}return e}}),i.followingXml=function(){var t=v(n,i.name,!0);return n.substr(t)})),i}function b(n){return typeof n=="string"?(n[0]==="<"&&(n=n.substr(1)),n[0]==="!"&&(n=n.substr(1)),n[n.length-1]===">"&&(n=n.substr(0,n.length-1)),n[n.length-1]==="?"&&(n=n.substr(0,n.length-1)),n[n.length-1]==="/"&&(n=n.substr(0,n.length-1)),n[0]==="-"&&n[1]==="-"&&n[n.length-2]==="-"&&n[n.length-1]==="-"&&(n=n.substr(2,n.length-4)),n):""}function v(n,t,i){for(var f=[],u=-1,r=n.indexOf("<"+t)+1+t.length;(r=n.indexOf(t,r))>-1;){if(r>1&&n[r-2]==="<"&&n[r-1]==="/")if(f.length===0){u=r-2;break}else f.pop();else n[r-1]==="<"&&n[n.indexOf(">",r)-1]!=="/"&&f.push(r);r+=t.length}return i&&(u=u<0?n.indexOf(">")+1:n.indexOf(">",u)+1),u}function k(n){for(var t=n.split(/"\s/),r=[],i;t.length;)i=d(t[0]),t.shift(),i&&r.push(i);return r}function d(n){var r,u,i;return typeof n=="string"&&(r=n.split("="),r[0])?(u={},u.name=r[0].trim(),i=r[1]?r[1].trim():null,i&&(i=i[0]==='"'||i[0]==="'"?i.substr(1):i,i=i[i.length-1]==='"'||i[i.length-1]==="'"?i.substr(0,i.length-1):i),u.value=t(i),u):null}function g(n,t,i,r,u){return f(n,t,i,r,u).join("")}function y(n,t,i,r,u){var e,o;if(typeof r=="number")for(e=r<10?r:10;e>0;e--)r=r[0]==="\t"?r+"\t":"\t";else r||(r="\t");return t||(u=!0),o=f(n,t,i,r,u).map(function(n){n=n+"";var t=n.split(/[\r|\n]/);return/\S/.test(t.pop())||(n=t.join("\r\n")),n.substr(0,r.length)===r&&(n=n.substr(r.length)),n}),o.join("\r\n")}function f(n,t,r,u,o){function l(){n&&(s.push('<?xml version="'+(n["-version"]?n["-version"]:"1.0")+'" encoding="'+(n["-encoding"]?n["-encoding"]:"UTF-8")+'" ?>'),delete n["-version"],delete n["-encoding"])}function p(){var t="";return typeof n=="object"&&n&&Object.keys(n).forEach(function(r){r[0]==="-"&&n[r]&&(t+=" "+r.substr(1)+'="'+i(n[r])+'"')}),t}function a(r){var f=[];return r&&!n?f:n===undefined||n===""?f:(Array.isArray(n)?f=f.concat(e(n,t,r,u)):typeof n=="object"&&n?Object.keys(n).forEach(function(t){if(t[0]!=="-")if(t==="@innerXML")for(var i=0;i<n[t].length;i++)f=f.concat(v(n[t][i],undefined,r,u));else f=f.concat(v(n[t],t,r,u))}):f.push(u+i(n)),f)}function v(n,t,r){var o=[];if(t)switch(t){case"@text":o.push(i(n));break;case"@cdata":o.push(u+"<![CDATA["+n+"]\]>");break;case"@comment":o.push(u+"<!--"+n+"-->");break;default:if(r&&!n)break;else(n===undefined||n==="")&&o.push(u+"<"+t+"/>");Array.isArray(n)?o=o.concat(e(n,t,r,u)):typeof n=="object"?o=o.concat(f(n,t,r,u)):o.push(u+"<"+t+">"+i(n)+"<\/"+t+">")}else Array.isArray(n)?o=o.concat(e(n,t,r,u)):typeof n=="object"?o=o.concat(f(n,t,r,u)):o.push(u+i(n));return o}var s=[];if(u||(u=""),Array.isArray(n))return t?e(n,t,r,u,o):e(n,t,r,u);if(t){o&&l();var h=(o?"":u)+"<"+t,y=p(),c=a(r);if(r&&!c.length&&!y)return"";h+=y;c.length?(s.push(h+">"),s=s.concat(c.map(function(n){return(o?"":u)+n})),s.push((o?"":u)+"<\/"+t+">")):s.push(h+"/>")}else o&&l(),s=s.concat(a(r));return s}function e(n,t,i,r,u){var e=[],s=!1,o,h;for(r||(r=""),(!t||u)&&(s=!0,e.push('<?xml version="'+(n["-version"]?n["-version"]:"1.0")+'" encoding="'+(n["-encoding"]?n["-encoding"]:"UTF-8")+'"?>'),delete n["-version"],delete n["-encoding"],e.push("<root>"),t=!t&&n[0]&&n[0].constructor&&n[0].constructor.name?n[0].constructor.name:t?t:"node"),o=0;o<n.length;o++)h=f(n[o],t,i,r),h.length?e=e.concat(h):e.push((s?"":r)+"<"+t+"/>");return s&&e.push("<\/root>"),e}function nt(n){var r={},i;return n&&n[0]==="."?r.className=t(n.substr(1)):n&&n.indexOf(".")>-1?(i=n.split("."),r.tagName=i.shift(),r.className=t(i.join("."))):n&&n[0]==="#"?r.id=t(n.substr(1)):n&&n.indexOf("[")>-1?(i=n.split("["),r.tagName=i.shift(),i=i.join("[").replace("]","").split("="),i[0]&&(r.attribute=i[0]),i[1]&&(r.attributeValue=t(i[1]))):n&&(r.tagName=n),r}function tt(n,t,i){var r,u;return t&&typeof i=="string"?(i=nt(i),r=!1,i.tagName&&(r=n===i.tagName),i.id&&(r=t["-id"]===i.id),i.className&&t["-class"]&&(u=t["-class"].split(" "),r=u.indexOf(i.className)>-1),i.attribute&&t["-"+i.attribute]&&(r=i.attributeValue?t["-"+i.attribute]===i.attributeValue:!0),r):!1}function it(n,t,i){if(t&&typeof i=="string"){var u=i.trim().split(" "),f=u.shift();if(tt(n,t,f))return u.length?u[0].trim()===">"?(u.shift(),r(t,u.join(" "))):[o(t,u.join(" "))]:[t]}return null}function p(n,t,i){if(t&&typeof i=="string"){var r=[];return i.split(",").forEach(function(i){var u=it(n,t,i);Array.isArray(u)&&u.length&&(r=r.concat(u))}),r}return null}function r(n,t){var i=[],u=[];return Array.isArray(n)?n.forEach(function(n){i=r(n,t);Array.isArray(i)&&i.length&&(u=u.concat(i))}):typeof n=="object"&&n&&Object.keys(n).forEach(function(f){f[0]!=="-"&&(Array.isArray(n[f])?n[f].forEach(function(n){var r=p(f,n,t);Array.isArray(r)&&r.length&&(i=i.concat(r))}):i=p(f,n[f],t),Array.isArray(i)&&i.length?u=u.concat(i):(i=r(n[f],t),Array.isArray(i)&&(u=u.concat(i))))}),u.length?u:null}function o(n,t){if(typeof t!="string")return null;var u=t[0]==="*",i=r(n,u?t.substr(1):t);return u?i:i&&i[0]?i[0]:null}return n.encode=i,n.decode=t,n.toObject=s,n.parse=s,n.toXml=g,n.toPrettyXml=y,n.stringify=y,n.querySelectorAll=r,n.querySelector=o,n})(typeof exports=="undefined"?this.XML||(this.XML={}):exports);
    </script>
    <script id="xml" type="text/html">
<?xml version="1.0" encoding="utf-8" ?>
<!-- comment nodes may appear almost anywhere -->
<root id="abc &lt;&quot;&amp;&apos;&gt;">
    <et>Eesti</et>
    text
    <![CDATA[123]]>
    <!-- comment nodes may appear almost anywhere -->
</root>
<!-- comment nodes may appear almost anywhere -->
    </script>
    <script>

        function load() {

            var strXml = document.getElementById("xml").innerHTML;
            var objXml = XML.parse(strXml);
            var strJson = JSON.stringify(objXml, null, 2);

            function format(str) {

                return str.split("\n").map(function (line) {

                        return "<code>" + line.split("")
                            .map(function (c) { return c === " " ? "&nbsp;" : "&#" + c.charCodeAt(0) + ";"; })
                            .join("") + "</code><br />";
                    })
                    .join("");
            }

            document.body.innerHTML = "<h3>Xml:</h3>" + format(strXml);
            document.body.innerHTML += "<h3>querySelector:</h3>objXml.querySelector('et')&nbsp;=>&nbsp;" + objXml.querySelector('et');
            document.body.innerHTML += "<h3>Json:</h3>" + format(strJson);
        }
    </script>
</head>
<body onload="load()">
    
</body>
</html>
```

## XML Reference
```
/**
* Convert xml string to object.
* @param {string} xml .
* @param {Boolean} ignoreComment .
* @returns {Object} .
*/
XML.parse(xml, ignoreComment)
XML.toObject(xml, ignoreComment)

/**
* Get xml string. 
* Parameter 'tagName' is name current item (optional). 
* Parameter 'isMin' ignore empty fields (optional).
* @param {any} obj Object.
* @param {string} tagName Tag name (optional).
* @param {Boolean} isMin Ignore empty fields (optional).
* @param {String | Number} space Either a String or a Number. Number, from 0 to 10, to indicate how many space characters to use as white space. (optional).
* @param {Boolean} isRoot .
* @returns {string} xml string.
*/
XML.stringify(obj, tagName, isMin, space, isRoot)
XML.toPrettyXml(obj, tagName, isMin, space, isRoot)

/**
* Get xml string.
* Parameter 'tagName' is name current item (optional). 
* Parameter 'isMin' ignore empty fields (optional).
* @param {any} obj Object.
* @param {string} tagName Tag name (optional).
* @param {Boolean} isMin Ignore empty fields (optional).
* @param {String | Number} space Either a String or a Number. Number, from 0 to 10, to indicate how many space characters to use as white space. (optional).
* @param {Boolean} isRoot .
* @returns {string} xml string.
*/
XML.toXml(obj, tagName, isMin, space, isRoot) 

/**
* @param {string} input .
* @returns {string} .
*/
XML.Encode(input)

/**
* @param {string} input .
* @returns {string} .
*/
XML.Decode(input)

/**
* @param {any} objXml
* @param {string} selectors
* @returns {any[]}
*/
XML.querySelectorAll(objXml, selectors)

/**
* @param {string} selectors
* @returns {any[]}
*/
objXml.querySelectorAll(selectors)
/**
* @param {any} objXml
* @param {string} selectors
* @returns {any}
*/
XML.querySelector(objXml, selectors)

/**
* @param {string} selectors
* @returns {any}
*/
objXml.querySelector(selectors)
```


## License

[MIT](LICENSE)

Copyright (c) 2021 Manuel L&otilde;hmus <manuel@hauss.ee>


