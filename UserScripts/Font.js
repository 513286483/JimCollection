'use strict';

var record = GM_getValue('fontQueue');
var fontQueue = record ? record.split(',') : [];
for (var i = 0; i < fontQueue.length; i++) {
    inject(fontQueue[i]);
}

function inject(font) {
    var style =
        '<style>' +
        '@font-face{font-family:' + font + ';src:local(' + font + ');}' +
        '@font-face{font-family:' + font + ';unicode-range:U+4E00-9FFF;src:local(Noto Sans CJK SC);}' +
        '</style>';
    $(style).appendTo('html');
}

$(window).on('load', () => {
    probeLang();
    travel(document.body);
    GM_setValue('fontQueue', fontQueue.slice(0, 30).join(','));
});

var isTraditional;
function probeLang() {
    var innerText = document.body.innerText.replace(/\s*/g, '');
    var threshold = Math.min(Math.floor(innerText.length / 10), 100);
    for (var i = 0; i < threshold; i++) {
        if (innerText.charAt(i) in dict) {
            document.documentElement.lang = 'zh-CN';
            return isTraditional = true;
        }
    }
}

var cache;
function travel(element, probe) {
    var $element = $(element);
    var fontFamily = $element.css('font-family').replace(/'|"/g, '').toLowerCase();
    var fonts = render(fontFamily.split(', '));

    function render(fonts) {
        var isModified;

        for (var i = 0; i < fonts.length; i++) {
            var font = fonts[i];
            if (font.match(/(sans-serif|serif)/)) {
                isModified = (fonts[i] = 'open sans');
            } else if (font.match('monospace')) {
                isModified = (fonts[i] = 'consolas');
            }
        }

        fonts = fonts.filter(Boolean);
        if (isModified) {
            $element.css('font-family', fonts.join());
        }
        return fonts;
    }

    if ((probe || probe === undefined) && fontFamily !== cache &&
        (probe = (element.innerText && element.innerText.search(/[\u4E00-\u9FFF]/) !== -1))) {
        cache = fontFamily;
        fonts.map(
            (font) => {
                var curr = fontQueue.indexOf(font);
                if (curr === -1) {
                    inject(font);
                    fontQueue.push(font);
                } else if (curr !== 0) {
                    var prev = curr - 1;
                    var temp = fontQueue[curr];
                    fontQueue[curr] = fontQueue[prev];
                    fontQueue[prev] = temp;
                }
            }
        );
    }

    if (probe && isTraditional) {
        simplify(element);
    }

    var children = element.children;
    for (var i = 0; i < children.length; i++) {
        var child = children[i];
        travel(child, probe);
    }
}

function simplify(element) {
    var childNodes = element.childNodes;
    for (i = 0; i < childNodes.length; i++) {
        var childNode = childNodes[i];
        if (childNode.nodeType === Node.TEXT_NODE) {
            childNode.data = transform(childNode.data);
        }
    }

    function transform(text) {
        var result = '';
        for (var i = 0; i < text.length; i++) {
            var char = text.charAt(i);
            result += char in dict ? dict[char] : char;
        }
        return result;
    }
}

const dict = {
    '贊': '赞',
    '槓': '杠',
    '復': '复',
    '啓': '启',
    '採': '采',
    '佔': '占',
    '艷': '艳',
    '砲': '炮',
    '嘆': '叹',
    '甯': '宁',
    '闆': '板',
    '剋': '克',
    '週': '周',
    '錶': '表',
    '歷': '历',
    '匯': '汇',
    '萬': '万',
    '與': '与',
    '醜': '丑',
    '專': '专',
    '業': '业',
    '叢': '丛',
    '東': '东',
    '絲': '丝',
    '丟': '丢',
    '兩': '两',
    '嚴': '严',
    '喪': '丧',
    '個': '个',
    '豐': '丰',
    '臨': '临',
    '為': '为',
    '麗': '丽',
    '舉': '举',
    '麼': '么',
    '義': '义',
    '烏': '乌',
    '樂': '乐',
    '喬': '乔',
    '習': '习',
    '鄉': '乡',
    '書': '书',
    '買': '买',
    '亂': '乱',
    '爭': '争',
    '於': '于',
    '虧': '亏',
    '雲': '云',
    '亙': '亘',
    '亞': '亚',
    '產': '产',
    '畝': '亩',
    '親': '亲',
    '褻': '亵',
    '嚲': '亸',
    '億': '亿',
    '僅': '仅',
    '從': '从',
    '侖': '仑',
    '倉': '仓',
    '儀': '仪',
    '們': '们',
    '價': '价',
    '眾': '众',
    '優': '优',
    '夥': '伙',
    '會': '会',
    '傴': '伛',
    '傘': '伞',
    '偉': '伟',
    '傳': '传',
    '傷': '伤',
    '倀': '伥',
    '倫': '伦',
    '傖': '伧',
    '偽': '伪',
    '佇': '伫',
    '體': '体',
    '餘': '余',
    '傭': '佣',
    '僉': '佥',
    '俠': '侠',
    '侶': '侣',
    '僥': '侥',
    '偵': '侦',
    '側': '侧',
    '僑': '侨',
    '儈': '侩',
    '儕': '侪',
    '儂': '侬',
    '俁': '俣',
    '儔': '俦',
    '儼': '俨',
    '倆': '俩',
    '儷': '俪',
    '儉': '俭',
    '債': '债',
    '傾': '倾',
    '傯': '偬',
    '僂': '偻',
    '僨': '偾',
    '償': '偿',
    '儻': '傥',
    '儐': '傧',
    '儲': '储',
    '儺': '傩',
    '兒': '儿',
    '兌': '兑',
    '兗': '兖',
    '黨': '党',
    '蘭': '兰',
    '關': '关',
    '興': '兴',
    '茲': '兹',
    '養': '养',
    '獸': '兽',
    '囅': '冁',
    '內': '内',
    '岡': '冈',
    '冊': '册',
    '寫': '写',
    '軍': '军',
    '農': '农',
    '塚': '冢',
    '馮': '冯',
    '衝': '冲',
    '決': '决',
    '況': '况',
    '凍': '冻',
    '淨': '净',
    '淒': '凄',
    '涼': '凉',
    '淩': '凌',
    '減': '减',
    '湊': '凑',
    '凜': '凛',
    '幾': '几',
    '鳳': '凤',
    '鳧': '凫',
    '憑': '凭',
    '凱': '凯',
    '擊': '击',
    '氹': '凼',
    '鑿': '凿',
    '芻': '刍',
    '劃': '划',
    '劉': '刘',
    '則': '则',
    '剛': '刚',
    '創': '创',
    '刪': '删',
    '別': '别',
    '剗': '刬',
    '剄': '刭',
    '劊': '刽',
    '劌': '刿',
    '剴': '剀',
    '劑': '剂',
    '剮': '剐',
    '劍': '剑',
    '剝': '剥',
    '劇': '剧',
    '勸': '劝',
    '辦': '办',
    '務': '务',
    '勱': '劢',
    '動': '动',
    '勵': '励',
    '勁': '劲',
    '勞': '劳',
    '勢': '势',
    '勳': '勋',
    '勩': '勚',
    '勻': '匀',
    '匭': '匦',
    '匱': '匮',
    '區': '区',
    '醫': '医',
    '華': '华',
    '協': '协',
    '單': '单',
    '賣': '卖',
    '盧': '卢',
    '鹵': '卤',
    '臥': '卧',
    '衛': '卫',
    '卻': '却',
    '巹': '卺',
    '廠': '厂',
    '廳': '厅',
    '曆': '历',
    '厲': '厉',
    '壓': '压',
    '厭': '厌',
    '厙': '厍',
    '廁': '厕',
    '廂': '厢',
    '厴': '厣',
    '廈': '厦',
    '廚': '厨',
    '廄': '厩',
    '廝': '厮',
    '縣': '县',
    '參': '参',
    '靉': '叆',
    '靆': '叇',
    '雙': '双',
    '發': '发',
    '變': '变',
    '敘': '叙',
    '疊': '叠',
    '葉': '叶',
    '號': '号',
    '歎': '叹',
    '嘰': '叽',
    '籲': '吁',
    '後': '后',
    '嚇': '吓',
    '呂': '吕',
    '嗎': '吗',
    '唚': '吣',
    '噸': '吨',
    '聽': '听',
    '啟': '启',
    '吳': '吴',
    '嘸': '呒',
    '囈': '呓',
    '嘔': '呕',
    '嚦': '呖',
    '唄': '呗',
    '員': '员',
    '咼': '呙',
    '嗆': '呛',
    '嗚': '呜',
    '詠': '咏',
    '嚨': '咙',
    '嚀': '咛',
    '噝': '咝',
    '噅': '咴',
    '鹹': '咸',
    '響': '响',
    '啞': '哑',
    '噠': '哒',
    '嘵': '哓',
    '嗶': '哔',
    '噦': '哕',
    '嘩': '哗',
    '噲': '哙',
    '嚌': '哜',
    '噥': '哝',
    '喲': '哟',
    '嘜': '唛',
    '嗊': '唝',
    '嘮': '唠',
    '啢': '唡',
    '嗩': '唢',
    '唕': '唣',
    '喚': '唤',
    '嘖': '啧',
    '嗇': '啬',
    '囀': '啭',
    '齧': '啮',
    '囉': '啰',
    '嘽': '啴',
    '嘯': '啸',
    '噴': '喷',
    '嘍': '喽',
    '嚳': '喾',
    '囁': '嗫',
    '噯': '嗳',
    '噓': '嘘',
    '嚶': '嘤',
    '囑': '嘱',
    '嚕': '噜',
    '囂': '嚣',
    '團': '团',
    '園': '园',
    '囪': '囱',
    '圍': '围',
    '圇': '囵',
    '國': '国',
    '圖': '图',
    '圓': '圆',
    '聖': '圣',
    '壙': '圹',
    '場': '场',
    '阪': '坂',
    '壞': '坏',
    '塊': '块',
    '堅': '坚',
    '壇': '坛',
    '壢': '坜',
    '壩': '坝',
    '塢': '坞',
    '墳': '坟',
    '墜': '坠',
    '壟': '垄',
    '壚': '垆',
    '壘': '垒',
    '墾': '垦',
    '堊': '垩',
    '墊': '垫',
    '埡': '垭',
    '墶': '垯',
    '壋': '垱',
    '塏': '垲',
    '堖': '垴',
    '塒': '埘',
    '塤': '埙',
    '堝': '埚',
    '垵': '埯',
    '塹': '堑',
    '墮': '堕',
    '壪': '塆',
    '牆': '墙',
    '壯': '壮',
    '聲': '声',
    '殼': '壳',
    '壺': '壶',
    '壼': '壸',
    '處': '处',
    '備': '备',
    '複': '复',
    '夠': '够',
    '頭': '头',
    '誇': '夸',
    '夾': '夹',
    '奪': '夺',
    '奩': '奁',
    '奐': '奂',
    '奮': '奋',
    '獎': '奖',
    '奧': '奥',
    '妝': '妆',
    '婦': '妇',
    '媽': '妈',
    '嫵': '妩',
    '嫗': '妪',
    '媯': '妫',
    '姍': '姗',
    '薑': '姜',
    '婁': '娄',
    '婭': '娅',
    '嬈': '娆',
    '嬌': '娇',
    '孌': '娈',
    '娛': '娱',
    '媧': '娲',
    '嫻': '娴',
    '嫿': '婳',
    '嬰': '婴',
    '嬋': '婵',
    '嬸': '婶',
    '媼': '媪',
    '嬡': '嫒',
    '嬪': '嫔',
    '嬙': '嫱',
    '嬤': '嬷',
    '孫': '孙',
    '學': '学',
    '孿': '孪',
    '寧': '宁',
    '寶': '宝',
    '實': '实',
    '寵': '宠',
    '審': '审',
    '憲': '宪',
    '宮': '宫',
    '寬': '宽',
    '賓': '宾',
    '寢': '寝',
    '對': '对',
    '尋': '寻',
    '導': '导',
    '壽': '寿',
    '將': '将',
    '爾': '尔',
    '塵': '尘',
    '堯': '尧',
    '尷': '尴',
    '屍': '尸',
    '盡': '尽',
    '層': '层',
    '屭': '屃',
    '屜': '屉',
    '屆': '届',
    '屬': '属',
    '屢': '屡',
    '屨': '屦',
    '嶼': '屿',
    '歲': '岁',
    '豈': '岂',
    '嶇': '岖',
    '崗': '岗',
    '峴': '岘',
    '嶴': '岙',
    '嵐': '岚',
    '島': '岛',
    '嶺': '岭',
    '嶽': '岳',
    '崠': '岽',
    '巋': '岿',
    '嶨': '峃',
    '嶧': '峄',
    '峽': '峡',
    '嶢': '峣',
    '嶠': '峤',
    '崢': '峥',
    '巒': '峦',
    '嶗': '崂',
    '崍': '崃',
    '嶮': '崄',
    '嶄': '崭',
    '嶸': '嵘',
    '嶔': '嵚',
    '崳': '嵛',
    '嶁': '嵝',
    '巔': '巅',
    '鞏': '巩',
    '巰': '巯',
    '幣': '币',
    '帥': '帅',
    '師': '师',
    '幃': '帏',
    '帳': '帐',
    '簾': '帘',
    '幟': '帜',
    '帶': '带',
    '幀': '帧',
    '幫': '帮',
    '幬': '帱',
    '幘': '帻',
    '幗': '帼',
    '冪': '幂',
    '幹': '干',
    '並': '并',
    '廣': '广',
    '莊': '庄',
    '慶': '庆',
    '廬': '庐',
    '廡': '庑',
    '庫': '库',
    '應': '应',
    '廟': '庙',
    '龐': '庞',
    '廢': '废',
    '廎': '庼',
    '廩': '廪',
    '開': '开',
    '異': '异',
    '棄': '弃',
    '張': '张',
    '彌': '弥',
    '弳': '弪',
    '彎': '弯',
    '彈': '弹',
    '強': '强',
    '歸': '归',
    '當': '当',
    '錄': '录',
    '彠': '彟',
    '彥': '彦',
    '徹': '彻',
    '徑': '径',
    '徠': '徕',
    '禦': '御',
    '憶': '忆',
    '懺': '忏',
    '憂': '忧',
    '愾': '忾',
    '懷': '怀',
    '態': '态',
    '慫': '怂',
    '憮': '怃',
    '慪': '怄',
    '悵': '怅',
    '愴': '怆',
    '憐': '怜',
    '總': '总',
    '懟': '怼',
    '懌': '怿',
    '戀': '恋',
    '懇': '恳',
    '惡': '恶',
    '慟': '恸',
    '懨': '恹',
    '愷': '恺',
    '惻': '恻',
    '惱': '恼',
    '惲': '恽',
    '悅': '悦',
    '愨': '悫',
    '懸': '悬',
    '慳': '悭',
    '憫': '悯',
    '驚': '惊',
    '懼': '惧',
    '慘': '惨',
    '懲': '惩',
    '憊': '惫',
    '愜': '惬',
    '慚': '惭',
    '憚': '惮',
    '慣': '惯',
    '湣': '愍',
    '慍': '愠',
    '憤': '愤',
    '憒': '愦',
    '願': '愿',
    '懾': '慑',
    '憖': '慭',
    '懣': '懑',
    '懶': '懒',
    '懍': '懔',
    '戇': '戆',
    '戔': '戋',
    '戲': '戏',
    '戧': '戗',
    '戰': '战',
    '戩': '戬',
    '戶': '户',
    '紮': '扎',
    '撲': '扑',
    '扡': '扦',
    '執': '执',
    '擴': '扩',
    '捫': '扪',
    '掃': '扫',
    '揚': '扬',
    '擾': '扰',
    '撫': '抚',
    '拋': '抛',
    '摶': '抟',
    '摳': '抠',
    '掄': '抡',
    '搶': '抢',
    '護': '护',
    '報': '报',
    '擔': '担',
    '擬': '拟',
    '攏': '拢',
    '揀': '拣',
    '擁': '拥',
    '攔': '拦',
    '擰': '拧',
    '撥': '拨',
    '擇': '择',
    '掛': '挂',
    '摯': '挚',
    '攣': '挛',
    '撾': '挝',
    '撻': '挞',
    '挾': '挟',
    '撓': '挠',
    '擋': '挡',
    '撟': '挢',
    '掙': '挣',
    '擠': '挤',
    '揮': '挥',
    '撏': '挦',
    '撈': '捞',
    '損': '损',
    '撿': '捡',
    '換': '换',
    '搗': '捣',
    '據': '据',
    '撚': '捻',
    '擄': '掳',
    '摑': '掴',
    '擲': '掷',
    '撣': '掸',
    '摻': '掺',
    '摜': '掼',
    '摣': '揸',
    '攬': '揽',
    '撳': '揿',
    '攙': '搀',
    '擱': '搁',
    '摟': '搂',
    '攪': '搅',
    '攜': '携',
    '攝': '摄',
    '攄': '摅',
    '擺': '摆',
    '搖': '摇',
    '擯': '摈',
    '攤': '摊',
    '攖': '撄',
    '撐': '撑',
    '攆': '撵',
    '擷': '撷',
    '擼': '撸',
    '攛': '撺',
    '擻': '擞',
    '攢': '攒',
    '敵': '敌',
    '斂': '敛',
    '數': '数',
    '齋': '斋',
    '斕': '斓',
    '鬥': '斗',
    '斬': '斩',
    '斷': '断',
    '無': '无',
    '舊': '旧',
    '時': '时',
    '曠': '旷',
    '暘': '旸',
    '曇': '昙',
    '晝': '昼',
    '曨': '昽',
    '顯': '显',
    '晉': '晋',
    '曬': '晒',
    '曉': '晓',
    '曄': '晔',
    '暈': '晕',
    '暉': '晖',
    '暫': '暂',
    '曖': '暧',
    '劄': '札',
    '術': '术',
    '樸': '朴',
    '機': '机',
    '殺': '杀',
    '雜': '杂',
    '權': '权',
    '條': '条',
    '來': '来',
    '楊': '杨',
    '榪': '杩',
    '傑': '杰',
    '極': '极',
    '構': '构',
    '樅': '枞',
    '樞': '枢',
    '棗': '枣',
    '櫪': '枥',
    '梘': '枧',
    '棖': '枨',
    '槍': '枪',
    '楓': '枫',
    '梟': '枭',
    '櫃': '柜',
    '檸': '柠',
    '檉': '柽',
    '梔': '栀',
    '柵': '栅',
    '標': '标',
    '棧': '栈',
    '櫛': '栉',
    '櫳': '栊',
    '棟': '栋',
    '櫨': '栌',
    '櫟': '栎',
    '欄': '栏',
    '樹': '树',
    '棲': '栖',
    '樣': '样',
    '欒': '栾',
    '棬': '桊',
    '椏': '桠',
    '橈': '桡',
    '楨': '桢',
    '檔': '档',
    '榿': '桤',
    '橋': '桥',
    '樺': '桦',
    '檜': '桧',
    '槳': '桨',
    '樁': '桩',
    '夢': '梦',
    '檮': '梼',
    '棶': '梾',
    '檢': '检',
    '欞': '棂',
    '槨': '椁',
    '櫝': '椟',
    '槧': '椠',
    '欏': '椤',
    '橢': '椭',
    '樓': '楼',
    '欖': '榄',
    '櫬': '榇',
    '櫚': '榈',
    '櫸': '榉',
    '檟': '槚',
    '檻': '槛',
    '檳': '槟',
    '櫧': '槠',
    '橫': '横',
    '檣': '樯',
    '櫻': '樱',
    '櫫': '橥',
    '櫥': '橱',
    '櫓': '橹',
    '櫞': '橼',
    '簷': '檐',
    '檁': '檩',
    '歡': '欢',
    '歟': '欤',
    '歐': '欧',
    '殲': '歼',
    '歿': '殁',
    '殤': '殇',
    '殘': '残',
    '殞': '殒',
    '殮': '殓',
    '殫': '殚',
    '殯': '殡',
    '毆': '殴',
    '毀': '毁',
    '轂': '毂',
    '畢': '毕',
    '氈': '毡',
    '毿': '毵',
    '氌': '氇',
    '氣': '气',
    '氫': '氢',
    '氬': '氩',
    '氳': '氲',
    '彙': '汇',
    '漢': '汉',
    '汙': '污',
    '湯': '汤',
    '洶': '汹',
    '遝': '沓',
    '溝': '沟',
    '沒': '没',
    '灃': '沣',
    '漚': '沤',
    '瀝': '沥',
    '淪': '沦',
    '滄': '沧',
    '渢': '沨',
    '溈': '沩',
    '滬': '沪',
    '濘': '泞',
    '淚': '泪',
    '澩': '泶',
    '瀧': '泷',
    '瀘': '泸',
    '濼': '泺',
    '瀉': '泻',
    '潑': '泼',
    '澤': '泽',
    '涇': '泾',
    '潔': '洁',
    '灑': '洒',
    '窪': '洼',
    '浹': '浃',
    '淺': '浅',
    '漿': '浆',
    '澆': '浇',
    '湞': '浈',
    '溮': '浉',
    '濁': '浊',
    '測': '测',
    '澮': '浍',
    '濟': '济',
    '瀏': '浏',
    '滻': '浐',
    '渾': '浑',
    '滸': '浒',
    '濃': '浓',
    '潯': '浔',
    '濜': '浕',
    '塗': '涂',
    '湧': '涌',
    '濤': '涛',
    '澇': '涝',
    '淶': '涞',
    '漣': '涟',
    '潿': '涠',
    '渦': '涡',
    '溳': '涢',
    '渙': '涣',
    '滌': '涤',
    '潤': '润',
    '澗': '涧',
    '漲': '涨',
    '澀': '涩',
    '澱': '淀',
    '淵': '渊',
    '淥': '渌',
    '漬': '渍',
    '瀆': '渎',
    '漸': '渐',
    '澠': '渑',
    '漁': '渔',
    '瀋': '沈',
    '滲': '渗',
    '溫': '温',
    '遊': '游',
    '灣': '湾',
    '濕': '湿',
    '潰': '溃',
    '濺': '溅',
    '漵': '溆',
    '漊': '溇',
    '潷': '滗',
    '滾': '滚',
    '滯': '滞',
    '灩': '滟',
    '灄': '滠',
    '滿': '满',
    '瀅': '滢',
    '濾': '滤',
    '濫': '滥',
    '灤': '滦',
    '濱': '滨',
    '灘': '滩',
    '澦': '滪',
    '瀠': '潆',
    '瀟': '潇',
    '瀲': '潋',
    '濰': '潍',
    '潛': '潜',
    '瀦': '潴',
    '瀾': '澜',
    '瀨': '濑',
    '瀕': '濒',
    '灝': '灏',
    '滅': '灭',
    '燈': '灯',
    '靈': '灵',
    '災': '灾',
    '燦': '灿',
    '煬': '炀',
    '爐': '炉',
    '燉': '炖',
    '煒': '炜',
    '熗': '炝',
    '點': '点',
    '煉': '炼',
    '熾': '炽',
    '爍': '烁',
    '爛': '烂',
    '烴': '烃',
    '燭': '烛',
    '煙': '烟',
    '煩': '烦',
    '燒': '烧',
    '燁': '烨',
    '燴': '烩',
    '燙': '烫',
    '燼': '烬',
    '熱': '热',
    '煥': '焕',
    '燜': '焖',
    '燾': '焘',
    '煆': '煅',
    '愛': '爱',
    '爺': '爷',
    '牘': '牍',
    '犛': '牦',
    '牽': '牵',
    '犧': '牺',
    '犢': '犊',
    '狀': '状',
    '獷': '犷',
    '獁': '犸',
    '猶': '犹',
    '狽': '狈',
    '麅': '狍',
    '獮': '狝',
    '獰': '狞',
    '獨': '独',
    '狹': '狭',
    '獅': '狮',
    '獪': '狯',
    '猙': '狰',
    '獄': '狱',
    '猻': '狲',
    '獫': '猃',
    '獵': '猎',
    '獼': '猕',
    '玀': '猡',
    '豬': '猪',
    '貓': '猫',
    '蝟': '猬',
    '獻': '献',
    '獺': '獭',
    '璣': '玑',
    '璵': '玙',
    '瑒': '玚',
    '瑪': '玛',
    '瑋': '玮',
    '環': '环',
    '現': '现',
    '瑲': '玱',
    '璽': '玺',
    '瑉': '珉',
    '玨': '珏',
    '琺': '珐',
    '瓏': '珑',
    '璫': '珰',
    '琿': '珲',
    '璡': '琎',
    '璉': '琏',
    '瑣': '琐',
    '瓊': '琼',
    '瑤': '瑶',
    '璦': '瑷',
    '璿': '璇',
    '瓔': '璎',
    '瓚': '瓒',
    '甕': '瓮',
    '甌': '瓯',
    '電': '电',
    '畫': '画',
    '暢': '畅',
    '疇': '畴',
    '癤': '疖',
    '療': '疗',
    '瘧': '疟',
    '癘': '疠',
    '瘍': '疡',
    '鬁': '疬',
    '瘡': '疮',
    '瘋': '疯',
    '皰': '疱',
    '癰': '痈',
    '痙': '痉',
    '癢': '痒',
    '瘂': '痖',
    '癆': '痨',
    '瘓': '痪',
    '癇': '痫',
    '癡': '痴',
    '癉': '瘅',
    '瘮': '瘆',
    '瘞': '瘗',
    '瘺': '瘘',
    '癟': '瘪',
    '癱': '瘫',
    '癮': '瘾',
    '癭': '瘿',
    '癩': '癞',
    '癬': '癣',
    '癲': '癫',
    '臒': '癯',
    '皚': '皑',
    '皺': '皱',
    '皸': '皲',
    '盞': '盏',
    '鹽': '盐',
    '監': '监',
    '蓋': '盖',
    '盜': '盗',
    '盤': '盘',
    '瞘': '眍',
    '眥': '眦',
    '矓': '眬',
    '著': '着',
    '睜': '睁',
    '睞': '睐',
    '瞼': '睑',
    '瞞': '瞒',
    '矚': '瞩',
    '矯': '矫',
    '磯': '矶',
    '礬': '矾',
    '礦': '矿',
    '碭': '砀',
    '碼': '码',
    '磚': '砖',
    '硨': '砗',
    '硯': '砚',
    '碸': '砜',
    '礪': '砺',
    '礱': '砻',
    '礫': '砾',
    '礎': '础',
    '硜': '硁',
    '矽': '硅',
    '碩': '硕',
    '硤': '硖',
    '磽': '硗',
    '磑': '硙',
    '礄': '硚',
    '確': '确',
    '鹼': '硷',
    '礙': '碍',
    '磧': '碛',
    '磣': '碜',
    '堿': '碱',
    '镟': '碹',
    '禮': '礼',
    '禕': '祎',
    '禰': '祢',
    '禎': '祯',
    '禱': '祷',
    '禍': '祸',
    '稟': '禀',
    '祿': '禄',
    '禪': '禅',
    '離': '离',
    '禿': '秃',
    '稈': '秆',
    '種': '种',
    '積': '积',
    '稱': '称',
    '穢': '秽',
    '穠': '秾',
    '穭': '稆',
    '稅': '税',
    '穌': '稣',
    '穩': '稳',
    '穡': '穑',
    '窮': '穷',
    '竊': '窃',
    '竅': '窍',
    '窯': '窑',
    '竄': '窜',
    '窩': '窝',
    '窺': '窥',
    '竇': '窦',
    '窶': '窭',
    '豎': '竖',
    '競': '竞',
    '篤': '笃',
    '筆': '笔',
    '筧': '笕',
    '箋': '笺',
    '籠': '笼',
    '籩': '笾',
    '築': '筑',
    '篳': '筚',
    '篩': '筛',
    '簹': '筜',
    '箏': '筝',
    '籌': '筹',
    '簽': '签',
    '簡': '简',
    '籙': '箓',
    '簀': '箦',
    '篋': '箧',
    '籜': '箨',
    '籮': '箩',
    '簞': '箪',
    '簫': '箫',
    '簣': '篑',
    '簍': '篓',
    '籃': '篮',
    '籬': '篱',
    '籪': '簖',
    '籟': '籁',
    '糴': '籴',
    '類': '类',
    '秈': '籼',
    '糶': '粜',
    '糲': '粝',
    '粵': '粤',
    '糞': '粪',
    '糧': '粮',
    '糝': '糁',
    '餱': '糇',
    '緊': '紧',
    '縶': '絷',
    '糾': '纠',
    '紆': '纡',
    '紅': '红',
    '紂': '纣',
    '纖': '纤',
    '紇': '纥',
    '約': '约',
    '級': '级',
    '紈': '纨',
    '纊': '纩',
    '紀': '纪',
    '紉': '纫',
    '緯': '纬',
    '紜': '纭',
    '純': '纯',
    '紕': '纰',
    '紗': '纱',
    '綱': '纲',
    '納': '纳',
    '紝': '纴',
    '縱': '纵',
    '綸': '纶',
    '紛': '纷',
    '紙': '纸',
    '紋': '纹',
    '紡': '纺',
    '紵': '纻',
    '紐': '纽',
    '紓': '纾',
    '線': '线',
    '紺': '绀',
    '絏': '绁',
    '紱': '绂',
    '練': '练',
    '組': '组',
    '紳': '绅',
    '細': '细',
    '織': '织',
    '終': '终',
    '縐': '绉',
    '絆': '绊',
    '紼': '绋',
    '絀': '绌',
    '紹': '绍',
    '繹': '绎',
    '經': '经',
    '紿': '绐',
    '綁': '绑',
    '絨': '绒',
    '結': '结',
    '絝': '绔',
    '繞': '绕',
    '絰': '绖',
    '絎': '绗',
    '繪': '绘',
    '給': '给',
    '絢': '绚',
    '絳': '绛',
    '絡': '络',
    '絕': '绝',
    '絞': '绞',
    '統': '统',
    '綆': '绠',
    '綃': '绡',
    '絹': '绢',
    '繡': '绣',
    '綌': '绤',
    '綏': '绥',
    '絛': '绦',
    '繼': '继',
    '綈': '绨',
    '綾': '绫',
    '續': '续',
    '綺': '绮',
    '緋': '绯',
    '綽': '绰',
    '緔': '绱',
    '緄': '绲',
    '繩': '绳',
    '維': '维',
    '綿': '绵',
    '綬': '绶',
    '繃': '绷',
    '綢': '绸',
    '綯': '绹',
    '綹': '绺',
    '綣': '绻',
    '綜': '综',
    '綻': '绽',
    '綰': '绾',
    '綠': '绿',
    '綴': '缀',
    '緇': '缁',
    '緙': '缂',
    '緗': '缃',
    '緬': '缅',
    '纜': '缆',
    '緹': '缇',
    '緲': '缈',
    '緝': '缉',
    '縕': '缊',
    '緦': '缌',
    '緞': '缎',
    '緶': '缏',
    '緱': '缑',
    '縋': '缒',
    '緩': '缓',
    '締': '缔',
    '縷': '缕',
    '編': '编',
    '緡': '缗',
    '緣': '缘',
    '縉': '缙',
    '縛': '缚',
    '縟': '缛',
    '縝': '缜',
    '縫': '缝',
    '縗': '缞',
    '縞': '缟',
    '纏': '缠',
    '縭': '缡',
    '縊': '缢',
    '縑': '缣',
    '繽': '缤',
    '縹': '缥',
    '縵': '缦',
    '縲': '缧',
    '纓': '缨',
    '縮': '缩',
    '繆': '缪',
    '繅': '缫',
    '纈': '缬',
    '繚': '缭',
    '繕': '缮',
    '繒': '缯',
    '韁': '缰',
    '繾': '缱',
    '繰': '缲',
    '繯': '缳',
    '繳': '缴',
    '纘': '缵',
    '罌': '罂',
    '網': '网',
    '羅': '罗',
    '罰': '罚',
    '罷': '罢',
    '羆': '罴',
    '羈': '羁',
    '羥': '羟',
    '羨': '羡',
    '翹': '翘',
    '翽': '翙',
    '翬': '翚',
    '耮': '耢',
    '耬': '耧',
    '聳': '耸',
    '恥': '耻',
    '聶': '聂',
    '聾': '聋',
    '職': '职',
    '聹': '聍',
    '聯': '联',
    '聵': '聩',
    '聰': '聪',
    '肅': '肃',
    '腸': '肠',
    '膚': '肤',
    '膁': '肷',
    '腎': '肾',
    '腫': '肿',
    '脹': '胀',
    '脅': '胁',
    '膽': '胆',
    '勝': '胜',
    '朧': '胧',
    '腖': '胨',
    '臚': '胪',
    '脛': '胫',
    '膠': '胶',
    '脈': '脉',
    '膾': '脍',
    '髒': '脏',
    '臍': '脐',
    '腦': '脑',
    '膿': '脓',
    '臠': '脔',
    '腳': '脚',
    '脫': '脱',
    '腡': '脶',
    '臉': '脸',
    '臘': '腊',
    '醃': '腌',
    '膕': '腘',
    '齶': '腭',
    '膩': '腻',
    '靦': '腼',
    '膃': '腽',
    '騰': '腾',
    '臏': '膑',
    '臢': '臜',
    '輿': '舆',
    '艤': '舣',
    '艦': '舰',
    '艙': '舱',
    '艫': '舻',
    '艱': '艰',
    '豔': '艳',
    '艸': '草',
    '藝': '艺',
    '節': '节',
    '羋': '芈',
    '薌': '芗',
    '蕪': '芜',
    '蘆': '芦',
    '蓯': '苁',
    '葦': '苇',
    '藶': '苈',
    '莧': '苋',
    '萇': '苌',
    '蒼': '苍',
    '苧': '苎',
    '蘇': '苏',
    '檾': '苘',
    '蘋': '苹',
    '莖': '茎',
    '蘢': '茏',
    '蔦': '茑',
    '塋': '茔',
    '煢': '茕',
    '繭': '茧',
    '荊': '荆',
    '薦': '荐',
    '薘': '荙',
    '莢': '荚',
    '蕘': '荛',
    '蓽': '荜',
    '蕎': '荞',
    '薈': '荟',
    '薺': '荠',
    '蕩': '荡',
    '榮': '荣',
    '葷': '荤',
    '滎': '荥',
    '犖': '荦',
    '熒': '荧',
    '蕁': '荨',
    '藎': '荩',
    '蓀': '荪',
    '蔭': '荫',
    '蕒': '荬',
    '葒': '荭',
    '葤': '荮',
    '藥': '药',
    '蒞': '莅',
    '蓧': '莜',
    '萊': '莱',
    '蓮': '莲',
    '蒔': '莳',
    '萵': '莴',
    '薟': '莶',
    '獲': '获',
    '蕕': '莸',
    '瑩': '莹',
    '鶯': '莺',
    '蓴': '莼',
    '蘀': '萚',
    '蘿': '萝',
    '螢': '萤',
    '營': '营',
    '縈': '萦',
    '蕭': '萧',
    '薩': '萨',
    '蔥': '葱',
    '蕆': '蒇',
    '蕢': '蒉',
    '蔣': '蒋',
    '蔞': '蒌',
    '藍': '蓝',
    '薊': '蓟',
    '蘺': '蓠',
    '蕷': '蓣',
    '鎣': '蓥',
    '驀': '蓦',
    '薔': '蔷',
    '蘞': '蔹',
    '藺': '蔺',
    '藹': '蔼',
    '蘄': '蕲',
    '蘊': '蕴',
    '藪': '薮',
    '蘚': '藓',
    '虜': '虏',
    '慮': '虑',
    '虛': '虚',
    '蟲': '虫',
    '虯': '虬',
    '蟣': '虮',
    '雖': '虽',
    '蝦': '虾',
    '蠆': '虿',
    '蝕': '蚀',
    '蟻': '蚁',
    '螞': '蚂',
    '蠶': '蚕',
    '蠔': '蚝',
    '蜆': '蚬',
    '蠱': '蛊',
    '蠣': '蛎',
    '蟶': '蛏',
    '蠻': '蛮',
    '蟄': '蛰',
    '蛺': '蛱',
    '蟯': '蛲',
    '螄': '蛳',
    '蠐': '蛴',
    '蛻': '蜕',
    '蝸': '蜗',
    '蠟': '蜡',
    '蠅': '蝇',
    '蟈': '蝈',
    '譯': '译',
    '詒': '诒',
    '誆': '诓',
    '試': '试',
    '詿': '诖',
    '詩': '诗',
    '詰': '诘',
    '詼': '诙',
    '誠': '诚',
    '誅': '诛',
    '詵': '诜',
    '話': '话',
    '誕': '诞',
    '詬': '诟',
    '詮': '诠',
    '詭': '诡',
    '詢': '询',
    '詣': '诣',
    '諍': '诤',
    '該': '该',
    '詳': '详',
    '詫': '诧',
    '諢': '诨',
    '詡': '诩',
    '誡': '诫',
    '誣': '诬',
    '語': '语',
    '誚': '诮',
    '誤': '误',
    '誥': '诰',
    '誘': '诱',
    '誨': '诲',
    '誑': '诳',
    '說': '说',
    '誦': '诵',
    '誒': '诶',
    '請': '请',
    '諸': '诸',
    '諏': '诹',
    '諾': '诺',
    '讀': '读',
    '諑': '诼',
    '誹': '诽',
    '課': '课',
    '諉': '诿',
    '諛': '谀',
    '誰': '谁',
    '諗': '谂',
    '調': '调',
    '諂': '谄',
    '諒': '谅',
    '諄': '谆',
    '誶': '谇',
    '談': '谈',
    '誼': '谊',
    '謀': '谋',
    '諶': '谌',
    '諜': '谍',
    '謊': '谎',
    '諫': '谏',
    '諧': '谐',
    '謔': '谑',
    '謁': '谒',
    '謂': '谓',
    '諤': '谔',
    '諭': '谕',
    '諼': '谖',
    '讒': '谗',
    '諮': '咨',
    '諳': '谙',
    '諺': '谚',
    '諦': '谛',
    '謎': '谜',
    '諞': '谝',
    '諝': '谞',
    '讜': '谠',
    '謖': '谡',
    '謝': '谢',
    '謠': '谣',
    '謗': '谤',
    '諡': '谥',
    '謙': '谦',
    '謐': '谧',
    '謹': '谨',
    '謾': '谩',
    '譾': '谫',
    '謬': '谬',
    '譚': '谭',
    '譖': '谮',
    '譙': '谯',
    '讕': '谰',
    '譜': '谱',
    '譎': '谲',
    '讞': '谳',
    '譴': '谴',
    '譫': '谵',
    '讖': '谶',
    '穀': '谷',
    '豶': '豮',
    '貝': '贝',
    '貞': '贞',
    '負': '负',
    '貟': '贠',
    '貢': '贡',
    '財': '财',
    '責': '责',
    '賢': '贤',
    '敗': '败',
    '賬': '帐',
    '貨': '货',
    '質': '质',
    '販': '贩',
    '貪': '贪',
    '貧': '贫',
    '貶': '贬',
    '購': '购',
    '貯': '贮',
    '貫': '贯',
    '貳': '贰',
    '賤': '贱',
    '賁': '贲',
    '貰': '贳',
    '貼': '贴',
    '貴': '贵',
    '貺': '贶',
    '貸': '贷',
    '貿': '贸',
    '費': '费',
    '賀': '贺',
    '貽': '贻',
    '賊': '贼',
    '贄': '贽',
    '賈': '贾',
    '賄': '贿',
    '貲': '赀',
    '賃': '赁',
    '賂': '赂',
    '贓': '赃',
    '資': '资',
    '賅': '赅',
    '贐': '赆',
    '賕': '赇',
    '賑': '赈',
    '賚': '赉',
    '賒': '赊',
    '賦': '赋',
    '賭': '赌',
    '齎': '赍',
    '贖': '赎',
    '賞': '赏',
    '賜': '赐',
    '贔': '赑',
    '賙': '赒',
    '賡': '赓',
    '賠': '赔',
    '賧': '赕',
    '賴': '赖',
    '賵': '赗',
    '贅': '赘',
    '賻': '赙',
    '賺': '赚',
    '賽': '赛',
    '賾': '赜',
    '讚': '赞',
    '贇': '赟',
    '贈': '赠',
    '贍': '赡',
    '贏': '赢',
    '赬': '赪',
    '趙': '赵',
    '趕': '赶',
    '趨': '趋',
    '趲': '趱',
    '躉': '趸',
    '躍': '跃',
    '蹌': '跄',
    '蹠': '跖',
    '躒': '跞',
    '踐': '践',
    '躂': '跶',
    '蹺': '跷',
    '蹕': '跸',
    '躚': '跹',
    '躋': '跻',
    '踴': '踊',
    '躊': '踌',
    '蹤': '踪',
    '躓': '踬',
    '躑': '踯',
    '躡': '蹑',
    '蹣': '蹒',
    '躕': '蹰',
    '躥': '蹿',
    '躪': '躏',
    '躦': '躜',
    '軀': '躯',
    '車': '车',
    '軋': '轧',
    '軌': '轨',
    '軒': '轩',
    '軔': '轫',
    '轉': '转',
    '軛': '轭',
    '輪': '轮',
    '軟': '软',
    '轟': '轰',
    '軲': '轱',
    '軻': '轲',
    '轤': '轳',
    '軸': '轴',
    '軹': '轵',
    '軼': '轶',
    '軤': '轷',
    '軫': '轸',
    '轢': '轹',
    '軺': '轺',
    '輕': '轻',
    '軾': '轼',
    '載': '载',
    '輊': '轾',
    '轎': '轿',
    '輈': '辀',
    '輇': '辁',
    '輅': '辂',
    '較': '较',
    '輔': '辅',
    '輛': '辆',
    '輦': '辇',
    '輩': '辈',
    '輝': '辉',
    '輥': '辊',
    '輞': '辋',
    '輬': '辌',
    '輟': '辍',
    '輜': '辎',
    '輳': '辏',
    '輻': '辐',
    '輯': '辑',
    '轀': '辒',
    '輸': '输',
    '轡': '辔',
    '轅': '辕',
    '轄': '辖',
    '輾': '辗',
    '轆': '辘',
    '轍': '辙',
    '轔': '辚',
    '辭': '辞',
    '辯': '辩',
    '辮': '辫',
    '邊': '边',
    '遼': '辽',
    '達': '达',
    '遷': '迁',
    '過': '过',
    '邁': '迈',
    '運': '运',
    '還': '还',
    '這': '这',
    '進': '进',
    '遠': '远',
    '違': '违',
    '連': '连',
    '遲': '迟',
    '邇': '迩',
    '逕': '迳',
    '跡': '迹',
    '適': '适',
    '選': '选',
    '遜': '逊',
    '遞': '递',
    '邐': '逦',
    '邏': '逻',
    '遺': '遗',
    '遙': '遥',
    '鄧': '邓',
    '鄺': '邝',
    '鄔': '邬',
    '郵': '邮',
    '鄒': '邹',
    '鄴': '邺',
    '鄰': '邻',
    '鬱': '郁',
    '郤': '隙',
    '郟': '郏',
    '鄶': '郐',
    '鄭': '郑',
    '鄆': '郓',
    '酈': '郦',
    '鄖': '郧',
    '鄲': '郸',
    '醞': '酝',
    '醱': '酦',
    '醬': '酱',
    '釅': '酽',
    '釃': '酾',
    '釀': '酿',
    '釋': '释',
    '裏': '里',
    '鑒': '鉴',
    '鑾': '銮',
    '鏨': '錾',
    '釓': '钆',
    '釔': '钇',
    '針': '针',
    '釘': '钉',
    '釗': '钊',
    '釙': '钋',
    '釕': '钌',
    '釷': '钍',
    '釺': '钎',
    '釧': '钏',
    '釤': '钐',
    '釩': '钒',
    '釣': '钓',
    '鍆': '钔',
    '釹': '钕',
    '鍚': '钖',
    '釵': '钗',
    '鈃': '钘',
    '鈣': '钙',
    '鈈': '钚',
    '鈦': '钛',
    '鈍': '钝',
    '鈔': '钞',
    '鍾': '钟',
    '鈉': '钠',
    '鋇': '钡',
    '鋼': '钢',
    '鈑': '钣',
    '鈐': '钤',
    '鑰': '钥',
    '欽': '钦',
    '鈞': '钧',
    '鎢': '钨',
    '鉤': '钩',
    '鈧': '钪',
    '鈁': '钫',
    '鈥': '钬',
    '鈄': '钭',
    '鈕': '钮',
    '鈀': '钯',
    '鈺': '钰',
    '錢': '钱',
    '鉦': '钲',
    '鉗': '钳',
    '鈷': '钴',
    '缽': '钵',
    '鈳': '钶',
    '鉕': '钷',
    '鈽': '钸',
    '鈸': '钹',
    '鉞': '钺',
    '鉬': '钼',
    '鉭': '钽',
    '鉀': '钾',
    '鈿': '钿',
    '鈾': '铀',
    '鐵': '铁',
    '鉑': '铂',
    '鈴': '铃',
    '鑠': '铄',
    '鉛': '铅',
    '鉚': '铆',
    '鈰': '铈',
    '鉉': '铉',
    '鉈': '铊',
    '鉍': '铋',
    '鈹': '铍',
    '鐸': '铎',
    '鉶': '铏',
    '銬': '铐',
    '銠': '铑',
    '鉺': '铒',
    '銪': '铕',
    '鋏': '铗',
    '鋣': '铘',
    '鐃': '铙',
    '銍': '铚',
    '鐺': '铛',
    '銅': '铜',
    '鋁': '铝',
    '銱': '铞',
    '銦': '铟',
    '鎧': '铠',
    '鍘': '铡',
    '銖': '铢',
    '銑': '铣',
    '鋌': '铤',
    '銩': '铥',
    '銛': '铦',
    '鏵': '铧',
    '銓': '铨',
    '鉿': '铪',
    '鉻': '铬',
    '銘': '铭',
    '錚': '铮',
    '銫': '铯',
    '鉸': '铰',
    '銥': '铱',
    '銃': '铳',
    '鐋': '铴',
    '銨': '铵',
    '銀': '银',
    '銣': '铷',
    '鐒': '铹',
    '鋪': '铺',
    '鋙': '铻',
    '錸': '铼',
    '鋱': '铽',
    '鏈': '链',
    '鏗': '铿',
    '銷': '销',
    '鎖': '锁',
    '鋰': '锂',
    '鋥': '锃',
    '鍋': '锅',
    '鋯': '锆',
    '鋨': '锇',
    '鏽': '锈',
    '鋝': '锊',
    '鋒': '锋',
    '鋅': '锌',
    '鋶': '锍',
    '鐦': '锎',
    '鐧': '锏',
    '銳': '锐',
    '銻': '锑',
    '鋃': '锒',
    '鋟': '锓',
    '鋦': '锔',
    '錒': '锕',
    '錆': '锖',
    '鍺': '锗',
    '錯': '错',
    '錨': '锚',
    '錡': '锜',
    '錁': '锞',
    '錕': '锟',
    '錩': '锠',
    '錫': '锡',
    '錮': '锢',
    '鑼': '锣',
    '錘': '锤',
    '錐': '锥',
    '錦': '锦',
    '鍁': '锨',
    '錈': '锩',
    '錇': '锫',
    '錟': '锬',
    '錠': '锭',
    '鍵': '键',
    '鋸': '锯',
    '錳': '锰',
    '錙': '锱',
    '鍥': '锲',
    '鍈': '锳',
    '鍇': '锴',
    '鏘': '锵',
    '鍶': '锶',
    '鍔': '锷',
    '鍤': '锸',
    '鍬': '锹',
    '鍛': '锻',
    '鎪': '锼',
    '鍠': '锽',
    '鍰': '锾',
    '鎄': '锿',
    '鍍': '镀',
    '鎂': '镁',
    '鏤': '镂',
    '鎡': '镃',
    '鏌': '镆',
    '鎮': '镇',
    '鎛': '镈',
    '鎘': '镉',
    '鑷': '镊',
    '鐫': '镌',
    '鎳': '镍',
    '鎿': '镎',
    '鎦': '镏',
    '鎬': '镐',
    '鎊': '镑',
    '鎰': '镒',
    '鎔': '镕',
    '鏢': '镖',
    '鏜': '镗',
    '鏍': '镙',
    '鏰': '镚',
    '鏞': '镛',
    '鏡': '镜',
    '鏑': '镝',
    '鏃': '镞',
    '鏇': '旋',
    '鏐': '镠',
    '鐔': '镡',
    '钁': '镢',
    '鐐': '镣',
    '鏷': '镤',
    '鑥': '镥',
    '鐓': '镦',
    '鑭': '镧',
    '鐠': '镨',
    '鑹': '镩',
    '鏹': '镪',
    '鐙': '镫',
    '鑊': '镬',
    '鐳': '镭',
    '鐶': '镮',
    '鐲': '镯',
    '鐿': '镱',
    '鑔': '镲',
    '鑣': '镳',
    '鑞': '镴',
    '鑲': '镶',
    '長': '长',
    '門': '门',
    '閂': '闩',
    '閃': '闪',
    '閆': '闫',
    '閈': '闬',
    '閉': '闭',
    '問': '问',
    '闖': '闯',
    '閏': '闰',
    '闈': '闱',
    '閑': '闲',
    '閎': '闳',
    '間': '间',
    '閔': '闵',
    '閌': '闶',
    '悶': '闷',
    '閘': '闸',
    '鬧': '闹',
    '閨': '闺',
    '聞': '闻',
    '闥': '闼',
    '閩': '闽',
    '閭': '闾',
    '闓': '闿',
    '閥': '阀',
    '閣': '阁',
    '閡': '阂',
    '閫': '阃',
    '鬮': '阄',
    '閱': '阅',
    '閬': '阆',
    '闍': '阇',
    '閾': '阈',
    '閹': '阉',
    '閶': '阊',
    '鬩': '阋',
    '閽': '阍',
    '閻': '阎',
    '閼': '阏',
    '闡': '阐',
    '闌': '阑',
    '闃': '阒',
    '闊': '阔',
    '闋': '阕',
    '闔': '阖',
    '闐': '阗',
    '闒': '阘',
    '闕': '阙',
    '隊': '队',
    '陽': '阳',
    '陰': '阴',
    '陣': '阵',
    '階': '阶',
    '際': '际',
    '陸': '陆',
    '隴': '陇',
    '陳': '陈',
    '陘': '陉',
    '陝': '陕',
    '隉': '陧',
    '隕': '陨',
    '險': '险',
    '隨': '随',
    '隱': '隐',
    '隸': '隶',
    '雋': '隽',
    '難': '难',
    '雛': '雏',
    '讎': '仇',
    '靂': '雳',
    '霧': '雾',
    '霽': '霁',
    '黴': '霉',
    '靄': '霭',
    '靚': '靓',
    '靜': '静',
    '靨': '靥',
    '韃': '鞑',
    '鞽': '鞒',
    '韉': '鞯',
    '韝': '鞴',
    '韋': '韦',
    '韓': '韩',
    '韙': '韪',
    '韞': '韫',
    '韜': '韬',
    '韻': '韵',
    '頁': '页',
    '頂': '顶',
    '頃': '顷',
    '頇': '顸',
    '項': '项',
    '順': '顺',
    '須': '须',
    '頊': '顼',
    '頑': '顽',
    '顧': '顾',
    '頓': '顿',
    '頎': '颀',
    '頒': '颁',
    '頌': '颂',
    '頏': '颃',
    '預': '预',
    '顱': '颅',
    '領': '领',
    '頗': '颇',
    '頸': '颈',
    '頡': '颉',
    '頰': '颊',
    '頲': '颋',
    '頜': '颌',
    '潁': '颍',
    '熲': '颎',
    '頦': '颏',
    '頤': '颐',
    '頻': '频',
    '頮': '颒',
    '頷': '颔',
    '頴': '颕',
    '穎': '颖',
    '顆': '颗',
    '題': '题',
    '顒': '颙',
    '顎': '颚',
    '顓': '颛',
    '顏': '颜',
    '顳': '颞',
    '顢': '颟',
    '顛': '颠',
    '顙': '颡',
    '顥': '颢',
    '顫': '颤',
    '顬': '颥',
    '顰': '颦',
    '顴': '颧',
    '風': '风',
    '颺': '飏',
    '颭': '飐',
    '颮': '飑',
    '颯': '飒',
    '颶': '飓',
    '颸': '飔',
    '颼': '飕',
    '颻': '飖',
    '飀': '飗',
    '飄': '飘',
    '飆': '飙',
    '飛': '飞',
    '饗': '飨',
    '饜': '餍',
    '飣': '饤',
    '饑': '饥',
    '飥': '饦',
    '餳': '饧',
    '飩': '饨',
    '餼': '饩',
    '飫': '饫',
    '飭': '饬',
    '飯': '饭',
    '飲': '饮',
    '餞': '饯',
    '飾': '饰',
    '飽': '饱',
    '飼': '饲',
    '飿': '饳',
    '飴': '饴',
    '餌': '饵',
    '饒': '饶',
    '餄': '饸',
    '餎': '饹',
    '餃': '饺',
    '餏': '饻',
    '餅': '饼',
    '餑': '饽',
    '餓': '饿',
    '餒': '馁',
    '餜': '馃',
    '餛': '馄',
    '餡': '馅',
    '館': '馆',
    '餷': '馇',
    '餶': '馉',
    '餿': '馊',
    '饞': '馋',
    '饁': '馌',
    '饃': '馍',
    '餾': '馏',
    '饈': '馐',
    '饉': '馑',
    '饅': '馒',
    '饊': '馓',
    '饢': '馕',
    '馬': '马',
    '馭': '驭',
    '馴': '驯',
    '馳': '驰',
    '驅': '驱',
    '馹': '驲',
    '驢': '驴',
    '駔': '驵',
    '駛': '驶',
    '駟': '驷',
    '駙': '驸',
    '駒': '驹',
    '騶': '驺',
    '駐': '驻',
    '駝': '驼',
    '駑': '驽',
    '駕': '驾',
    '驛': '驿',
    '駘': '骀',
    '驍': '骁',
    '罵': '骂',
    '駰': '骃',
    '驕': '骄',
    '驊': '骅',
    '駱': '骆',
    '駭': '骇',
    '駢': '骈',
    '驫': '骉',
    '驪': '骊',
    '騁': '骋',
    '驗': '验',
    '騂': '骍',
    '駸': '骎',
    '駿': '骏',
    '騏': '骐',
    '騎': '骑',
    '騍': '骒',
    '騅': '骓',
    '騌': '骔',
    '驌': '骕',
    '驂': '骖',
    '騙': '骗',
    '騭': '骘',
    '騤': '骙',
    '騷': '骚',
    '騖': '骛',
    '驁': '骜',
    '騮': '骝',
    '騫': '骞',
    '騸': '骟',
    '驃': '骠',
    '驏': '骣',
    '驟': '骤',
    '驥': '骥',
    '驤': '骧',
    '髏': '髅',
    '髖': '髋',
    '髕': '髌',
    '鬢': '鬓',
    '魘': '魇',
    '魎': '魉',
    '魚': '鱼',
    '魛': '鱽',
    '魢': '鱾',
    '魷': '鱿',
    '魨': '鲀',
    '魯': '鲁',
    '魴': '鲂',
    '鮁': '鲅',
    '鮃': '鲆',
    '鱸': '鲈',
    '鮋': '鲉',
    '鮒': '鲋',
    '鮊': '鲌',
    '鮑': '鲍',
    '鱟': '鲎',
    '鮍': '鲏',
    '鮐': '鲐',
    '鮭': '鲑',
    '鮚': '鲒',
    '鮪': '鲔',
    '鮞': '鲕',
    '鮦': '鲖',
    '鮜': '鲘',
    '鱠': '鲙',
    '鱭': '鲚',
    '鮫': '鲛',
    '鮮': '鲜',
    '鮺': '鲊',
    '鯗': '鲞',
    '鱘': '鲟',
    '鯁': '鲠',
    '鱺': '鲡',
    '鰱': '鲢',
    '鰹': '鲣',
    '鯉': '鲤',
    '鰣': '鲥',
    '鰷': '鲦',
    '鯀': '鲧',
    '鯊': '鲨',
    '鯇': '鲩',
    '鮶': '鲪',
    '鯽': '鲫',
    '鯒': '鲬',
    '鯖': '鲭',
    '鯪': '鲮',
    '鯕': '鲯',
    '鯫': '鲰',
    '鯡': '鲱',
    '鯤': '鲲',
    '鯧': '鲳',
    '鯝': '鲴',
    '鯢': '鲵',
    '鯰': '鲇',
    '鯛': '鲷',
    '鯨': '鲸',
    '鯵': '鲹',
    '鯴': '鲺',
    '鯔': '鲻',
    '鱝': '鲼',
    '鰈': '鲽',
    '鰏': '鲾',
    '鰮': '鳁',
    '鰃': '鳂',
    '鰓': '鳃',
    '鱷': '鳄',
    '鰍': '鳅',
    '鰉': '鳇',
    '鰁': '鳈',
    '鱂': '鳉',
    '鯿': '鳊',
    '鼇': '鳌',
    '鰭': '鳍',
    '鰨': '鳎',
    '鰥': '鳏',
    '鰩': '鳐',
    '鰟': '鳑',
    '鰜': '鳒',
    '鰳': '鳓',
    '鰾': '鳔',
    '鱈': '鳕',
    '鱉': '鳖',
    '鰻': '鳗',
    '鰵': '鳘',
    '鱅': '鳙',
    '鰼': '鳛',
    '鱖': '鳜',
    '鱗': '鳞',
    '鱒': '鳟',
    '鱯': '鳠',
    '鱤': '鳡',
    '鱧': '鳢',
    '鳥': '鸟',
    '鳩': '鸠',
    '雞': '鸡',
    '鳶': '鸢',
    '鳴': '鸣',
    '鳲': '鸤',
    '鷗': '鸥',
    '鴉': '鸦',
    '鶬': '鸧',
    '鴇': '鸨',
    '鴣': '鸪',
    '鶇': '鸫',
    '鸕': '鸬',
    '鴨': '鸭',
    '鴞': '鸮',
    '鴦': '鸯',
    '鴒': '鸰',
    '鴟': '鸱',
    '鴝': '鸲',
    '鴛': '鸳',
    '鴬': '鸴',
    '鴕': '鸵',
    '鷥': '鸶',
    '鷙': '鸷',
    '鴯': '鸸',
    '鴰': '鸹',
    '鵂': '鸺',
    '鴴': '鸻',
    '鵃': '鸼',
    '鴿': '鸽',
    '鸞': '鸾',
    '鴻': '鸿',
    '鵐': '鹀',
    '鵓': '鹁',
    '鸝': '鹂',
    '鵑': '鹃',
    '鵠': '鹄',
    '鵝': '鹅',
    '鵒': '鹆',
    '鷳': '鹇',
    '鵜': '鹈',
    '鵡': '鹉',
    '鵲': '鹊',
    '鶓': '鹋',
    '鵪': '鹌',
    '鶤': '鹍',
    '鵯': '鹎',
    '鵬': '鹏',
    '鵮': '鹐',
    '鶉': '鹑',
    '鶊': '鹒',
    '鷫': '鹔',
    '鶘': '鹕',
    '鶚': '鹗',
    '鶻': '鹘',
    '鶿': '鹚',
    '鶥': '鹛',
    '鶩': '鹜',
    '鷊': '鹝',
    '鷂': '鹞',
    '鶲': '鹟',
    '鶹': '鹠',
    '鶺': '鹡',
    '鶼': '鹣',
    '鶴': '鹤',
    '鸚': '鹦',
    '鷓': '鹧',
    '鷚': '鹨',
    '鷯': '鹩',
    '鷦': '鹪',
    '鷲': '鹫',
    '鷸': '鹬',
    '鷺': '鹭',
    '鸇': '鹯',
    '鷹': '鹰',
    '鸌': '鹱',
    '鸏': '鹲',
    '鸛': '鹳',
    '鹺': '鹾',
    '麥': '麦',
    '麩': '麸',
    '黃': '黄',
    '黌': '黉',
    '黶': '黡',
    '黷': '黩',
    '黲': '黪',
    '黽': '黾',
    '黿': '鼋',
    '鼉': '鼍',
    '鞀': '鼗',
    '鼴': '鼹',
    '齊': '齐',
    '齏': '齑',
    '齒': '齿',
    '齔': '龀',
    '齕': '龁',
    '齗': '龂',
    '齟': '龃',
    '齡': '龄',
    '齙': '龅',
    '齠': '龆',
    '齜': '龇',
    '齦': '龈',
    '齬': '龉',
    '齪': '龊',
    '齲': '龋',
    '齷': '龌',
    '龍': '龙',
    '龔': '龚',
    '龕': '龛',
    '龜': '龟',
    '誌': '志',
    '製': '制',
    '谘': '咨',
    '隻': '只',
    '裡': '里',
    '係': '系',
    '範': '范',
    '鬆': '松',
    '嚐': '尝',
    '嘗': '尝',
    '鬨': '哄',
    '麵': '面',
    '準': '准',
    '鐘': '钟',
    '彆': '别',
    '閒': '闲',
    '儘': '尽',
    '臟': '脏',
    '嗬': '呵',
    '掗': '挜',
    '斃': '毙',
    '濔': '沵',
    '紘': '纮',
    '紖': '纼',
    '績': '绩',
    '緒': '绪',
    '緓': '绬',
    '緘': '缄',
    '繢': '缋',
    '綞': '缍',
    '蟬': '蝉',
    '蠍': '蝎',
    '螻': '蝼',
    '蠑': '蝾',
    '螿': '螀',
    '蟎': '螨',
    '蠨': '蟏',
    '釁': '衅',
    '銜': '衔',
    '補': '补',
    '襯': '衬',
    '袞': '衮',
    '襖': '袄',
    '嫋': '袅',
    '褘': '袆',
    '襪': '袜',
    '襲': '袭',
    '襏': '袯',
    '裝': '装',
    '襠': '裆',
    '褌': '裈',
    '褳': '裢',
    '襝': '裣',
    '褲': '裤',
    '襇': '裥',
    '褸': '褛',
    '襤': '褴',
    '繈': '襁',
    '襴': '襕',
    '見': '见',
    '觀': '观',
    '覎': '觃',
    '規': '规',
    '覓': '觅',
    '視': '视',
    '覘': '觇',
    '覽': '览',
    '覺': '觉',
    '覬': '觊',
    '覡': '觋',
    '覿': '觌',
    '覥': '觍',
    '覦': '觎',
    '覯': '觏',
    '覲': '觐',
    '覷': '觑',
    '觴': '觞',
    '觸': '触',
    '觶': '觯',
    '讋': '詟',
    '譽': '誉',
    '謄': '誊',
    '計': '计',
    '訂': '订',
    '訃': '讣',
    '認': '认',
    '譏': '讥',
    '訐': '讦',
    '訌': '讧',
    '討': '讨',
    '讓': '让',
    '訕': '讪',
    '訖': '讫',
    '訓': '训',
    '議': '议',
    '訊': '讯',
    '記': '记',
    '訒': '讱',
    '講': '讲',
    '諱': '讳',
    '謳': '讴',
    '詎': '讵',
    '訝': '讶',
    '訥': '讷',
    '許': '许',
    '訛': '讹',
    '論': '论',
    '訩': '讻',
    '訟': '讼',
    '諷': '讽',
    '設': '设',
    '訪': '访',
    '訣': '诀',
    '證': '证',
    '詁': '诂',
    '訶': '诃',
    '評': '评',
    '詛': '诅',
    '識': '识',
    '詗': '诇',
    '詐': '诈',
    '訴': '诉',
    '診': '诊',
    '詆': '诋',
    '謅': '诌',
    '詞': '词',
    '詘': '诎',
    '詔': '诏',
    '詖': '诐',
    '誄': '诔',
    '譸': '诪',
    '謨': '谟',
    '謫': '谪',
    '贗': '赝',
    '贛': '赣',
    '軑': '轪',
    '輒': '辄',
    '钜': '鉅',
    '鈒': '钑',
    '鑽': '钻',
    '銚': '铫',
    '鏟': '铲',
    '鑄': '铸',
    '鋤': '锄',
    '銼': '锉',
    '鐮': '镰',
    '閿': '阌',
    '闠': '阓',
    '闞': '阚',
    '闤': '阛',
    '韌': '韧',
    '韍': '韨',
    '頹': '颓',
    '額': '额',
    '纇': '颣',
    '飪': '饪',
    '餉': '饷',
    '餖': '饾',
    '餕': '馂',
    '饋': '馈',
    '餺': '馎',
    '饌': '馔',
    '馱': '驮',
    '駁': '驳',
    '騾': '骡',
    '驄': '骢',
    '驦': '骦',
    '魺': '鲄',
    '鮓': '鲊',
    '鮳': '鲓',
    '鰂': '鲗',
    '鱨': '鲿',
    '鯷': '鳀',
    '鰒': '鳆',
    '鰠': '鳋',
    '鱔': '鳝',
    '鱣': '鳣',
    '鴆': '鸩',
    '鵷': '鹓',
    '鶡': '鹖',
    '鷁': '鹢',
    '鷖': '鹥',
    '鸘': '鹴',
    '鼂': '晁',
    '拚': '拼',
    '倣': '仿',
    '釐': '厘'
};