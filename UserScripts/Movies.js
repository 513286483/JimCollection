'use strict';

var count = 0;
var markLink = 'http://movie.douban.com/subject_search?search_text=';

var names = $('a > [data-type="name"]');
for (var i = 0; i < names.length; i++) {
    var name = names[i];

    (name => {
        GM_xmlhttpRequest({
            method: 'GET',
            url: markLink + name.innerText,

            onload: data => {
                var page = $(data.responseText.replace(/<img[^>]*>/g, ''));
                $(name).parent().find('[data-type="mark"]')
                       .text(page.find('.rating_nums').first().text());
                if (++count === names.length) {
                    sort();
                }
            }

        });
    })(name);
}

function sort() {
    var links = $('a');
    links.sort((a, b) => -($(a).find('[data-type="mark"]').text() - $(b).find('[data-type="mark"]').text()));
    links.detach();
    $('.list-group').append(links);
}