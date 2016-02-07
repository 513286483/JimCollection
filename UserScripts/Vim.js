// Handler
var commandMap = {};
var commandCount = 0;
function dispatch(command, ...args) {
    return commandMap[command].apply(args);
}

// Global
var clickableElements = [];

// Hook
Element.prototype._addEventListener = Element.prototype.addEventListener;
Element.prototype.addEventListener = function (type, listener, userCapture) {
    this._addEventListener(type, listener, userCapture);
    if (type.search(/(mousedown|mouseup|click)/i) !== -1) {
        clickableElements.push(this);
    }
};

// Event
$(window)
    .on('click resize scroll', () => dispatch(ESCAPE))
    .on('click', event => dispatch(SWITCH_SCROLL));

addEventListener('keydown', event => {
    var isTab = (event.code === 'Tab');
    if (isTab) {
        event.preventDefault();
    }

    if (dispatch(IS_READY, event)) {
        if (isTab) {
            dispatch(ESCAPE);
        }
        event.stopImmediatePropagation();
    } else if (isTab) {
        document.activeElement.blur();
    }
}, true);

addEventListener('keyup', event => {
    if (dispatch(IS_READY, event)) {
        event.stopImmediatePropagation();
    }
}, true);

addEventListener('keypress', event => {
    if (dispatch(IS_READY, event)) {
        var char = String.fromCharCode(event.keyCode).toUpperCase();
        switch (char) {
            case 'F':
                dispatch(LINK_HINT);
                break;

            case 'J':
                dispatch(DOWN);
                break;

            case 'K':
                dispatch(UP);
                break;

            case 'X':
                dispatch(CLOSE);
                break;

            case ' ':
                dispatch(PLUS);
                break;

            case ',':
                dispatch(TAB_LEFT);
                break;

            case '.':
                dispatch(TAB_RIGHT);
                break;

            default:
                dispatch(MATCH, char);
        }

        event.preventDefault();
        event.stopImmediatePropagation();
    }
}, true);

// General
$('<style>._click{box-shadow:0 0 10px 0 black}</style>').appendTo('html');
$(`<style>._hint{
    background-color: lightBlue;
    border-radius: 3px;
    box-shadow: 0 0 2px;
    color: black;
    font-family: consolas;
    font-size: 13px;
    opacity: 0.9;
    position: fixed;
    z-index: 2147483648
}</style>`).appendTo('html');

// Employee
var LINK_HINT;
var ESCAPE;
var MATCH;
var DOWN;
var UP;
var CLOSE;
var PLUS;
var SWITCH_SCROLL;
var IS_READY;

