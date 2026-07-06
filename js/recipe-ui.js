// recipe-ui.js — DOM操作・レンダリング・イベントバインド
// Implemented in Task 5+

// Module-level state for edit form tags
var editTagsList = [];

/**
 * タグを追加（正規化＋重複チェック）
 * @param {string} tag - 追加するタグ
 */
function addEditTag(tag) {
  var normalized = tag.trim().toLowerCase();
  if (!normalized) return;
  if (editTagsList.indexOf(normalized) !== -1) return; // duplicate
  editTagsList.push(normalized);
  var container = document.getElementById('edit-tags-pills');
  if (container) renderEditTagPills(container);
  // Update suggestion buttons visibility
  updateTagSuggestions();
}

/**
 * タグを削除
 * @param {string} tag - 削除するタグ
 */
function removeEditTag(tag) {
  var idx = editTagsList.indexOf(tag);
  if (idx !== -1) editTagsList.splice(idx, 1);
  var container = document.getElementById('edit-tags-pills');
  if (container) renderEditTagPills(container);
  updateTagSuggestions();
}

/**
 * タグpillsを再描画
 * @param {HTMLElement} container - pills表示コンテナ
 */
function renderEditTagPills(container) {
  while (container.firstChild) container.removeChild(container.firstChild);
  for (var i = 0; i < editTagsList.length; i++) {
    (function(tag) {
      var pill = document.createElement('span');
      pill.style.cssText = 'display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:16px;background:#f0f0f0;font-size:0.9em;margin:2px 4px 2px 0;';
      var pillText = document.createElement('span');
      pillText.textContent = tag;
      pill.appendChild(pillText);
      var removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.textContent = '✕';
      removeBtn.style.cssText = 'border:none;background:transparent;cursor:pointer;font-size:0.85em;color:#999;padding:0 2px;line-height:1;';
      removeBtn.addEventListener('click', function() { removeEditTag(tag); });
      pill.appendChild(removeBtn);
      container.appendChild(pill);
    })(editTagsList[i]);
  }
}

/**
 * タグサジェストボタンの表示を更新（既に追加済みのタグは非表示）
 */
function updateTagSuggestions() {
  var sugContainer = document.getElementById('edit-tags-suggestions');
  if (!sugContainer) return;
  var btns = sugContainer.querySelectorAll('[data-tag-suggestion]');
  for (var i = 0; i < btns.length; i++) {
    var tagVal = btns[i].getAttribute('data-tag-suggestion');
    btns[i].style.display = (editTagsList.indexOf(tagVal) !== -1) ? 'none' : '';
  }
}

/**
 * 調味料の分量入力UI（ボタンモード）を生成
 * @returns {HTMLElement} container with unit buttons and amount +/-
 */
function createSeasoningQuantityUI() {
  var wrapper = document.createElement('div');
  wrapper.className = 'seasoning-qty-ui';
  wrapper.style.cssText = 'display:flex;flex-direction:column;gap:6px;';

  var currentUnit = '大さじ';
  var currentAmount = 1;

  // Unit buttons row
  var unitRow = document.createElement('div');
  unitRow.style.cssText = 'display:flex;gap:4px;';
  var units = ['大さじ', '小さじ', 'カップ'];

  var unitButtons = [];
  for (var u = 0; u < units.length; u++) {
    (function(unit) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = unit;
      btn.style.cssText = 'padding:6px 12px;border-radius:6px;font-size:0.85em;cursor:pointer;min-height:36px;border:1px solid #ddd;background:#fff;';
      if (unit === currentUnit) {
        btn.style.background = '#e65100';
        btn.style.color = '#fff';
        btn.style.borderColor = '#e65100';
      }
      btn.addEventListener('click', function() {
        currentUnit = unit;
        for (var i = 0; i < unitButtons.length; i++) {
          unitButtons[i].style.background = '#fff';
          unitButtons[i].style.color = '#333';
          unitButtons[i].style.borderColor = '#ddd';
        }
        btn.style.background = '#e65100';
        btn.style.color = '#fff';
        btn.style.borderColor = '#e65100';
        updateDisplay();
      });
      unitButtons.push(btn);
      unitRow.appendChild(btn);
    })(units[u]);
  }
  wrapper.appendChild(unitRow);

  // Amount row: - [display] +
  var amountRow = document.createElement('div');
  amountRow.style.cssText = 'display:flex;align-items:center;gap:6px;';

  var minusBtn = document.createElement('button');
  minusBtn.type = 'button';
  minusBtn.textContent = '−';
  minusBtn.style.cssText = 'width:36px;height:36px;border:1px solid #ddd;border-radius:8px;background:#fff;font-size:1.2em;cursor:pointer;';
  minusBtn.addEventListener('click', function() {
    if (currentAmount > 0.5) {
      currentAmount -= 0.5;
      updateDisplay();
    }
  });
  amountRow.appendChild(minusBtn);

  var amountDisplay = document.createElement('span');
  amountDisplay.style.cssText = 'min-width:40px;text-align:center;font-size:1em;font-weight:600;';
  amountDisplay.textContent = '1';
  amountRow.appendChild(amountDisplay);

  var plusBtn = document.createElement('button');
  plusBtn.type = 'button';
  plusBtn.textContent = '＋';
  plusBtn.style.cssText = 'width:36px;height:36px;border:1px solid #ddd;border-radius:8px;background:#fff;font-size:1.2em;cursor:pointer;';
  plusBtn.addEventListener('click', function() {
    currentAmount += 0.5;
    updateDisplay();
  });
  amountRow.appendChild(plusBtn);

  wrapper.appendChild(amountRow);

  // Result display
  var resultDisplay = document.createElement('div');
  resultDisplay.className = 'seasoning-result';
  resultDisplay.style.cssText = 'font-size:0.9em;color:#555;font-weight:600;';
  resultDisplay.textContent = '大さじ 1';
  wrapper.appendChild(resultDisplay);

  function formatAmount(val) {
    if (val === 0.5) return '1/2';
    if (val === 1.5) return '1 1/2';
    if (val === 2.5) return '2 1/2';
    if (val === 3.5) return '3 1/2';
    if (val % 1 === 0.5) return Math.floor(val) + ' 1/2';
    return String(val);
  }

  function updateDisplay() {
    amountDisplay.textContent = formatAmount(currentAmount);
    resultDisplay.textContent = currentUnit + ' ' + formatAmount(currentAmount);
  }

  // Public method to get value
  wrapper.getValue = function() {
    return currentUnit + ' ' + formatAmount(currentAmount);
  };

  // Public method to set value (for loading existing data)
  wrapper.setValue = function(unit, amount) {
    currentUnit = unit;
    currentAmount = amount;
    for (var i = 0; i < unitButtons.length; i++) {
      unitButtons[i].style.background = '#fff';
      unitButtons[i].style.color = '#333';
      unitButtons[i].style.borderColor = '#ddd';
      if (unitButtons[i].textContent === unit) {
        unitButtons[i].style.background = '#e65100';
        unitButtons[i].style.color = '#fff';
        unitButtons[i].style.borderColor = '#e65100';
      }
    }
    updateDisplay();
  };

  return wrapper;
}

/**
 * 調味料行を追加
 * @param {object} [data] - {name?, quantity?, memo?}
 * @returns {HTMLElement} 追加された行要素
 */
function addSeasoningRow(data) {
  data = data || {};
  var container = document.getElementById('edit-seasonings-list');
  if (!container) return null;

  var row = document.createElement('div');
  row.className = 'seasoning-row';
  row.style.cssText = 'margin-bottom:12px;padding:10px;border:1px solid #f0f0f0;border-radius:8px;background:#fafafa;';

  // Top row: name input + remove button
  var topRow = document.createElement('div');
  topRow.style.cssText = 'display:flex;gap:8px;align-items:center;margin-bottom:8px;';

  var nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.placeholder = '調味料名';
  nameInput.value = data.name || '';
  nameInput.className = 'sea-name';
  nameInput.style.cssText = 'flex:1;padding:10px;border:1px solid #ddd;border-radius:8px;font-size:1em;';

  var removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.textContent = '✕';
  removeBtn.style.cssText = 'width:36px;height:36px;border:none;background:#f5f5f5;border-radius:50%;cursor:pointer;font-size:1em;color:#999;';
  removeBtn.addEventListener('click', function() {
    row.parentNode.removeChild(row);
  });

  topRow.appendChild(nameInput);
  topRow.appendChild(removeBtn);
  row.appendChild(topRow);

  // Mode toggle: text vs button
  var modeRow = document.createElement('div');
  modeRow.style.cssText = 'display:flex;gap:6px;margin-bottom:8px;';

  var btnModeBtn = document.createElement('button');
  btnModeBtn.type = 'button';
  btnModeBtn.textContent = 'ボタン入力';
  btnModeBtn.style.cssText = 'padding:4px 10px;border-radius:6px;font-size:0.8em;cursor:pointer;border:1px solid #ddd;background:#e65100;color:#fff;';

  var textModeBtn = document.createElement('button');
  textModeBtn.type = 'button';
  textModeBtn.textContent = 'テキスト入力';
  textModeBtn.style.cssText = 'padding:4px 10px;border-radius:6px;font-size:0.8em;cursor:pointer;border:1px solid #ddd;background:#fff;color:#333;';

  modeRow.appendChild(btnModeBtn);
  modeRow.appendChild(textModeBtn);
  row.appendChild(modeRow);

  // Button mode UI (default visible)
  var btnInputDiv = document.createElement('div');
  btnInputDiv.className = 'sea-btn-mode';
  var qtyUI = createSeasoningQuantityUI();
  btnInputDiv.appendChild(qtyUI);
  row.appendChild(btnInputDiv);

  // Text mode input (hidden by default)
  var textInputDiv = document.createElement('div');
  textInputDiv.className = 'sea-text-mode';
  textInputDiv.style.display = 'none';
  var qtyTextInput = document.createElement('input');
  qtyTextInput.type = 'text';
  qtyTextInput.placeholder = '分量（例: 大さじ2）';
  qtyTextInput.value = data.quantity || '';
  qtyTextInput.className = 'sea-quantity-text';
  qtyTextInput.style.cssText = 'width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;font-size:1em;box-sizing:border-box;';
  textInputDiv.appendChild(qtyTextInput);
  row.appendChild(textInputDiv);

  // Current mode state (default: button)
  var currentMode = 'button';

  function setMode(mode) {
    currentMode = mode;
    if (mode === 'text') {
      textInputDiv.style.display = '';
      btnInputDiv.style.display = 'none';
      textModeBtn.style.background = '#e65100';
      textModeBtn.style.color = '#fff';
      textModeBtn.style.borderColor = '#e65100';
      btnModeBtn.style.background = '#fff';
      btnModeBtn.style.color = '#333';
      btnModeBtn.style.borderColor = '#ddd';
    } else {
      textInputDiv.style.display = 'none';
      btnInputDiv.style.display = '';
      btnModeBtn.style.background = '#e65100';
      btnModeBtn.style.color = '#fff';
      btnModeBtn.style.borderColor = '#e65100';
      textModeBtn.style.background = '#fff';
      textModeBtn.style.color = '#333';
      textModeBtn.style.borderColor = '#ddd';
    }
  }

  textModeBtn.addEventListener('click', function() { setMode('text'); });
  btnModeBtn.addEventListener('click', function() { setMode('button'); });

  // Expose a method to get the quantity value
  row.getQuantity = function() {
    if (currentMode === 'text') {
      return qtyTextInput.value.trim();
    } else {
      return qtyUI.getValue();
    }
  };

  // If existing data has quantity matching button pattern, try to set button mode
  if (data.quantity) {
    var match = data.quantity.match(/^(大さじ|小さじ|カップ)\s*(.+)$/);
    if (match) {
      var unitVal = match[1];
      var amtStr = match[2].trim();
      var amtNum = null;
      if (amtStr === '1/2') amtNum = 0.5;
      else if (amtStr.match(/^\d+\s+1\/2$/)) amtNum = parseInt(amtStr) + 0.5;
      else amtNum = parseFloat(amtStr);
      if (amtNum && !isNaN(amtNum)) {
        setMode('button');
        qtyUI.setValue(unitVal, amtNum);
      }
    }
  }

  container.appendChild(row);
  return row;
}

/**
 * ユーザー名選択モーダルを表示
 * @returns {Promise<string|null>}
 */
async function promptUserName() {
  // Try to get from children table
  var children = [];
  try {
    var { data } = await client.from('children').select('name');
    children = data || [];
  } catch(e) {}

  if (children.length === 0) {
    // Manual input
    var name = prompt('お名前を入力してください');
    return name && name.trim() ? name.trim() : null;
  }

  if (children.length === 1) {
    return children[0].name;
  }

  // Multiple children: show selection prompt
  var names = children.map(function(c) { return c.name; });
  var choice = prompt('誰ですか？\n' + names.map(function(n, i) { return (i+1) + '. ' + n; }).join('\n') + '\n\n番号を入力:');
  if (choice) {
    var idx = parseInt(choice, 10) - 1;
    if (idx >= 0 && idx < names.length) {
      return names[idx];
    }
  }
  return null;
}

/**
 * レシピカードを描画する（DocumentFragment返却、XSS安全）
 * @param {object} cardData - recipeCardData() の返却値
 * @returns {DocumentFragment}
 */
