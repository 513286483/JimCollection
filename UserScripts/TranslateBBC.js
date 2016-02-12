'use strict';
var prevWord = '';
var audio = new AudioContext();
addEventListener('mouseup', translate);

function translate(event) {
    var prevPopup = document.querySelector('.overlay-popup');
    if (prevPopup) {
        document.body.removeChild(prevPopup);
    }

    var selection = document.getSelection();
    if (selection.anchorNode.nodeType === 3) {
        var word = selection.toString();

        if (word == '' || word === prevWord) {
            return;
        } else {
            prevWord = word;
        }

        var ts = new Date().getTime();
        var x = event.clientX;
        var y = event.clientY;
        request(word, ts);
    }

    function request(word, ts) {
        var requestLink = 'http://fanyi.youdao.com/openapi.do?type=data&doctype=json&version=1.1&relatedUrl=' +
            encodeURIComponent('http://fanyi.youdao.com/#') +
            '&keyfrom=fanyiweb&key=null&translate=on' +
            '&q=' + word +
            '&ts=' + ts;

        GM_xmlhttpRequest({
            method: 'GET',
            url: requestLink,
            onload: res => popup(x, y, res.response)
        });
    }
}

function popup(x, y, result) {
    var overlayPopup = document.createElement('div');
    overlayPopup.classList.add('overlay-popup');

    var map = JSON.parse(result);
    'basic' in map ? word() : sentence();

    function word() {
        var query = map['query'];
        var basic = map['basic'];

        var header = document.createElement('div');
        var span = document.createElement('span');
        span.innerText = query;
        span.style.color = 'black';
        header.appendChild(span);

        var phonetic = basic['phonetic'];
        if (phonetic) {
            var phoneticElement = document.createElement('span');
            phoneticElement.innerText = '[' + phonetic + ']';
            phoneticElement.style.cursor = 'pointer';
            phoneticElement.addEventListener('mouseup', event => event.stopPropagation());
            header.appendChild(phoneticElement);

            var soundUrl = 'https://dict.youdao.com/dictvoice?type=2&audio=' + query;
            GM_xmlhttpRequest({
                method: 'GET',
                url: soundUrl,
                responseType: 'arraybuffer',

                onload: res => {
                    audio.decodeAudioData(res.response, buffer => {
                        phoneticElement.addEventListener('mouseup', () => {
                            var source = audio.createBufferSource();
                            source.buffer = buffer;
                            source.connect(audio.destination);
                            source.start(0);
                        });
                        header.appendChild(document.createTextNode('✓'));
                    })
                }

            })
        }

        header.style.color = 'darkBlue';
        header.style.margin = '0px';
        header.style.padding = '0px';
        overlayPopup.appendChild(header);

        var hr = document.createElement('hr');
        hr.style.margin = '0px';
        overlayPopup.appendChild(hr);

        var ul = document.createElement('ul');
        basic['explains'].map(explain => {
            var li = document.createElement('li');
            li.appendChild(document.createTextNode(explain));
            ul.appendChild(li);
        });

        ul.style.listStyle = 'none';
        ul.style.margin = '0px';
        ul.style.padding = '0px';
        ul.style.textAlign = 'left';
        overlayPopup.appendChild(ul);
    }

    function sentence() {
        overlayPopup.appendChild(document.createTextNode(map['translation']));
    }

    overlayPopup.style.background = 'lightblue';
    overlayPopup.style.borderRadius = '5px';
    overlayPopup.style.boxShadow = '0 0 5px';
    overlayPopup.style.color = 'black';
    overlayPopup.style.fontSize = '13px';
    overlayPopup.style.maxWidth = '200px';
    overlayPopup.style.padding = '5px';
    overlayPopup.style.position = 'fixed';
    overlayPopup.style.zIndex = '1024';

    overlayPopup.style.left =
        x + overlayPopup.offsetWidth > document.documentElement.clientWidth ?
        x - overlayPopup.offsetWidth + 'px' : x + 'px';

    overlayPopup.style.top =
        y + overlayPopup.offsetHeight > document.documentElement.clientHeight ?
        y - overlayPopup.offsetHeight + 'px' : y + 'px';

    document.body.appendChild(overlayPopup);
}
