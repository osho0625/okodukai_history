// recipe-utils.js — ユーティリティ関数（純粋関数）

/**
 * レシピカード用データオブジェクト生成
 * @param {object} recipe - Supabaseから取得したレシピオブジェクト（recipe_photos, recipe_tags, recipe_favorites を JOIN済み）
 * @param {string[]} userFavorites - 現在ユーザーがお気に入り登録済みのrecipe_id配列
 * @param {object} cookStats - {recipeId: {count, lastCookedAt}} マップ
 * @returns {object} カード表示用データ
 */
function recipeCardData(recipe, userFavorites, cookStats) {
  const photos = recipe.recipe_photos || [];
  const thumbnail = photos.find(p => p.sort_order === 0);
  const thumbnailUrl = thumbnail ? thumbnail.url : null;

  const tags = (recipe.recipe_tags || []).map(t => t.tag);

  const isFavorite = Array.isArray(userFavorites) && userFavorites.includes(recipe.id);

  return {
    id: recipe.id,
    title: recipe.title,
    author: recipe.author,
    category: recipe.category,
    cookTimeMinutes: recipe.cook_time_minutes,
    servings: recipe.servings,
    isFavorite: isFavorite,
    thumbnailUrl: thumbnailUrl,
    tags: tags,
  };
}

/**
 * 調理回数・最終日時集計
 * @param {Array<{recipe_id: string, user_name: string, created_at: string}>} historyRecords
 * @returns {{count: number, lastCookedAt: string|null}}
 */
function computeCookStats(historyRecords) {
  if (!historyRecords || historyRecords.length === 0) {
    return { count: 0, lastCookedAt: null };
  }

  let maxDate = null;
  for (const record of historyRecords) {
    if (record.created_at) {
      if (maxDate === null || record.created_at > maxDate) {
        maxDate = record.created_at;
      }
    }
  }

  return {
    count: historyRecords.length,
    lastCookedAt: maxDate,
  };
}

/**
 * よく作る/最近作ったトップN件を返す
 * @param {Array} recipes - レシピオブジェクト配列
 * @param {object} statsMap - {recipe_id: {count, lastCookedAt}} マップ
 * @param {'popular'|'recent'} mode - ソートモード
 * @param {number} [limit=5] - 取得件数
 * @returns {Array} ソート＋スライスされたレシピ配列
 */
function getTopRecipes(recipes, statsMap, mode, limit) {
  if (limit === undefined || limit === null) {
    limit = 5;
  }

  const sorted = [...recipes].sort((a, b) => {
    const statsA = statsMap[a.id] || { count: 0, lastCookedAt: null };
    const statsB = statsMap[b.id] || { count: 0, lastCookedAt: null };

    if (mode === 'popular') {
      return statsB.count - statsA.count;
    } else if (mode === 'recent') {
      const dateA = statsA.lastCookedAt || '';
      const dateB = statsB.lastCookedAt || '';
      if (dateB > dateA) return 1;
      if (dateB < dateA) return -1;
      return 0;
    }
    return 0;
  });

  return sorted.slice(0, limit);
}

/**
 * 現在のユーザー名を取得（async）
 * common.jsの既存パターン: push_subscriptions.child_name → children テーブルから取得
 * @returns {Promise<string|null>}
 */
async function getCurrentUserName() {
  // client はグローバル（common.jsで定義）
  const deviceId = localStorage.getItem('push_device_id');
  if (deviceId) {
    const { data: sub } = await client.from('push_subscriptions')
      .select('child_name')
      .eq('device_id', deviceId)
      .maybeSingle();
    if (sub && sub.child_name) return sub.child_name;
  }

  // フォールバック: 子供が1人ならその名前
  const { data: children } = await client.from('children').select('name');
  if (children && children.length === 1) return children[0].name;

  // 複数 or 0人 → null（UIで選択させる）
  return null;
}

/**
 * お気に入りトグルのシミュレーション（純粋関数）
 * @param {boolean} currentState - 現在のお気に入り状態
 * @returns {boolean} トグル後の状態
 */
function simulateToggle(currentState) {
  return !currentState;
}

/**
 * 特定ユーザーのお気に入りをトグルする（純粋関数、入力を変更しない）
 * @param {object} favoritesMap - {userName: boolean}
 * @param {string} userName - トグル対象のユーザー名
 * @returns {object} 新しいfavoritesMap
 */
function toggleUserFavorite(favoritesMap, userName) {
  var newMap = Object.create(null);
  var keys = Object.keys(favoritesMap);
  for (var i = 0; i < keys.length; i++) {
    newMap[keys[i]] = favoritesMap[keys[i]];
  }
  newMap[userName] = !newMap[userName];
  return newMap;
}