function renderRecipeCard(cardData) {
  var fragment = document.createDocumentFragment();
  var card = document.createElement('div');
  card.className = 'card recipe-card';
  card.style.cursor = 'pointer';
  card.setAttribute('data-recipe-id', cardData.id);

  // サムネイル
  var thumbnailDiv = document.createElement('div');
  thumbnailDiv.className = 'recipe-card-thumbnail';
  thumbnailDiv.style.cssText = 'text-align:center;padding:16px 0;font-size:3em;background:#f9f9f6;border-radius:8px 8px 0 0;';
  if (cardData.thumbnailUrl) {
    var img = document.createElement('img');
    img.src = cardData.thumbnailUrl;
    img.alt = cardData.title || 'レシピ写真';
    img.style.cssText = 'width:100%;height:140px;object-fit:cover;border-radius:8px 8px 0 0;';
    thumbnailDiv.style.padding = '0';
    thumbnailDiv.appendChild(img);
  } else {
    thumbnailDiv.textContent = '🍳';
  }
  card.appendChild(thumbnailDiv);

  // カード本体
  var body = document.createElement('div');
  body.style.cssText = 'padding:12px;';

  // タイトル
  var titleEl = document.createElement('div');
  titleEl.style.cssText = 'font-weight:700;font-size:1.1em;margin-bottom:6px;';
  titleEl.textContent = cardData.title || '（無題）';
  body.appendChild(titleEl);

  // メタ情報行
  var metaEl = document.createElement('div');
  metaEl.style.cssText = 'display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-size:0.85em;color:#666;margin-bottom:6px;';

  // 作者
  if (cardData.author) {
    var authorSpan = document.createElement('span');
    authorSpan.textContent = cardData.author;
    metaEl.appendChild(authorSpan);
  }

  // 調理時間
  if (cardData.cookTimeMinutes) {
    var timeSpan = document.createElement('span');
    timeSpan.textContent = cardData.cookTimeMinutes + '分';
    metaEl.appendChild(timeSpan);
  }

  // 人数
  if (cardData.servings) {
    var servingsSpan = document.createElement('span');
    servingsSpan.textContent = cardData.servings;
    metaEl.appendChild(servingsSpan);
  }

  body.appendChild(metaEl);

  // 下段: カテゴリバッジ + お気に入り⭐
  var bottomRow = document.createElement('div');
  bottomRow.style.cssText = 'display:flex;align-items:center;justify-content:space-between;';

  // カテゴリバッジ
  if (cardData.category) {
    var badge = document.createElement('span');
    badge.style.cssText = 'display:inline-block;padding:2px 8px;border-radius:10px;background:#fff3e0;color:#e65100;font-size:0.8em;font-weight:600;';
    badge.textContent = cardData.category;
    bottomRow.appendChild(badge);
  } else {
    bottomRow.appendChild(document.createElement('span'));
  }

  // アレルギー⚠️表示
  var allergyTagsOnCard = (cardData.tags || []).filter(function(t) { return t.indexOf('allergy:') === 0; });
  if (allergyTagsOnCard.length > 0) {
    var allergyIcon = document.createElement('span');
    allergyIcon.style.cssText = 'font-size:1em;';
    allergyIcon.title = allergyTagsOnCard.map(function(t) { return t.replace('allergy:', ''); }).join(', ');
    allergyIcon.textContent = '⚠️';
    bottomRow.appendChild(allergyIcon);
  }

  // お気に入り⭐
  var favSpan = document.createElement('span');
  favSpan.style.cssText = 'font-size:1.2em;';
  favSpan.textContent = cardData.isFavorite ? '⭐' : '☆';
  bottomRow.appendChild(favSpan);

  body.appendChild(bottomRow);
  card.appendChild(body);

  // カードクリック → 詳細へ遷移
  card.addEventListener('click', function() {
    navigateTo('#detail/' + cardData.id);
  });

  fragment.appendChild(card);
  return fragment;
}

/**
 * カテゴリ管理モーダルを表示（admin専用）
 */
async function showCategorySettingsModal() {
  var existing = document.getElementById('category-settings-overlay');
  if (existing) existing.parentNode.removeChild(existing);

  var overlay = document.createElement('div');
  overlay.id = 'category-settings-overlay';
  overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:100;display:flex;align-items:center;justify-content:center;';

  var modal = document.createElement('div');
  modal.style.cssText = 'background:#fff;border-radius:16px;padding:24px;max-width:90%;width:360px;';

  var title = document.createElement('h3');
  title.style.cssText = 'margin-bottom:16px;font-size:1.1em;';
  title.textContent = '⚙️ カテゴリ管理';
  modal.appendChild(title);

  var categories = await RecipeCategoryRepository.getAll();
  var listDiv = document.createElement('div');
  listDiv.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px;';

  for (var i = 0; i < categories.length; i++) {
    (function(cat) {
      var pill = document.createElement('span');
      pill.style.cssText = 'display:inline-flex;align-items:center;gap:4px;padding:6px 12px;border-radius:16px;background:#f0f0f0;font-size:0.95em;';
      var pillText = document.createElement('span');
      pillText.textContent = cat;
      pill.appendChild(pillText);
      var removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.textContent = '✕';
      removeBtn.style.cssText = 'border:none;background:transparent;cursor:pointer;font-size:0.9em;color:#e53935;padding:0 2px;';
      removeBtn.addEventListener('click', async function() {
        if (confirm('カテゴリ「' + cat + '」を削除しますか？\n※既存レシピのカテゴリは変更されません')) {
          var result = await RecipeCategoryRepository.remove(cat);
          if (!result.error) {
            pill.parentNode.removeChild(pill);
            showToast('カテゴリを削除しました', 'success');
          } else {
            showToast('削除に失敗しました', 'error');
          }
        }
      });
      pill.appendChild(removeBtn);
      listDiv.appendChild(pill);
    })(categories[i]);
  }
  modal.appendChild(listDiv);

  var closeBtn = document.createElement('button');
  closeBtn.className = 'btn-secondary';
  closeBtn.textContent = '閉じる';
  closeBtn.style.cssText = 'width:100%;padding:12px;';
  closeBtn.addEventListener('click', function() {
    overlay.parentNode.removeChild(overlay);
  });
  modal.appendChild(closeBtn);

  overlay.appendChild(modal);
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) overlay.parentNode.removeChild(overlay);
  });
  document.body.appendChild(overlay);
}

/**
 * レシピ一覧をロードして描画
 */
async function loadRecipeList() {
  var container = document.getElementById('view-list');
  if (!container) return;

  // ローディング表示
  container.innerHTML = '';
  var loadingEl = document.createElement('div');
  loadingEl.className = 'loading';
  loadingEl.textContent = 'レシピを読み込み中...';
  container.appendChild(loadingEl);

  try {
    // データ取得（下書き・非公開含む全件取得）
    var result = await RecipeRepository.getAll({ status: null });
    var recipes = result.data || [];

    // ユーザー名取得
    var currentUserName = await getCurrentUserName();

    // お気に入り取得
    var userFavorites = await FavoriteRepository.getByUser(currentUserName);

    // 調理統計取得
    var recipeIds = recipes.map(function(r) { return r.id; });
    var cookStats = await CookHistoryRepository.getStats(recipeIds);

    // お気に入りカウント取得（ソート用）
    var favoriteCounts = await FavoriteRepository.getCountsForRecipes(recipeIds);

    // コンテナをクリア
    container.innerHTML = '';

    // --- Admin カテゴリ管理ボタン ---
    if (localStorage.getItem('deviceRole') === 'admin') {
      var catSettingsBtn = document.createElement('button');
      catSettingsBtn.type = 'button';
      catSettingsBtn.textContent = '⚙️ カテゴリ管理';
      catSettingsBtn.style.cssText = 'float:right;border:1px solid #ddd;border-radius:8px;background:#fff;padding:6px 12px;font-size:0.85em;cursor:pointer;color:#666;margin-bottom:8px;';
      catSettingsBtn.addEventListener('click', function() {
        showCategorySettingsModal();
      });
      container.appendChild(catSettingsBtn);
    }

    if (recipes.length === 0) {
      var emptyEl = document.createElement('div');
      emptyEl.className = 'empty-state';
      var emojiDiv = document.createElement('div');
      emojiDiv.className = 'emoji';
      emojiDiv.textContent = '🍳';
      var msgDiv = document.createElement('div');
      msgDiv.textContent = 'レシピが見つかりません';
      emptyEl.appendChild(emojiDiv);
      emptyEl.appendChild(msgDiv);
      container.appendChild(emptyEl);
      return;
    }

    // --- 検索バー＋ソート＋お気に入りフィルタ UI ---
    var searchSection = document.createElement('div');
    searchSection.className = 'recipe-search-section';
    searchSection.style.cssText = 'margin-bottom:16px;';

    // 検索バー行
    var searchRow = document.createElement('div');
    searchRow.style.cssText = 'display:flex;gap:8px;align-items:center;margin-bottom:8px;flex-wrap:wrap;';

    var searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.id = 'recipe-search-input';
    searchInput.placeholder = 'レシピを検索...';
    searchInput.style.cssText = 'flex:1;min-width:120px;padding:10px 14px;border:1px solid #ddd;border-radius:8px;font-size:1em;';
    searchRow.appendChild(searchInput);

    // お気に入りフィルタボタン
    var favFilterBtn = document.createElement('button');
    favFilterBtn.type = 'button';
    favFilterBtn.id = 'recipe-fav-filter-btn';
    favFilterBtn.textContent = '☆';
    favFilterBtn.title = 'お気に入りのみ表示';
    favFilterBtn.style.cssText = 'width:42px;height:42px;border:1px solid #ddd;border-radius:8px;background:#fff;font-size:1.3em;cursor:pointer;';
    searchRow.appendChild(favFilterBtn);

    searchSection.appendChild(searchRow);

    // ソートドロップダウン行
    var sortRow = document.createElement('div');
    sortRow.style.cssText = 'display:flex;align-items:center;gap:8px;';

    var sortLabel = document.createElement('span');
    sortLabel.textContent = '並び替え:';
    sortLabel.style.cssText = 'font-size:0.85em;color:#666;';
    sortRow.appendChild(sortLabel);

    var sortSelect = document.createElement('select');
    sortSelect.id = 'recipe-sort-select';
    sortSelect.style.cssText = 'padding:8px 12px;border:1px solid #ddd;border-radius:8px;font-size:0.9em;background:#fff;';
    var sortOptions = [
      { value: 'newest', label: '新しい順' },
      { value: 'oldest', label: '古い順' },
      { value: 'name', label: '名前順' },
      { value: 'favorite', label: 'お気に入り順' },
      { value: 'recent', label: '最近作った順' }
    ];
    for (var si = 0; si < sortOptions.length; si++) {
      var opt = document.createElement('option');
      opt.value = sortOptions[si].value;
      opt.textContent = sortOptions[si].label;
      sortSelect.appendChild(opt);
    }
    sortRow.appendChild(sortSelect);
    searchSection.appendChild(sortRow);
    container.appendChild(searchSection);

    // --- トップセクション描画 ---
    var topSectionsContainer = document.createElement('div');
    topSectionsContainer.id = 'recipe-top-sections';
    container.appendChild(topSectionsContainer);
    await loadTopSections(topSectionsContainer, recipes, userFavorites, cookStats, currentUserName);

    // --- 自分の下書き/非公開セクション ---
    var ownDrafts = recipes.filter(function(r) {
      return (r.status === 'draft' || r.status === 'private') && r.author === currentUserName;
    });
    var draftSection = document.createElement('div');
    draftSection.id = 'recipe-draft-section';
    if (ownDrafts.length > 0) {
      var draftHeading = document.createElement('h2');
      draftHeading.style.cssText = 'font-size:1.1em;margin:16px 0 10px;color:#333;';
      draftHeading.textContent = '📝 自分の下書き/非公開';
      draftSection.appendChild(draftHeading);

      var draftGrid = document.createElement('div');
      draftGrid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px;margin-bottom:16px;';

      for (var di = 0; di < ownDrafts.length; di++) {
        var draftCardData = recipeCardData(ownDrafts[di], userFavorites, cookStats);
        // Add status icon to title
        var statusIcon = ownDrafts[di].status === 'draft' ? '📝 ' : '🔒 ';
        draftCardData.title = statusIcon + (draftCardData.title || '（無題）');
        var draftCardFragment = renderRecipeCard(draftCardData);
        draftGrid.appendChild(draftCardFragment);
      }
      draftSection.appendChild(draftGrid);
    }
    container.appendChild(draftSection);

    // --- 🎲 ランダムレシピセクション ---
    var randomSection = document.createElement('div');
    randomSection.id = 'recipe-random-section';
    randomSection.style.cssText = 'margin-bottom:20px;background:#fff;border-radius:12px;padding:16px;box-shadow:0 2px 8px rgba(0,0,0,0.08);';

    var randomHeading = document.createElement('h2');
    randomHeading.style.cssText = 'font-size:1.1em;margin-bottom:12px;color:#333;';
    randomHeading.textContent = '🎲 ランダムレシピ';
    randomSection.appendChild(randomHeading);

    var randomControls = document.createElement('div');
    randomControls.style.cssText = 'display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:12px;';

    var randomCatSelect = document.createElement('select');
    randomCatSelect.id = 'random-category-select';
    randomCatSelect.style.cssText = 'padding:8px 12px;border:1px solid #ddd;border-radius:8px;font-size:0.9em;background:#fff;';
    var randomCats = await RecipeCategoryRepository.getAll();
    var rcOptAll = document.createElement('option');
    rcOptAll.value = '';
    rcOptAll.textContent = '全て';
    randomCatSelect.appendChild(rcOptAll);
    for (var rci = 0; rci < randomCats.length; rci++) {
      var rcOpt = document.createElement('option');
      rcOpt.value = randomCats[rci];
      rcOpt.textContent = randomCats[rci];
      randomCatSelect.appendChild(rcOpt);
    }
    randomControls.appendChild(randomCatSelect);

    var randomBtn = document.createElement('button');
    randomBtn.className = 'btn-primary';
    randomBtn.style.cssText = 'padding:8px 16px;font-size:1.1em;';
    randomBtn.textContent = '🎲';
    randomControls.appendChild(randomBtn);

    randomSection.appendChild(randomControls);

    var randomResult = document.createElement('div');
    randomResult.id = 'random-result';
    randomSection.appendChild(randomResult);

    container.appendChild(randomSection);

    // Random button event
    randomBtn.addEventListener('click', async function() {
      var cat = randomCatSelect.value || null;
      randomResult.innerHTML = '';
      var loadingDiv = document.createElement('div');
      loadingDiv.style.cssText = 'text-align:center;color:#999;padding:12px;';
      loadingDiv.textContent = '選んでいます...';
      randomResult.appendChild(loadingDiv);

      var res = await RecipeRepository.getRandom(cat);
      randomResult.innerHTML = '';

      if (!res.data) {
        var emptyDiv = document.createElement('div');
        emptyDiv.style.cssText = 'text-align:center;color:#999;padding:12px;';
        emptyDiv.textContent = 'レシピが見つかりません';
        randomResult.appendChild(emptyDiv);
        return;
      }

      var rCardData = recipeCardData(res.data, userFavorites, cookStats);
      var rCardFrag = renderRecipeCard(rCardData);
      randomResult.appendChild(rCardFrag);

      // もう一回ボタン
      var retryBtn = document.createElement('button');
      retryBtn.className = 'btn-secondary';
      retryBtn.style.cssText = 'margin-top:8px;width:100%;';
      retryBtn.textContent = 'もう一回 🎲';
      retryBtn.addEventListener('click', function() {
        randomBtn.click();
      });
      randomResult.appendChild(retryBtn);
    });

    // --- 全レシピカード描画エリア ---
    var allSection = document.createElement('div');
    allSection.className = 'recipe-all-section';
    allSection.id = 'recipe-all-section';
    var allHeading = document.createElement('h2');
    allHeading.style.cssText = 'font-size:1.1em;margin:20px 0 12px;color:#333;';
    allHeading.textContent = '📖 すべてのレシピ';
    allSection.appendChild(allHeading);

    var cardGrid = document.createElement('div');
    cardGrid.id = 'recipe-card-grid';
    cardGrid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px;';

    for (var i = 0; i < recipes.length; i++) {
      var cardData = recipeCardData(recipes[i], userFavorites, cookStats);
      var cardFragment = renderRecipeCard(cardData);
      cardGrid.appendChild(cardFragment);
    }
    allSection.appendChild(cardGrid);
    container.appendChild(allSection);

    // --- 検索結果なし表示用 ---
    var noResultEl = document.createElement('div');
    noResultEl.id = 'recipe-no-result';
    noResultEl.className = 'empty-state';
    noResultEl.style.display = 'none';
    noResultEl.textContent = 'レシピが見つかりません';
    container.appendChild(noResultEl);

    // --- フィルタ/ソート/検索のイベントバインド ---
    var favFilterActive = false;

    function reRenderCards() {
      var query = searchInput.value;
      var sortMode = sortSelect.value;

      // フィルタ: 可視性 → テキスト検索 → お気に入りフィルタ
      var filtered = filterVisibleRecipes(recipes, currentUserName);

      if (query && query.trim() !== '') {
        filtered = filtered.filter(function(r) {
          return matchesTextSearch(r, query);
        });
      }

      if (favFilterActive) {
        filtered = filterFavorites(filtered, userFavorites);
      }

      // ソート
      var sorted = sortRecipes(filtered, sortMode, favoriteCounts, cookStats);

      // 再描画
      cardGrid.innerHTML = '';
      for (var i = 0; i < sorted.length; i++) {
        var cd = recipeCardData(sorted[i], userFavorites, cookStats);
        var cf = renderRecipeCard(cd);
        cardGrid.appendChild(cf);
      }

      // トップセクション・下書きセクション表示制御
      var topEl = document.getElementById('recipe-top-sections');
      var draftEl = document.getElementById('recipe-draft-section');
      var hasActiveFilter = (query && query.trim() !== '') || favFilterActive;

      if (topEl) topEl.style.display = hasActiveFilter ? 'none' : '';
      if (draftEl) draftEl.style.display = hasActiveFilter ? 'none' : '';

      // 結果なし表示
      if (sorted.length === 0) {
        noResultEl.style.display = '';
        allSection.querySelector('h2').style.display = 'none';
      } else {
        noResultEl.style.display = 'none';
        allSection.querySelector('h2').style.display = '';
      }
    }

    searchInput.addEventListener('input', reRenderCards);
    sortSelect.addEventListener('change', reRenderCards);

    favFilterBtn.addEventListener('click', function() {
      favFilterActive = !favFilterActive;
      favFilterBtn.textContent = favFilterActive ? '⭐' : '☆';
      favFilterBtn.style.background = favFilterActive ? '#fff3e0' : '#fff';
      favFilterBtn.style.borderColor = favFilterActive ? '#e65100' : '#ddd';
      reRenderCards();
    });

  } catch (e) {
    container.innerHTML = '';
    var errorEl = document.createElement('div');
    errorEl.className = 'empty-state';
    errorEl.textContent = 'エラーが発生しました。再読み込みしてください。';
    container.appendChild(errorEl);
  }
}

