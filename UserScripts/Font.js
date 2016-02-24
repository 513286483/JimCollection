'use strict';

var record = GM_getValue('fontQueue');
var fontQueue = record ? record.split(',') : [];
for (var i = 0; i < fontQueue.length; i++) {
    inject(fontQueue[i]);
}

$(() => {
        transformElement(document.body);
        GM_setValue('fontQueue', fontQueue.slice(0, 30).join(','));
    }
);

function inject(font) {
    var style =
        '<style>' +
        '@font-face{font-family:' + font + ';src:local(' + font + ');}' +
        '@font-face{font-family:' + font + ';unicode-range:U+4E00-9FFF;src:local(Noto Sans CJK SC);}' +
        '</style>';
    $(style).prependTo(document.body);
}

var cache;
function transformElement(element, probe) {
    var $element = $(element);
    var fontFamily = $element.css('font-family').replace(/'|"/g, '').toLowerCase();
    var fonts = fontFamily.split(', ').filter(notDefault);

    if (!fonts.includes('arial')) {
        fonts.push('arial');
        $element.css('font-family', fonts.join());
    }

    if ((probe || probe === undefined) && (probe = (fontFamily !== cache) && hasChinese(element))) {
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

    var children = element.children;
    for (var i = 0; i < children.length; i++) {
        var child = children[i];
        transformElement(child, probe);
    }
}

function hasChinese(element) {
    return element.innerText && element.innerText.search(/[\u4E00-\u9FFF]/) !== -1;
}

function notDefault(font) {
    return font && font.search(/(sans-serif|serif|monospace)/) === -1;
}