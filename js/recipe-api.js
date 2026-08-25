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
    const status = opts.hasOwnProperty('status') ? opts.status : 'published';
    const sort = opts.sort || 'updated_at DESC';
    const limit = opts.limit || null;

    // Parse sort string (e.g. "updated_at DESC")
    const sortParts = sort.split(' ');
    const sortColumn = sortParts[0];
    const sortAscending = sortParts[1] && sortParts[1].toUpperCase() === 'ASC';

    // Try full query with all relations
    var selectQueries = [
      '*, recipe_photos(url, sort_order), recipe_tags(tag), recipe_favorites(user_name)',
      '*, recipe_photos(url, sort_order), recipe_tags(tag)',
      '*, recipe_tags(tag)',
      '*'
    ];

    var data = null;
    var error = null;

    for (var qi = 0; qi < selectQueries.length; qi++) {
      let query = client.from('recipes').select(selectQueries[qi]);

      if (status) {
        query = query.eq('status', status);
      }

      query = query.order(sortColumn, { ascending: sortAscending });

      if (limit) {
        query = query.limit(limit);
      }

      var result = await query;
      if (!result.error) {
        data = result.data;
        error = null;
        break;
      }
      error = result.error;
    }

    // Ultimate fallback: no filter, no sort, just get all rows
    if (!data) {
      var fallbackResult = await client.from('recipes').select('*');
      if (!fallbackResult.error) {
        data = fallbackResult.data;
        error = null;
      }
    }

    // Normalize: ensure status field exists (old recipes may have null)
    if (data) {
      for (var i = 0; i < data.length; i++) {
        if (!data[i].status) data[i].status = 'published';
        if (!data[i].recipe_photos) data[i].recipe_photos = [];
        if (!data[i].recipe_tags) data[i].recipe_tags = [];
        if (!data[i].recipe_favorites) data[i].recipe_favorites = [];
      }
    }

    return { data, error };
  },

  /**
   * レシピ1件を全リレーション付きで取得
   * @param {string} id - レシピID (UUID)
   * @returns {Promise<{data: object|null, error: object|null}>}
   */
  async getById(id) {
    // Try full query with all relations, fallback progressively
    var selectQueries = [
      '*, recipe_ingredients(id, name, quantity, memo, sort_order), recipe_steps(id, description, sort_order), recipe_photos(id, url, type, sort_order, caption, step_id), recipe_tags(id, tag), recipe_favorites(id, user_name, created_at), recipe_cook_history(id, user_name, created_at)',
      '*, recipe_ingredients(id, name, quantity, sort_order), recipe_steps(id, description, sort_order), recipe_photos(id, url, type, sort_order), recipe_tags(id, tag), recipe_favorites(id, user_name, created_at)',
      '*, recipe_ingredients(id, name, quantity), recipe_steps(id, description), recipe_photos(id, url), recipe_tags(id, tag)',
      '*, recipe_ingredients(id, name, quantity), recipe_steps(id, description)',
      '*'
    ];

    var data = null;
    var error = null;

    for (var qi = 0; qi < selectQueries.length; qi++) {
      var query = client.from('recipes').select(selectQueries[qi]).eq('id', id);

      // Only add order clauses for queries that include sort_order
      if (qi <= 1) {
        query = query
          .order('sort_order', { referencedTable: 'recipe_ingredients', ascending: true })
          .order('sort_order', { referencedTable: 'recipe_steps', ascending: true })
          .order('sort_order', { referencedTable: 'recipe_photos', ascending: true });
      }

      var result = await query.maybeSingle();
      if (!result.error) {
        data = result.data;
        error = null;
        break;
      }
      error = result.error;
    }

    // Ultimate fallback: just get the recipe row
    if (!data && error) {
      var fallbackResult = await client.from('recipes').select('*').eq('id', id).maybeSingle();
      if (!fallbackResult.error) {
        data = fallbackResult.data;
        error = null;
      }
    }

    if (data) {
      // Normalize: ensure all relation arrays exist
      if (!data.status) data.status = 'published';
      if (!data.recipe_ingredients) data.recipe_ingredients = [];
      if (!data.recipe_steps) data.recipe_steps = [];
      if (!data.recipe_photos) data.recipe_photos = [];
      if (!data.recipe_tags) data.recipe_tags = [];
      if (!data.recipe_favorites) data.recipe_favorites = [];
      if (!data.recipe_cook_history) data.recipe_cook_history = [];

      // Normalize ingredients: ensure memo and sort_order exist
      for (var ii = 0; ii < data.recipe_ingredients.length; ii++) {
        if (data.recipe_ingredients[ii].memo === undefined) data.recipe_ingredients[ii].memo = '';
        if (data.recipe_ingredients[ii].sort_order === undefined) data.recipe_ingredients[ii].sort_order = ii;
        if (data.recipe_ingredients[ii].group_label === undefined) data.recipe_ingredients[ii].group_label = '';
      }

      // Normalize steps: ensure sort_order exists
      for (var si = 0; si < data.recipe_steps.length; si++) {
        if (data.recipe_steps[si].sort_order === undefined) data.recipe_steps[si].sort_order = si;
      }

      // Normalize photos: ensure step_id and caption exist
      for (var pi = 0; pi < data.recipe_photos.length; pi++) {
        if (data.recipe_photos[pi].step_id === undefined) data.recipe_photos[pi].step_id = null;
        if (data.recipe_photos[pi].caption === undefined) data.recipe_photos[pi].caption = '';
        if (data.recipe_photos[pi].sort_order === undefined) data.recipe_photos[pi].sort_order = pi;
      }

      // Try to fetch group_label separately (if column exists and not already fetched)
      if (data.recipe_ingredients.length > 0 && !data.recipe_ingredients[0].hasOwnProperty('group_label_fetched')) {
        try {
          var { data: ingWithGroup, error: groupErr } = await client
            .from('recipe_ingredients')
            .select('id, group_label')
            .eq('recipe_id', id);
          if (!groupErr && ingWithGroup) {
            var groupMap = {};
            for (var gi = 0; gi < ingWithGroup.length; gi++) {
              groupMap[ingWithGroup[gi].id] = ingWithGroup[gi].group_label || '';
            }
            for (var ij = 0; ij < data.recipe_ingredients.length; ij++) {
              data.recipe_ingredients[ij].group_label = groupMap[data.recipe_ingredients[ij].id] || '';
            }
          }
        } catch(e) { /* group_label column doesn't exist yet — ignore */ }
      }
    }

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
   * レシピ一覧を材料情報付きで取得（N+1回避用）
   * @param {object} [options] - {status}
   * @returns {Promise<{data: Array|null, error: object|null}>}
   */
  async getAllWithIngredients(options) {
    const opts = options || {};
    const status = opts.hasOwnProperty('status') ? opts.status : 'published';

    var selectQueries = [
      '*, recipe_ingredients(id, name, quantity, memo, sort_order), recipe_photos(url, sort_order), recipe_tags(tag), recipe_favorites(user_name)',
      '*, recipe_ingredients(id, name, quantity), recipe_photos(url, sort_order), recipe_tags(tag)',
      '*, recipe_ingredients(id, name, quantity), recipe_tags(tag)',
      '*, recipe_ingredients(id, name, quantity)',
      '*'
    ];

    var data = null;
    var error = null;

    for (var qi = 0; qi < selectQueries.length; qi++) {
      let query = client.from('recipes').select(selectQueries[qi]);

      if (status) {
        query = query.eq('status', status);
      }

      query = query.order('updated_at', { ascending: false });
      var result = await query;
      if (!result.error) {
        data = result.data;
        error = null;
        break;
      }
      error = result.error;
    }

    // Normalize
    if (data) {
      for (var i = 0; i < data.length; i++) {
        if (!data[i].status) data[i].status = 'published';
        if (!data[i].recipe_ingredients) data[i].recipe_ingredients = [];
        if (!data[i].recipe_photos) data[i].recipe_photos = [];
        if (!data[i].recipe_tags) data[i].recipe_tags = [];
        if (!data[i].recipe_favorites) data[i].recipe_favorites = [];
      }
    }

    return { data, error };
  },

  /**
   * ランダム1件取得（カテゴリフィルタ対応）
   * @param {string|null} category - カテゴリ（nullで全カテゴリ）
   * @returns {Promise<{data: object|null, error: object|null}>}
   */
  async getRandom(category) {
    let query = client.from('recipes').select('id').eq('status', 'published');
    if (category) query = query.eq('category', category);
    const { data, error } = await query;
    if (error) return { data: null, error };
    if (!data || data.length === 0) return { data: null, error: null };
    var randomIndex = Math.floor(Math.random() * data.length);
    return await this.getById(data[randomIndex].id);
  },

  /**
   * レシピを複製（写真除く）
   * @param {string} id - 複製元レシピID
   * @returns {Promise<{data: object|null, error: object|null}>}
   */
  async duplicate(id) {
    var original = await this.getById(id);
    if (original.error || !original.data) return { data: null, error: original.error || new Error('Recipe not found') };
    var dupData = duplicateRecipeData(original.data);
    // Save new recipe
    var saveResult = await this.save({
      title: dupData.title,
      description: dupData.description,
      author: dupData.author,
      category: dupData.category,
      cook_time_minutes: dupData.cook_time_minutes,
      servings: dupData.servings,
      status: 'draft'
    });
    if (saveResult.error) return { data: null, error: saveResult.error };
    var newRecipe = saveResult.data;
    // Save ingredients
    if (dupData.ingredients && dupData.ingredients.length > 0) {
      await IngredientRepository.saveAll(newRecipe.id, dupData.ingredients);
    }
    // Save tags
    if (dupData.tags && dupData.tags.length > 0) {
      await TagRepository.saveAll(newRecipe.id, dupData.tags);
    }
    return { data: newRecipe, error: null };
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
    try {
      const { data, error } = await client
        .from('recipe_favorites')
        .select('recipe_id')
        .eq('user_name', userName);

      if (error || !data) return [];
      return data.map(row => row.recipe_id);
    } catch (e) {
      return [];
    }
  },

  /**
   * 複数レシピのお気に入り数を一括取得
   * @param {string[]} recipeIds
   * @returns {Promise<object>} {recipeId: count} マップ
   */
  async getCountsForRecipes(recipeIds) {
    if (!recipeIds || recipeIds.length === 0) return {};
    try {
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
    } catch (e) {
      return {};
    }
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
    try {
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
    } catch (e) {
      return {};
    }
  },

  /**
   * 指定レシピの調理履歴一覧を取得（created_at DESC）
   * @param {string} recipeId
   * @returns {Promise<{data: Array|null, error: object|null}>}
   */
  async getByRecipeId(recipeId) {
    try {
      const { data, error } = await client
        .from('recipe_cook_history')
        .select('id, recipe_id, user_name, created_at')
        .eq('recipe_id', recipeId)
        .order('created_at', { ascending: false });

      return { data: data || [], error };
    } catch (e) {
      return { data: [], error: null };
    }
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
        sort_order: ing.sort_order !== undefined ? ing.sort_order : idx,
        group_label: ing.group_label || ''
      };
    });

    var { error: insertError } = await client
      .from('recipe_ingredients')
      .insert(rows);

    // Fallback: if group_label column doesn't exist, retry without it
    if (insertError) {
      var rowsNoGroup = ingredients.map(function(ing, idx) {
        return {
          recipe_id: recipeId,
          name: ing.name,
          quantity: ing.quantity || '',
          memo: ing.memo || '',
          sort_order: ing.sort_order !== undefined ? ing.sort_order : idx
        };
      });
      var fallback = await client.from('recipe_ingredients').insert(rowsNoGroup);
      insertError = fallback.error;
    }

    return { error: insertError || null };
  },

  /**
   * 材料名で部分一致検索（複数名対応、OR結合）
   * @param {string[]} names - 検索材料名リスト
   * @returns {Promise<{data: Array, error: object|null}>}
   */
  async searchByNames(names) {
    if (!names || names.length === 0) return { data: [], error: null };
    try {
      var query = client.from('recipe_ingredients').select('recipe_id, name');
      var orFilter = names.map(function(n) { return 'name.ilike.%' + n + '%'; }).join(',');
      query = query.or(orFilter);
      var { data, error } = await query;
      return { data: data || [], error: error || null };
    } catch (e) {
      return { data: [], error: null };
    }
  }
};