/**
 * トップセクション描画（よく作る / 最近作った / お気に入り）
 * @param {HTMLElement} container - 描画先コンテナ
 * @param {Array} recipes - 全レシピ配列
 * @param {string[]} userFavorites - ユーザーのお気に入りrecipe_id配列
 * @param {object} cookStats - {recipeId: {count, lastCookedAt}} マップ
 * @param {string|null} currentUserName - 現在のユーザー名
 */
async function loadTopSections(container, recipes, userFavorites, cookStats, currentUserName) {
  // よく作るレシピ（top 5）
  var popularRecipes = getTopRecipes(recipes, cookStats, 'popular', 5);
  // count > 0 のもののみ表示
  popularRecipes = popularRecipes.filter(function(r) {
    var s = cookStats[r.id];
    return s && s.count > 0;
  });

  if (popularRecipes.length > 0) {
    renderTopSection(container, '🔥 よく作る', popularRecipes, userFavorites, cookStats);
  }

  // 最近作ったレシピ（top 5）
  var recentRecipes = getTopRecipes(recipes, cookStats, 'recent', 5);
  // lastCookedAt があるもののみ表示
  recentRecipes = recentRecipes.filter(function(r) {
    var s = cookStats[r.id];
    return s && s.lastCookedAt;
  });

  if (recentRecipes.length > 0) {
    renderTopSection(container, '🕐 最近作った', recentRecipes, userFavorites, cookStats);
  }

  // お気に入りレシピ
  if (userFavorites && userFavorites.length > 0) {
    var favoriteRecipes = recipes.filter(function(r) {
      return userFavorites.includes(r.id);
    });
    if (favoriteRecipes.length > 0) {
      renderTopSection(container, '⭐ お気に入り', favoriteRecipes, userFavorites, cookStats);
    }
  }
}

/**
 * トップセクション1つを描画（見出し + 横スクロールカード行）
 * @param {HTMLElement} container - 描画先
 * @param {string} title - セクション見出し
 * @param {Array} recipes - セクション内レシピ配列
 * @param {string[]} userFavorites - お気に入りID配列
 * @param {object} cookStats - 調理統計マップ
 */
function renderTopSection(container, title, recipes, userFavorites, cookStats) {
  var section = document.createElement('div');
  section.className = 'recipe-top-section';
  section.style.cssText = 'margin-bottom:20px;';

  var heading = document.createElement('h2');
  heading.style.cssText = 'font-size:1.1em;margin-bottom:10px;color:#333;';
  heading.textContent = title;
  section.appendChild(heading);

  var scrollRow = document.createElement('div');
  scrollRow.style.cssText = 'display:flex;gap:12px;overflow-x:auto;padding-bottom:8px;-webkit-overflow-scrolling:touch;';

  for (var i = 0; i < recipes.length; i++) {
    var cardData = recipeCardData(recipes[i], userFavorites, cookStats);
    var cardWrapper = document.createElement('div');
    cardWrapper.style.cssText = 'min-width:150px;max-width:180px;flex-shrink:0;';
    var cardFragment = renderRecipeCard(cardData);
    cardWrapper.appendChild(cardFragment);
    scrollRow.appendChild(cardWrapper);
  }

  section.appendChild(scrollRow);
  container.appendChild(section);
}

/**
 * トースト通知を表示
 * @param {string} message - メッセージ
 * @param {string} [type='error'] - 'error' | 'success' | 'info'
 */
function showToast(message, type) {
  type = type || 'error';
  var toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.className = 'toast ' + type + ' show';
  setTimeout(function() {
    toast.classList.remove('show');
  }, 3000);
}

/**
 * 材料リストを描画
 * @param {Array<{name: string, quantity: string, memo: string, sort_order: number}>} ingredients
 * @returns {DocumentFragment}
 */
function renderIngredients(ingredients) {
  var fragment = document.createDocumentFragment();
  var section = document.createElement('div');
  section.className = 'recipe-detail-ingredients';

  var heading = document.createElement('h3');
  heading.textContent = '🥕 材料';
  heading.style.cssText = 'margin-bottom:12px;font-size:1.1em;color:#333;';
  section.appendChild(heading);

  if (!ingredients || ingredients.length === 0) {
    var emptyMsg = document.createElement('p');
    emptyMsg.textContent = '材料情報なし';
    emptyMsg.style.cssText = 'color:#999;font-size:0.9em;';
    section.appendChild(emptyMsg);
    fragment.appendChild(section);
    return fragment;
  }

  // Sort by sort_order ASC
  var sorted = ingredients.slice().sort(function(a, b) {
    return (a.sort_order || 0) - (b.sort_order || 0);
  });

  var table = document.createElement('table');
  table.style.cssText = 'width:100%;border-collapse:collapse;';

  for (var i = 0; i < sorted.length; i++) {
    var ing = sorted[i];
    var row = document.createElement('tr');
    row.style.cssText = 'border-bottom:1px solid #eee;';

    var nameCell = document.createElement('td');
    nameCell.style.cssText = 'padding:8px 4px;font-weight:600;';
    nameCell.textContent = ing.name || '';
    row.appendChild(nameCell);

    var qtyCell = document.createElement('td');
    qtyCell.style.cssText = 'padding:8px 4px;color:#666;';
    qtyCell.textContent = ing.quantity || '';
    row.appendChild(qtyCell);

    var memoCell = document.createElement('td');
    memoCell.style.cssText = 'padding:8px 4px;color:#999;font-size:0.85em;';
    memoCell.textContent = ing.memo || '';
    row.appendChild(memoCell);

    table.appendChild(row);
  }

  section.appendChild(table);
  fragment.appendChild(section);
  return fragment;
}

/**
 * 手順リストを描画（sort_order ASC → 表示番号 1, 2, 3...）
 * @param {Array<{description: string, sort_order: number, id: string}>} steps
 * @param {Array} [photos] - レシピの全写真（step_idでマッチング）
 * @returns {DocumentFragment}
 */
function renderSteps(steps, photos) {
  var fragment = document.createDocumentFragment();
  var section = document.createElement('div');
  section.className = 'recipe-detail-steps';

  var heading = document.createElement('h3');
  heading.textContent = '📝 手順';
  heading.style.cssText = 'margin-bottom:12px;font-size:1.1em;color:#333;';
  section.appendChild(heading);

  if (!steps || steps.length === 0) {
    var emptyMsg = document.createElement('p');
    emptyMsg.textContent = '手順情報なし';
    emptyMsg.style.cssText = 'color:#999;font-size:0.9em;';
    section.appendChild(emptyMsg);
    fragment.appendChild(section);
    return fragment;
  }

  // Sort by sort_order ASC
  var sorted = steps.slice().sort(function(a, b) {
    return (a.sort_order || 0) - (b.sort_order || 0);
  });

  var list = document.createElement('ol');
  list.style.cssText = 'padding-left:24px;';

  for (var i = 0; i < sorted.length; i++) {
    var step = sorted[i];
    var li = document.createElement('li');
    li.style.cssText = 'margin-bottom:16px;line-height:1.6;';

    var descEl = document.createElement('div');
    descEl.textContent = step.description || '';
    li.appendChild(descEl);

    // If photos exist with step_id matching, show photo under that step
    if (photos && step.id) {
      var stepPhotos = photos.filter(function(p) { return p.step_id === step.id; });
      for (var j = 0; j < stepPhotos.length; j++) {
        var img = document.createElement('img');
        img.src = stepPhotos[j].url;
        img.alt = stepPhotos[j].caption || '手順写真';
        img.style.cssText = 'max-width:100%;height:auto;border-radius:8px;margin-top:8px;';
        li.appendChild(img);
      }
    }

    list.appendChild(li);
  }

  section.appendChild(list);
  fragment.appendChild(section);
  return fragment;
}

/**
 * レシピ詳細表示
 * @param {string} id - レシピID
 */
