'use strict';

var topics = $('.topic-feed-item > a');
for (var i = 0; i < topics.length; i++) {
    var topic = topics[i];

    (topic => {
        $.get(topic.href, data => {

            var page = $(data.replace(/<img[^>]*>/g, ''));
            var counts = page.find('.count');
            counts.sort((a, b) => -(a.innerText - b.innerText));

            counts.length > 0 ?
                topic.innerText = topic.innerText + ' ' + counts.length + ':' + counts.first().text() :
                topic.innerText += ' ✓';
        });
    })(topic);
}