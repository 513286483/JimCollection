'use strict';

// Hook
Element.prototype._addEventListener = Element.prototype.addEventListener;
Element.prototype.addEventListener = function (type, listener, userCapture) {
    this._addEventListener(type, listener, userCapture);
    if (type.match(/(mousedown|mouseup|click)/i)) {
        Page.clickElements.push(this);
    }
};

// Event
$(window).on('click resize scroll', () => Page.escape());

addEventListener('keydown', event => {
    var isFree = Page.isFree(event);
    var isTab = (event.code === 'Tab');

    if (isTab) {
        event.preventDefault();
        event.stopImmediatePropagation();
        isFree ? Page.escape() : document.activeElement.blur();
    } else if (isFree) {
        event.stopImmediatePropagation();
    }
}, true);

addEventListener('keyup', event => {
    if (Page.isFree(event)) {
        event.stopImmediatePropagation();
    }
}, true);

addEventListener('keypress', event => {
    if (Page.isFree(event)) {
        var char = String.fromCharCode(event.keyCode).toUpperCase();
        switch (char) {
            case 'F':
                $('._hint').length ? Page.match(char) : Page.linkHint();
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
$(`<style>
._click{box-shadow:0 0 10px 0 black}
._plus{font-weight:bold;}
._hint{
    background-color: rgba(173, 216, 230, 0.7);
    border-radius: 3px;
    box-shadow: 0 0 2px;
    color: black;
    font-family: consolas;
    font-size: 13px;
    position: fixed;
    z-index: 2147483648
}</style>`).appendTo('html');

var Page = {
    clickElements: [],

    chars: '',
    hintMap: {},
    isPlus: false,

    linkHint: () => {
        Page.escape();

        var elements = getElements();
        var hints = getHints(elements);
        Page.hintMap = popupHints(elements, hints);

        function getElements() {
            var elements = $('a, button, select, input, textarea, [role="button"], [contenteditable]');

            function removeDuplicate(elements) {
                var result = [];
                elements.map(
                    element => {
                        for (var i = 0; i < result.length; i++) {
                            if (result[i].contains(element)) {
                                return;
                            }
                        }
                        result.push(element);
                    }
                );
                return result;
            }

            var clickElements = $(removeDuplicate(Page.clickElements))
                .find('div, span')
                .filter((i, element) => {
                    var style = getComputedStyle(element);
                    return (style.cursor === 'pointer'
                        || (style.cursor === 'default' && element.classList.toString().includes('button')))
                        && !style.left.includes('-') && !style.top.includes('-')
                });
            return purify(elements, clickElements);

            function purify(elements, clickElements) {
                function isDisplayed(i, element) {
                    var computedStyle = getComputedStyle(element);
                    if (computedStyle.display === 'none' ||
                        computedStyle.visibility === 'hidden' || computedStyle.opacity === '0') {
                        return;
                    }

                    var rect = element.getClientRects()[0];
                    if (rect && rect.left >= 0 && rect.top >= 0 && rect.width > 1 && rect.height > 1
                        && rect.right <= document.documentElement.clientWidth
                        && rect.bottom <= document.documentElement.clientHeight) {

                        element._left = rect.left;
                        element._top = rect.top;
                        var positions = [[element._left + 1, element._top + 1],
                            [element._left + rect.width / 3, element._top + rect.height / 3]];

                        for (i = 0; i < positions.length; i++) {
                            var targetElement = document.elementFromPoint(positions[i][0], positions[i][1]);
                            if (targetElement === element || element.contains(targetElement)) {
                                return true;
                            }
                        }
                    }
                }

                elements = elements.filter(isDisplayed);
                clickElements = clickElements.filter(isDisplayed);
                var xTree = Tree.create(0, document.documentElement.clientWidth);
                var yTree = Tree.create(0, document.documentElement.clientHeight);

                elements = elements.filter((i, element) => hasPlace(element));
                clickElements = clickElements.get().reverse().filter(hasPlace);

                function hasPlace(element) {
                    const length = 16;
                    var overlapsX = $();
                    var overlapsY = $();

                    var leftTo = Math.min(element._left + length, xTree.to);
                    var topTo = Math.min(element._top + length, yTree.to);
                    Tree.search(xTree, element._left, leftTo, x => overlapsX = overlapsX.add(x));
                    Tree.search(yTree, element._top, topTo, y => overlapsY = overlapsY.add(y));

                    if (overlapsX.filter(overlapsY).length === 0) {
                        Tree.insert(xTree, element._left, leftTo, element);
                        Tree.insert(yTree, element._top, topTo, element);
                        element.siblingsY = overlapsY;
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

                if (allHints[y].length === 0) {
                    y = B.charAt(0);
                }
                if (!allHints[y].includes(x)) {
                    x = allHints[y].charAt(0);
                }

                allHints[y] = allHints[y].replace(x, '');
                if (allHints[y] === '') {
                    B = B.replace(y, '');
                }

                hints.splice(Math.round(hints.length * 0.618 % 1 * hints.length), 0, y + x);
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

            for (i = 0; i < hints.length; i++) {
                var startChar = hints[i].charAt(0);
                if (singletonChars.includes(startChar)) {
                    hints[i] = startChar;
                } else if (availableChars.length) {
                    hints[i] = availableChars.pop();
                    if ((allHints[startChar] += '.').length === lengthB - 1) {
                        singletonChars.push(startChar);
                    }
                }
            }

            var availableChar = 'F';
            for (i = 0; i < elements.length; i++) {
                element = elements[i];
                if (element.tagName === 'INPUT' &&
                    element.type.search(/(button|checkbox|file|hidden|image|radio|reset|submit)/i) === -1) {
                    availableChar = hints[i];
                    hints[i] = 'F';
                    break;
                }
            }

            if (availableChar.length == 1) {
                for (i = 0; i < hints.length; i++) {
                    if (hints[i].length > 1) {
                        hints[i] = availableChar;
                        break
                    }
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

                element.siblingsY.each((i, elem) => {
                    if (Math.abs(element._top - elem._top) <= 5) {
                        element._top = elem._top;
                        return false;
                    }
                });

                var style = {
                    top: element._top,
                    left: element._left
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
    },

    match: char => {
        var hints = $('._hint');
        if (hints.length) {
            Page.chars += char;

            var removeElements = [];
            hints = hints.filter((i, element) => {
                if (element.innerText.startsWith(char)) {
                    return element.innerText = element.innerText.substr(-1);
                } else {
                    removeElements.push(element);
                }
            });
            $(removeElements).remove();

            if (hints.length === 1) {
                var element = Page.hintMap[Page.chars];
                element.tagName === 'A' && Page.isPlus ? GM_openInTab(element.href, true) : Page.click(element);

                element = $(element).addClass('_click');
                setTimeout(() => element.removeClass('_click'), 500);
                Page.escape();
            }
        }
    },

    down: ()=> scrollBy(0, 200),

    up: ()=> scrollBy(0, -200),

    close: ()=> {
        top.close();
    },

    plus: ()=> {
        Page.isPlus = !Page.isPlus;
        $('._hint').toggleClass('_plus');
    },

    click: (element) => {
        var $element = $(element);

        if ((element.tagName === 'INPUT' && element
                .type.search(/(button|checkbox|file|hidden|image|radio|reset|submit)/i) === -1) ||
            element.hasAttribute('contenteditable') || element.tagName === 'TEXTAREA') {
            element.focus();
        }

        else if ((element.tagName === 'A' && element.getAttribute('href').match(/(\/|\.)/i)) ||
            element.tagName === 'INPUT') {
            element.click();
        }

        else {
            mouseClick();
        }

        function mouseClick() {
            var before = document.body.innerHTML;
            var nodes = [element, ...$element.find('div, span').get()];
            var names = ['mousedown', 'mouseup', 'click'];

            out:for (var node of nodes) {
                for (var name of names) {
                    node.dispatchEvent(new MouseEvent(name, {bubbles: true}));
                    if (document.body.innerHTML !== before) {
                        break out;
                    }
                }
            }
        }
    },

    isFree: (event) => {
        var element = document.activeElement;
        return element && element.tagName !== 'INPUT' && element.tagName !== 'TEXTAREA'
            && !element.hasAttribute('contenteditable') && !event.ctrlKey;
    }
};

var Tree = {
    create: (from, to) => {
        return {
            from: Math.floor(from),
            to: Math.floor(to)
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
        from = Math.floor(from);
        to = Math.floor(to);

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
        from = Math.floor(from);
        to = Math.floor(to);

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