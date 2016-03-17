'use strict';

if (location.pathname.startsWith('/story')) {
    $(()=> {
        var questions = $('div.content-inner > .question');
        for (var i = 0; i < questions.length; i++) {
            var question = $(questions[i]);
            if (question.text().match(/(一点编辑手记|这篇文章有意思吗)/g)) {
                question.remove();
            }
        }
    });
} else {
    $('<style>@media screen and (max-width: 1120px){.zu-top{display:none;}}</style>').appendTo('html');
    $(document)
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