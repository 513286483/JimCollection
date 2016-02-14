'use strict';

var topics = $('.topic-feed-item > a');
for (var i = 0; i < topics.length; i++) {
    var topic = topics[i];

    (topic => {
        $.get(topic.href, data => {

            var subPage = $(data.replace(/<img[^>]*>/g, ''));
            var counts = subPage.find('.count');
            counts.sort((x, y) => -(x.innerText - y.innerText));

            topic.innerText = counts.length > 0 ?
            topic.innerText + ' ' + counts.length + ':' + counts.first().text() : topic.innerText += ' ✓';
        });
    })(topic);
}