async function loadRecipeDetail(id) {
  var container = document.getElementById('view-detail');
  if (!container) return;

  // ローディング表示
  container.innerHTML = '';
  var loadingEl = document.createElement('div');
  loadingEl.className = 'loading';
  loadingEl.textContent = 'レシピを読み込み中...';
  container.appendChild(loadingEl);

  try {
    var result = await RecipeRepository.getById(id);
    if (result.error || !result.data) {
      container.innerHTML = '';
      var notFound = document.createElement('div');
      notFound.className = 'empty-state';
      notFound.textContent = 'レシピが見つかりません';
      var backLink = document.createElement('a');
      backLink.href = '#list';
      backLink.textContent = '← 一覧に戻る';
      backLink.style.cssText = 'display:block;margin-top:12px;color:#e65100;';
      notFound.appendChild(backLink);
      container.appendChild(notFound);
      return;
    }

    var recipe = result.data;

    // Visibility check: draft/private recipes only visible to author
    var currentUserName = await getCurrentUserName();
    if (recipe.status === 'draft' || recipe.status === 'private') {
      if (recipe.author !== currentUserName) {
        container.innerHTML = '';
        var notAllowed = document.createElement('div');
        notAllowed.className = 'empty-state';
        notAllowed.textContent = 'レシピが見つかりません';
        var backLink2 = document.createElement('a');
        backLink2.href = '#list';
        backLink2.textContent = '← 一覧に戻る';
        backLink2.style.cssText = 'display:block;margin-top:12px;color:#e65100;';
        notAllowed.appendChild(backLink2);
        container.appendChild(notAllowed);
        return;
      }
    }

    container.innerHTML = '';

    // Allergy tags at top with ⚠️
    var tags = (recipe.recipe_tags || []).map(function(t) { return t.tag; });
    var allergyTags = tags.filter(function(t) { return t.indexOf('allergy:') === 0; });
    if (allergyTags.length > 0) {
      var allergyBanner = document.createElement('div');
      allergyBanner.style.cssText = 'background:#fff3e0;border:1px solid #ffcc02;border-radius:8px;padding:10px 14px;margin-bottom:16px;';
      var allergyText = allergyTags.map(function(t) { return '⚠️ ' + t.replace('allergy:', ''); }).join('　');
      allergyBanner.textContent = allergyText;
      container.appendChild(allergyBanner);
    }

    // Photos gallery
    var photos = recipe.recipe_photos || [];
    if (photos.length > 0) {
      var gallery = document.createElement('div');
      gallery.style.cssText = 'display:flex;gap:8px;overflow-x:auto;margin-bottom:16px;-webkit-overflow-scrolling:touch;';
      for (var p = 0; p < photos.length; p++) {
        var photoImg = document.createElement('img');
        photoImg.src = photos[p].url;
        photoImg.alt = photos[p].caption || 'レシピ写真';
        photoImg.style.cssText = 'height:200px;object-fit:cover;border-radius:8px;flex-shrink:0;';
        gallery.appendChild(photoImg);
      }
      container.appendChild(gallery);
    }

    // Title
    var titleEl = document.createElement('h2');
    titleEl.style.cssText = 'font-size:1.4em;margin-bottom:8px;color:#333;';
    titleEl.textContent = recipe.title || '（無題）';
    container.appendChild(titleEl);

    // Meta: category badge, cook_time, servings
    var metaRow = document.createElement('div');
    metaRow.style.cssText = 'display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:12px;';

    if (recipe.category) {
      var badge = document.createElement('span');
      badge.style.cssText = 'display:inline-block;padding:3px 10px;border-radius:10px;background:#fff3e0;color:#e65100;font-size:0.85em;font-weight:600;';
      badge.textContent = recipe.category;
      metaRow.appendChild(badge);
    }

    if (recipe.cook_time_minutes) {
      var timeSpan = document.createElement('span');
      timeSpan.style.cssText = 'font-size:0.9em;color:#666;';
      timeSpan.textContent = '⏱ ' + recipe.cook_time_minutes + '分';
      metaRow.appendChild(timeSpan);
    }

    if (recipe.servings) {
      var servingsSpan = document.createElement('span');
      servingsSpan.style.cssText = 'font-size:0.9em;color:#666;';
      servingsSpan.textContent = '👥 ' + recipe.servings;
      metaRow.appendChild(servingsSpan);
    }

    container.appendChild(metaRow);

    // Description
    if (recipe.description) {
      var descEl = document.createElement('p');
      descEl.style.cssText = 'color:#555;line-height:1.6;margin-bottom:16px;';
      descEl.textContent = recipe.description;
      container.appendChild(descEl);
    }

    // Cook stats
    var cookHistory = recipe.recipe_cook_history || [];
    var cookStats = computeCookStats(cookHistory);
    if (cookStats.count > 0) {
      var statsEl = document.createElement('div');
      statsEl.className = 'recipe-cook-stats';
      statsEl.style.cssText = 'background:#f0f4f8;border-radius:8px;padding:10px 14px;margin-bottom:16px;font-size:0.9em;color:#555;';
      var statsText = '🍳 ' + cookStats.count + '回作った';
      if (cookStats.lastCookedAt) {
        var lastDate = new Date(cookStats.lastCookedAt);
        statsText += '（最後: ' + lastDate.toLocaleDateString('ja-JP') + '）';
      }
      statsEl.textContent = statsText;
      container.appendChild(statsEl);
    }

    // Tags (clickable → filter list)
    var generalTags = tags.filter(function(t) { return t.indexOf('allergy:') !== 0; });
    if (generalTags.length > 0) {
      var tagsDiv = document.createElement('div');
      tagsDiv.style.cssText = 'display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px;';
      for (var ti = 0; ti < generalTags.length; ti++) {
        var tagBtn = document.createElement('button');
        tagBtn.style.cssText = 'border:1px solid #ddd;background:#fafafa;border-radius:16px;padding:4px 12px;font-size:0.85em;cursor:pointer;color:#555;';
        tagBtn.textContent = '#' + generalTags[ti];
        tagBtn.setAttribute('data-tag', generalTags[ti]);
        tagBtn.addEventListener('click', function() {
          navigateTo('#list');
          // TODO: trigger tag filter on list view
        });
        tagsDiv.appendChild(tagBtn);
      }
      container.appendChild(tagsDiv);
    }

    // Action bar
    var currentUserName = await getCurrentUserName();
    var actionBar = document.createElement('div');
    actionBar.className = 'recipe-action-bar';
    actionBar.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px;';

    // ⭐ toggle button
    var favorites = (recipe.recipe_favorites || []).map(function(f) { return f.user_name; });
    var isFavorite = currentUserName && favorites.indexOf(currentUserName) !== -1;

    var favBtn = document.createElement('button');
    favBtn.className = 'btn-secondary recipe-fav-btn';
    favBtn.textContent = isFavorite ? '⭐ お気に入り' : '☆ お気に入り';
    favBtn.addEventListener('click', async function() {
      if (!currentUserName) {
        currentUserName = await promptUserName();
        if (!currentUserName) {
          showToast('ユーザー名が取得できません', 'error');
          return;
        }
      }
      // Optimistic update
      isFavorite = !isFavorite;
      favBtn.textContent = isFavorite ? '⭐ お気に入り' : '☆ お気に入り';

      FavoriteRepository.toggle(id, currentUserName).then(function(result) {
        if (result.error) {
          // Rollback
          isFavorite = !isFavorite;
          favBtn.textContent = isFavorite ? '⭐ お気に入り' : '☆ お気に入り';
          showToast('お気に入り更新に失敗しました', 'error');
        }
      });
    });
    actionBar.appendChild(favBtn);

    // "作った！" button
    var cookBtn = document.createElement('button');
    cookBtn.className = 'btn-secondary';
    cookBtn.textContent = '🍳 作った！';
    cookBtn.addEventListener('click', async function() {
      if (!currentUserName) {
        currentUserName = await promptUserName();
        if (!currentUserName) {
          showToast('ユーザー名が取得できません', 'error');
          return;
        }
      }
      CookHistoryRepository.add(id, currentUserName).then(function(result) {
        if (result.error) {
          showToast('調理記録の保存に失敗しました', 'error');
        } else {
          showToast('調理記録を追加しました！', 'success');
          // Update cook stats display
          cookStats.count += 1;
          cookStats.lastCookedAt = new Date().toISOString();
          var statsDisplayEl = container.querySelector('.recipe-cook-stats');
          if (statsDisplayEl) {
            var updatedText = '🍳 ' + cookStats.count + '回作った';
            var lastD = new Date(cookStats.lastCookedAt);
            updatedText += '（最後: ' + lastD.toLocaleDateString('ja-JP') + '）';
            statsDisplayEl.textContent = updatedText;
          } else {
            // Create stats element if it didn't exist before
            var newStatsEl = document.createElement('div');
            newStatsEl.className = 'recipe-cook-stats';
            newStatsEl.style.cssText = 'background:#f0f4f8;border-radius:8px;padding:10px 14px;margin-bottom:16px;font-size:0.9em;color:#555;';
            newStatsEl.textContent = '🍳 1回作った（最後: ' + new Date().toLocaleDateString('ja-JP') + '）';
            container.insertBefore(newStatsEl, container.querySelector('.recipe-detail-ingredients') || container.querySelector('.recipe-action-bar'));
          }
          // Update cook history display
          var histSection = container.querySelector('.recipe-cook-history');
          if (histSection) {
            var newEntry = document.createElement('div');
            newEntry.style.cssText = 'padding:4px 0;font-size:0.85em;color:#666;';
            newEntry.textContent = currentUserName + ' — ' + new Date().toLocaleDateString('ja-JP');
            histSection.insertBefore(newEntry, histSection.children[1] || null);
          }
        }
      });
    });
    actionBar.appendChild(cookBtn);

    // "✏️ 編集" button
    var editBtn = document.createElement('button');
    editBtn.className = 'btn-secondary';
    editBtn.textContent = '✏️ 編集';
    editBtn.addEventListener('click', function() {
      navigateTo('#edit/' + id);
    });
    actionBar.appendChild(editBtn);

    // "🗑️ 削除" button
    var deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn-secondary';
    deleteBtn.style.color = '#e53935';
    deleteBtn.style.borderColor = '#e53935';
    deleteBtn.textContent = '🗑️ 削除';
    deleteBtn.addEventListener('click', function() {
      if (confirm('このレシピを削除しますか？この操作は取り消せません。')) {
        RecipeRepository.delete(id).then(function(result) {
          if (result.error) {
            showToast('削除に失敗しました', 'error');
          } else {
            showToast('レシピを削除しました', 'success');
            navigateTo('#list');
          }
        });
      }
    });
    actionBar.appendChild(deleteBtn);

    // "📋 複製" button
    var dupBtn = document.createElement('button');
    dupBtn.className = 'btn-secondary';
    dupBtn.textContent = '📋 複製';
    dupBtn.addEventListener('click', function() {
      RecipeRepository.duplicate(id).then(function(result) {
        if (result.error || !result.data) {
          showToast('複製に失敗しました', 'error');
        } else {
          showToast('レシピを複製しました', 'success');
          navigateTo('#edit/' + result.data.id);
        }
      });
    });
    actionBar.appendChild(dupBtn);

    // "🖨️ 印刷" button
    var printBtn = document.createElement('button');
    printBtn.className = 'btn-secondary';
    printBtn.textContent = '🖨️ 印刷';
    printBtn.addEventListener('click', function() {
      navigateTo('#print/' + id);
    });
    actionBar.appendChild(printBtn);

    // "🛒 買い物リストに追加" button
    var shoppingBtn = document.createElement('button');
    shoppingBtn.className = 'btn-secondary';
    shoppingBtn.textContent = '🛒 買い物リスト';
    shoppingBtn.addEventListener('click', function() {
      var ings = (recipe.recipe_ingredients || []).map(function(ing) {
        return { name: ing.name, quantity: ing.quantity };
      });
      if (ings.length === 0) {
        showToast('材料がありません', 'info');
        return;
      }
      showShoppingModal(id, ings);
    });
    actionBar.appendChild(shoppingBtn);

    container.appendChild(actionBar);

    // Render ingredients
    var ingredientsFragment = renderIngredients(recipe.recipe_ingredients);
    container.appendChild(ingredientsFragment);

    // Render steps
    var stepsFragment = renderSteps(recipe.recipe_steps, photos);
    container.appendChild(stepsFragment);

    // Cook history display (who cooked when)
    if (cookHistory.length > 0) {
      var histSection = document.createElement('div');
      histSection.className = 'recipe-cook-history';
      histSection.style.cssText = 'margin-top:20px;';

      var histHeading = document.createElement('h3');
      histHeading.textContent = '📋 調理履歴';
      histHeading.style.cssText = 'font-size:1em;margin-bottom:8px;color:#333;';
      histSection.appendChild(histHeading);

      // Sort by created_at DESC (already sorted from API)
      var sortedHistory = cookHistory.slice().sort(function(a, b) {
        return a.created_at > b.created_at ? -1 : 1;
      });

      for (var h = 0; h < sortedHistory.length; h++) {
        var entry = document.createElement('div');
        entry.style.cssText = 'padding:4px 0;font-size:0.85em;color:#666;';
        var entryDate = new Date(sortedHistory[h].created_at);
        entry.textContent = sortedHistory[h].user_name + ' — ' + entryDate.toLocaleDateString('ja-JP');
        histSection.appendChild(entry);
      }

      container.appendChild(histSection);
    }

  } catch (e) {
    container.innerHTML = '';
    var errorEl = document.createElement('div');
    errorEl.className = 'empty-state';
    errorEl.textContent = 'エラーが発生しました。再読み込みしてください。';
    container.appendChild(errorEl);
  }
}

/**
 * フィールドエラー表示
 * @param {string} fieldId - フィールドのID
 * @param {string} message - エラーメッセージ
 */
function showFieldError(fieldId, message) {
  var field = document.getElementById(fieldId);
  if (field) {
    field.style.borderColor = '#e53935';
    var errEl = document.createElement('div');
    errEl.className = 'field-error';
    errEl.style.cssText = 'color:#e53935;font-size:0.8em;margin-top:4px;';
    errEl.textContent = message;
    field.parentNode.insertBefore(errEl, field.nextSibling);
  }
}

/**
 * フィールドエラーをクリア
 */
function clearFieldErrors() {
  var errors = document.querySelectorAll('.field-error');
  for (var i = 0; i < errors.length; i++) {
    errors[i].parentNode.removeChild(errors[i]);
  }
  var highlighted = document.querySelectorAll('[style*="border-color: rgb(229, 57, 53)"]');
  for (var j = 0; j < highlighted.length; j++) {
    highlighted[j].style.borderColor = '';
  }
}

/**
 * 材料行を追加
 * @param {object} [data] - {name?, quantity?, memo?}
 * @returns {HTMLElement} 追加された行要素
 */
function addIngredientRow(data) {
  data = data || {};
  var container = document.getElementById('edit-ingredients-list');
  if (!container) return null;

  var row = document.createElement('div');
  row.className = 'ingredient-row';
  row.style.cssText = 'display:flex;gap:8px;align-items:center;margin-bottom:8px;flex-wrap:wrap;';

  var nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.placeholder = '材料名';
  nameInput.value = data.name || '';
  nameInput.className = 'ing-name';
  nameInput.style.cssText = 'flex:2;padding:10px;border:1px solid #ddd;border-radius:8px;font-size:1em;min-width:80px;';

  var qtyInput = document.createElement('input');
  qtyInput.type = 'text';
  qtyInput.placeholder = '分量';
  qtyInput.value = data.quantity || '';
  qtyInput.className = 'ing-quantity';
  qtyInput.style.cssText = 'flex:1;padding:10px;border:1px solid #ddd;border-radius:8px;font-size:1em;min-width:60px;';

  var memoInput = document.createElement('input');
  memoInput.type = 'text';
  memoInput.placeholder = 'メモ';
  memoInput.value = data.memo || '';
  memoInput.className = 'ing-memo';
  memoInput.style.cssText = 'flex:1;padding:10px;border:1px solid #ddd;border-radius:8px;font-size:1em;min-width:60px;';

  var removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.textContent = '✕';
  removeBtn.style.cssText = 'width:36px;height:36px;border:none;background:#f5f5f5;border-radius:50%;cursor:pointer;font-size:1em;color:#999;';
  removeBtn.addEventListener('click', function() {
    row.parentNode.removeChild(row);
  });

  row.appendChild(nameInput);
  row.appendChild(qtyInput);
  row.appendChild(memoInput);
  row.appendChild(removeBtn);
  container.appendChild(row);
  return row;
}

/**
 * 手順行を追加
 * @param {object} [data] - {description?, photoUrl?}
 * @returns {HTMLElement} 追加された行要素
 */
function addStepRow(data) {
  data = data || {};
  var container = document.getElementById('edit-steps-list');
  if (!container) return null;

  var row = document.createElement('div');
  row.className = 'step-row';
  row.style.cssText = 'display:flex;gap:8px;align-items:flex-start;margin-bottom:12px;';

  var numLabel = document.createElement('span');
  numLabel.className = 'step-num';
  var stepCount = container.querySelectorAll('.step-row').length + 1;
  numLabel.textContent = stepCount + '.';
  numLabel.style.cssText = 'font-weight:700;font-size:1.1em;padding-top:10px;min-width:24px;';

  var contentDiv = document.createElement('div');
  contentDiv.style.cssText = 'flex:1;';

  var descInput = document.createElement('textarea');
  descInput.placeholder = '手順を入力';
  descInput.value = data.description || '';
  descInput.className = 'step-description';
  descInput.rows = 2;
  descInput.style.cssText = 'width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;font-size:1em;resize:vertical;';

  contentDiv.appendChild(descInput);

  if (data.photoUrl) {
    var preview = document.createElement('img');
    preview.src = data.photoUrl;
    preview.alt = '手順写真';
    preview.style.cssText = 'max-width:100px;height:auto;border-radius:6px;margin-top:6px;';
    contentDiv.appendChild(preview);
  }

  var removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.textContent = '✕';
  removeBtn.style.cssText = 'width:36px;height:36px;border:none;background:#f5f5f5;border-radius:50%;cursor:pointer;font-size:1em;color:#999;margin-top:8px;';
  removeBtn.addEventListener('click', function() {
    row.parentNode.removeChild(row);
    // Re-number steps
    var rows = container.querySelectorAll('.step-row');
    for (var i = 0; i < rows.length; i++) {
      var num = rows[i].querySelector('.step-num');
      if (num) num.textContent = (i + 1) + '.';
    }
  });

  row.appendChild(numLabel);
  row.appendChild(contentDiv);
  row.appendChild(removeBtn);
  container.appendChild(row);
  return row;
}