/**
 * レシピフォームバリデーション
 * @param {object} data - { title: string, ingredients: Array }
 * @param {string} status - 'published' | 'draft' | 'private'
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validateRecipeForm(data, status) {
  var errors = [];

  if (status === 'published' || status === 'private') {
    // title must not be empty/whitespace-only
    if (!data.title || data.title.trim() === '') {
      errors.push('タイトルを入力してください');
    }
    // ingredients must have at least 1
    if (!data.ingredients || data.ingredients.length < 1) {
      errors.push('材料を1つ以上追加してください');
    }
  }
  // For 'draft', no validation required (always valid)

  return { valid: errors.length === 0, errors: errors };
}

/**
 * 画像ファイルバリデーション
 * @param {object} file - { type: string, size: number }
 * @returns {{ valid: boolean, error: string|null }}
 */
function validateImageFile(file) {
  var allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  var maxSize = 3 * 1024 * 1024; // 3MB

  if (allowedTypes.indexOf(file.type) === -1) {
    return { valid: false, error: 'JPEG、PNG、WebP形式の画像を選択してください' };
  }

  if (file.size > maxSize) {
    return { valid: false, error: '画像サイズが3MBを超えています' };
  }

  return { valid: true, error: null };
}

/**
 * 画像リサイズ（Canvas API使用、最大幅1200px、アスペクト比保持）
 * @param {File|Blob} file - 画像ファイル
 * @returns {Promise<Blob>}
 */
function resizeImage(file) {
  return new Promise(function(resolve, reject) {
    var img = new Image();
    var url = URL.createObjectURL(file);

    img.onload = function() {
      URL.revokeObjectURL(url);
      var maxWidth = 1200;

      // If image is already <= maxWidth, return as-is
      if (img.width <= maxWidth) {
        resolve(file);
        return;
      }

      // Calculate new dimensions maintaining aspect ratio
      var ratio = maxWidth / img.width;
      var newWidth = maxWidth;
      var newHeight = Math.round(img.height * ratio);

      // Create canvas and draw resized image
      var canvas = document.createElement('canvas');
      canvas.width = newWidth;
      canvas.height = newHeight;
      var ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, newWidth, newHeight);

      // Convert to blob
      canvas.toBlob(function(blob) {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('画像のリサイズに失敗しました'));
        }
      }, file.type || 'image/jpeg', 0.85);
    };

    img.onerror = function() {
      URL.revokeObjectURL(url);
      reject(new Error('画像の読み込みに失敗しました'));
    };

    img.src = url;
  });
}

/**
 * リサイズ計算ロジック（テスト用に分離）
 * @param {number} originalWidth
 * @param {number} originalHeight
 * @param {number} [maxWidth=1200]
 * @returns {{ width: number, height: number }}
 */
function computeResizeDimensions(originalWidth, originalHeight, maxWidth) {
  if (maxWidth === undefined || maxWidth === null) {
    maxWidth = 1200;
  }
  if (originalWidth <= maxWidth) {
    return { width: originalWidth, height: originalHeight };
  }
  var ratio = maxWidth / originalWidth;
  return {
    width: maxWidth,
    height: Math.round(originalHeight * ratio)
  };
}

/**
 * タグ正規化（trim + lowercase）
 * @param {string} tag
 * @returns {string}
 */
function normalizeTag(tag) {
  return (tag || '').trim().toLowerCase();
}

/**
 * アレルギータグ判定（"allergy:"プレフィックス）
 * @param {string} tag
 * @returns {boolean}
 */
function isAllergyTag(tag) {
  return (tag || '').startsWith('allergy:');
}

/**
 * アレルギータグのみ抽出
 * @param {string[]} tags
 * @returns {string[]}
 */
function filterAllergyTags(tags) {
  return (tags || []).filter(function(t) { return isAllergyTag(t); });
}

/**
 * 一般タグのみ抽出（allergy:除外）
 * @param {string[]} tags
 * @returns {string[]}
 */
function filterGeneralTags(tags) {
  return (tags || []).filter(function(t) { return !isAllergyTag(t); });
}

/**
 * 不足率計算
 * @param {number} totalIngredients - 全材料数
 * @param {number} missingCount - 不足材料数
 * @returns {number}
 */
function computeDeficiencyRatio(totalIngredients, missingCount) {
  if (totalIngredients === 0) return 1;
  return missingCount / totalIngredients;
}

// Dual-export: ブラウザではグローバル、Node.jsではmodule.exports
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { recipeCardData, computeCookStats, getTopRecipes, getCurrentUserName, simulateToggle, toggleUserFavorite, validateRecipeForm, validateImageFile, resizeImage, computeResizeDimensions, normalizeTag, isAllergyTag, filterAllergyTags, filterGeneralTags, computeDeficiencyRatio };
}
