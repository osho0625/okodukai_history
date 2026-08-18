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
  try {
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
  } catch(e) {
    // DB接続エラー時はnullを返してプロンプトに委ねる
  }

  // 複数 or 0人 or エラー → null（UIで選択させる）
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

/**
 * 数量文字列を解析
 * @param {string} str - "300g", "1.5kg", "200ml", "1個", "1/2個", "適量", "少々"
 * @returns {{value: number|null, unit: string|null, raw: string}}
 */
function parseQuantity(str) {
  if (!str || str.trim() === '') return { value: null, unit: null, raw: str || '' };
  var trimmed = str.trim();

  // Match fraction format: 1/2個, 3/4カップ
  var fractionMatch = trimmed.match(/^(\d+)\/(\d+)(.*)$/);
  if (fractionMatch) {
    var num = parseInt(fractionMatch[1], 10);
    var denom = parseInt(fractionMatch[2], 10);
    var unit = fractionMatch[3].trim() || null;
    return { value: denom !== 0 ? num / denom : null, unit: unit, raw: trimmed };
  }

  // Match decimal number + unit: 300g, 1.5kg, 200ml, 2個
  var numMatch = trimmed.match(/^(\d+\.?\d*)(.*)$/);
  if (numMatch) {
    var value = parseFloat(numMatch[1]);
    var unitStr = numMatch[2].trim() || null;
    return { value: value, unit: unitStr, raw: trimmed };
  }

  // Non-numeric: 適量, 少々, etc
  return { value: null, unit: null, raw: trimmed };
}

/**
 * 同名材料の数量合算
 * @param {Array<{ingredient_name: string, quantity: string}>} items
 * @returns {Array<{ingredient_name: string, quantity: string, merged: boolean}>}
 */
function mergeQuantities(items) {
  if (!items || items.length === 0) return [];

  // Group by ingredient_name
  var groups = Object.create(null);
  var order = [];
  for (var i = 0; i < items.length; i++) {
    var name = items[i].ingredient_name;
    if (!groups[name]) {
      groups[name] = [];
      order.push(name);
    }
    groups[name].push(items[i]);
  }

  var result = [];
  for (var n = 0; n < order.length; n++) {
    var group = groups[order[n]];
    if (group.length === 1) {
      result.push({ ingredient_name: order[n], quantity: group[0].quantity, merged: false });
      continue;
    }

    // Try to merge: all must be numeric with same unit
    var parsed = group.map(function(g) { return parseQuantity(g.quantity); });
    var allNumeric = parsed.every(function(p) { return p.value !== null; });
    var allSameUnit = allNumeric && parsed.every(function(p) { return p.unit === parsed[0].unit; });

    if (allNumeric && allSameUnit) {
      var sum = parsed.reduce(function(acc, p) { return acc + p.value; }, 0);
      var mergedQty = sum + (parsed[0].unit || '');
      result.push({ ingredient_name: order[n], quantity: mergedQty, merged: true });
    } else {
      // Cannot merge - add separately
      for (var g = 0; g < group.length; g++) {
        result.push({ ingredient_name: order[n], quantity: group[g].quantity, merged: false });
      }
    }
  }
  return result;
}

/**
 * レシピ複製データ生成（写真除く）
 * @param {object} recipe - 元レシピオブジェクト
 * @returns {object} 複製用データ
 */
function duplicateRecipeData(recipe) {
  var ingredients = (recipe.recipe_ingredients || []).map(function(ing) {
    return {
      name: ing.name,
      quantity: ing.quantity || '',
      memo: ing.memo || '',
      sort_order: ing.sort_order !== undefined ? ing.sort_order : 0,
      group_label: ing.group_label || ''
    };
  });

  var steps = (recipe.recipe_steps || []).map(function(step) {
    return {
      description: step.description || '',
      sort_order: step.sort_order !== undefined ? step.sort_order : 0
    };
  });

  var tags = (recipe.recipe_tags || []).map(function(t) {
    return typeof t === 'string' ? t : t.tag;
  });

  return {
    title: (recipe.title || '') + 'のコピー',
    description: recipe.description || '',
    author: recipe.author || '',
    category: recipe.category || '',
    cook_time_minutes: recipe.cook_time_minutes || null,
    servings: recipe.servings || '',
    ingredients: ingredients,
    steps: steps,
    tags: tags
  };
}

// Dual-export: ブラウザではグローバル、Node.jsではmodule.exports
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { recipeCardData, computeCookStats, getTopRecipes, getCurrentUserName, simulateToggle, toggleUserFavorite, validateRecipeForm, validateImageFile, resizeImage, computeResizeDimensions, normalizeTag, isAllergyTag, filterAllergyTags, filterGeneralTags, computeDeficiencyRatio, parseQuantity, mergeQuantities, duplicateRecipeData };
}
