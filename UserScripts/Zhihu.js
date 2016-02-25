'use strict';

$('<style>@media screen and (max-width: 1120px){.zu-top{display:none;}}</style>').appendTo('html');
$(document)
    .on('copy', () => {
        GM_setClipboard(getSelection().toString(), 'text');
    })
    .on('click', event => {
        var link = event.target;
        if (link.classList.contains('external')) {
            const sign = 'link.zhihu.com/?target=';
            link.href = decodeURIComponent(link.href.substr(link.href.indexOf(sign) + sign.length));
        }
    });