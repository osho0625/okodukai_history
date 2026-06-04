/**
 * ねこです認識汚染 (SCP-040-JP)
 * scp_viewedに'scp-040-jp'が含まれている場合、ページ表示を汚染する。
 * 
 * 汚染パターン（排他: 3が優先、3不発時に4適用）:
 *  1. 背景: 5%でneko.pngタイル表示
 *  2. アイコン(img): 各10%でneko.pngに差し替え
 *  3. テキスト: 各5%で全体を「これはねこです」等に置換
 *  4. テキスト: 各10%で単語間に「これは」「ねこです」を挿入（3不発時のみ）
 *
 * ▶等の記号のみのテキストノードは汚染対象外。
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
  // 記号のみ（矢印、絵文字、装飾文字等）のテキストは汚染しない
  var SYMBOL_ONLY = /^[\s\u2000-\u27FF\u2B00-\u2BFF\uFE00-\uFEFF\u{1F000}-\u{1FFFF}\u25A0-\u25FF←→↑↓▶▷◀◁►▲△▼▽●○◎★☆♪♫§†‡※×÷±≠≤≥∞∴∵∫∑∏…‥・]+$/u;

  // 1. 背景汚染 (5%)
  if (Math.random() < 0.05) {
    document.body.style.background = "url('" + NEKO_IMG + "') top left / 33.333% auto repeat";
  }

  // 汚染済みマーク用
  var INFECTED_ATTR = 'data-neko';

  function infectImg(img) {
    if (img.getAttribute(INFECTED_ATTR)) return;
    if (Math.random() < 0.10) {
      img.src = NEKO_IMG;
      img.alt = 'ねこ';
    }
    img.setAttribute(INFECTED_ATTR, '1');
  }

  function isSymbolOnly(text) {
    try {
      return SYMBOL_ONLY.test(text.trim());
    } catch(e) {
      // unicode regex未対応のブラウザ用フォールバック
      return /^[\s▶▷◀◁►▲△▼▽←→↑↓●○◎★☆♪♫※×÷±]+$/.test(text.trim());
    }
  }

  function infectTextNode(node) {
    if (node._nekoInfected) return;
    var text = node.textContent;
    if (!text.trim()) return;
    if (isSymbolOnly(text)) return;

    // パターン3: 5%で全置換（優先）
    if (Math.random() < 0.05) {
      node.textContent = NEKO_TEXTS[Math.floor(Math.random() * NEKO_TEXTS.length)];
    } else if (Math.random() < 0.10) {
      // パターン4: 10%で単語間に挿入（3不発時のみ）
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
    // img汚染
    if (el.tagName === 'IMG') {
      infectImg(el);
    }
    var imgs = el.querySelectorAll ? el.querySelectorAll('img') : [];
    for (var i = 0; i < imgs.length; i++) {
      infectImg(imgs[i]);
    }
    // テキスト汚染
    infectTexts(el);
  }

  function infect() {
    // 2. アイコン汚染
    var imgs = document.querySelectorAll('img');
    for (var i = 0; i < imgs.length; i++) {
      infectImg(imgs[i]);
    }
    // 3 & 4. テキスト汚染
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

  // 初回実行
  function start() {
    infect();
    // MutationObserverで動的追加された要素も汚染
    if (typeof MutationObserver !== 'undefined') {
      var observer = new MutationObserver(function(mutations) {
        for (var i = 0; i < mutations.length; i++) {
          var added = mutations[i].addedNodes;
          for (var j = 0; j < added.length; j++) {
            var node = added[j];
            if (node.nodeType === 1) { // Element
              infectElement(node);
            } else if (node.nodeType === 3) { // Text
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