/**
 * レシピ保存処理
 * @param {string} status - 'published' | 'draft' | 'private'
 */
async function saveRecipe(status) {
  clearFieldErrors();

  // Collect form data
  var titleInput = document.getElementById('edit-title');
  var descInput = document.getElementById('edit-description');
  var categoryInput = document.getElementById('edit-category');
  var cookTimeInput = document.getElementById('edit-cook-time');
  var servingsInput = document.getElementById('edit-servings');
  var recipeIdInput = document.getElementById('edit-recipe-id');

  var title = titleInput ? titleInput.value : '';
  var description = descInput ? descInput.value : '';
  var category = categoryInput ? categoryInput.value : '';
  var cookTime = cookTimeInput ? parseInt(cookTimeInput.value, 10) || null : null;
  var servings = servingsInput ? servingsInput.value : '';
  var recipeId = recipeIdInput ? recipeIdInput.value : '';

  // Collect ingredients from 材料 section
  var ingredientRows = document.querySelectorAll('#edit-ingredients-list .ingredient-row');
  var ingredients = [];
  var sortIdx = 0;
  for (var i = 0; i < ingredientRows.length; i++) {
    var nameEl = ingredientRows[i].querySelector('.ing-name');
    var qtyEl = ingredientRows[i].querySelector('.ing-quantity');
    var memoEl = ingredientRows[i].querySelector('.ing-memo');
    var name = nameEl ? nameEl.value.trim() : '';
    if (name) {
      ingredients.push({
        name: name,
        quantity: qtyEl ? qtyEl.value.trim() : '',
        memo: memoEl ? memoEl.value.trim() : '',
        sort_order: sortIdx++
      });
    }
  }

  // Collect ingredients from 調味料 section
  var seasoningRows = document.querySelectorAll('#edit-seasonings-list .seasoning-row');
  for (var si2 = 0; si2 < seasoningRows.length; si2++) {
    var seaNameEl = seasoningRows[si2].querySelector('.sea-name');
    var seaName = seaNameEl ? seaNameEl.value.trim() : '';
    if (seaName) {
      var seaQty = '';
      if (seasoningRows[si2].getQuantity) {
        seaQty = seasoningRows[si2].getQuantity();
      }
      ingredients.push({
        name: seaName,
        quantity: seaQty,
        memo: '',
        sort_order: sortIdx++
      });
    }
  }

  // Validate
  var validation = validateRecipeForm({ title: title, ingredients: ingredients }, status);
  if (!validation.valid) {
    for (var v = 0; v < validation.errors.length; v++) {
      showToast(validation.errors[v], 'error');
    }
    if (validation.errors.some(function(e) { return e.indexOf('タイトル') !== -1; })) {
      showFieldError('edit-title', 'タイトルを入力してください');
    }
    return;
  }

  // Get author
  var author = await getCurrentUserName();
  if (!author) {
    author = await promptUserName();
    if (!author) {
      showToast('ユーザー名が取得できません', 'error');
      return;
    }
  }

  // Save recipe
  var recipeData = {
    title: title,
    description: description,
    author: author,
    category: category,
    cook_time_minutes: cookTime,
    servings: servings,
    status: status
  };
  if (recipeId) {
    recipeData.id = recipeId;
  }

  var result = await RecipeRepository.save(recipeData);
  if (result.error) {
    showToast('保存に失敗しました', 'error');
    return;
  }

  var savedId = result.data.id;

  // Save ingredients (includes both 材料 and 調味料)
  var ingResult = await IngredientRepository.saveAll(savedId, ingredients);
  if (ingResult.error) {
    showToast('材料の保存に失敗しました', 'error');
  }

  // Collect and save steps
  var stepRows = document.querySelectorAll('#edit-steps-list .step-row');
  var steps = [];
  for (var si = 0; si < stepRows.length; si++) {
    var descEl = stepRows[si].querySelector('.step-description');
    var desc = descEl ? descEl.value.trim() : '';
    if (desc) {
      steps.push({
        description: desc,
        sort_order: si
      });
    }
  }

  // 手順を保存（空配列の場合も既存を削除するため常に呼ぶ）
  var stepResult = await StepRepository.saveAll(savedId, steps);
  if (stepResult.error) {
    showToast('手順の保存に失敗しました', 'error');
  }

  // Collect tags from editTagsList (new pill-based UI)
  var tagList = editTagsList.slice();

  // Allergy checkboxes
  var allergyChecks = document.querySelectorAll('.allergy-check:checked');
  for (var a = 0; a < allergyChecks.length; a++) {
    tagList.push('allergy:' + allergyChecks[a].value);
  }

  // タグを保存（空配列の場合も既存を削除するため常に呼ぶ）
  var tagResult = await TagRepository.saveAll(savedId, tagList);
  if (tagResult.error) {
    showToast('タグの保存に失敗しました', 'error');
  }

  // Upload photos
  var photoInput = document.getElementById('edit-photo-input');
  if (photoInput && photoInput.files && photoInput.files.length > 0) {
    for (var p = 0; p < photoInput.files.length; p++) {
      var file = photoInput.files[p];
      var imgValidation = validateImageFile(file);
      if (!imgValidation.valid) {
        showToast(imgValidation.error, 'error');
        continue;
      }
      var resizedBlob = await resizeImage(file);
      var uploadResult = await PhotoRepository.upload({
        file: resizedBlob,
        recipeId: savedId,
        stepId: null,
        type: 'main',
        caption: ''
      });
      if (uploadResult.error) {
        showToast('写真のアップロードに失敗しました', 'error');
      }
    }
  }

  showToast('保存しました', 'success');
  navigateTo('#detail/' + savedId);
}

/**
 * 編集フォームをロード
 * @param {string|null} id - レシピID（nullの場合新規作成）
 */
