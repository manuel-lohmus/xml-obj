/** XML-OBJ functions for browser and node.js. @preserve Copyright (c) 2020 Manuel Lõhmus.*/
"use strict";

(function (xlmObj) {

    // #region encoding

    /**
     * XML Encode
     * @param {string} input .
     * @returns {string} .
     */
    function Encode(input) {

        var strOutput;

        if (typeof input === "string") {

            strOutput = "";

            for (var i = 0; i < input.length; i++) {

                var charCode = input.charCodeAt(i);

                switch (charCode) {

                    case 34: strOutput += "&quot;"; break; // "
                    case 38: strOutput += "&amp;"; break; // &
                    case 39: strOutput += "&apos;"; break; // '
                    case 60: strOutput += "&lt;"; break; // < 
                    case 62: strOutput += "&gt;"; break; // >

                    default:
                        strOutput += input.charAt(i);
                        break;
                }
            }

            return strOutput;
        }

        return input;
    }
    xlmObj.encode = Encode;

    /**
     * XML Decode
     * @param {string} input .
     * @returns {string} .
     */
    function Decode(input) {

        var strOutput;

        if (typeof input === "string") {

            strOutput = "";

            for (var i = 0; i < input.length; i++) {

                var char = input.charAt(i);

                if (char === "&") {

                    var key = "";
                    var j = i;

                    while (++j < input.length && key.length < 16 && input.charAt(j) !== ";")
                        key += input.charAt(j);

                    switch (key) {

                        case "quot": strOutput += "\""; i = j; break; // "
                        case "amp": strOutput += "&"; i = j; break; // &
                        case "apos": strOutput += "'"; i = j; break; // '
                        case "lt": strOutput += "<"; i = j; break; // < 
                        case "gt": strOutput += ">"; i = j; break; // >

                        default: strOutput += char; break;
                    }
                }
                else
                    strOutput += char;
            }

            return strOutput;
        }
        return input;
    }
    xlmObj.decode = Decode;

    // #endregion encoding

    // #region parse
    
    /**
    * Convert xml string to object.
    * @param {string} xml .
    * @param {Boolean} ignoreComment .
    * @returns {Object} .
    */
    function ToObject(xml, ignoreComment) {

        var obj = null;

        if (typeof xml === "string") {

            var node = ParseXml(xml, ignoreComment);

            if (node) {

                obj = nodeToObject(node);
            }
        }

        obj.querySelector = function (selectors) { return querySelector(obj, selectors); };
        obj.querySelectorAll = function (selectors) { return querySelectorAll(obj, selectors); };

        return obj;
    }
    xlmObj.toObject = ToObject;
    xlmObj.parse = ToObject;

    function nodeToObject(node) {

        var obj = null;

        if (node && node.name) {

            var textArray = node.children ? node.children.filter(function (i) { return i && i.name[0] === "@"; }) : [];

            if (textArray.length === 1 && node.children.length === 1) {

                if (node.attributes && node.attributes.length) {

                    obj = {};
                    obj[node.children[0].name] = node.children[0].value;
                }
                else if (node.children[0].name === "@text")
                    obj = node.children[0].value; // is value

                else {

                    obj = {};
                    obj[node.children[0].name] = node.children[0].value;
                }
            }
            else if (node.isEmpty) {

                obj = "";
            }
            else {

                if (node.children && node.children.length) {

                    obj = {};

                    for (var i = 0; i < node.children.length; i++) { // children

                        var key = node.children[i].name;

                        if (textArray.length > 0) {

                            if (!obj["@innerXML"]) obj["@innerXML"] = [];
                            if (key) {

                                var o = {};
                                o[key] = nodeToObject(node.children[i]);
                                obj["@innerXML"].push(o);
                            }
                            else
                                obj["@innerXML"].push(node.children[i]);
                        }
                        else {

                            if (obj[key]) {

                                if (Array.isArray(obj[key])) // push child
                                    obj[key].push(nodeToObject(node.children[i]));
                                else {

                                    obj[key] = [obj[key]];
                                    obj[key].push(nodeToObject(node.children[i]));
                                }
                            }
                            else {

                                obj[key] = nodeToObject(node.children[i]); // add child
                            }
                        }
                    }
                }
                else if (node.value) {

                    obj = {};
                    obj = node.value;
                }
            }

            if (node.attributes && node.attributes.length > 0) {

                if (!(obj && typeof obj === "object"))
                    obj = {};

                for (var i1 = 0; i1 < node.attributes.length; i1++) // add attributes
                    obj["-" + node.attributes[i1].name] = node.attributes[i1].value;
            }
        }

        return obj;
    }

    /**
    * Parse string to xml object.
    * @param {string} xml .
    * @param {Boolean} ignoreComment .
    * @returns {ParseXml} .
    */
    function ParseXml(xml, ignoreComment) {

        var node;

        node = Text(xml);

        if (!node) {

            node = Cdata(xml);

            if (!node) {

                node = Comment(xml);

                if (!node) {

                    node = Node(xml, ignoreComment);
                }
            }
        }

        return node;
    }

    /**
     * Parse string to xml text.
     * @param {string} xml .
     * @returns {Text} .
     */
    function Text(xml) {

        if (xml) {

            var indexTextEnd = xml.indexOf("<") - 1;
            if (indexTextEnd < -1) indexTextEnd = xml.length - 1;
            if (indexTextEnd > -1) {

                var innerText = xml.substr(0, indexTextEnd + 1);
                innerText = Decode(innerText);

                if (innerText && innerText.trim()) {

                    function trim(s) {

                        while (s[0] === "\n" || s[0] === "\r") {

                            s = s.substr(1);
                        }

                        while (s.length
                            && (s[s.length - 1] === "\n"
                                || s[s.length - 1] === "\r")) {

                            s = s.substr(0, s.length - 1);
                        }

                        return s;
                    }

                    var node = { name: "@text", value: trim(innerText) }; // node

                    Object.defineProperty(node, "innerXml", {

                        get: function () { return Encode(node.value); },
                        set: function (val) { node.value = Decode(val); }
                    });

                    Object.defineProperty(node, "outerXml", {

                        get: function () { return Encode(node.value); },
                        set: function (val) { node.value = Decode(val); }
                    });

                    node.followingXml = function () {

                        var index = xml.indexOf("<");

                        return index > -1 ? xml.substr(index) : "";
                    };

                    return node;
                }
            }
        }
    }

    /**
     * Parse string to xml cdata.
     * @param {string} xml .
     * @returns {Cdata} .
     */
    function Cdata(xml) {

        if (xml) {

            var indexTagStart = xml.indexOf("<");

            if (indexTagStart > -1 && xml.substr(indexTagStart, 9) === "<![CDATA[") {

                var indexTagEnd = xml.indexOf("]]>");
                var indexStartData = indexTagStart + 9;
                var lengthData = xml.indexOf("]]>") - indexStartData;
                lengthData = indexTagEnd < 0 ? xml.length - 1 - indexStartData : indexTagEnd - indexStartData;

                if (indexStartData + lengthData + 2 < xml.length) {

                    var cdata = xml.substr(indexStartData, lengthData);

                    var node = { name: "@cdata", value: cdata }; // node

                    Object.defineProperty(node, "innerXml", {

                        get: function () { return node.value; },
                        set: function (val) { node.value = val; }
                    });

                    Object.defineProperty(node, "outerXml", {

                        get: function () { return "<![CDATA[" + node.value + "]]>"; },
                        set: function (val) { node.value = new Cdata(val).value; }
                    });

                    node.followingXml = function () {

                        var index = xml.indexOf("]]>");

                        return index < 0 ? "" : xml.substr(index + 3);
                    };

                    return node;
                }
            }
        }
    }

    /**
     * Parse string to xml comment.
     * @param {string} xml .
     * @returns {Comment} .
     */
    function Comment(xml) {

        if (xml) {

            var indexTagStart = xml.indexOf("<");

            if (indexTagStart > -1 && xml.substr(indexTagStart, 4) === "<!--") {

                var indexTagEnd = xml.indexOf("-->");
                var indexStartComment = indexTagStart + 4;
                var lengthComment = indexTagEnd < 0 ? xml.length - 1 - indexStartComment : indexTagEnd - indexStartComment;

                if (indexStartComment + lengthComment + 2 < xml.length) {

                    var comment = xml.substr(indexStartComment, lengthComment);

                    var node = { name: "@comment", value: comment }; // node

                    Object.defineProperty(node, "innerXml", {

                        get: function () { return node.value; },
                        set: function (val) { node.value = val; }
                    });

                    Object.defineProperty(node, "outerXml", {

                        get: function () { return "<!--" + node.value + "-->"; },
                        set: function (val) { node.value = new Comment(val).value; }
                    });

                    node.followingXml = function () {

                        var index = xml.indexOf("-->");

                        return index < 0 ? "" : xml.substr(index + 3);
                    };

                    return node;
                }
            }
        }
    }

    /**
     * Parse string to xml node.
     * @param {string} xml .
     * @param {Boolean} ignoreComment .
     * @returns {Node} .
     */
    function Node(xml, ignoreComment) {

        var node;

        if (xml) {

            var indexTagStart = xml.indexOf("<");
            var indexTagEnd = xml.indexOf(">", indexTagStart);

            if (indexTagEnd > -1) {

                node = {}; // node
                var startTag = xml.substr(indexTagStart, indexTagEnd - indexTagStart + 1).trim();

                node.isEmpty = startTag.substr(startTag.length - 2) === "/>"; // node.isEmpty

                startTag = trimTag(startTag);
                var startTagArray = startTag.split(" ");

                node.name = startTagArray.shift(); // node.name
                
                node.attributes = getAttributes(startTagArray.join(" ")); // node.attributes

                var innerXml;

                if (!node.isEmpty) {

                    var indexEnd = getIndexTagEnd(xml, node.name);

                    if (node.name === "?xml")
                        innerXml = xml.substr(indexTagEnd + 1);

                    else if (indexEnd > -1) {

                        innerXml = xml.substr(indexTagEnd + 1, indexEnd - indexTagEnd - 1); // node.innerXml
                        node.isEmpty = !innerXml;
                    }

                    else
                        node.isEmpty = null;
                }

                Object.defineProperty(node, "innerXml", { // node.innerXml

                    get: function () {

                        var inner = "";

                        for (var i = 0; i < node.children.length; i++)
                            inner += node.children[i].outerXml;

                        return inner;
                    },
                    set: function (val) {
                        if (val !== innerXml) {

                            innerXml = val;
                            children = undefined;
                        }
                    }
                });

                Object.defineProperty(node, "outerXml", {

                    get: function () {

                        var outer = "";

                        if (node.name === "xml") {

                            outer += "<" + "?" + node.name;

                            for (var i = 0; i < node.attributes.length; i++)
                                outer += " " + node.attributes[i].name + "=\"" + node.attributes[i].value + "\"";

                            outer += "?" + ">";

                            for (var i1 = 0; i1 < node.children.length; i1++)
                                outer += node.children[i1].outerXml;
                        }
                        else {

                            outer += "<" + node.name;

                            for (var i2 = 0; i2 < node.attributes.length; i2++)
                                outer += " " + node.attributes[i2].name + "=\"" + node.attributes[i2].value + "\"";

                            if (node.isEmpty === null)
                                outer += ">";

                            else if (node.isEmpty)
                                outer += "/>";

                            else {

                                outer += ">";

                                for (var i3 = 0; i3 < node.children.length; i3++)
                                    outer += node.children[i3].outerXml;

                                outer += "</" + node.name + ">";
                            }
                        }

                        return outer;
                    },
                    set: function (val) {

                        var n = Node(val);

                        if (n) {

                            node.name = n.name;
                            node.attributes = n.attributes;
                            node.innerXml = n.innerXml;
                        }
                    }
                });

                var children;
                Object.defineProperty(node, "children", {

                    get: function () {

                        if (!children) {

                            children = [];
                            var child;

                            while (innerXml && (child = ParseXml(innerXml))) {

                                if (!(child.name === "@comment" && ignoreComment)) {

                                    child.parent = node;
                                    children.push(child);
                                }

                                innerXml = child.followingXml();
                            }
                        }

                        return children;
                    }
                });

                node.followingXml = function () {

                    var index = getIndexTagEnd(xml, node.name, true);
                    var result = xml.substr(index);

                    return result;
                };
            }
        }

        return node;
    }

    function trimTag(tag) {

        if (typeof tag === "string") {

            if (tag[0] === "<") tag = tag.substr(1);
            if (tag[0] === "!") tag = tag.substr(1);

            if (tag[tag.length - 1] === ">") tag = tag.substr(0, tag.length - 1);
            if (tag[tag.length - 1] === "?") tag = tag.substr(0, tag.length - 1);
            if (tag[tag.length - 1] === "/") tag = tag.substr(0, tag.length - 1);

            if (tag[0] === "-" && tag[1] === "-" && tag[tag.length - 2] === "-" && tag[tag.length - 1] === "-")
                tag = tag.substr(2, tag.length - 4);

            return tag;
        }
        else
            return "";
    }
    function getIndexTagEnd(xml, tagName, isFollowingIndex) {

        var stack = [];
        var index = -1;
        var i = xml.indexOf("<" + tagName) + 1 + tagName.length;

        while ((i = xml.indexOf(tagName, i)) > -1) {

            if (i > 1 && xml[i - 2] === "<" && xml[i - 1] === "/") { // end index

                if (stack.length === 0) {

                    index = i - 2;
                    break;
                }
                else
                    stack.pop();
            }
            else if (xml[i - 1] === "<" && xml[xml.indexOf(">", i) - 1] !== "/") {// srart index

                stack.push(i);
            }

            i += tagName.length;
        }

        if (isFollowingIndex) {

            if (index < 0)
                index = xml.indexOf(">") + 1; // "<name>"
            else
                index = xml.indexOf(">", index) + 1; // "</name    >"
        }

        return index;
    }
    function getAttributes(str) {

        var arr = str.split(/"\s/);
        var attributes = [];

        while (arr.length) {

            var attribute = getAttribute(arr[0]);
            arr.shift();

            if (attribute)
                attributes.push(attribute);
        }

        return attributes;
    }
    function getAttribute(str) {

        if (typeof str === "string") {

            var arr = str.split("=");

            if (arr[0]) {

                var attribute = {};

                attribute.name = arr[0].trim(); // name

                var value = arr[1] ? arr[1].trim() : null;
                if (value) {
                    value = value[0] === "\"" || value[0] === "'" ? value.substr(1) : value;
                    value = value[value.length - 1] === "\"" || value[value.length - 1] === "'" ? value.substr(0, value.length - 1) : value;
                }
                attribute.value = Decode(value); // value

                return attribute;
            }
        }

        return null;
    }

    // #endregion parse

    // #region stringify

    /**
    * Get xml string. <br/>
    * Parameter 'tagName' is name current item (optional). <br/>
    * Parameter 'isMin' ignore empty fields (optional).
    * @param {any} obj Object.
    * @param {string} tagName Tag name (optional).
    * @param {Boolean} isMin Ignore empty fields (optional).
    * @param {String | Number} space Either a String or a Number. Number, from 0 to 10, to indicate how many space characters to use as white space. (optional).
    * @param {Boolean} isRoot .
    * @returns {string} xml string.
    */
    function ToXml(obj, tagName, isMin, space, isRoot) { return ObjectToXmlArr(obj, tagName, isMin, space, isRoot).join(""); }
    xlmObj.toXml = ToXml;
    /**
    * Get xml string. <br/>
    * Parameter 'tagName' is name current item (optional). <br/>
    * Parameter 'isMin' ignore empty fields (optional).
    * @param {any} obj Object.
    * @param {string} tagName Tag name (optional).
    * @param {Boolean} isMin Ignore empty fields (optional).
    * @param {String | Number} space Either a String or a Number. Number, from 0 to 10, to indicate how many space characters to use as white space. (optional).
    * @param {Boolean} isRoot .
    * @returns {string} xml string.
    */
    function ToPrettyXml(obj, tagName, isMin, space, isRoot) {

        if (typeof space === "number")
            for (var i = space < 10 ? space : 10; i > 0; i--)
                space = space[0] === "\t" ? space + "\t" : "\t";
        else if (!space)
            space = "\t";

        if (!tagName && typeof isRoot === "undefined") isRoot = true;

        var arr = ObjectToXmlArr(obj, tagName, isMin, space, isRoot)
                .map(function (s) {
                    // trim xml line
                    s = s + "";
                    var arr = s.split(/[\r|\n]/);

                    if (!/\S/.test(arr.pop()))
                        s = arr.join("\r\n");

                    if (s.substr(0, space.length) === space)
                        s = s.substr(space.length);

                    return s;
                });
        return arr.join("\r\n");
    }
    xlmObj.toPrettyXml = ToPrettyXml;
    xlmObj.stringify = ToPrettyXml;
    /**
    * Get xml string. <br/>
    * Parameter 'tagName' is name current item (optional). <br/>
    * If 'tagName' is '?xml', then add xml prolog: &lt;?xml version='1.0' encoding='UTF-8'?&gt; (optional). <br/>
    * Parameter 'isMin' ignore empty fields (optional).
    * @param {any} obj Object.
    * @param {string} tagName Tag name (optional).
    * @param {Boolean} isMin Ignore empty fields (optional).
    * @param {String} tabStr .
    * @param {Boolean} isRoot .
    * @returns {Array} xml line array.
    */
    function ObjectToXmlArr(obj, tagName, isMin, tabStr, isRoot) {

        function addXmlProlog() {

            if (!obj) return;

            sArr.push("<?xml version=\"" +
                (obj["-version"] ? obj["-version"] : "1.0") +
                "\" encoding=\"" +
                (obj["-encoding"] ? obj["-encoding"] : "UTF-8") +
                "\" ?>");
            delete obj["-version"];
            delete obj["-encoding"];
        }
        function getAttributesStr() {

            var attributes = "";

            if (typeof obj === "object" && obj)
                Object.keys(obj).forEach(function (key) {
                    if (key[0] === "-" && obj[key])
                        attributes += " " + key.substr(1) + "=\"" + Encode(obj[key]) + "\"";
                });

            return attributes;
        }
        function getInnerArr(isMin) {

            var sArr = [];

            if (isMin && !obj)
                return sArr;

            else if (obj === undefined || obj === "")
                return sArr;

            if (Array.isArray(obj))
                sArr = sArr.concat(ArrayToXmlArr(obj, tagName, isMin, tabStr));

            else if (typeof obj === "object" && obj)
                Object.keys(obj).forEach(function (key) {

                    if (key[0] !== "-" && typeof obj[key] !== "function") {

                        if (key === "@innerXML") { // @innerXML

                            for (var j = 0; j < obj[key].length; j++)
                                sArr = sArr.concat(getXmlArr(obj[key][j], undefined, isMin, tabStr));
                        }
                        else {

                            sArr = sArr.concat(getXmlArr(obj[key], key, isMin, tabStr));
                        }
                    }
                });

            else
                sArr.push(tabStr + Encode(obj));

            return sArr;
        }
        function getXmlArr(obj, key, isMin) {

            var sArr = [];

            if (key) {

                switch (key) {

                    case "@text":
                        sArr.push(Encode(obj));
                        break;

                    case "@cdata":
                        sArr.push(tabStr + "<![CDATA[" + obj + "]]>");
                        break;

                    case "@comment":
                        sArr.push(tabStr + "<!--" + obj + "-->");
                        break;

                    default:

                        if (isMin && !obj)
                            break;

                        else if (obj === undefined || obj === "")
                            sArr.push(tabStr + "<" + key + "/>");

                        if (Array.isArray(obj))
                            sArr = sArr.concat(ArrayToXmlArr(obj, key, isMin, tabStr));

                        else if (typeof obj === "object")
                            sArr = sArr.concat(ObjectToXmlArr(obj, key, isMin, tabStr));

                        else
                            sArr.push(tabStr + "<" + key + ">" + Encode(obj) + "</" + key + ">");

                        break;
                }
            }
            else {

                if (Array.isArray(obj))
                    sArr = sArr.concat(ArrayToXmlArr(obj, key, isMin, tabStr));

                else if (typeof obj === "object")
                    sArr = sArr.concat(ObjectToXmlArr(obj, key, isMin, tabStr));

                else
                    sArr.push(tabStr + Encode(obj));
            }

            return sArr;
        }

        var sArr = [];
        if (!tabStr) tabStr = "";

        if (Array.isArray(obj)) {
            if (tagName)
                return ArrayToXmlArr(obj, tagName, isMin, tabStr, isRoot);
            else
                return ArrayToXmlArr(obj, tagName, isMin, tabStr);
        }
        else if (tagName) {

            if (isRoot)
                addXmlProlog();

            var startTag = (isRoot ? "" : tabStr) + "<" + tagName; // <startTag

            var attributeStr = getAttributesStr();// attributes
            var innerArr = getInnerArr(isMin);// innerXML

            if (isMin && !innerArr.length && !attributeStr)
                return "";

            startTag += attributeStr;

            if (innerArr.length) {

                sArr.push(startTag + ">"); // <startTag>


                sArr = sArr.concat(innerArr.map(function (s) { return (isRoot ? "" : tabStr) + s; }));


                sArr.push((isRoot ? "" : tabStr) + "</" + tagName + ">"); // </endTag>
            }
            else
                sArr.push(startTag + "/>"); // <startTag/>
        }
        else {

            if (isRoot) addXmlProlog();
            sArr = sArr.concat(getInnerArr(isMin));
        }

        return sArr;
    }
    /**
    * Get xml string.<br/>
    * Parameter 'nodeTag' is name current collection.<br/>
    * Parameter 'isRoot' add xml prolog: < ?xml version='1.0' encoding='UTF-8' ? >.
    * @param {any} collection Array.
    * @param {string} nodeTag .
    * @param {Boolean} isMin .
    * @param {String} tabStr .
    * @param {Boolean} isRoot .
    * @returns {Array} .
    */
    function ArrayToXmlArr(collection, nodeTag, isMin, tabStr, isRoot) {

        var sArr = [];
        var isXmlTag = false;
        if (!tabStr) tabStr = "";

        if (!nodeTag || isRoot) {

            isXmlTag = true;
            sArr.push("<?xml version=\"" +
                (collection["-version"] ? collection["-version"] : "1.0") +
                "\" encoding=\"" +
                (collection["-encoding"] ? collection["-encoding"] : "UTF-8") +
                "\"?>");
            delete collection["-version"];
            delete collection["-encoding"];
            sArr.push("<root>");
            nodeTag = !nodeTag && collection[0] && collection[0].constructor && collection[0].constructor.name
                ? collection[0].constructor.name
                : nodeTag ? nodeTag : "node";
        }

        for (var i = 0; i < collection.length; i++) {

            var arrXml = ObjectToXmlArr(collection[i], nodeTag, isMin, tabStr);

            if (!arrXml.length)
                sArr.push((isXmlTag ? "" : tabStr) + "<" + nodeTag + "/>");

            else
                sArr = sArr.concat(arrXml);
        }

        if (isXmlTag)
            sArr.push("</root>");

        return sArr;
    }

    // #endregion stringify

    // #region selector

    // "div.note, div.alert"    - or
    // '.outer .inner'          - and
    // '.select'
    // "#test"
    // "iframe[data-src]"
    // "li[data-active=1]"
    // "p"

    function objSelector(selector) {

        var result = {};

        if (selector && selector[0] === ".") {
            result.className = Decode(selector.substr(1));
        }
        else if (selector && selector.indexOf(".") > -1) {
            var arr = selector.split(".");
            result.tagName = arr.shift();
            result.className = Decode(arr.join("."));
        }
        else if (selector && selector[0] === "#") {
            result.id = Decode(selector.substr(1));
        }
        else if (selector && selector.indexOf("[") > -1) {
            arr = selector.split("[");
            result.tagName = arr.shift();
            arr = arr.join("[").replace("]", "").split("=");
            if (arr[0]) { result.attribute = arr[0]; }
            if (arr[1]) { result.attributeValue = Decode(arr[1]); }
        }
        else if (selector) {
            result.tagName = selector;
        }

        return result;
    }
    function isSelected(tag, obj, selector) {

        if (obj && typeof selector === "string") {

            selector = objSelector(selector);
            var isSelected = false;

            if (selector.tagName) isSelected = tag === selector.tagName;
            if (selector.id) isSelected = obj["-id"] === selector.id;
            if (selector.className && obj["-class"]) {
                var arrClass = obj["-class"].split(" ");
                isSelected = arrClass.indexOf(selector.className) > -1;
            }
            if (selector.attribute && obj["-" + selector.attribute]) {
                if (selector.attributeValue)
                    isSelected = obj["-" + selector.attribute] === selector.attributeValue;
                else
                    isSelected = true;
            }

            return isSelected;
        }
        return false;
    }
    function andSelected(tag, obj, selectors) {

        if (obj && typeof selectors === "string") {
            var andSelectors = selectors.trim().split(" ");

            var selector = andSelectors.shift();
            //if (selector === ">") debugger;
            if (isSelected(tag, obj, selector)) {
                if (andSelectors.length) {
                    if (andSelectors[0].trim() === ">") {
                        andSelectors.shift();
                        return querySelectorAll(obj, andSelectors.join(" "));
                    }
                    return [querySelector(obj, andSelectors.join(" "))];
                }
                return [obj];
            }
        }
        return null;
    }
    function orSelected(tag, obj, selectors) {

        if (obj && typeof selectors === "string") {

            var result = [];

            selectors.split(",").forEach(function (selector) {

                var l = andSelected(tag, obj, selector);

                if (Array.isArray(l) && l.length) {
                    result = result.concat(l);
                }
            });
            return result;
        }
        return null;
    }

    /**
     * @param {any} obj
     * @param {string} selectors
     * @returns {any[]}
     */
    function querySelectorAll(obj, selectors) {

        var list = [], result = [];

        if (Array.isArray(obj)) {
            obj.forEach(function (o) {
                list = querySelectorAll(o, selectors);
                if (Array.isArray(list) && list.length)
                    result = result.concat(list);
            });
        }
        else if (typeof obj === "object" && obj) {

            Object.keys(obj).forEach(function (k) {

                if (k[0] === "-")
                    return;

                if (Array.isArray(obj[k])) {
                    obj[k].forEach(function (o) {
                        var l = orSelected(k, o, selectors);

                        if (Array.isArray(l) && l.length) {
                            list = list.concat(l);
                        }
                    });
                }
                else
                    list = orSelected(k, obj[k], selectors);

                if (Array.isArray(list) && list.length) {
                    result = result.concat(list);
                }
                else {
                    list = querySelectorAll(obj[k], selectors);
                    if (Array.isArray(list)) result = result.concat(list);
                }
            });
        }

        return result.length ? result : null;
    }
    xlmObj.querySelectorAll = querySelectorAll;
    
    /**
     * @param {any} obj
     * @param {string} selectors
     * @returns {any}
     */
    function querySelector(obj, selectors) {
        if (typeof selectors !== "string") return null;
        var isAll = selectors[0] === "*";
        var list = querySelectorAll(obj, isAll ? selectors.substr(1) : selectors);
        if (isAll) return list;
        if (list && list[0]) return list[0];
        return null;
    }
    xlmObj.querySelector = querySelector;

    // #endregion selector

    return xlmObj;

})(typeof exports === "undefined" ? this.XML || (this.XML = {}) : exports);