// recipe-api.js — Supabaseアクセス（Repository層）
// Uses the global `client` from common.js

// === RecipeRepository ===
const RecipeRepository = {
  /**
   * レシピ一覧を取得
   * @param {object} [options] - {status, sort, limit}
   * @returns {Promise<{data: Array|null, error: object|null}>}
   */
  async getAll(options) {
    const opts = options || {};
    const status = opts.status || 'published';
    const sort = opts.sort || 'updated_at DESC';
    const limit = opts.limit || null;

    let query = client
      .from('recipes')
      .select('*, recipe_photos(url, sort_order), recipe_tags(tag), recipe_favorites(user_name)');

    if (status) {
      query = query.eq('status', status);
    }

    // Parse sort string (e.g. "updated_at DESC")
    const sortParts = sort.split(' ');
    const sortColumn = sortParts[0];
    const sortAscending = sortParts[1] && sortParts[1].toUpperCase() === 'ASC';
    query = query.order(sortColumn, { ascending: sortAscending });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;
    return { data, error };
  },

  /**
   * レシピ1件を全リレーション付きで取得
   * @param {string} id - レシピID (UUID)
   * @returns {Promise<{data: object|null, error: object|null}>}
   */
  async getById(id) {
    const { data, error } = await client
      .from('recipes')
      .select('*, recipe_ingredients(id, name, quantity, memo, sort_order), recipe_steps(id, description, sort_order), recipe_photos(id, url, type, sort_order, caption, step_id), recipe_tags(id, tag), recipe_favorites(id, user_name, created_at), recipe_cook_history(id, user_name, created_at)')
      .eq('id', id)
      .order('sort_order', { referencedTable: 'recipe_ingredients', ascending: true })
      .order('sort_order', { referencedTable: 'recipe_steps', ascending: true })
      .order('sort_order', { referencedTable: 'recipe_photos', ascending: true })
      .maybeSingle();

    return { data, error };
  },

  /**
   * レシピを保存（INSERT or UPDATE）
   * @param {object} data - {id?, title, description, author, category, cook_time_minutes, servings, status}
   * @returns {Promise<{data: object|null, error: object|null}>}
   */
  async save(data) {
    if (data.id) {
      // UPDATE
      const { data: updated, error } = await client
        .from('recipes')
        .update({
          title: data.title,
          description: data.description,
          author: data.author,
          category: data.category,
          cook_time_minutes: data.cook_time_minutes,
          servings: data.servings,
          status: data.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', data.id)
        .select()
        .single();

      return { data: updated, error: error || null };
    } else {
      // INSERT
      const { data: inserted, error } = await client
        .from('recipes')
        .insert({
          title: data.title,
          description: data.description,
          author: data.author,
          category: data.category,
          cook_time_minutes: data.cook_time_minutes,
          servings: data.servings,
          status: data.status
        })
        .select()
        .single();

      return { data: inserted, error: error || null };
    }
  },

  /**
   * レシピを削除（Storage写真削除 → DB CASCADE削除）
   * @param {string} id - レシピID
   * @returns {Promise<{error: object|null}>}
   */
  async delete(id) {
    // 1. Get all photo URLs for the recipe
    const { data: photos } = await client
      .from('recipe_photos')
      .select('url')
      .eq('recipe_id', id);

    // 2. Delete photos from storage
    if (photos && photos.length > 0) {
      const paths = photos
        .map(function(p) {
          // Extract path from URL: recipe-photos bucket path is {recipe_id}/{filename}
          var match = p.url.match(/recipe-photos\/(.+)$/);
          return match ? match[1] : null;
        })
        .filter(function(p) { return p !== null; });

      if (paths.length > 0) {
        await client.storage.from('recipe-photos').remove(paths);
      }
    }

    // 3. Delete recipe from DB (CASCADE handles ingredients, steps, photos records, tags, favorites, cook_history)
    const { error } = await client
      .from('recipes')
      .delete()
      .eq('id', id);

    return { error: error || null };
  }
};

// === FavoriteRepository ===
const FavoriteRepository = {
  /**
   * 指定ユーザーがお気に入り登録しているレシピID一覧を取得
   * @param {string} userName
   * @returns {Promise<string[]>} recipe_idの配列
   */
  async getByUser(userName) {
    if (!userName) return [];
    const { data, error } = await client
      .from('recipe_favorites')
      .select('recipe_id')
      .eq('user_name', userName);

    if (error || !data) return [];
    return data.map(row => row.recipe_id);
  },

  /**
   * 複数レシピのお気に入り数を一括取得
   * @param {string[]} recipeIds
   * @returns {Promise<object>} {recipeId: count} マップ
   */
  async getCountsForRecipes(recipeIds) {
    if (!recipeIds || recipeIds.length === 0) return {};
    const { data, error } = await client
      .from('recipe_favorites')
      .select('recipe_id')
      .in('recipe_id', recipeIds);

    if (error || !data) return {};

    const counts = {};
    for (const row of data) {
      counts[row.recipe_id] = (counts[row.recipe_id] || 0) + 1;
    }
    return counts;
  },

  /**
   * お気に入りをトグル（存在すれば削除、なければ追加）
   * @param {string} recipeId
   * @param {string} userName
   * @returns {Promise<{isFavorite: boolean, error: object|null}>}
   */
  async toggle(recipeId, userName) {
    // Check if favorite exists
    const { data: existing, error: checkError } = await client
      .from('recipe_favorites')
      .select('id')
      .eq('recipe_id', recipeId)
      .eq('user_name', userName)
      .maybeSingle();

    if (checkError) {
      return { isFavorite: false, error: checkError };
    }

    if (existing) {
      // Exists → DELETE (unfavorite)
      const { error: deleteError } = await client
        .from('recipe_favorites')
        .delete()
        .eq('id', existing.id);

      return { isFavorite: false, error: deleteError || null };
    } else {
      // Not exists → INSERT (favorite)
      const { error: insertError } = await client
        .from('recipe_favorites')
        .insert({ recipe_id: recipeId, user_name: userName });

      return { isFavorite: true, error: insertError || null };
    }
  }
};

// === CookHistoryRepository ===
const CookHistoryRepository = {
  /**
   * 複数レシピの調理統計を一括取得
   * @param {string[]} recipeIds
   * @returns {Promise<object>} {recipeId: {count, lastCookedAt}} マップ
   */
  async getStats(recipeIds) {
    if (!recipeIds || recipeIds.length === 0) return {};
    const { data, error } = await client
      .from('recipe_cook_history')
      .select('recipe_id, created_at')
      .in('recipe_id', recipeIds);

    if (error || !data) return {};

    const stats = {};
    for (const row of data) {
      if (!stats[row.recipe_id]) {
        stats[row.recipe_id] = { count: 0, lastCookedAt: null };
      }
      stats[row.recipe_id].count += 1;
      if (!stats[row.recipe_id].lastCookedAt || row.created_at > stats[row.recipe_id].lastCookedAt) {
        stats[row.recipe_id].lastCookedAt = row.created_at;
      }
    }
    return stats;
  },

  /**
   * 指定レシピの調理履歴一覧を取得（created_at DESC）
   * @param {string} recipeId
   * @returns {Promise<{data: Array|null, error: object|null}>}
   */
  async getByRecipeId(recipeId) {
    const { data, error } = await client
      .from('recipe_cook_history')
      .select('id, recipe_id, user_name, created_at')
      .eq('recipe_id', recipeId)
      .order('created_at', { ascending: false });

    return { data, error };
  },

  /**
   * 調理記録を追加
   * @param {string} recipeId
   * @param {string} userName
   * @returns {Promise<{data: object|null, error: object|null}>}
   */
  async add(recipeId, userName) {
    const { data, error } = await client
      .from('recipe_cook_history')
      .insert({ recipe_id: recipeId, user_name: userName })
      .select()
      .single();

    return { data, error };
  }
};

// === IngredientRepository ===
const IngredientRepository = {
  /**
   * レシピの全材料を保存（全削除＋全挿入）
   * @param {string} recipeId - レシピID
   * @param {Array<{name: string, quantity: string, memo: string, sort_order: number}>} ingredients
   * @returns {Promise<{error: object|null}>}
   */
  async saveAll(recipeId, ingredients) {
    // 1. Delete all existing ingredients for recipeId
    const { error: deleteError } = await client
      .from('recipe_ingredients')
      .delete()
      .eq('recipe_id', recipeId);

    if (deleteError) return { error: deleteError };

    // 2. Insert all new ingredients with sort_order
    if (!ingredients || ingredients.length === 0) {
      return { error: null };
    }

    const rows = ingredients.map(function(ing, idx) {
      return {
        recipe_id: recipeId,
        name: ing.name,
        quantity: ing.quantity || '',
        memo: ing.memo || '',
        sort_order: ing.sort_order !== undefined ? ing.sort_order : idx
      };
    });

    const { error: insertError } = await client
      .from('recipe_ingredients')
      .insert(rows);

    return { error: insertError || null };
  }
};

// === TagRepository ===
const TagRepository = {
  /**
   * レシピの全タグを保存（全削除＋全挿入）
   * @param {string} recipeId - レシピID
   * @param {string[]} tags - 正規化済みタグ配列
   * @returns {Promise<{error: object|null}>}
   */
  async saveAll(recipeId, tags) {
    // 1. Delete all existing tags for recipeId
    const { error: deleteError } = await client
      .from('recipe_tags')
      .delete()
      .eq('recipe_id', recipeId);

    if (deleteError) return { error: deleteError };

    // 2. Insert normalized tags
    if (!tags || tags.length === 0) {
      return { error: null };
    }

    const rows = tags.map(function(tag) {
      return { recipe_id: recipeId, tag: tag };
    });

    const { error: insertError } = await client
      .from('recipe_tags')
      .insert(rows);

    return { error: insertError || null };
  },

  /**
   * タグオートコンプリート候補取得
   * @param {string} prefix - 入力プレフィックス
   * @returns {Promise<string[]>}
   */
  async getSuggestions(prefix) {
    if (!prefix) return [];

    const { data, error } = await client
      .from('recipe_tags')
      .select('tag')
      .ilike('tag', prefix + '%')
      .not('tag', 'ilike', 'allergy:%');

    if (error || !data) return [];

    // Return distinct tags
    var seen = {};
    var result = [];
    for (var i = 0; i < data.length; i++) {
      if (!seen[data[i].tag]) {
        seen[data[i].tag] = true;
        result.push(data[i].tag);
      }
    }
    return result;
  }
};

// === PhotoRepository ===
const PhotoRepository = {
  /**
   * 写真アップロード
   * @param {object} params - {file, recipeId, stepId, type, caption}
   * @returns {Promise<{data: object|null, error: object|null}>}
   */
  async upload(params) {
    var file = params.file;
    var recipeId = params.recipeId;
    var stepId = params.stepId || null;
    var type = params.type || 'main';
    var caption = params.caption || '';

    // 1. Generate filename: {uuid}.{ext}
    var ext = 'jpg';
    if (file.type === 'image/png') ext = 'png';
    else if (file.type === 'image/webp') ext = 'webp';
    var uuid = crypto.randomUUID ? crypto.randomUUID() : (Date.now().toString(36) + Math.random().toString(36).slice(2));
    var filename = uuid + '.' + ext;

    // 2. Upload to storage: recipe-photos/{recipeId}/{filename}
    var storagePath = recipeId + '/' + filename;
    var { error: uploadError } = await client.storage
      .from('recipe-photos')
      .upload(storagePath, file, { contentType: file.type });

    if (uploadError) return { data: null, error: uploadError };

    // 3. Get public URL
    var { data: urlData } = client.storage
      .from('recipe-photos')
      .getPublicUrl(storagePath);

    var publicUrl = urlData ? urlData.publicUrl : '';

    // 4. Insert into recipe_photos table
    var { data: photoRecord, error: insertError } = await client
      .from('recipe_photos')
      .insert({
        recipe_id: recipeId,
        step_id: stepId,
        url: publicUrl,
        type: type,
        sort_order: 0,
        caption: caption
      })
      .select()
      .single();

    return { data: photoRecord, error: insertError || null };
  },

  /**
   * 写真削除（Storage＋DB）
   * @param {string} photoId - 写真ID
   * @returns {Promise<{error: object|null}>}
   */
  async delete(photoId) {
    // 1. Get photo record (url)
    var { data: photo, error: getError } = await client
      .from('recipe_photos')
      .select('url')
      .eq('id', photoId)
      .maybeSingle();

    if (getError || !photo) return { error: getError || new Error('Photo not found') };

    // 2. Extract storage path from URL
    var match = photo.url.match(/recipe-photos\/(.+)$/);
    if (match) {
      // 3. Delete from storage
      await client.storage.from('recipe-photos').remove([match[1]]);
    }

    // 4. Delete from DB
    var { error: deleteError } = await client
      .from('recipe_photos')
      .delete()
      .eq('id', photoId);

    return { error: deleteError || null };
  },

  /**
   * 写真のsort_orderを更新
   * @param {string} photoId - 写真ID
   * @param {number} sortOrder - 新しいsort_order
   * @returns {Promise<{error: object|null}>}
   */
  async updateSortOrder(photoId, sortOrder) {
    var { error } = await client
      .from('recipe_photos')
      .update({ sort_order: sortOrder })
      .eq('id', photoId);

    return { error: error || null };
  }
};

// Dual-export: ブラウザではグローバル、Node.jsではmodule.exports
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { RecipeRepository, FavoriteRepository, CookHistoryRepository, IngredientRepository, TagRepository, PhotoRepository };
}
