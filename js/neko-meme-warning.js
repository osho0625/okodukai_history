/**
 * SCP-040-JP ミーム災害警告ダイアログ
 * SCP-040-JPのリンクをクリックした時に警告ダイアログを表示する。
 * 「閲覧する」を選ぶとリンク先に遷移、「戻る」を選ぶと何もしない。
 */
(function() {
  // モーダルHTML挿入
  var overlay = document.createElement('div');
  overlay.id = 'memeWarningOverlay';
  overlay.style.cssText = 'display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); z-index:9999; justify-content:center; align-items:center; padding:20px;';
  overlay.innerHTML = '<div style="background:#1a1a1a; border:2px solid #ff5722; border-radius:16px; max-width:420px; width:100%; padding:28px 24px; color:#eee; font-family:monospace; max-height:90vh; overflow-y:auto;">'
    + '<div style="text-align:center; font-size:2em; margin-bottom:12px;">⚠</div>'
    + '<h2 style="text-align:center; color:#ff5722; font-size:1.1em; margin-bottom:16px;">ミーム災害警告</h2>'
    + '<p style="font-size:0.85em; color:#ccc; line-height:1.7; margin-bottom:14px;">対象記事には<span style="color:#ff5722; font-weight:bold;">認識災害・ミーム汚染要素</span>が含まれています。閲覧者は以下の項目を確認してください。</p>'
    + '<ul style="font-size:0.82em; color:#ddd; line-height:2; list-style:none; padding:0; margin:0 0 16px 0;">'
    + '<li>☑ 猫を猫として認識できます</li>'
    + '<li>☑ 猫以外を猫と認識していません</li>'
    + '<li>☑ 「これはねこです」という文に違和感を覚えます</li>'
    + '<li>☑ 現在、強い眠気・頭痛・既視感はありません</li>'
    + '</ul>'
    + '<p style="font-size:0.8em; color:#aaa; line-height:1.6; margin-bottom:12px;">当該文書の閲覧には <span style="color:#ff9800; font-weight:bold;">レベル2以上のセキュリティクリアランス</span> が必要です。クリアランスを保有していない場合は該当記事の閲覧を禁止します。</p>'
    + '<p style="font-size:0.75em; color:#888; line-height:1.5; margin-bottom:20px;">閲覧中に猫以外の物体を猫と認識した場合は、直ちに画面から目を離し、最寄りのサイト管理者へ連絡してください。<br>ただし、サイト管理者が猫に見える場合は連絡不要です。</p>'
    + '<div style="display:flex; gap:12px;">'
    + '<button id="memeWarnProceed" style="flex:1; padding:14px; border:none; border-radius:10px; background:#ff5722; color:#fff; font-size:1em; font-weight:700; cursor:pointer;">閲覧する</button>'
    + '<button id="memeWarnBack" style="flex:1; padding:14px; border:none; border-radius:10px; background:#424242; color:#eee; font-size:1em; font-weight:700; cursor:pointer;">戻る</button>'
    + '</div>'
    + '</div>';
  document.body.appendChild(overlay);

  var pendingUrl = null;
  var pendingCallback = null;

  window.showMemeWarning = function(url, onProceed) {
    pendingUrl = url;
    pendingCallback = onProceed || null;
    overlay.style.display = 'flex';
  };

  document.getElementById('memeWarnProceed').onclick = function() {
    overlay.style.display = 'none';
    if (pendingCallback) pendingCallback();
    if (pendingUrl) {
      // aタグを動的生成してクリック（ポップアップブロッカー回避）
      var a = document.createElement('a');
      a.href = pendingUrl;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
    pendingUrl = null;
    pendingCallback = null;
  };

  document.getElementById('memeWarnBack').onclick = function() {
    overlay.style.display = 'none';
    pendingUrl = null;
    pendingCallback = null;
  };
})();
