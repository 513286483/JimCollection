'use strict';

$('<style>@media screen and (max-width: 1120px){.zu-top{display:none;}}</style>').appendTo('html');
$(document)
    .on('copy', event => {
        event.preventDefault();
        event.stopPropagation();
        event.originalEvent.clipboardData.setData('text/plain', getSelection().toString());
    })
    .on('click', event => {
        const sign = 'link.zhihu.com/?target=';
        var link = event.target;
        if (link.classList.contains('external')) {
            link.href = decodeURIComponent(link.href.substr(link.href.indexOf(sign) + sign.length));
        }
    });