var Page = {
    hintMap: {},
    inChars: '',
    inPlus: false,
    scrollElement: null,

    linkHint: () => {
        dispatch(ESCAPE);

        var elements = getElements();
        var hints = getHints(elements);
        Page.hintMap = popupHints(elements, hints);

        function getElements() {
            var elements = $('a, button, select, input, textarea, [role="button"], [contenteditable], [tabindex]');
            var additionalElements = $(clickableElements).find('div, span').addBack()
                                                         .filter((i, element) => $(element).css('cursor') == 'pointer');
            return purify(elements, additionalElements);

            function purify(elements, additionalElements) {
                function canTouch(element) {
                    var $element = $(element);

                    if ($element.css('display') === 'none' ||
                        $element.css('visibility') === 'hidden' || $element.css('opacity') == '0') {
                        return;
                    }

                    var rect = element.getBoundingClientRect();
                    if (rect.top >= 0 && rect.left >= 0 && rect.width > 1 && rect.height > 1
                        && rect.bottom <= document.documentElement.clientHeight
                        && rect.right <= document.documentElement.clientWidth) {

                        var temp;
                        var driftTop = (temp = parseInt($element.css('margin-top'))) < 0 ? -temp : 0;
                        var driftLeft = (temp = parseInt($element.css('margin-left'))) < 0 ? -temp : 0;
                        element._top = rect.top + driftTop;
                        element._left = rect.left + driftLeft;

                        var positions = [[element._left + 1, element._top + 1],
                            [element._left + rect.width - 1, element._top + rect.height - 1]];

                        for (var i = 0; i < positions.length; i++) {
                            var clickElement = document.elementFromPoint(positions[i][0], positions[i][1]);
                            if (clickElement === element ||
                                clickElement.contains(element) || element.contains(clickElement)) {
                                return true;
                            }
                        }
                    }
                }

                elements = $.filter(elements, canTouch);
                var i, element;

                var WIDTH = 6;
                var Xtree = dispatch(TREE_RELOAD, 0, document.documentElement.clientWidth);
                for (i = 0; i < elements.length; i++) {
                    element = elements[i];
                    dispatch(TREE_INSERT, element._left, element._left + WIDTH, element, WIDTH + 1);
                }

                var HEIGHT = 17;
                var Ytree = dispatch(TREE_RELOAD, 0, document.documentElement.clientHeight);
                for (i = 0; i < elements.length; i++) {
                    element = elements[i];
                    dispatch(TREE_INSERT, element._top, element._top + HEIGHT, element, HEIGHT + 1);
                }

                additionalElements = $.filter(additionalElements, canTouch)
                                      .filter(notOverlap);

                function notOverlap(element) {
                    var overlapsX = $();
                    var overlapsY = $();

                    dispatch(TREE_RELOAD, Xtree);
                    dispatch(TREE_SEARCH, element._left, element._left + WIDTH, (result)=> overlapsX.add(result));
                    dispatch(TREE_RELOAD, Ytree);
                    dispatch(TREE_SEARCH, element._top, element._top + HEIGHT, (result) => overlapsY.add(result));

                    if (overlapsX.filter(overlapsY).length === 0) {
                        dispatch(TREE_RELOAD, Xtree);
                        dispatch(TREE_INSERT, element._left, element._left + WIDTH, element, WIDTH + 1);
                        dispatch(TREE_RELOAD, Ytree);
                        dispatch(TREE_INSERT, element._top, element._top + HEIGHT, element, HEIGHT + 1);
                        return true;
                    }
                }

                dispatch(TREE_RELOAD, null);
                return element.add(additionalElements);
            }
        }

        function getHints(elements) {
            var hints = [];
            var Y = 'ABCDEGHILM';
            var X = '1234567890';
            var B = 'NOPQRSTUVWYZ' + Y + X;
            var lengthB = B.length;

            var allHints = {};
            for (var i = 0; i < B.length; i++) {
                allHints[B.charAt(i)] = B;
            }

            for (i = 0; i < elements.length; i++) {
                var element = elements[i];

                var y = Y.charAt(Math.round(element._top / document.documentElement.clientHeight * (Y.length - 1)));
                var x = X.charAt(Math.round(element._left / document.documentElement.clientWidth * (X.length - 1)));

                if (allHints[y].indexOf(x) === -1) {
                    y = B.charAt(0);
                    x = allHints[y].charAt(0);
                }

                allHints[y] = allHints[y].replace(x, '');
                if (allHints[y] === '') {
                    B = B.replace(y, '');
                }
                hints.push(y + x);
            }

            var unusedHints = [];
            var singleHints = [];
            for (i = 0; i < B.length; i++) {
                if (allHints[B.charAt(i)].length === lengthB) {
                    unusedHints.push(B.charAt(i));
                }
                else if (allHints[B.charAt(i)].length === lengthB - 1) {
                    singleHints.push(B.charAt(i));
                }
            }

            for (i = 0; i < hints.length && (singleHints.length || unusedHints.length); i++) {
                var letter = hints[i].charAt(0);
                if (singleHints && singleHints.indexOf(letter) !== -1) {
                    hints[i] = letter;
                } else if (unusedHints.length) {
                    hints[i] = unusedHints.pop();
                }
            }

            return hints;
        }

        function popupHints(elements, hints) {
            var map = {};

            for (var i = 0; i < elements.length; i++) {
                var element = elements[i];
                var hint = hints[i];
                map[hint] = element;

                var style = {
                    'top': element._top,
                    'left': element._left
                };
                $('<div class="_hint">' + hint + '</div>')
                    .css(style)
                    .appendTo('html');
            }

            return map;
        }
    },

    escape: () => {
        $('._hint').remove();
        Page.hintMap = {};
        Page.inChars = '';
        Page.inPlus = false;
        Page.scrollElement = null;
    },

    match: char => {
        var hints = $('._hint');
        if (hints.length) {
            Page.inChars += char;

            if ((hints.length -
                hints.filter((i, element) => !element.innerText.startsWith(Page.inChars)).remove().length) === 1) {

                var element = Page.hintMap[Page.inChars];
                element.tagName === 'A' && Page.plusMode ? GM_openInTab(element.href, true) : Page.mouseClick(element);

                var toggle;
                (toggle = () => $(element).toggleClass('_click'))();
                setTimeout(toggle, 500);
                dispatch(ESCAPE);
            }
        }
    },

    down: ()=> Page.scrollElement ? Page.scrollElement.scrollTop += 100 : scrollBy(0, 100),

    up: ()=> Page.scrollElement ? Page.scrollElement.scrollTop -= 100 : scrollBy(0, -100),

    close: ()=> {
        dispatch(TAB_CLOSE);
        window.close();
    },

    plus: ()=> {
        $('._hint').css('font-weight', 'bold');
        Page.inPlus = true;
    },

    mouseClick: (element) => {
        var $element = $(element);

        if ((element.tagName === 'INPUT'
            && element.type.search(/(button|checkbox|file|hidden|image|radio|reset|submit)/i) === -1)
            || element.tagName === 'TEXTAREA') {

            element.focus();
            if (document.activeElement.tagName === 'BODY') {
                $element.parent().find('input, textarea').focus();
            }
        }

        else if (element.tagName === 'A') {
            element.click();
        }

        else if (element.tagName === 'DIV' && element.hasAttribute('contenteditable')) {
            element.focus();
        }

        else {
            stimulateClick(element);
        }

        function stimulateClick(element) {
            var names = ['mousedown', 'mouseup', 'click'];
            var nodes = $(element).find('div, span').addBack();

            Out:for (var i = 0; i < nodes.length; i++) {
                var node = nodes[i];
                for (var j = 0; j < names.length; j++) {
                    var name = names[j];

                    var before = document.body.innerText;
                    var event = new MouseEvent(name, {bubbles: true});
                    node.dispatchEvent(event);
                    if (document.body.innerText !== before) {
                        break Out;
                    }
                }
            }

        }
    },

    switchScroll: (target) => {
        target = $(target);
        var elements = target.add(target.parentsUntil(document.body));
        for (var i = 0; i < elements.length; i++) {
            var element = elements[i];
            if (element.scrollHeight > element.clientHeight) {
                Page.scrollElement = element;
            }
        }
    },

    isReady: (event) => {
        var element = document.activeElement;
        return element && element.nodeName !== 'INPUT'
            && element.nodeName !== 'TEXTAREA' && !element.hasAttribute('contenteditable') && !event.ctrlKey;
    }
};
commandMap[LINK_HINT = ++commandCount] = Page.linkHint;
commandMap[ESCAPE = ++commandCount] = Page.escape;
commandMap[MATCH = ++commandCount] = Page.match;
commandMap[DOWN = ++commandCount] = Page.down;
commandMap[UP = ++commandCount] = Page.up;
commandMap[CLOSE = ++commandCount] = Page.close;
commandMap[PLUS = ++commandCount] = Page.plus;
commandMap[SWITCH_SCROLL = ++commandCount] = Page.switchScroll;
commandMap[IS_READY = ++commandCount] = Page.isReady;

