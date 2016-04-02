'use strict';

if (location.pathname.startsWith('/story')) {
    $(() => {
        $('.question:last-child').not(':contains("查看知乎原文")').remove();
    });
} else {
    $('<style>@media screen and (max-width: 1120px){.zu-top{display:none;}}</style>').appendTo('html');
    $(window)
        .on('copy', () => {
            GM_setClipboard(getSelection().toString(), 'text');
        })
        .on('click', (event) => {
            var link = event.target;
            if (link.parentElement && link.parentElement.tagName === 'A') {
                link = link.parentElement;
            }

            const sign = 'link.zhihu.com/?target=';
            if (link.classList.contains('external') && link.href.includes(sign)) {
                link.href = decodeURIComponent(link.href.substr(link.href.indexOf(sign) + sign.length));
            } else if (link.href === 'javascript:;') {
                link.href = '#';
            }
        });
    if (location.pathname === '/topic') {
        $(() => {
            var topics = $('.topic-feed-item > a');
            for (var i = 0; i < topics.length; i++) {
                var topic = topics[i];

                ((topic) => {
                    $.get(topic.href, (data) => {
                        var page = $(data.replace(/<img[^>]*>/g, ''));
                        var counts = page.find('.count');
                        counts.sort((a, b) => -(a.innerText - b.innerText));

                        counts.length > 0 ?
                            topic.innerText = topic.innerText + ' ' + counts.length + ':' + counts.first().text() :
                            topic.innerText += ' ✓';
                    });
                })(topic);
            }
        });
    }
}