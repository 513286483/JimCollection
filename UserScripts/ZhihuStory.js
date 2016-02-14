'use strict';

var questions = $('div.content-inner > .question');
for (var i = 0; i < questions.length; i++) {
    var question = $(questions[i]);
    if (question.text().match(/(一点编辑手记|下载知乎日报客户端|这篇文章有意思吗)/g)) {
        question.remove();
    }
}