async function loadEditForm(id) {
  var container = document.getElementById('view-edit');
  if (!container) return;
  container.innerHTML = '';

  // Reset module-level tag state
  editTagsList = [];

  var fragment = document.createDocumentFragment();

  // Hidden input for recipe ID
  var hiddenId = document.createElement('input');
  hiddenId.type = 'hidden';
  hiddenId.id = 'edit-recipe-id';
  hiddenId.value = id || '';
  fragment.appendChild(hiddenId);

  // Hidden input for category value (read by saveRecipe)
  var hiddenCat = document.createElement('input');
  hiddenCat.type = 'hidden';
  hiddenCat.id = 'edit-category';
  hiddenCat.value = '';
  fragment.appendChild(hiddenCat);

  // Title
  var titleLabel = document.createElement('label');
  titleLabel.textContent = 'タイトル';
  titleLabel.style.cssText = 'display:block;font-weight:600;margin-bottom:6px;color:#333;';
  fragment.appendChild(titleLabel);

  var titleInput = document.createElement('input');
  titleInput.type = 'text';
  titleInput.id = 'edit-title';
  titleInput.placeholder = 'レシピ名を入力';
  titleInput.style.cssText = 'width:100%;padding:12px;border:1px solid #ddd;border-radius:8px;font-size:1em;margin-bottom:16px;box-sizing:border-box;';
  fragment.appendChild(titleInput);

  // Description
  var descLabel = document.createElement('label');
  descLabel.textContent = '説明';
  descLabel.style.cssText = 'display:block;font-weight:600;margin-bottom:6px;color:#333;';
  fragment.appendChild(descLabel);

  var descInput = document.createElement('textarea');
  descInput.id = 'edit-description';
  descInput.placeholder = 'レシピの説明（任意）';
  descInput.rows = 3;
  descInput.style.cssText = 'width:100%;padding:12px;border:1px solid #ddd;border-radius:8px;font-size:1em;margin-bottom:16px;resize:vertical;box-sizing:border-box;';
  fragment.appendChild(descInput);

  // Category — button selection (radio-like behavior)
  var catLabel = document.createElement('label');
  catLabel.textContent = 'カテゴリ';
  catLabel.style.cssText = 'display:block;font-weight:600;margin-bottom:6px;color:#333;';
  fragment.appendChild(catLabel);

  var catBtnRow = document.createElement('div');
  catBtnRow.id = 'edit-category-buttons';
  catBtnRow.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px;';
  var categories = await RecipeCategoryRepository.getAll();
  var catButtons = [];

  for (var ci = 0; ci < categories.length; ci++) {
    (function(catVal) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = catVal;
      btn.setAttribute('data-category', catVal);
      btn.style.cssText = 'min-height:40px;padding:8px 16px;border:1px solid #ddd;border-radius:8px;background:#fff;font-size:1em;cursor:pointer;font-weight:600;';
      btn.addEventListener('click', function() {
        // Deselect all
        for (var k = 0; k < catButtons.length; k++) {
          catButtons[k].style.background = '#fff';
          catButtons[k].style.color = '#333';
          catButtons[k].style.borderColor = '#ddd';
        }
        // Toggle: if already selected, deselect
        if (hiddenCat.value === catVal) {
          hiddenCat.value = '';
        } else {
          btn.style.background = '#e65100';
          btn.style.color = '#fff';
          btn.style.borderColor = '#e65100';
          hiddenCat.value = catVal;
        }
      });
      catButtons.push(btn);
      catBtnRow.appendChild(btn);
    })(categories[ci]);
  }

  // Add new category button
  var addCatBtn = document.createElement('button');
  addCatBtn.type = 'button';
  addCatBtn.textContent = '＋';
  addCatBtn.style.cssText = 'min-height:40px;width:40px;border:2px dashed #ddd;border-radius:8px;background:#fafafa;font-size:1.2em;cursor:pointer;color:#e65100;';
  addCatBtn.addEventListener('click', async function() {
    var newCat = prompt('新しいカテゴリ名を入力:');
    if (newCat && newCat.trim()) {
      newCat = newCat.trim();
      var result = await RecipeCategoryRepository.add(newCat);
      if (!result.error) {
        var newBtn = document.createElement('button');
        newBtn.type = 'button';
        newBtn.textContent = newCat;
        newBtn.setAttribute('data-category', newCat);
        newBtn.style.cssText = 'min-height:40px;padding:8px 16px;border:1px solid #ddd;border-radius:8px;background:#fff;font-size:1em;cursor:pointer;font-weight:600;';
        newBtn.addEventListener('click', function() {
          for (var k = 0; k < catButtons.length; k++) {
            catButtons[k].style.background = '#fff';
            catButtons[k].style.color = '#333';
            catButtons[k].style.borderColor = '#ddd';
          }
          if (hiddenCat.value === newCat) {
            hiddenCat.value = '';
          } else {
            newBtn.style.background = '#e65100';
            newBtn.style.color = '#fff';
            newBtn.style.borderColor = '#e65100';
            hiddenCat.value = newCat;
          }
        });
        catButtons.push(newBtn);
        catBtnRow.insertBefore(newBtn, addCatBtn);
        showToast('カテゴリ「' + newCat + '」を追加しました', 'success');
      }
    }
  });
  catBtnRow.appendChild(addCatBtn);
  fragment.appendChild(catBtnRow);

  // Cook time + Servings row
  var timeServRow = document.createElement('div');
  timeServRow.style.cssText = 'display:flex;gap:12px;margin-bottom:16px;';

  var timeDiv = document.createElement('div');
  timeDiv.style.cssText = 'flex:1;';
  var timeLabel = document.createElement('label');
  timeLabel.textContent = '調理時間';
  timeLabel.style.cssText = 'display:block;font-weight:600;margin-bottom:6px;color:#333;';
  timeDiv.appendChild(timeLabel);
  var timeRow = document.createElement('div');
  timeRow.style.cssText = 'display:flex;align-items:center;gap:4px;';
  var timeInput = document.createElement('input');
  timeInput.type = 'number';
  timeInput.id = 'edit-cook-time';
  timeInput.min = '0';
  timeInput.placeholder = '30';
  timeInput.style.cssText = 'width:80px;padding:10px;border:1px solid #ddd;border-radius:8px;font-size:1em;';
  var timeUnit = document.createElement('span');
  timeUnit.textContent = '分';
  timeUnit.style.cssText = 'color:#666;';
  timeRow.appendChild(timeInput);
  timeRow.appendChild(timeUnit);
  timeDiv.appendChild(timeRow);
  timeServRow.appendChild(timeDiv);

  var servDiv = document.createElement('div');
  servDiv.style.cssText = 'flex:1;';
  var servLabel = document.createElement('label');
  servLabel.textContent = '人数';
  servLabel.style.cssText = 'display:block;font-weight:600;margin-bottom:6px;color:#333;';
  servDiv.appendChild(servLabel);
  var servInput = document.createElement('input');
  servInput.type = 'text';
  servInput.id = 'edit-servings';
  servInput.placeholder = '4人分';
  servInput.style.cssText = 'width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;font-size:1em;box-sizing:border-box;';
  servDiv.appendChild(servInput);
  timeServRow.appendChild(servDiv);

  fragment.appendChild(timeServRow);

  // === 材料 section (regular ingredients) ===
  var ingSection = document.createElement('div');
  ingSection.style.cssText = 'margin-bottom:16px;';
  var ingLabel = document.createElement('label');
  ingLabel.textContent = '🥕 材料';
  ingLabel.style.cssText = 'display:block;font-weight:600;margin-bottom:8px;color:#333;font-size:1.1em;';
  ingSection.appendChild(ingLabel);

  var ingList = document.createElement('div');
  ingList.id = 'edit-ingredients-list';
  ingSection.appendChild(ingList);

  var addIngBtn = document.createElement('button');
  addIngBtn.type = 'button';
  addIngBtn.textContent = '＋ 材料を追加';
  addIngBtn.style.cssText = 'width:100%;min-height:48px;padding:12px;border:2px dashed #ddd;border-radius:10px;background:#fafafa;font-size:1.1em;font-weight:600;color:#e65100;cursor:pointer;transition:border-color 0.2s;';
  addIngBtn.addEventListener('click', function() {
    addIngredientRow();
  });
  ingSection.appendChild(addIngBtn);
  fragment.appendChild(ingSection);

  // === 調味料 section (seasonings) ===
  var seaSection = document.createElement('div');
  seaSection.style.cssText = 'margin-bottom:16px;';
  var seaLabel = document.createElement('label');
  seaLabel.textContent = '🧂 調味料';
  seaLabel.style.cssText = 'display:block;font-weight:600;margin-bottom:8px;color:#333;font-size:1.1em;';
  seaSection.appendChild(seaLabel);

  var seaList = document.createElement('div');
  seaList.id = 'edit-seasonings-list';
  seaSection.appendChild(seaList);

  var addSeaBtn = document.createElement('button');
  addSeaBtn.type = 'button';
  addSeaBtn.textContent = '＋ 調味料を追加';
  addSeaBtn.style.cssText = 'width:100%;min-height:48px;padding:12px;border:2px dashed #ddd;border-radius:10px;background:#fafafa;font-size:1.1em;font-weight:600;color:#e65100;cursor:pointer;transition:border-color 0.2s;';
  addSeaBtn.addEventListener('click', function() {
    addSeasoningRow();
  });
  seaSection.appendChild(addSeaBtn);
  fragment.appendChild(seaSection);

  // Steps section
  var stepSection = document.createElement('div');
  stepSection.style.cssText = 'margin-bottom:16px;';
  var stepLabel = document.createElement('label');
  stepLabel.textContent = '📝 手順';
  stepLabel.style.cssText = 'display:block;font-weight:600;margin-bottom:8px;color:#333;font-size:1.1em;';
  stepSection.appendChild(stepLabel);

  var stepList = document.createElement('div');
  stepList.id = 'edit-steps-list';
  stepSection.appendChild(stepList);

  var addStepBtn = document.createElement('button');
  addStepBtn.type = 'button';
  addStepBtn.textContent = '＋ 手順を追加';
  addStepBtn.style.cssText = 'width:100%;min-height:48px;padding:12px;border:2px dashed #ddd;border-radius:10px;background:#fafafa;font-size:1.1em;font-weight:600;color:#e65100;cursor:pointer;transition:border-color 0.2s;';
  addStepBtn.addEventListener('click', function() {
    addStepRow();
  });
  stepSection.appendChild(addStepBtn);
  fragment.appendChild(stepSection);

  // === Tags section — pill-based UI ===
  var tagSection = document.createElement('div');
  tagSection.style.cssText = 'margin-bottom:16px;';
  var tagLabel = document.createElement('label');
  tagLabel.textContent = 'タグ';
  tagLabel.style.cssText = 'display:block;font-weight:600;margin-bottom:6px;color:#333;';
  tagSection.appendChild(tagLabel);

  // Tag pills display area
  var tagPills = document.createElement('div');
  tagPills.id = 'edit-tags-pills';
  tagPills.style.cssText = 'min-height:24px;margin-bottom:8px;';
  tagSection.appendChild(tagPills);

  // Tag input row
  var tagInputRow = document.createElement('div');
  tagInputRow.style.cssText = 'display:flex;gap:8px;margin-bottom:8px;';

  var tagInput = document.createElement('input');
  tagInput.type = 'text';
  tagInput.id = 'edit-tag-input';
  tagInput.placeholder = 'タグを入力';
  tagInput.style.cssText = 'flex:1;padding:10px 12px;border:1px solid #ddd;border-radius:8px;font-size:1em;';

  var tagAddBtn = document.createElement('button');
  tagAddBtn.type = 'button';
  tagAddBtn.textContent = '追加';
  tagAddBtn.style.cssText = 'padding:10px 16px;border:none;border-radius:8px;background:#e65100;color:#fff;font-size:1em;font-weight:600;cursor:pointer;';
  tagAddBtn.addEventListener('click', function() {
    var val = tagInput.value.trim();
    if (val) {
      addEditTag(val);
      tagInput.value = '';
    }
  });

  tagInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      var val = tagInput.value.trim();
      if (val) {
        addEditTag(val);
        tagInput.value = '';
      }
    }
  });

  tagInputRow.appendChild(tagInput);
  tagInputRow.appendChild(tagAddBtn);
  tagSection.appendChild(tagInputRow);

  // Tag suggestions area (populated after DOM attached)
  var tagSugSection = document.createElement('div');
  tagSugSection.id = 'edit-tags-suggestions';
  tagSugSection.style.cssText = 'margin-bottom:4px;';
  tagSection.appendChild(tagSugSection);

  fragment.appendChild(tagSection);

  // Allergy checkboxes
  var allergySection = document.createElement('div');
  allergySection.style.cssText = 'margin-bottom:16px;';
  var allergyLabel = document.createElement('label');
  allergyLabel.textContent = '⚠️ アレルギー';
  allergyLabel.style.cssText = 'display:block;font-weight:600;margin-bottom:8px;color:#333;';
  allergySection.appendChild(allergyLabel);

  var allergens = ['卵', '乳', '小麦', 'えび', 'かに'];
  var allergyGrid = document.createElement('div');
  allergyGrid.style.cssText = 'display:flex;gap:12px;flex-wrap:wrap;';
  for (var ai = 0; ai < allergens.length; ai++) {
    var checkLabel = document.createElement('label');
    checkLabel.style.cssText = 'display:flex;align-items:center;gap:4px;cursor:pointer;font-size:1em;';
    var checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'allergy-check';
    checkbox.value = allergens[ai];
    checkbox.style.cssText = 'width:20px;height:20px;';
    var checkText = document.createElement('span');
    checkText.textContent = allergens[ai];
    checkLabel.appendChild(checkbox);
    checkLabel.appendChild(checkText);
    allergyGrid.appendChild(checkLabel);
  }
  allergySection.appendChild(allergyGrid);
  fragment.appendChild(allergySection);

  // Photo upload
  var photoSection = document.createElement('div');
  photoSection.style.cssText = 'margin-bottom:20px;';
  var photoLabel = document.createElement('label');
  photoLabel.textContent = '📷 写真';
  photoLabel.style.cssText = 'display:block;font-weight:600;margin-bottom:8px;color:#333;';
  photoSection.appendChild(photoLabel);

  var photoInput = document.createElement('input');
  photoInput.type = 'file';
  photoInput.id = 'edit-photo-input';
  photoInput.accept = 'image/*';
  photoInput.multiple = true;
  photoInput.style.cssText = 'display:block;margin-bottom:8px;';
  photoSection.appendChild(photoInput);

  var photoPreview = document.createElement('div');
  photoPreview.id = 'edit-photo-preview';
  photoPreview.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;';
  photoSection.appendChild(photoPreview);

  // Photo preview handler
  photoInput.addEventListener('change', function() {
    photoPreview.innerHTML = '';
    if (photoInput.files) {
      for (var fi = 0; fi < photoInput.files.length; fi++) {
        var thumb = document.createElement('img');
        thumb.src = URL.createObjectURL(photoInput.files[fi]);
        thumb.alt = '写真プレビュー';
        thumb.style.cssText = 'width:80px;height:80px;object-fit:cover;border-radius:8px;';
        photoPreview.appendChild(thumb);
      }
    }
  });

  fragment.appendChild(photoSection);

  // Save buttons
  var btnRow = document.createElement('div');
  btnRow.style.cssText = 'display:flex;gap:10px;flex-wrap:wrap;margin-bottom:20px;';

  var publishBtn = document.createElement('button');
  publishBtn.type = 'button';
  publishBtn.className = 'btn-primary';
  publishBtn.textContent = '公開保存';
  publishBtn.style.cssText = 'flex:1;min-height:48px;padding:12px 24px;border:none;border-radius:10px;background:#e65100;color:#fff;font-size:1.1em;font-weight:600;cursor:pointer;';
  publishBtn.addEventListener('click', function() { saveRecipe('published'); });
  btnRow.appendChild(publishBtn);

  var draftBtn = document.createElement('button');
  draftBtn.type = 'button';
  draftBtn.className = 'btn-secondary';
  draftBtn.textContent = '下書き保存';
  draftBtn.style.cssText = 'flex:1;min-height:48px;padding:12px 24px;border:2px solid #ddd;border-radius:10px;background:#fff;font-size:1.1em;font-weight:600;cursor:pointer;color:#333;';
  draftBtn.addEventListener('click', function() { saveRecipe('draft'); });
  btnRow.appendChild(draftBtn);

  var privateBtn = document.createElement('button');
  privateBtn.type = 'button';
  privateBtn.className = 'btn-secondary';
  privateBtn.textContent = '非公開保存';
  privateBtn.style.cssText = 'flex:1;min-height:48px;padding:12px 24px;border:2px solid #ddd;border-radius:10px;background:#fff;font-size:1.1em;font-weight:600;cursor:pointer;color:#333;';
  privateBtn.addEventListener('click', function() { saveRecipe('private'); });
  btnRow.appendChild(privateBtn);

  fragment.appendChild(btnRow);
  container.appendChild(fragment);

  // Fetch tag suggestions (all unique non-allergy tags from DB)
  var allUniqueTags = [];
  try {
    var tagFetchResult = await client
      .from('recipe_tags')
      .select('tag')
      .not('tag', 'ilike', 'allergy:%');
    if (tagFetchResult.data) {
      var seenTags = {};
      for (var tfi = 0; tfi < tagFetchResult.data.length; tfi++) {
        var tfTag = tagFetchResult.data[tfi].tag;
        if (!seenTags[tfTag]) {
          seenTags[tfTag] = true;
          allUniqueTags.push(tfTag);
        }
      }
    }
  } catch(e) {}

  // Render tag suggestion buttons
  if (allUniqueTags.length > 0) {
    var sugLabel = document.createElement('div');
    sugLabel.style.cssText = 'font-size:0.85em;color:#666;margin-bottom:4px;';
    sugLabel.textContent = 'よく使うタグ:';
    tagSugSection.appendChild(sugLabel);

    var sugBtnRow = document.createElement('div');
    sugBtnRow.style.cssText = 'display:flex;gap:6px;flex-wrap:wrap;';
    for (var sti = 0; sti < allUniqueTags.length; sti++) {
      (function(tagVal) {
        var sugBtn = document.createElement('button');
        sugBtn.type = 'button';
        sugBtn.textContent = tagVal;
        sugBtn.setAttribute('data-tag-suggestion', tagVal);
        sugBtn.style.cssText = 'padding:4px 12px;border:1px solid #ddd;border-radius:16px;background:#fff;font-size:0.85em;cursor:pointer;';
        sugBtn.addEventListener('click', function() {
          addEditTag(tagVal);
        });
        sugBtnRow.appendChild(sugBtn);
      })(allUniqueTags[sti]);
    }
    tagSugSection.appendChild(sugBtnRow);
  }

  // If editing existing recipe, pre-fill form
  if (id) {
    var loadResult = await RecipeRepository.getById(id);
    if (loadResult.data) {
      var recipe = loadResult.data;
      titleInput.value = recipe.title || '';
      descInput.value = recipe.description || '';
      timeInput.value = recipe.cook_time_minutes || '';
      servInput.value = recipe.servings || '';

      // Set category button selection
      if (recipe.category) {
        hiddenCat.value = recipe.category;
        for (var cbi = 0; cbi < catButtons.length; cbi++) {
          if (catButtons[cbi].getAttribute('data-category') === recipe.category) {
            catButtons[cbi].style.background = '#e65100';
            catButtons[cbi].style.color = '#fff';
            catButtons[cbi].style.borderColor = '#e65100';
          }
        }
      }

      // Pre-fill ingredients (split into regular ingredients vs seasonings)
      var ings = (recipe.recipe_ingredients || []).sort(function(a, b) {
        return (a.sort_order || 0) - (b.sort_order || 0);
      });

      // Heuristic: if quantity matches seasoning unit patterns, put in seasoning section
      var seasoningPattern = /^(大さじ|小さじ|カップ)\s*/;
      for (var ii = 0; ii < ings.length; ii++) {
        if (seasoningPattern.test(ings[ii].quantity)) {
          addSeasoningRow({ name: ings[ii].name, quantity: ings[ii].quantity, memo: ings[ii].memo });
        } else {
          addIngredientRow({ name: ings[ii].name, quantity: ings[ii].quantity, memo: ings[ii].memo });
        }
      }

      // Pre-fill steps
      var steps = (recipe.recipe_steps || []).sort(function(a, b) {
        return (a.sort_order || 0) - (b.sort_order || 0);
      });
      for (var si = 0; si < steps.length; si++) {
        addStepRow({ description: steps[si].description });
      }

      // Pre-fill tags (pill-based)
      var recipeTags = (recipe.recipe_tags || []).map(function(t) { return t.tag; });
      var generalTagsEdit = recipeTags.filter(function(t) { return t.indexOf('allergy:') !== 0; });
      var allergyTagsEdit = recipeTags.filter(function(t) { return t.indexOf('allergy:') === 0; });

      // Populate editTagsList and render pills
      for (var gti = 0; gti < generalTagsEdit.length; gti++) {
        editTagsList.push(generalTagsEdit[gti]);
      }
      renderEditTagPills(tagPills);
      updateTagSuggestions();

      // Check allergy checkboxes
      for (var ati = 0; ati < allergyTagsEdit.length; ati++) {
        var allergenName = allergyTagsEdit[ati].replace('allergy:', '');
        var checkboxEl = allergyGrid.querySelector('input[value="' + allergenName + '"]');
        if (checkboxEl) checkboxEl.checked = true;
      }
    }
  } else {
    // New recipe: add one empty ingredient row, one empty seasoning row, and one empty step row
    addIngredientRow();
    addSeasoningRow();
    addStepRow();
  }
}

/**
 * 素材検索タブUIを初期化・描画
 * Task 16.1 + 16.2: 材料入力フィールド＋AND/OR切替 + 冷蔵庫検索モード
 */
