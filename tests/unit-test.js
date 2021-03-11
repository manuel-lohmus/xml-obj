'use strict';

var assert = require('assert');
var XML = require('../index.js');
var fs = require('fs');
var path = require('path');

describe('XML', function () {

    it('XML.parse()', function (done) {

        var strXml = fs.readFileSync(path.resolve('./tests/xml_file.xml')).toString('utf-8');
        var objXml = XML.parse(strXml);
        var strJson = JSON.stringify(objXml);
        var objJson = JSON.parse(strJson);
        var result = XML.stringify(objJson);

        function trim(s) { return (s + '').split(/[\r|\n]/).join("") }

        if (trim(strXml) === trim(result)) { done(); }
        else { done('Something went wrong!'); }
    });

    it('XML.querySelector', function (done) {

        var strXml = fs.readFileSync(path.resolve('./tests/xml_file.xml')).toString('utf-8');
        var objXml = XML.parse(strXml);
        var val = XML.querySelector(objXml, 'project2 et');

        if (val === 'ELEMENT HOUSES') { done(); }
        else { done('Something went wrong!'); }
    });
});