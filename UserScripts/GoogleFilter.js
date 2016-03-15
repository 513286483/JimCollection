'use strict';

main();
function main() {
    var href = location.href;
    var mapFirst;
    var mapSecond;

    var update;
    var isEngine;
    if (isEngine = (href.includes('google.co.uk/'))) {
        update = function () {
            var rc = $('.srg > .g > .rc');
            var links = rc.find('.r > a');
            var abstracts = rc.find('.s .st');
            for (var i = 0; i < links.length; i += 1) {
                var link = links[i];
                if (link.hasAttribute('onmousedown')) {
                    link.removeAttribute('onmousedown');
                }
                link = (link.href = link.href.replace('wikipedia.org/zh/', 'wikipedia.org/wiki/'));

                var abstract = $(abstracts[i]);
                mapFirst[link] = abstract.find('span').length ? '' : '-';
                mapFirst[link] += abstract.text();

                var emList = abstract.find('em');
                mapSecond[link] =
                    emList.length ?
                    '-' + emList.first().text() + '...' + emList.last().text() : extract(mapFirst[link]);
            }
        };
    }

    else if (isEngine = (href.includes('baidu.com/s?'))) {
        update = function () {
            var result = $('.c-container');
            result.map((i, element) => {
                element = $(element);

                var link = element.find('.t > a:first');
                var abstract = element.find('.c-abstract');
                if (link.length && abstract.length) {
                    link = link.attr('href').match(/(url=)(.{5})/).pop();

                    mapFirst[link] = '-' +
                        abstract.contents()
                                .filter((i, element) => element.nodeType === 3 || element.tagName === 'EM')
                                .text();

                    var emList = abstract.find('em');
                    mapSecond[link] =
                        emList.length ?
                        '-' + emList.first().text() + '...' + emList.last().text() : extract(mapFirst[link]);
                }
            });
        };
    }

    function commit() {
        update();
        GM_setValue('mapFirst', JSON.stringify(mapFirst));
        GM_setValue('mapSecond', JSON.stringify(mapSecond));
    }

    if (isEngine) {
        mapFirst = {};
        mapSecond = {};

        commit();
        var change;
        var observer = new MutationObserver(() => change = true);
        observer.observe(document.body, {childList: true, subtree: true});
        setInterval(() => {
            if (change) {
                commit();
                change = false;
            }
        }, 500);
    }

    else if (top === self) {
        var record = GM_getValue('mapFirst');
        mapFirst = record ? JSON.parse(record) : {};

        var abstract = document.referrer.includes('baidu.com/link?url=') ?
            mapFirst[href = document.referrer.match(/(url=)(.{5})/).pop()]
            : mapFirst[href] || mapFirst[href = document.referrer];

        if (abstract) {
            $(() => {
                if (filter(abstract) === -1 && href !== document.referrer) {
                    filter(JSON.parse(GM_getValue('mapSecond'))[href]);
                }
            });
        }
    }
}

function filter(abstract) {
    var marks = abstract
        .substr(abstract.indexOf('-') + 1)
        .split('...')
        .map(purify)
        .filter(Boolean);

    var open = xPath(findElement(marks.shift()));
    if (marks.length) {
        var close = xPath(findElement(marks.pop()));
    }

    var path = open && close && (open !== close) ? intersection(open, close) : open || close;
    if (!path) {
        return -1;
    }
    path = estimate(path);

    var element = document.evaluate(path).iterateNext();
    if (enoughText(element)) {
        toggleExcept(element);
        $(document).keypress('B', event => {
            if (event.ctrlKey) {
                toggleExcept(element);
            }
        });
    } else {
        return -1;
    }
}

function findElement(mark) {
    var result = null;

    function travelElement(element) {
        var children = element.children;
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            travelElement(child);
        }

        if (result === null &&
            element.tagName.search(/(SCRIPT|STYLE)/) === -1 && purify(getText(element)).includes(mark)) {
            result = element;
        }
    }

    travelElement(document.body);
    return result;
}

function xPath(node) {
    if (!(node && node.nodeType === 1)) {
        return '';
    }

    var count = 0;
    var siblings = node.parentNode.childNodes;
    for (var i = 0; i < siblings.length; i++) {
        var sibling = siblings[i];
        if (sibling.tagName === node.tagName) {
            count += 1;
        }
        if (sibling === node) {
            break;
        }
    }

    var suffix = count > 1 ? '[' + count + ']' : '';
    return xPath(node.parentNode) + '/' + node.tagName + suffix;
}

$.fn.visibleToggle = function () {
    return this.css('visibility', (i, visibility) => visibility === 'visible' ? 'hidden' : 'visible');
};

function toggleExcept(element) {
    var hide = $('._hide');
    if (hide.length === 0) {
        element.scrollIntoView();
        element = $(element);
        element.add(element.parentsUntil(document.body)).siblings().map(
            (i, x) => {
                x = $(x);
                if (x.is(':visible')) {
                    x.visibleToggle().addClass('_hide');
                }
            });
    } else {
        hide.visibleToggle();
    }
}

function purify(text) {
    return text.replace(/[^a-zA-Z\u4E00-\u9FFF]/g, '').toLowerCase();
}

function extract(abstract) {
    var marks = abstract
        .split(/[^a-zA-Z\u4E00-\u9FFF]/)
        .sort((a, b) => a.length - b.length);
    return '-' + marks.pop() + '...' + marks.pop();
}

function intersection(a, b) {
    var big, small;
    if (a.length > b.length) {
        big = a;
        small = b;
    } else {
        big = b;
        small = a;
    }

    for (var i = 0; i < small.length; i++) {
        if (small[i] !== big[i]) {
            break;
        }
    }

    small = small.substr(0, i);
    return small.substr(0, small.lastIndexOf('/'));
}

function estimate(xPath) {
    var breakPoints = [];
    var match;
    var re = /(DIV|ARTICLE|SECTION)/g;
    while ((match = re.exec(xPath))) {
        breakPoints.push(match.index);
    }

    if (breakPoints.length === 0) {
        return xPath;
    } else {
        var anchor = breakPoints[Math.ceil(breakPoints.length / 3) - 1];
        var close = xPath.indexOf('/', anchor);
        if (close !== -1) {
            return xPath.substr(0, close);
        } else {
            return xPath;
        }
    }
}

function getText(element) {
    if ($(element).is(':visible') && element.innerText) {
        return element.innerText;
    } else {
        return '';
    }
}

function enoughText(element) {
    return purify(getText(element)).length > purify(getText(document.body)).length / 5;
}