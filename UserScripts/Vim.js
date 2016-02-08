// Hook
Element.prototype._addEventListener = Element.prototype.addEventListener;
Element.prototype.addEventListener = function (type, listener, userCapture) {
    this._addEventListener(type, listener, userCapture);
    if (type.search(/(mousedown|mouseup|click)/i) !== -1) {
        Page.clickElements.push(this);
    }
};

// Event
$(window)
    .on('click resize scroll', () => Page.escape())
    .on('click', event => Page.scrollWithin(event.target));

addEventListener('keydown', event => {
    var isTab = (event.code === 'Tab');
    if (isTab) {
        event.preventDefault();
    }

    if (Page.isReady(event)) {
        event.stopImmediatePropagation();
        if (isTab) {
            Page.escape();
        }
    } else if (isTab) {
        document.activeElement.blur();
    }
}, true);

addEventListener('keyup', event => {
    if (Page.isReady(event)) {
        event.stopImmediatePropagation();
    }
}, true);

addEventListener('keypress', event => {
    if (Page.isReady(event)) {
        var char = String.fromCharCode(event.keyCode).toUpperCase();
        switch (char) {
            case 'F':
                Page.linkHint();
                break;

            case 'J':
                Page.down();
                break;

            case 'K':
                Page.up();
                break;

            case 'X':
                Page.close();
                break;

            case ' ':
                Page.plus();
                break;

            default:
                Page.match(char);
        }

        event.preventDefault();
        event.stopImmediatePropagation();
    }
}, true);

// General
$('<style>._click{box-shadow:0 0 10px 0 black}</style>').appendTo('html');
$(`<style>._hint{
    background-color: rgba(173, 216, 230, 0.5);
    border-radius: 3px;
    box-shadow: 0 0 2px;
    color: black;
    font-family: consolas;
    font-size: 13px;
    position: fixed;
    z-index: 2147483648
}</style>`).appendTo('html');

