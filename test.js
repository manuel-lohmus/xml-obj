'use strict';

var log = require('log-report');
log.clear();
var XML = require('./index.js');
var fs = require('fs');
var path = require('path');

var strXml = `
<?xml version="1.0" encoding="utf-8" ?>
<!-- comment nodes may appear almost anywhere -->
<root id="abc &lt;&quot;&amp;&apos;&gt;">
	<et>Eesti</et>
	text	
	<![CDATA[123]]>
	<!-- comment nodes may appear almost anywhere -->
</root>
<!-- comment nodes may appear almost anywhere -->
`;
var objXml = XML.parse(strXml);
var strJson = JSON.stringify(objXml);
var objJson = JSON.parse(strJson);
var result = XML.stringify(objJson);

//var val = XML.querySelector(objXml, 'root et');
var val = objXml.querySelector('root et');

function trim(s) { return (s + '').split(/[\r|\n]/).join(""); }

if (trim(strXml) === trim(result)) { console.log('OK'); debugger; }
else { console.log('Something went wrong!'); debugger; }