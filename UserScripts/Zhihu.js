$(() => {
    var sign = 'link.zhihu.com/?target=';
    var links = $('a.external');
    for (var i = 0; i < links.length; i++) {
        var link = links[i];
        link.href = decodeURIComponent(link.href.substr(link.href.indexOf(sign) + sign.length));
    }

    $('<style>@media screen and (max-width: 1120px){.zu-top{display:none;}}</style>').appendTo('head');
});

$(document).on('copy', function (event) {
    event.stopPropagation();
    event.preventDefault();
    event.originalEvent.clipboardData.setData('text/plain', getSelection().toString());
});