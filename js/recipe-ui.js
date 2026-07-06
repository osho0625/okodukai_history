// recipe-ui.js — DOM操作・レンダリング・イベントバインド
// Implemented in Task 5+

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
    // データ取得
    var result = await RecipeRepository.getAll();
    var recipes = result.data || [];

    // ユーザー名取得
    var currentUserName = await getCurrentUserName();

    // お気に入り取得
    var userFavorites = await FavoriteRepository.getByUser(currentUserName);

    // 調理統計取得
    var recipeIds = recipes.map(function(r) { return r.id; });
    var cookStats = await CookHistoryRepository.getStats(recipeIds);

    // コンテナをクリア
    container.innerHTML = '';

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

    // トップセクション描画
    await loadTopSections(container, recipes, userFavorites, cookStats, currentUserName);

    // 全レシピカード描画
    var allSection = document.createElement('div');
    allSection.className = 'recipe-all-section';
    var allHeading = document.createElement('h2');
    allHeading.style.cssText = 'font-size:1.1em;margin:20px 0 12px;color:#333;';
    allHeading.textContent = '📖 すべてのレシピ';
    allSection.appendChild(allHeading);

    var cardGrid = document.createElement('div');
    cardGrid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px;';

    for (var i = 0; i < recipes.length; i++) {
      var cardData = recipeCardData(recipes[i], userFavorites, cookStats);
      var cardFragment = renderRecipeCard(cardData);
      cardGrid.appendChild(cardFragment);
    }
    allSection.appendChild(cardGrid);
    container.appendChild(allSection);

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
    favBtn.addEventListener('click', function() {
      if (!currentUserName) {
        showToast('ユーザー名が取得できません', 'error');
        return;
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
    cookBtn.addEventListener('click', function() {
      if (!currentUserName) {
        showToast('ユーザー名が取得できません', 'error');
        return;
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

// Dual-export: ブラウザではグローバル、Node.jsではmodule.exports
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { renderRecipeCard, loadRecipeList, loadTopSections, showToast, loadRecipeDetail, renderIngredients, renderSteps, loadEditForm, addIngredientRow, addStepRow, saveRecipe };
}