async function loadIngredientSearchView() {
  var container = document.getElementById('view-ingredient-search');
  if (!container) return;

  container.innerHTML = '';

  // --- 入力セクション ---
  var inputSection = document.createElement('div');
  inputSection.style.cssText = 'margin-bottom:20px;';

  // 説明
  var desc = document.createElement('p');
  desc.style.cssText = 'color:#666;font-size:0.9em;margin-bottom:12px;';
  desc.textContent = '材料名を入力してレシピを検索（カンマまたはスペース区切りで複数指定可）';
  inputSection.appendChild(desc);

  // 材料名入力フィールド
  var searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.id = 'ingredient-search-input';
  searchInput.placeholder = '例: 鶏肉, 玉ねぎ, にんじん';
  searchInput.style.cssText = 'width:100%;padding:12px 14px;border:1px solid #ddd;border-radius:8px;font-size:1em;margin-bottom:12px;box-sizing:border-box;';
  inputSection.appendChild(searchInput);

  // AND/OR 切替ボタン行
  var modeRow = document.createElement('div');
  modeRow.style.cssText = 'display:flex;gap:8px;align-items:center;margin-bottom:12px;';

  var modeLabel = document.createElement('span');
  modeLabel.style.cssText = 'font-size:0.9em;color:#555;';
  modeLabel.textContent = '検索モード:';
  modeRow.appendChild(modeLabel);

  var andBtn = document.createElement('button');
  andBtn.type = 'button';
  andBtn.textContent = 'AND（すべて含む）';
  andBtn.className = 'btn-secondary';
  andBtn.style.cssText = 'padding:8px 16px;font-size:0.85em;border-radius:20px;background:#e65100;color:#fff;border-color:#e65100;';
  modeRow.appendChild(andBtn);

  var orBtn = document.createElement('button');
  orBtn.type = 'button';
  orBtn.textContent = 'OR（いずれか含む）';
  orBtn.className = 'btn-secondary';
  orBtn.style.cssText = 'padding:8px 16px;font-size:0.85em;border-radius:20px;';
  modeRow.appendChild(orBtn);

  inputSection.appendChild(modeRow);

  // 冷蔵庫検索モードスイッチ
  var fridgeRow = document.createElement('div');
  fridgeRow.style.cssText = 'display:flex;align-items:center;gap:8px;margin-bottom:12px;';

  var fridgeLabel = document.createElement('label');
  fridgeLabel.style.cssText = 'font-size:0.9em;color:#555;cursor:pointer;display:flex;align-items:center;gap:6px;';

  var fridgeCheckbox = document.createElement('input');
  fridgeCheckbox.type = 'checkbox';
  fridgeCheckbox.id = 'fridge-mode-toggle';
  fridgeLabel.appendChild(fridgeCheckbox);

  var fridgeLabelText = document.createTextNode('🧊 冷蔵庫検索モード（不足2品以内のレシピを表示）');
  fridgeLabel.appendChild(fridgeLabelText);
  fridgeRow.appendChild(fridgeLabel);
  inputSection.appendChild(fridgeRow);

  // 検索ボタン
  var searchBtn = document.createElement('button');
  searchBtn.type = 'button';
  searchBtn.textContent = '🔍 検索';
  searchBtn.className = 'btn-primary';
  searchBtn.style.cssText = 'width:100%;padding:14px;font-size:1.05em;';
  inputSection.appendChild(searchBtn);

  container.appendChild(inputSection);

  // --- 検索結果エリア ---
  var resultsArea = document.createElement('div');
  resultsArea.id = 'ingredient-search-results';
  container.appendChild(resultsArea);

  // --- State ---
  var currentMode = 'and'; // 'and' or 'or'

  function updateModeButtons() {
    if (currentMode === 'and') {
      andBtn.style.background = '#e65100';
      andBtn.style.color = '#fff';
      andBtn.style.borderColor = '#e65100';
      orBtn.style.background = '#fff';
      orBtn.style.color = '#333';
      orBtn.style.borderColor = '#ddd';
    } else {
      orBtn.style.background = '#e65100';
      orBtn.style.color = '#fff';
      orBtn.style.borderColor = '#e65100';
      andBtn.style.background = '#fff';
      andBtn.style.color = '#333';
      andBtn.style.borderColor = '#ddd';
    }
  }

  andBtn.addEventListener('click', function() {
    currentMode = 'and';
    updateModeButtons();
  });

  orBtn.addEventListener('click', function() {
    currentMode = 'or';
    updateModeButtons();
  });

  // --- 検索実行 ---
  searchBtn.addEventListener('click', async function() {
    var input = searchInput.value.trim();
    if (!input) {
      resultsArea.innerHTML = '';
      var emptyMsg = document.createElement('div');
      emptyMsg.className = 'empty-state';
      emptyMsg.textContent = '材料名を入力してください';
      resultsArea.appendChild(emptyMsg);
      return;
    }

    // Parse input (comma or space separated)
    var names = input.split(/[,、\s]+/).filter(function(n) { return n.trim() !== ''; });
    if (names.length === 0) return;

    resultsArea.innerHTML = '';
    var loadingEl = document.createElement('div');
    loadingEl.className = 'loading';
    loadingEl.textContent = '検索中...';
    resultsArea.appendChild(loadingEl);

    try {
      // Load all published recipes with ingredients in one query
      var result = await RecipeRepository.getAllWithIngredients();
      var recipesWithIngredients = result.data || [];

      var filteredRecipes;
      var isFridgeMode = fridgeCheckbox.checked;

      if (isFridgeMode) {
        filteredRecipes = searchFridgeLogic(recipesWithIngredients, names);
      } else {
        filteredRecipes = searchByIngredientsLogic(recipesWithIngredients, names, currentMode);
      }

      resultsArea.innerHTML = '';

      if (filteredRecipes.length === 0) {
        var noResult = document.createElement('div');
        noResult.className = 'empty-state';
        noResult.textContent = isFridgeMode
          ? '不足2品以内のレシピが見つかりませんでした'
          : 'レシピが見つかりませんでした';
        resultsArea.appendChild(noResult);
        return;
      }

      // 結果表示ヘッダー
      var resultHeader = document.createElement('div');
      resultHeader.style.cssText = 'margin-bottom:12px;font-size:0.9em;color:#666;';
      resultHeader.textContent = filteredRecipes.length + ' 件のレシピが見つかりました';
      resultsArea.appendChild(resultHeader);

      // 結果カードグリッド
      var cardGrid = document.createElement('div');
      cardGrid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px;';

      var currentUserName = await getCurrentUserName();
      var userFavorites = await FavoriteRepository.getByUser(currentUserName);
      var recipeIds = filteredRecipes.map(function(r) { return r.id; });
      var cookStats = await CookHistoryRepository.getStats(recipeIds);

      for (var ri = 0; ri < filteredRecipes.length; ri++) {
        var recipe = filteredRecipes[ri];
        var cardData = recipeCardData(recipe, userFavorites, cookStats);

        // For fridge mode, calculate missing ingredients
        if (isFridgeMode) {
          var ings = (recipe.recipe_ingredients || []).map(function(ing) { return ing.name; });
          var missing = [];
          for (var mi = 0; mi < ings.length; mi++) {
            var ingLower = ings[mi].toLowerCase();
            var found = names.some(function(a) {
              return ingLower.includes(a.toLowerCase()) || a.toLowerCase().includes(ingLower);
            });
            if (!found) missing.push(ings[mi]);
          }
          if (missing.length > 0) {
            cardData.title = cardData.title + '\n（あと ' + missing.join('・') + ' があれば作れる）';
          }
        }

        var cardFragment = renderRecipeCard(cardData);
        cardGrid.appendChild(cardFragment);
      }

      resultsArea.appendChild(cardGrid);

    } catch (e) {
      resultsArea.innerHTML = '';
      var errorEl = document.createElement('div');
      errorEl.className = 'empty-state';
      errorEl.textContent = 'エラーが発生しました。再読み込みしてください。';
      resultsArea.appendChild(errorEl);
    }
  });
}

/**
 * 買い物リストタブUIをロード
 * Task 19.3: レシピ別グループ化表示 + チェックオフ + 削除
 */
async function loadShoppingView() {
  var container = document.getElementById('view-shopping');
  if (!container) return;

  container.innerHTML = '';
  var loadingEl = document.createElement('div');
  loadingEl.className = 'loading';
  loadingEl.textContent = '買い物リストを読み込み中...';
  container.appendChild(loadingEl);

  try {
    var grouped = await loadShoppingList();
    container.innerHTML = '';

    var groupNames = Object.keys(grouped);
    if (groupNames.length === 0) {
      var emptyEl = document.createElement('div');
      emptyEl.className = 'empty-state';
      var emojiDiv = document.createElement('div');
      emojiDiv.className = 'emoji';
      emojiDiv.textContent = '🛒';
      var msgDiv = document.createElement('div');
      msgDiv.textContent = '買い物リストはまだ空です';
      emptyEl.appendChild(emojiDiv);
      emptyEl.appendChild(msgDiv);
      container.appendChild(emptyEl);
      return;
    }

    // Header
    var header = document.createElement('h2');
    header.style.cssText = 'font-size:1.2em;margin-bottom:16px;color:#333;';
    header.textContent = '🛒 買い物リスト';
    container.appendChild(header);

    // Render grouped items
    for (var gi = 0; gi < groupNames.length; gi++) {
      var recipeName = groupNames[gi];
      var items = grouped[recipeName];

      var groupCard = document.createElement('div');
      groupCard.className = 'card';
      groupCard.style.cssText = 'margin-bottom:12px;padding:16px;';

      var groupTitle = document.createElement('div');
      groupTitle.style.cssText = 'font-weight:600;font-size:1em;margin-bottom:10px;color:#e65100;';
      groupTitle.textContent = '📖 ' + recipeName;
      groupCard.appendChild(groupTitle);

      for (var ii = 0; ii < items.length; ii++) {
        var item = items[ii];
        var itemRow = document.createElement('div');
        itemRow.style.cssText = 'display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid #f0f0f0;';
        itemRow.setAttribute('data-item-id', item.id);

        // Checkbox
        var checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = item.checked || false;
        checkbox.style.cssText = 'width:20px;height:20px;cursor:pointer;flex-shrink:0;';
        (function(itemId, cb, row) {
          cb.addEventListener('change', function() {
            ShoppingListRepository.toggleChecked(itemId, cb.checked).then(function(result) {
              if (result.error) {
                cb.checked = !cb.checked;
                showToast('更新に失敗しました', 'error');
              } else {
                // Update strikethrough
                var textEl = row.querySelector('.shopping-item-text');
                if (textEl) {
                  textEl.style.textDecoration = cb.checked ? 'line-through' : 'none';
                  textEl.style.color = cb.checked ? '#aaa' : '#333';
                }
              }
            });
          });
        })(item.id, checkbox, itemRow);
        itemRow.appendChild(checkbox);

        // Ingredient name + quantity
        var textEl = document.createElement('span');
        textEl.className = 'shopping-item-text';
        textEl.style.cssText = 'flex:1;font-size:0.95em;' + (item.checked ? 'text-decoration:line-through;color:#aaa;' : 'color:#333;');
        textEl.textContent = item.ingredient_name + (item.quantity ? ' ' + item.quantity : '');
        itemRow.appendChild(textEl);

        // Delete button
        var deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.textContent = '✕';
        deleteBtn.style.cssText = 'width:28px;height:28px;border:none;background:#f5f5f5;border-radius:50%;cursor:pointer;font-size:0.9em;color:#999;flex-shrink:0;';
        (function(itemId, row) {
          deleteBtn.addEventListener('click', function() {
            ShoppingListRepository.deleteItem(itemId).then(function(result) {
              if (result.error) {
                showToast('削除に失敗しました', 'error');
              } else {
                row.parentNode.removeChild(row);
              }
            });
          });
        })(item.id, itemRow);
        itemRow.appendChild(deleteBtn);

        groupCard.appendChild(itemRow);
      }

      container.appendChild(groupCard);
    }

    // "チェック済みを削除" button
    var clearBtn = document.createElement('button');
    clearBtn.type = 'button';
    clearBtn.className = 'btn-secondary';
    clearBtn.textContent = '🗑️ チェック済みを削除';
    clearBtn.style.cssText = 'width:100%;padding:14px;margin-top:16px;font-size:1em;';
    clearBtn.addEventListener('click', function() {
      if (confirm('チェック済みの項目をすべて削除しますか？')) {
        ShoppingListRepository.deleteChecked().then(function(result) {
          if (result.error) {
            showToast('削除に失敗しました', 'error');
          } else {
            showToast('チェック済みを削除しました', 'success');
            loadShoppingView(); // Reload
          }
        });
      }
    });
    container.appendChild(clearBtn);

  } catch (e) {
    container.innerHTML = '';
    var errorEl = document.createElement('div');
    errorEl.className = 'empty-state';
    errorEl.textContent = 'エラーが発生しました。再読み込みしてください。';
    container.appendChild(errorEl);
  }
}

/**
 * 献立タブUIをロード
 * Task 20.3: 日付選択 + 朝昼夜グリッド表示
 */
