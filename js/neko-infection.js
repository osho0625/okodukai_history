/**
 * ねこです認識汚染 (SCP-040-JP)
 * scp_viewedに'scp-040-jp'が含まれている場合、ページ表示を汚染する。
 * 
 * 汚染パターン（排他: 3が優先、3不発時に4適用）:
 *  1. 背景: 5%でneko.pngタイル表示
 *  2. アイコン(img/絵文字): 各10%でneko.pngに差し替え
 *  3. テキスト: 各5%で全体を「これはねこです」等に置換
 *  4. テキスト: 各10%で単語間に「これは」「ねこです」を挿入（3不発時のみ）
 *
 * ▶等のUI記号は汚染対象外。絵文字アイコンは画像置換対象。
 * 動的に追加されるDOM要素もMutationObserverで汚染対象にする。
 */
(function() {
  var NEKO_IMG = (function() {
    var depth = (location.pathname.match(/pages\//)) ? '../' : '';
    return depth + '.kiro/specs/today-scp/images/neko.png';
  })();

  function isNekoInfected() {
    try {
      var viewed = JSON.parse(localStorage.getItem('scp_viewed') || '[]');
      return viewed.indexOf('scp-040-jp') !== -1;
    } catch(e) { return false; }
  }

  if (!isNekoInfected()) return;

  var NEKO_TEXTS = ['これはねこです', 'よろしくおねがいします', 'ねこですよろしくおねがいします'];
  var NEKO_INSERT = ['これは', 'ねこです'];

  // UI記号（矢印・図形・装飾）: 絶対に触らない
  var UI_SYMBOL_ONLY = /^[\s←→↑↓▶▷◀◁►▲△▼▽●○◎★☆♪♫§†‡※×÷±≠≤≥∞∴∵∫∑∏…‥・\u2000-\u206F\u2190-\u21FF\u2500-\u257F\u2580-\u259F\u25A0-\u25FF\u2600-\u26FF\u2700-\u27BF\uFE00-\uFE0F]+$/;

  // 絵文字のみ（サロゲートペア含む）: imgに置換対象
  var EMOJI_ONLY = /^[\s\uD800-\uDBFF\uDC00-\uDFFF\uFE0F\u200D\u20E3]+$/;

  // より正確な絵文字判定（絵文字のみで構成されたテキストか）
  function isEmojiOnly(text) {
    var trimmed = text.trim();
    if (!trimmed) return false;
    // 絵文字はサロゲートペアまたは特定のUnicode範囲
    // 全ての非空白文字を除去した結果が空ならテキストなし=絵文字のみ
    var withoutEmoji = trimmed
      .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '') // サロゲートペア
      .replace(/[\uFE0F\u200D\u20E3]/g, '')            // variation selector, ZWJ, keycap
      .replace(/[\u2600-\u27BF]/g, '')                  // misc symbols
      .replace(/[\u{1F000}-\u{1FFFF}]/gu, '')          // supplementary symbols
      .trim();
    return withoutEmoji.length === 0;
  }

  function isUiSymbol(text) {
    return UI_SYMBOL_ONLY.test(text.trim());
  }

  // 1. 背景汚染 (5%)
  if (Math.random() < 0.05) {
    document.body.style.background = "url('" + NEKO_IMG + "') top left / 33.333% auto repeat";
  }

  var INFECTED_ATTR = 'data-neko';

  function infectImg(img) {
    if (img.getAttribute(INFECTED_ATTR)) return;
    if (Math.random() < 0.10) {
      img.src = NEKO_IMG;
      img.alt = 'ねこ';
    }
    img.setAttribute(INFECTED_ATTR, '1');
  }

  function replaceWithNekoImg(node) {
    var img = document.createElement('img');
    img.src = NEKO_IMG;
    img.alt = 'ねこ';
    img.style.cssText = 'width:1.2em; height:1.2em; vertical-align:middle; object-fit:contain; display:inline;';
    img.setAttribute(INFECTED_ATTR, '1');
    node.parentNode.replaceChild(img, node);
  }

  function infectTextNode(node) {
    if (node._nekoInfected) return;
    var text = node.textContent;
    if (!text.trim()) return;

    // UI記号（▶等）は絶対に触らない
    if (isUiSymbol(text)) {
      node._nekoInfected = true;
      return;
    }

    // 絵文字のみのノード → 10%で猫画像に置換
    try {
      if (isEmojiOnly(text)) {
        if (Math.random() < 0.10) {
          replaceWithNekoImg(node);
        }
        node._nekoInfected = true;
        return;
      }
    } catch(e) {}

    // 通常テキスト: パターン3(5%) → パターン4(10%)排他
    if (Math.random() < 0.05) {
      node.textContent = NEKO_TEXTS[Math.floor(Math.random() * NEKO_TEXTS.length)];
    } else if (Math.random() < 0.10) {
      node.textContent = insertNeko(text);
    }
    node._nekoInfected = true;
  }

  function infectTexts(root) {
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function(node) {
        var parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        var tag = parent.tagName;
        if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'TEXTAREA' || tag === 'INPUT') {
          return NodeFilter.FILTER_REJECT;
        }
        if (!node.textContent.trim()) return NodeFilter.FILTER_REJECT;
        if (node._nekoInfected) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    var textNodes = [];
    while (walker.nextNode()) {
      textNodes.push(walker.currentNode);
    }

    for (var i = 0; i < textNodes.length; i++) {
      infectTextNode(textNodes[i]);
    }
  }

  function infectElement(el) {
    if (el.tagName === 'IMG') {
      infectImg(el);
    }
    var imgs = el.querySelectorAll ? el.querySelectorAll('img') : [];
    for (var i = 0; i < imgs.length; i++) {
      infectImg(imgs[i]);
    }
    infectTexts(el);
  }

  function infect() {
    var imgs = document.querySelectorAll('img');
    for (var i = 0; i < imgs.length; i++) {
      infectImg(imgs[i]);
    }
    infectTexts(document.body);
  }

  function insertNeko(text) {
    var parts = text.match(/[a-zA-Z0-9]+|[^\sa-zA-Z0-9]{1,3}/g);
    if (!parts || parts.length < 2) return text;
    var pos = Math.floor(Math.random() * (parts.length - 1)) + 1;
    var word = NEKO_INSERT[Math.floor(Math.random() * NEKO_INSERT.length)];
    parts.splice(pos, 0, word);
    return parts.join('');
  }

  function start() {
    infect();
    if (typeof MutationObserver !== 'undefined') {
      var observer = new MutationObserver(function(mutations) {
        for (var i = 0; i < mutations.length; i++) {
          var added = mutations[i].addedNodes;
          for (var j = 0; j < added.length; j++) {
            var node = added[j];
            if (node.nodeType === 1) {
              infectElement(node);
            } else if (node.nodeType === 3) {
              infectTextNode(node);
            }
          }
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(start, 200);
    });
  } else {
    setTimeout(start, 200);
  }
})();
