/**
 * ねこです認識汚染 (SCP-040-JP)
 * scp_viewedに'scp-040-jp'が含まれている場合、ページ表示を汚染する。
 * 
 * 汚染パターン（排他: 3が優先、3不発時に4適用）:
 *  1. 背景: 5%でneko.pngタイル表示
 *  2. アイコン(img): 各10%でneko.pngに差し替え
 *  3. テキスト: 各5%で全体を「これはねこです」等に置換
 *  4. テキスト: 各10%で単語間に「これは」「ねこです」を挿入（3不発時のみ）
 */
(function() {
  var NEKO_IMG = (function() {
    // パスを現在のページ位置から解決
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

  // 1. 背景汚染 (5%)
  if (Math.random() < 0.05) {
    document.body.style.background = "url('" + NEKO_IMG + "') top left / 33.333% auto repeat";
  }

  // DOMContentLoaded後にアイコン・テキスト汚染
  function infect() {
    // 2. アイコン汚染 - 全img要素を対象（各10%）
    var imgs = document.querySelectorAll('img');
    for (var i = 0; i < imgs.length; i++) {
      if (Math.random() < 0.10) {
        imgs[i].src = NEKO_IMG;
        imgs[i].alt = 'ねこ';
      }
    }

    // 3 & 4. テキスト汚染
    infectTexts(document.body);
  }

  function infectTexts(root) {
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function(node) {
        // script, style, textareaの中身は除外
        var parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        var tag = parent.tagName;
        if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'TEXTAREA' || tag === 'INPUT') {
          return NodeFilter.FILTER_REJECT;
        }
        // 空白のみは除外
        if (!node.textContent.trim()) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    var textNodes = [];
    while (walker.nextNode()) {
      textNodes.push(walker.currentNode);
    }

    for (var i = 0; i < textNodes.length; i++) {
      var node = textNodes[i];
      var text = node.textContent;
      if (!text.trim()) continue;

      // パターン3: 5%で全置換（優先）
      if (Math.random() < 0.05) {
        node.textContent = NEKO_TEXTS[Math.floor(Math.random() * NEKO_TEXTS.length)];
      } else if (Math.random() < 0.10) {
        // パターン4: 10%で単語間に挿入（3不発時のみ）
        node.textContent = insertNeko(text);
      }
    }
  }

  function insertNeko(text) {
    // 日本語テキストを1〜3文字ごとに分割、英数字はスペースで分割
    var parts = text.match(/[a-zA-Z0-9]+|[^\sa-zA-Z0-9]{1,3}/g);
    if (!parts || parts.length < 2) return text;
    // ランダムな1箇所に挿入
    var pos = Math.floor(Math.random() * (parts.length - 1)) + 1;
    var word = NEKO_INSERT[Math.floor(Math.random() * NEKO_INSERT.length)];
    parts.splice(pos, 0, word);
    return parts.join('');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(infect, 100);
    });
  } else {
    setTimeout(infect, 100);
  }
})();