// Employee
var TREE_RELOAD;
var TREE_INSERT;
var TREE_SEARCH;

var SegmentTree = {
    node: null,

    reload: function (...args) {
        return SegmentTree.node = arguments.length === 1 ? args[0] : SegmentTree.create(args[0], args[1]);
    },

    create: (from, to) => {
        return {
            from: from,
            to: to,
            left: null,
            right: null,
            values: []
        }
    },

    getLeft: (node) => {
        if (node.left) {
            return node.left
        } else {
            return node.left = SegmentTree.create(node.from, Math.floor((node.from + node.to) / 2));
        }
    },

    getRight: (node) => {
        if (node.right) {
            return node.right
        } else {
            return node.right = SegmentTree.create(Math.floor((node.from + node.to) / 2) + 1, node.to);
        }
    },

    insert: (from, to, value, range, node) => {
        if (!node) {
            node = SegmentTree.node;
        }

        if (node.from <= from && to <= node.to && node.to - node.from < range) {
            node.values.push(value)
        }
        if (node.from === from && node.to === to) {
            return;
        }

        var mid = Math.floor((node.from + node.to) / 2);
        if (from <= mid) {
            SegmentTree.insert(from, mid, value, range, SegmentTree.getLeft(node));
        }
        if (to > mid) {
            SegmentTree.insert(mid + 1, to, value, range, SegmentTree.getRight(node));
        }
    },

    search: (from, to, out, node) => {
        if (!node) {
            node = SegmentTree.node;
        }

        if (node.from === from && node.to === to) {
            return out(node.values)
        }

        var mid = Math.floor((node.from + node.to) / 2);
        if (from <= mid) {
            SegmentTree.search(from, mid, out, SegmentTree.getLeft(node));
        }
        if (to > mid) {
            SegmentTree.search(mid + 1, to, out, SegmentTree.getRight(node));
        }
    }
};
commandMap[TREE_RELOAD = ++commandCount] = SegmentTree.reload;
commandMap[TREE_INSERT = ++commandCount] = SegmentTree.insert;
commandMap[TREE_SEARCH = ++commandCount] = SegmentTree.search;

// Employee
var TAB_OPEN;
var TAB_APPEND;
var TAB_LEFT;
var TAB_RIGHT;
var TAB_CLOSE;

var Tab = {
    open: function () {

    },
    append: function () {

    },

    left: function () {

    },

    right: function () {

    },

    close: function () {

    }
};
commandMap[TAB_OPEN = ++commandCount] = Tab.open;
commandMap[TAB_APPEND = ++commandCount] = Tab.append;
commandMap[TAB_LEFT = ++commandCount] = Tab.left;
commandMap[TAB_RIGHT = ++commandCount] = Tab.right;
commandMap[TAB_CLOSE = ++commandCount] = Tab.close;