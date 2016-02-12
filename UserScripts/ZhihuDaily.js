'use strict';
var links = $('.list-group-item-info');
for (var i = 0; i < links.length; i++) {
    var link = links[i];
    if (link.innerText.search(/(·|？)/) === -1) {

        (link => {
            GM_xmlhttpRequest({
                method: 'GET',
                url: link.href,

                onload: data => {
                    var subPage = $(data.responseText.replace(/<img[^>]*>/g, ''));
                    var titles = subPage.find('.question-title').filter((i, element) => element.innerText);
                    if (titles.length === 1 && titles.text().indexOf('？') !== -1) {
                        link.text = titles.text();
                    } else {
                        link.text += '✓';
                    }
                }

            });
        })(link);
    }
}