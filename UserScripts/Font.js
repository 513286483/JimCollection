'use strict';
var record = GM_getValue('fontQueue');
var fontQueue = record ? record.split(',') : ['arial'];
for (var i = 0; i < fontQueue.length; i++) {
    inject(fontQueue[i]);
}

$(() => {
        transformElement(document.body, true);
        if (fontQueue.length > 30) {
            fontQueue.slice(0, 30);
        }
        GM_setValue('fontQueue', fontQueue.join(','));
    }
);

function inject(font) {
    var style =
        '<style>' +
        '@font-face{font-family:' + font + ';src:local(' + font + ');}' +
        '@font-face{font-family:' + font + ';unicode-range: U+4E00-9FFF;src:local(Noto Sans CJK SC);}' +
        '</style>';
    $(style).prependTo('html');
}

var cache;
function transformElement(element, check) {
    var $element = $(element);
    var fontFamily = $element.css('font-family').replace(/'|"/g, '').toLowerCase();
    var fonts = fontFamily.split(', ').filter(notDefault);

    if (fonts.indexOf('arial') === -1) {
        fonts.push('arial');
        $element.css('font-family', fonts.join());
    }

    if (check && fontFamily !== cache && (check = hasChinese(element))) {
        fonts.map(
            font => {
                var curr = fontQueue.indexOf(font);
                if (curr === -1) {
                    inject(font);
                    fontQueue.push(font);
                } else if (curr !== 0) {
                    var prev = curr - 1;
                    var temp = fontQueue[curr];
                    fontQueue[curr] = fontQueue[prev];
                    fontQueue[prev] = temp;
                }
            }
        );
        cache = fontFamily;
    }

    var childNodes = element.childNodes;
    for (var i = 0; i < childNodes.length; i++) {
        var childNode = childNodes[i];
        if (childNode.nodeType === 1) {
            transformElement(childNode, check);
        }
    }
}

function hasChinese(element) {
    return element.innerText && element.innerText.search(/[\u4E00-\u9FFF]/) !== -1;
}

function notDefault(font) {
    return font && font.search(/(sans-serif|serif|monospace)/) === -1;
}