main();
function main() {
    var href = location.href;
    var mapFirst;
    var mapSecond;

    var update;
    var isEngine;
    if (isEngine = (href.indexOf('google.co.uk/') !== -1)) {
        update = function () {
            var rc = $('.srg > .g > .rc');
            var links = rc.find('.r > a');
            var abstracts = rc.find('.s .st');
            for (var i = 0; i < links.length; i += 1) {
                var link = links[i];
                if (link.hasAttribute('onmousedown')) {
                    link.removeAttribute('onmousedown')
                }

                link = link.href;
                var abstract = $(abstracts[i]);

                mapFirst[link] = abstract.find('span').length < 1 ? '-' : '';
                mapFirst[link] += abstract.text();

                var emList = abstract.find('em');
                mapSecond[link] =
                    emList.length ? '-' + emList.first().text() + '...' + emList.last().text() : extract(mapFirst[link])
            }
        }
    }

    else if (isEngine = (href.indexOf('baidu.com/s?') !== -1)) {
        $('<style>#content_right{display:none}</style>').prependTo('html');

        update = function () {
            var result = $('.c-container');
            result.map((i, element) => {
                element = $(element);

                var link = element.find('.t > a:first');
                var abstract = element.find('.c-abstract');
                if (link.length && abstract.length) {

                    link = link.attr('href').match(/(url=)(.{5})/).pop();
                    mapFirst[link] = '-' +
                        abstract.contents().filter((i, element) => element.nodeType === 3 || element.tagName === 'EM')
                                .text();

                    var emList = abstract.find('em');
                    mapSecond[link] = emList.length
                        ? '-' + emList.first().text() + '...' + emList.last().text() : extract(mapFirst[link]);
                }
            });
        }
    }

    if (isEngine) {
        mapFirst = {};
        mapSecond = {};

        var change = true;
        var observer = new MutationObserver(() => change = true);
        var config = {childList: true, subtree: true};

        function commit() {
            update();
            GM_setValue('mapFirst', JSON.stringify(mapFirst));
            GM_setValue('mapSecond', JSON.stringify(mapSecond));
        }

        commit();
        observer.observe(document.body, config);
        setInterval(() => {
            if (change) {
                commit();
                change = false;
            }
        }, 500);
    }

    else {
        var record = GM_getValue('mapFirst');
        if (record) {
            mapFirst = JSON.parse(record);
        } else {
            return;
        }

        if (document.referrer.indexOf('baidu.com/link?url=') !== -1) {
            href = document.referrer.match(/(url=)(.{5})/).pop();
        }
        var abstract = mapFirst[href];
        if (abstract) {
            $(() => {
                if (filter(abstract) === -1) {
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

    var open = xPath(findNode(marks.shift()));
    if (marks.length) {
        var close = xPath(findNode(marks.pop()));
    }

    var final = open && close && (open !== close) ? intersection(open, close) : open || close;
    if (!final) {
        return -1;
    }
    final = estimate(final);

    var node = document.evaluate(final).iterateNext();
    if (enoughText(node)) {
        toggleBy(node);

        $(document).keypress('B', event => {
            if (event.ctrlKey) {
                toggleBy(node)
            }
        });
    }
}

function findNode(mark) {
    var result = undefined;

    function travelNode(node) {
        var childNodes = node.childNodes;
        for (var i = 0; i < childNodes.length; i++) {
            var childNode = childNodes[i];

            if (childNode.nodeType === 1) {
                travelNode(childNode);
            }
        }

        if (result === undefined &&
            node.tagName.search(/(SCRIPT|STYLE)/) === -1 && purify(getText(node)).indexOf(mark) !== -1) {
            result = node;
        }
    }

    travelNode(document.body);
    return result;
}

function xPath(node) {
    if (!node || node.nodeType !== 1) {
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
    return this.css('visibility', function (i, visibility) {
        return (visibility === 'visible') ? 'hidden' : 'visible';
    });
};

function toggleBy(node) {
    var _hide = $('._hide');
    if (_hide.length === 0) {
        node.scrollIntoView();
        node = $(node);
        node.add(node.parentsUntil(document.body)).siblings().map(
            (i, x) => {
                x = $(x);
                if (x.is(':visible')) {
                    x.visibleToggle().addClass('_hide');
                }
            });
    } else {
        _hide.visibleToggle();
    }
}

function purify(text) {
    return text.replace(/[^a-zA-Z\u4E00-\u9FFF]/g, '').toLowerCase();
}

function extract(abstract) {
    var marks = abstract.split(/[^a-zA-Z\u4E00-\u9FFF]/g);
    if (marks) {
        marks = marks.sort((a, b) => a.length - b.length);
        return '-' + marks.pop() + '...' + marks.pop();
    }
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
    var result = [];

    var match;
    var re = /(DIV|ARTICLE|SECTION)/g;
    while ((match = re.exec(xPath))) {
        result.push(match.index);
    }

    if (result.length === 0) {
        return xPath;
    } else {
        var mid = result[Math.ceil(result.length / 3) - 1];
        var close = xPath.indexOf('/', mid);
        if (close !== -1) {
            return xPath.substr(0, close);
        } else {
            return xPath;
        }
    }
}

function getText(node) {
    if ($(node).is(':visible') && node.innerText) {
        return node.innerText;
    } else {
        return '';
    }
}

function enoughText(node) {
    return purify(getText(node)).length > purify(getText(document.body)).length / 5;
}