async function loadMealPlanView() {
  var container = document.getElementById('view-meal-plan');
  if (!container) return;

  container.innerHTML = '';

  // Header
  var header = document.createElement('h2');
  header.style.cssText = 'font-size:1.2em;margin-bottom:16px;color:#333;';
  header.textContent = '📅 献立';
  container.appendChild(header);

  // Date picker row
  var dateRow = document.createElement('div');
  dateRow.style.cssText = 'display:flex;align-items:center;gap:12px;margin-bottom:20px;';

  var dateInput = document.createElement('input');
  dateInput.type = 'date';
  dateInput.id = 'meal-plan-date';
  var today = new Date();
  dateInput.value = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
  dateInput.style.cssText = 'padding:10px 14px;border:1px solid #ddd;border-radius:8px;font-size:1em;';
  dateRow.appendChild(dateInput);

  var todayBtn = document.createElement('button');
  todayBtn.type = 'button';
  todayBtn.className = 'btn-secondary';
  todayBtn.textContent = '今日';
  todayBtn.style.cssText = 'padding:10px 16px;font-size:0.9em;';
  todayBtn.addEventListener('click', function() {
    var now = new Date();
    dateInput.value = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
    renderMealGrid(dateInput.value);
  });
  dateRow.appendChild(todayBtn);

  container.appendChild(dateRow);

  // Grid container
  var gridContainer = document.createElement('div');
  gridContainer.id = 'meal-plan-grid';
  container.appendChild(gridContainer);

  // Load all recipes for dropdown
  var allRecipes = [];
  try {
    var result = await RecipeRepository.getAll({ status: 'published' });
    allRecipes = result.data || [];
  } catch (e) {
    // continue with empty list
  }

  async function renderMealGrid(date) {
    gridContainer.innerHTML = '';

    var loadingEl = document.createElement('div');
    loadingEl.className = 'loading';
    loadingEl.textContent = '読み込み中...';
    gridContainer.appendChild(loadingEl);

    try {
      var planResult = await loadMealPlan(date);
      var plans = planResult.data || [];
      gridContainer.innerHTML = '';

      var mealTypes = ['朝', '昼', '夜'];
      var slotLabels = [
        { key: 'main_dish_id', label: '主菜' },
        { key: 'side_dish_id', label: '副菜' },
        { key: 'soup_id', label: '汁物' }
      ];

      for (var mi = 0; mi < mealTypes.length; mi++) {
        var mealType = mealTypes[mi];
        var plan = plans.find(function(p) { return p.meal_type === mealType; });

        var mealCard = document.createElement('div');
        mealCard.className = 'card';
        mealCard.style.cssText = 'margin-bottom:12px;padding:16px;';

        var mealTitle = document.createElement('div');
        mealTitle.style.cssText = 'font-weight:700;font-size:1.1em;margin-bottom:12px;color:#333;';
        var mealEmojis = { '朝': '🌅', '昼': '☀️', '夜': '🌙' };
        mealTitle.textContent = (mealEmojis[mealType] || '') + ' ' + mealType + 'ごはん';
        mealCard.appendChild(mealTitle);

        for (var si = 0; si < slotLabels.length; si++) {
          var slot = slotLabels[si];
          var slotRow = document.createElement('div');
          slotRow.style.cssText = 'display:flex;align-items:center;gap:8px;margin-bottom:8px;';

          var slotLabel = document.createElement('span');
          slotLabel.style.cssText = 'font-size:0.85em;color:#666;min-width:40px;';
          slotLabel.textContent = slot.label;
          slotRow.appendChild(slotLabel);

          var selectEl = document.createElement('select');
          selectEl.style.cssText = 'flex:1;padding:8px 12px;border:1px solid #ddd;border-radius:8px;font-size:0.9em;background:#fff;';
          selectEl.setAttribute('data-meal-type', mealType);
          selectEl.setAttribute('data-slot', slot.key);

          // Default empty option
          var emptyOpt = document.createElement('option');
          emptyOpt.value = '';
          emptyOpt.textContent = '＋ レシピを選択';
          selectEl.appendChild(emptyOpt);

          // Add recipe options
          for (var ri = 0; ri < allRecipes.length; ri++) {
            var opt = document.createElement('option');
            opt.value = allRecipes[ri].id;
            opt.textContent = allRecipes[ri].title || '（無題）';
            if (plan && plan[slot.key] === allRecipes[ri].id) {
              opt.selected = true;
            }
            selectEl.appendChild(opt);
          }

          // Save on change
          (function(mType, sKey, sel) {
            sel.addEventListener('change', async function() {
              var currentDate = dateInput.value;
              // Get current slot values from the grid
              var selects = gridContainer.querySelectorAll('select[data-meal-type="' + mType + '"]');
              var slots = { main: null, side: null, soup: null };
              for (var k = 0; k < selects.length; k++) {
                var sName = selects[k].getAttribute('data-slot');
                var val = selects[k].value || null;
                if (sName === 'main_dish_id') slots.main = val;
                if (sName === 'side_dish_id') slots.side = val;
                if (sName === 'soup_id') slots.soup = val;
              }
              var saveResult = await saveMealPlan(currentDate, mType, slots);
              if (saveResult.error) {
                showToast('保存に失敗しました', 'error');
              } else {
                showToast('献立を保存しました', 'success');
              }
            });
          })(mealType, slot.key, selectEl);

          slotRow.appendChild(selectEl);
          mealCard.appendChild(slotRow);
        }

        gridContainer.appendChild(mealCard);
      }
    } catch (e) {
      gridContainer.innerHTML = '';
      var errorEl = document.createElement('div');
      errorEl.className = 'empty-state';
      errorEl.textContent = 'エラーが発生しました';
      gridContainer.appendChild(errorEl);
    }
  }

  // Date change listener
  dateInput.addEventListener('change', function() {
    renderMealGrid(dateInput.value);
  });

  // Initial render
  await renderMealGrid(dateInput.value);
}

/**
 * 買い物リストに追加モーダルを表示
 * @param {string} recipeId - レシピID
 * @param {Array<{name: string, quantity: string}>} ingredients - 材料リスト
 */
function showShoppingModal(recipeId, ingredients) {
  // Remove existing modal if any
  var existing = document.getElementById('shopping-modal-overlay');
  if (existing) existing.parentNode.removeChild(existing);

  var overlay = document.createElement('div');
  overlay.id = 'shopping-modal-overlay';
  overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:100;display:flex;align-items:center;justify-content:center;';

  var modal = document.createElement('div');
  modal.style.cssText = 'background:#fff;border-radius:16px;padding:24px;max-width:90%;width:360px;max-height:80vh;overflow-y:auto;';

  var title = document.createElement('h3');
  title.style.cssText = 'margin-bottom:16px;font-size:1.1em;color:#333;';
  title.textContent = '🛒 買い物リストに追加';
  modal.appendChild(title);

  var checkboxes = [];
  for (var i = 0; i < ingredients.length; i++) {
    var ing = ingredients[i];
    var row = document.createElement('label');
    row.style.cssText = 'display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid #f0f0f0;cursor:pointer;';

    var cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = true;
    cb.style.cssText = 'width:20px;height:20px;';
    cb.setAttribute('data-index', i.toString());
    checkboxes.push(cb);
    row.appendChild(cb);

    var text = document.createElement('span');
    text.style.cssText = 'flex:1;font-size:0.95em;';
    text.textContent = ing.name + (ing.quantity ? ' ' + ing.quantity : '');
    row.appendChild(text);

    modal.appendChild(row);
  }

  // Button row
  var btnRow = document.createElement('div');
  btnRow.style.cssText = 'display:flex;gap:8px;margin-top:16px;';

  var cancelBtn = document.createElement('button');
  cancelBtn.type = 'button';
  cancelBtn.className = 'btn-secondary';
  cancelBtn.textContent = 'キャンセル';
  cancelBtn.style.cssText = 'flex:1;padding:12px;';
  cancelBtn.addEventListener('click', function() {
    overlay.parentNode.removeChild(overlay);
  });
  btnRow.appendChild(cancelBtn);

  var addBtn = document.createElement('button');
  addBtn.type = 'button';
  addBtn.className = 'btn-primary';
  addBtn.textContent = '追加';
  addBtn.style.cssText = 'flex:1;padding:12px;';
  addBtn.addEventListener('click', async function() {
    var selected = [];
    for (var j = 0; j < checkboxes.length; j++) {
      if (checkboxes[j].checked) {
        var idx = parseInt(checkboxes[j].getAttribute('data-index'), 10);
        selected.push(ingredients[idx]);
      }
    }
    if (selected.length === 0) {
      showToast('材料を選択してください', 'info');
      return;
    }
    var result = await addToShoppingList(recipeId, selected);
    if (result.error) {
      showToast('追加に失敗しました', 'error');
    } else {
      showToast(selected.length + '件を買い物リストに追加しました', 'success');
      overlay.parentNode.removeChild(overlay);
    }
  });
  btnRow.appendChild(addBtn);
  modal.appendChild(btnRow);

  overlay.appendChild(modal);

  // Close on overlay click
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) {
      overlay.parentNode.removeChild(overlay);
    }
  });

  document.body.appendChild(overlay);
}

/**
 * 一覧画面にアレルギー除外UIを追加する
 * Task 16.3: タグタップ→フィルタ + アレルギー除外UI
 * This is called from within loadRecipeList to add allergy filter to the search section
 */
function renderAllergyFilterUI(container, onFilterChange) {
  var allergySection = document.createElement('div');
  allergySection.style.cssText = 'margin-top:12px;padding:10px 14px;background:#fff9f0;border-radius:8px;border:1px solid #ffe0b2;';

  var heading = document.createElement('div');
  heading.style.cssText = 'font-size:0.85em;color:#e65100;font-weight:600;margin-bottom:8px;';
  heading.textContent = '⚠️ アレルギー除外';
  allergySection.appendChild(heading);

  var allergens = ['卵', '乳', '小麦', 'えび', 'かに'];
  var checkboxes = [];

  var grid = document.createElement('div');
  grid.style.cssText = 'display:flex;gap:12px;flex-wrap:wrap;';

  for (var i = 0; i < allergens.length; i++) {
    var label = document.createElement('label');
    label.style.cssText = 'display:flex;align-items:center;gap:4px;font-size:0.85em;color:#555;cursor:pointer;';

    var cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.value = allergens[i];
    cb.addEventListener('change', function() {
      var selected = [];
      for (var j = 0; j < checkboxes.length; j++) {
        if (checkboxes[j].checked) selected.push(checkboxes[j].value);
      }
      onFilterChange(selected);
    });
    checkboxes.push(cb);

    label.appendChild(cb);
    var text = document.createTextNode(allergens[i] + 'なし');
    label.appendChild(text);
    grid.appendChild(label);
  }

  allergySection.appendChild(grid);
  container.appendChild(allergySection);
}

/**
 * 印刷モード表示
 * @param {string} id - レシピID
 */
async function showPrintView(id) {
  var container = document.getElementById('view-print');
  if (!container) return;
  container.innerHTML = '';

  var result = await RecipeRepository.getById(id);
  if (!result.data) {
    container.innerHTML = '';
    var notFoundEl = document.createElement('div');
    notFoundEl.className = 'empty-state';
    notFoundEl.textContent = 'レシピが見つかりません';
    container.appendChild(notFoundEl);
    return;
  }
  var recipe = result.data;

  // Print-friendly styles
  var style = document.createElement('style');
  style.textContent = '@media print { .tab-bar, .fab, .back, .home-btn, .no-print { display: none !important; } body { padding: 10px; } }';
  container.appendChild(style);

  // Back button (no-print)
  var backBtn = document.createElement('button');
  backBtn.className = 'btn-secondary no-print';
  backBtn.textContent = '← 戻る';
  backBtn.style.cssText = 'margin-bottom:16px;';
  backBtn.addEventListener('click', function() {
    navigateTo('#detail/' + id);
  });
  container.appendChild(backBtn);

  // Title
  var titleEl = document.createElement('h1');
  titleEl.style.cssText = 'font-size:1.8em;margin-bottom:12px;color:#333;';
  titleEl.textContent = recipe.title || '（無題）';
  container.appendChild(titleEl);

  // Meta info
  var metaEl = document.createElement('div');
  metaEl.style.cssText = 'margin-bottom:16px;font-size:1em;color:#666;';
  var metaParts = [];
  if (recipe.category) metaParts.push(recipe.category);
  if (recipe.cook_time_minutes) metaParts.push('⏱ ' + recipe.cook_time_minutes + '分');
  if (recipe.servings) metaParts.push('👥 ' + recipe.servings);
  if (recipe.author) metaParts.push('by ' + recipe.author);
  metaEl.textContent = metaParts.join(' ｜ ');
  container.appendChild(metaEl);

  // Description
  if (recipe.description) {
    var descEl = document.createElement('p');
    descEl.style.cssText = 'margin-bottom:20px;line-height:1.6;color:#555;';
    descEl.textContent = recipe.description;
    container.appendChild(descEl);
  }

  // Ingredients table
  var ings = (recipe.recipe_ingredients || []).slice().sort(function(a, b) {
    return (a.sort_order || 0) - (b.sort_order || 0);
  });
  if (ings.length > 0) {
    var ingHeading = document.createElement('h2');
    ingHeading.style.cssText = 'font-size:1.3em;margin-bottom:12px;color:#333;';
    ingHeading.textContent = '材料';
    container.appendChild(ingHeading);

    var table = document.createElement('table');
    table.style.cssText = 'width:100%;border-collapse:collapse;margin-bottom:24px;';
    for (var i = 0; i < ings.length; i++) {
      var tr = document.createElement('tr');
      tr.style.cssText = 'border-bottom:1px solid #ddd;';
      var tdName = document.createElement('td');
      tdName.style.cssText = 'padding:8px 6px;font-weight:600;font-size:1.1em;';
      tdName.textContent = ings[i].name;
      var tdQty = document.createElement('td');
      tdQty.style.cssText = 'padding:8px 6px;font-size:1.1em;color:#555;';
      tdQty.textContent = ings[i].quantity || '';
      tr.appendChild(tdName);
      tr.appendChild(tdQty);
      if (ings[i].memo) {
        var tdMemo = document.createElement('td');
        tdMemo.style.cssText = 'padding:8px 6px;font-size:0.9em;color:#999;';
        tdMemo.textContent = ings[i].memo;
        tr.appendChild(tdMemo);
      }
      table.appendChild(tr);
    }
    container.appendChild(table);
  }

  // Steps (numbered)
  var steps = (recipe.recipe_steps || []).slice().sort(function(a, b) {
    return (a.sort_order || 0) - (b.sort_order || 0);
  });
  if (steps.length > 0) {
    var stepsHeading = document.createElement('h2');
    stepsHeading.style.cssText = 'font-size:1.3em;margin-bottom:12px;color:#333;';
    stepsHeading.textContent = '手順';
    container.appendChild(stepsHeading);

    var ol = document.createElement('ol');
    ol.style.cssText = 'padding-left:24px;font-size:1.1em;line-height:1.8;';
    for (var s = 0; s < steps.length; s++) {
      var li = document.createElement('li');
      li.style.cssText = 'margin-bottom:12px;';
      li.textContent = steps[s].description || '';
      ol.appendChild(li);
    }
    container.appendChild(ol);
  }

  // Footer: date
  var footer = document.createElement('div');
  footer.style.cssText = 'margin-top:24px;padding-top:12px;border-top:1px solid #ddd;font-size:0.85em;color:#999;';
  footer.textContent = '印刷日: ' + new Date().toLocaleDateString('ja-JP');
  container.appendChild(footer);

  // Auto-trigger print (no-print button to trigger manually)
  var printTrigger = document.createElement('button');
  printTrigger.className = 'btn-primary no-print';
  printTrigger.textContent = '🖨️ 印刷する';
  printTrigger.style.cssText = 'margin-top:16px;width:100%;';
  printTrigger.addEventListener('click', function() {
    window.print();
  });
  container.appendChild(printTrigger);
}

// Dual-export: ブラウザではグローバル、Node.jsではmodule.exports
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { promptUserName, renderRecipeCard, loadRecipeList, loadTopSections, showToast, loadRecipeDetail, renderIngredients, renderSteps, loadEditForm, addIngredientRow, addSeasoningRow, addStepRow, saveRecipe, showFieldError, clearFieldErrors, loadIngredientSearchView, renderAllergyFilterUI, loadShoppingView, loadMealPlanView, showShoppingModal, showPrintView, addEditTag, removeEditTag, renderEditTagPills, createSeasoningQuantityUI };
}