// === StepRepository ===
const StepRepository = {
  /**
   * レシピの全手順を保存（全削除＋全挿入）
   * @param {string} recipeId - レシピID
   * @param {Array<{description: string, sort_order: number}>} steps
   * @returns {Promise<{error: object|null}>}
   */
  async saveAll(recipeId, steps) {
    // 1. Delete all existing steps for recipeId
    const { error: deleteError } = await client
      .from('recipe_steps')
      .delete()
      .eq('recipe_id', recipeId);

    if (deleteError) return { error: deleteError };

    // 2. Insert all new steps with sort_order
    if (!steps || steps.length === 0) {
      return { error: null };
    }

    const rows = steps.map(function(step, idx) {
      return {
        recipe_id: recipeId,
        description: step.description,
        sort_order: step.sort_order !== undefined ? step.sort_order : idx
      };
    });

    const { error: insertError } = await client
      .from('recipe_steps')
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

    // 2. Insert normalized tags (deduplicated)
    if (!tags || tags.length === 0) {
      return { error: null };
    }

    // Deduplicate tags
    var uniqueTags = [];
    var seen = {};
    for (var i = 0; i < tags.length; i++) {
      var t = tags[i];
      if (!seen[t]) {
        seen[t] = true;
        uniqueTags.push(t);
      }
    }

    const rows = uniqueTags.map(function(tag) {
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

// === ShoppingListRepository ===
const ShoppingListRepository = {
  /**
   * 買い物リスト全件取得（レシピ名JOIN、created_at昇順）
   * @returns {Promise<{data: Array, error: object|null}>}
   */
  async getAll() {
    const { data, error } = await client.from('shopping_list')
      .select('*, recipes(title)')
      .order('created_at', { ascending: true });
    return { data: data || [], error };
  },

  /**
   * 買い物リストに材料を追加
   * @param {string} recipeId - レシピID
   * @param {Array<{ingredient_name: string, quantity: string}>} items
   * @returns {Promise<{error: object|null}>}
   */
  async addItems(recipeId, items) {
    const rows = items.map(function(item) {
      return {
        recipe_id: recipeId,
        ingredient_name: item.ingredient_name,
        quantity: item.quantity || ''
      };
    });
    const { error } = await client.from('shopping_list').insert(rows);
    return { error };
  },

  /**
   * チェック状態トグル
   * @param {string} id - 買い物リスト項目ID
   * @param {boolean} checked - チェック状態
   * @returns {Promise<{error: object|null}>}
   */
  async toggleChecked(id, checked) {
    const { error } = await client.from('shopping_list')
      .update({ checked: checked }).eq('id', id);
    return { error };
  },

  /**
   * チェック済み一括削除
   * @returns {Promise<{error: object|null}>}
   */
  async deleteChecked() {
    const { error } = await client.from('shopping_list')
      .delete().eq('checked', true);
    return { error };
  },

  /**
   * 個別削除
   * @param {string} id - 買い物リスト項目ID
   * @returns {Promise<{error: object|null}>}
   */
  async deleteItem(id) {
    const { error } = await client.from('shopping_list').delete().eq('id', id);
    return { error };
  }
};

// === MealPlanRepository ===
const MealPlanRepository = {
  /**
   * 指定日の献立を取得
   * @param {string} date - 'YYYY-MM-DD'
   * @returns {Promise<{data: Array, error: object|null}>}
   */
  async getByDate(date) {
    const { data, error } = await client.from('meal_plans')
      .select('*')
      .eq('plan_date', date);
    return { data: data || [], error };
  },

  /**
   * 期間指定で献立を取得
   * @param {string} startDate - 'YYYY-MM-DD'
   * @param {string} endDate - 'YYYY-MM-DD'
   * @returns {Promise<{data: Array, error: object|null}>}
   */
  async getByDateRange(startDate, endDate) {
    const { data, error } = await client.from('meal_plans')
      .select('*')
      .gte('plan_date', startDate)
      .lte('plan_date', endDate)
      .order('plan_date', { ascending: true });
    return { data: data || [], error };
  },

  /**
   * 献立保存（UPSERT: plan_date + meal_type が一意）
   * @param {string} date - 'YYYY-MM-DD'
   * @param {string} mealType - '朝' | '昼' | '夜'
   * @param {object} slots - {main: recipeId|null, side: recipeId|null, soup: recipeId|null}
   * @returns {Promise<{data: object|null, error: object|null}>}
   */
  async save(date, mealType, slots) {
    const { data, error } = await client.from('meal_plans')
      .upsert({
        plan_date: date,
        meal_type: mealType,
        main_dish_id: slots.main || null,
        side_dish_id: slots.side || null,
        soup_id: slots.soup || null,
        updated_at: new Date().toISOString()
      }, { onConflict: 'plan_date,meal_type' })
      .select();
    return { data, error };
  },

  /**
   * スロットクリア
   * @param {string} id - 献立レコードID
   * @param {string} slotName - 'main_dish_id' | 'side_dish_id' | 'soup_id'
   * @returns {Promise<{error: object|null}>}
   */
  async clearSlot(id, slotName) {
    var update = { updated_at: new Date().toISOString() };
    update[slotName] = null;
    const { error } = await client.from('meal_plans').update(update).eq('id', id);
    return { error };
  }
};

// === RecipeCategoryRepository ===
const RecipeCategoryRepository = {
  /**
   * カテゴリ一覧を取得（game_settings.recipe_categories）
   * @returns {Promise<string[]>}
   */
  async getAll() {
    try {
      const { data, error } = await client
        .from('game_settings')
        .select('recipe_categories')
        .eq('id', 1)
        .maybeSingle();
      if (error || !data || !data.recipe_categories) {
        return ['主菜', '副菜', '汁物', 'デザート', 'お弁当', 'お菓子'];
      }
      return data.recipe_categories;
    } catch (e) {
      return ['主菜', '副菜', '汁物', 'デザート', 'お弁当', 'お菓子'];
    }
  },

  /**
   * カテゴリを追加
   * @param {string} category - 追加するカテゴリ名
   * @returns {Promise<{error: object|null}>}
   */
  async add(category) {
    var current = await this.getAll();
    if (current.indexOf(category) !== -1) return { error: null };
    current.push(category);
    const { error } = await client
      .from('game_settings')
      .update({ recipe_categories: current })
      .eq('id', 1);
    return { error: error || null };
  },

  /**
   * カテゴリを削除
   * @param {string} category - 削除するカテゴリ名
   * @returns {Promise<{error: object|null}>}
   */
  async remove(category) {
    var current = await this.getAll();
    var idx = current.indexOf(category);
    if (idx === -1) return { error: null };
    current.splice(idx, 1);
    const { error } = await client
      .from('game_settings')
      .update({ recipe_categories: current })
      .eq('id', 1);
    return { error: error || null };
  }
};

// Dual-export: ブラウザではグローバル、Node.jsではmodule.exports
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { RecipeRepository, FavoriteRepository, CookHistoryRepository, IngredientRepository, StepRepository, TagRepository, PhotoRepository, ShoppingListRepository, MealPlanRepository, RecipeCategoryRepository };
}