// Worker
var Page = {
    clickElements: [],

    chars: '',
    hintMap: {},
    isPlus: false,
    scrollElement: null,

    linkHint: () => {
        Page.escape();

        var elements = getElements();
        var hints = getHints(elements);
        Page.hintMap = popupHints(elements, hints);

        function getElements() {
            var elements = $('a, button, select, input, textarea, [role="button"], [contenteditable], [tabindex]');
            var clickElements =
                $(Page.clickElements).find('div, span').addBack()
                                     .filter((i, element) => $(element).css('cursor') === 'pointer');
            return purify(elements, clickElements);

            function purify(elements, clickElements) {
                function canTouch(i, element) {
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
                        var driftTop = (temp = parseInt($element.css('margin-top')) < 0) ? -temp : 0;
                        var driftLeft = (temp = parseInt($element.css('margin-left')) < 0) ? -temp : 0;
                        element._top = rect.top + driftTop;
                        element._left = rect.left + driftLeft;

                        var positions = [[element._left + 1, element._top + 1],
                            [element._left + rect.width - 1, element._top + rect.height - 1]];

                        for (i = 0; i < positions.length; i++) {
                            var clickElement = document.elementFromPoint(positions[i][0], positions[i][1]);
                            if (clickElement === element) {
                                return true;
                            }
                        }
                    }
                }

                elements = elements.filter(canTouch);
                var WIDTH = 15;
                var HEIGHT = 16;

                var xTree = Tree.create(0, document.documentElement.clientWidth);
                var yTree = Tree.create(0, document.documentElement.clientHeight);
                for (var i = 0; i < elements.length; i++) {
                    var element = elements[i];
                    Tree.insert(xTree, element._left, element._left + WIDTH, element);
                    Tree.insert(yTree, element._top, element._top + HEIGHT, element);
                }

                clickElements = clickElements.filter(canTouch);
                clickElements = clickElements.filter(hasPlace);

                function hasPlace(ignore, element) {
                    var overlapsX = $();
                    var overlapsY = $();
                    Tree.search(xTree, element._left, element._left + WIDTH, x => overlapsX = overlapsX.add(x));
                    Tree.search(yTree, element._top, element._top + HEIGHT, x => overlapsY = overlapsY.add(x));

                    if (overlapsX.filter(overlapsY).length === 0) {
                        Tree.insert(xTree, element._left, element._left + WIDTH, element);
                        Tree.insert(yTree, element._top, element._top + HEIGHT, element);
                        return true;
                    }
                }

                return elements.add(clickElements);
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

            var availableChars = [];
            var singletonChars = [];
            for (i = 0; i < B.length; i++) {
                var char = B.charAt(i);
                if (allHints[char].length === lengthB) {
                    availableChars.push(char);
                } else if (allHints[char].length === lengthB - 1) {
                    singletonChars.push(char);
                }
            }

            for (i = 0; i < hints.length && (singletonChars.length || availableChars.length); i++) {
                var startChar = hints[i].charAt(0);
                if (singletonChars.length && singletonChars.indexOf(startChar) !== -1) {
                    hints[i] = startChar;
                } else if (availableChars.length) {
                    hints[i] = availableChars.pop();
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
        Page.chars = '';
        Page.hintMap = {};
        Page.isPlus = false;
        Page.scrollElement = null;
    },

    match: char => {
        var hints = $('._hint');
        if (hints.length) {
            Page.chars += char;

            if ((hints.length - hints
                    .filter((i, element) => !element.innerText.startsWith(Page.chars))
                    .remove().length) === 1) {

                var element = Page.hintMap[Page.chars];
                element.tagName === 'A' && Page.plusMode ? GM_openInTab(element.href, true) : Page.click(element);

                var toggle;
                (toggle = () => $(element).toggleClass('_click'))();
                setTimeout(toggle, 500);
                Page.escape();
            }
        }
    },

    down: ()=> Page.scrollElement ? Page.scrollElement.scrollTop += 100 : scrollBy(0, 100),

    up: ()=> Page.scrollElement ? Page.scrollElement.scrollTop -= 100 : scrollBy(0, -100),

    close: ()=> {
        window.close();
    },

    plus: ()=> {
        Page.isPlus = true;
        $('._hint').css('font-weight', 'bold');
    },

    click: (element) => {
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

            out:for (var i = 0; i < nodes.length; i++) {
                var node = nodes[i];
                for (var j = 0; j < names.length; j++) {
                    var name = names[j];

                    var before = document.body.innerText;
                    var event = new MouseEvent(name, {bubbles: true});
                    node.dispatchEvent(event);
                    if (document.body.innerText !== before) {
                        break out;
                    }
                }
            }
        }
    },

    scrollWithin: (target) => {
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

// Worker
var Tree = {
    create: (from, to) => {
        return {
            from: parseInt(from),
            to: parseInt(to)
        }
    },

    getLeft: (node) => {
        if (node.left) {
            return node.left
        } else {
            return node.left = Tree.create(node.from, Math.floor((node.from + node.to) / 2));
        }
    },

    getRight: (node) => {
        if (node.right) {
            return node.right
        } else {
            return node.right = Tree.create(Math.floor((node.from + node.to) / 2) + 1, node.to);
        }
    },

    insert: (node, from, to, value) => {
        from = parseInt(from);
        to = parseInt(to);

        if (node.from === from && node.to === to) {
            if (node.values) {
                return node.values.push(value);
            } else {
                return node.values = [value];
            }
        }

        var mid = Math.floor((node.from + node.to) / 2);
        if (from < mid) {
            Tree.insert(Tree.getLeft(node), from, Math.min(to, mid), value);
        }
        if (to > mid) {
            Tree.insert(Tree.getRight(node), Math.max(from, mid + 1), to, value);
        }
    },

    search: (node, from, to, outPipe) => {
        from = parseInt(from);
        to = parseInt(to);

        if (node.from === from && node.to === to) {
            return include(node, outPipe);
        }
        if (node.values && node.values.length) {
            outPipe(node.values);
        }

        var mid = Math.floor((node.from + node.to) / 2);
        if (from < mid) {
            Tree.search(Tree.getLeft(node), from, Math.min(to, mid), outPipe);
        }
        if (to > mid) {
            Tree.search(Tree.getRight(node), Math.max(from, mid + 1), to, outPipe);
        }

        function include(node, outPipe) {
            if (node.values && node.values.length) {
                outPipe(node.values);
            }
            if (node.left) {
                include(node.left, outPipe)
            }
            if (node.right) {
                include(node.right, outPipe)
            }
        }
    }
};