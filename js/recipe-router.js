// recipe-router.js — ハッシュルーティング、画面切替制御
// Implemented in Task 3

/**
 * ハッシュを解析してビュー名とIDを返す
 * @param {string} hash - location.hash の値（例: "#detail/abc123"）
 * @returns {{view: string, id: string|null}}
 */
function parseRoute(hash) {
  const raw = (hash || '').replace(/^#/, '');
  if (!raw || raw === 'list') {
    return { view: 'list', id: null };
  }

  // #detail/{id}
  const detailMatch = raw.match(/^detail\/(.+)$/);
  if (detailMatch) {
    return { view: 'detail', id: detailMatch[1] };
  }

  // #edit/{id} or #edit (new)
  if (raw === 'edit') {
    return { view: 'edit', id: null };
  }
  const editMatch = raw.match(/^edit\/(.+)$/);
  if (editMatch) {
    return { view: 'edit', id: editMatch[1] };
  }

  // #print/{id}
  const printMatch = raw.match(/^print\/(.+)$/);
  if (printMatch) {
    return { view: 'print', id: printMatch[1] };
  }

  // Invalid hash → fallback to list
  return { view: 'list', id: null };
}

/**
 * 現在のhashに応じてview-*コンテナの表示/非表示を切替える
 */
function handleRoute() {
  const { view, id } = parseRoute(location.hash);

  // 全viewコンテナの一覧
  const allViews = [
    'view-list',
    'view-detail',
    'view-edit',
    'view-ingredient-search',
    'view-meal-plan',
    'view-shopping',
    'view-print'
  ];

  // 対象ビューのIDを決定
  const activeViewId = 'view-' + view;

  // 全ビューを非表示にし、対象だけ表示
  allViews.forEach(function(viewId) {
    const el = document.getElementById(viewId);
    if (el) {
      if (viewId === activeViewId) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    }
  });

  // タブバーの表示/非表示
  // hash-based route (detail, edit, print) → タブバーを非表示
  // list / tab views → タブバーを表示
  const tabBar = document.querySelector('.tab-bar');
  const fab = document.getElementById('fab-new-recipe');
  const hashOnlyViews = ['detail', 'edit', 'print'];

  if (tabBar) {
    if (hashOnlyViews.includes(view)) {
      tabBar.style.display = 'none';
    } else {
      tabBar.style.display = '';
    }
  }

  // FAB表示制御: 一覧/タブビューでは表示、詳細/編集/印刷では非表示
  if (fab) {
    if (hashOnlyViews.includes(view)) {
      fab.style.display = 'none';
    } else {
      fab.style.display = '';
    }
  }

  // タブバーのアクティブ状態更新
  updateActiveTab(view);

  // ビュー固有のロード処理
  if (view === 'list') {
    if (typeof loadRecipeList === 'function') {
      loadRecipeList();
    }
  } else if (view === 'detail' && id) {
    if (typeof loadRecipeDetail === 'function') {
      loadRecipeDetail(id);
    }
  } else if (view === 'edit') {
    if (typeof loadEditForm === 'function') {
      loadEditForm(id);
    }
  } else if (view === 'print' && id) {
    if (typeof showPrintView === 'function') {
      showPrintView(id);
    }
  }
}

/**
 * タブバーのボタンのactive状態を更新
 * @param {string} view - 現在のビュー名
 */
function updateActiveTab(view) {
  const tabButtons = document.querySelectorAll('.tab-bar button[data-tab]');
  tabButtons.forEach(function(btn) {
    const tab = btn.getAttribute('data-tab');
    // "recipe" タブ = "list" ビュー
    const tabView = tab === 'recipe' ? 'list' : tab;
    if (tabView === view) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

/**
 * 指定されたタブビューに切替える（ハッシュは変更しない）
 * @param {string} tabName - data-tab属性の値
 */
function switchTab(tabName) {
  // タブ→ビュー名のマッピング
  const viewName = tabName === 'recipe' ? 'list' : tabName;

  // ハッシュをクリア（タブ切替時はハッシュ不使用）
  // ただしlistの場合は#listとする
  if (viewName === 'list') {
    // history.replaceStateでハッシュを#listに
    history.replaceState(null, '', '#list');
  } else {
    // タブビューはハッシュを使わない（hashchangeをトリガーしないように直接制御）
    history.replaceState(null, '', location.pathname + location.search);
  }

  // 全viewを非表示にして対象を表示
  const allViews = [
    'view-list',
    'view-detail',
    'view-edit',
    'view-ingredient-search',
    'view-meal-plan',
    'view-shopping',
    'view-print'
  ];

  const activeViewId = 'view-' + viewName;
  allViews.forEach(function(viewId) {
    const el = document.getElementById(viewId);
    if (el) {
      if (viewId === activeViewId) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    }
  });

  // タブバー表示
  const tabBar = document.querySelector('.tab-bar');
  if (tabBar) {
    tabBar.style.display = '';
  }

  // FAB表示
  const fab = document.getElementById('fab-new-recipe');
  if (fab) {
    fab.style.display = '';
  }

  // タブアクティブ状態更新
  updateActiveTab(viewName);

  // タブ固有のロード処理
  if (viewName === 'list') {
    if (typeof loadRecipeList === 'function') {
      loadRecipeList();
    }
  } else if (viewName === 'ingredient-search') {
    if (typeof loadIngredientSearchView === 'function') {
      loadIngredientSearchView();
    }
  } else if (viewName === 'shopping') {
    if (typeof loadShoppingView === 'function') {
      loadShoppingView();
    }
  } else if (viewName === 'meal-plan') {
    if (typeof loadMealPlanView === 'function') {
      loadMealPlanView();
    }
  }
}

/**
 * 指定したハッシュに遷移する
 * @param {string} hash - 遷移先ハッシュ（例: "#edit" or "edit"）
 */
function navigateTo(hash) {
  const normalized = hash.startsWith('#') ? hash : '#' + hash;
  location.hash = normalized;
}

/**
 * ルーター初期化
 * - hashchangeイベントリスナー登録
 * - タブクリックリスナー登録
 * - FABクリックリスナー登録
 * - 初回ルート処理
 */
function initRouter() {
  // hashchange リスナー
  window.addEventListener('hashchange', handleRoute);

  // タブクリックリスナー
  const tabButtons = document.querySelectorAll('.tab-bar button[data-tab]');
  tabButtons.forEach(function(btn) {
    btn.addEventListener('click', function() {
      var tabName = btn.getAttribute('data-tab');
      switchTab(tabName);
    });
  });

  // FAB（新規作成）クリックリスナー
  var fab = document.getElementById('fab-new-recipe');
  if (fab) {
    fab.addEventListener('click', function() {
      navigateTo('#edit');
    });
  }

  // 初回ルート処理
  handleRoute();
}

// DOMContentLoaded で初期化
document.addEventListener('DOMContentLoaded', initRouter);
