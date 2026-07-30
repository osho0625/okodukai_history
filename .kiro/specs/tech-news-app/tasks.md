# 実装計画: ファミリーニュース

## 概要

既存のお小遣い手帳アプリ集にRSSニュースアグリゲーター機能を追加する。Phase 1〜6の段階的実装により、フィード取得・表示・お気に入り・オフライン・プッシュ通知までを網羅する。各モジュールは独立したJSファイルとして実装し、fast-check + vitestでプロパティベーステストを実施する。

## タスク

- [-] 1. Phase 1: コアモジュール実装（パーサー・サービス・ストア）
  - [x] 1.1 news-feed-parser.js を実装する
    - `parseFeed(xmlText, source)`: RSS 2.0 / Atom XML解析、Articleオブジェクト配列を返す
    - `sanitizeHtml(html, maxLength)`: HTMLタグ完全除去、プレーンテキスト返却
    - `generateArticleId(url)`: URL正規化 → SHA-256ハッシュID生成（crypto.subtle.digest）
    - `normalizeUrl(url)`: トレイリングスラッシュ除去、クエリパラメータソート、hash除去（http/httpsは別URL扱い）
    - Atomフィードで複数`<link>`要素がある場合は`rel="alternate"`を優先
    - 無効XMLの場合はエラーオブジェクトを返し、例外をスローしない
    - ID生成は取得時のみ実行（キャッシュ読み込み時は再生成しない）
    - Promise.allで複数記事のID生成を並列実行
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.3_

  - [x]* 1.2 news-feed-parser.js のプロパティテスト（Property 2: フィード解析の主要フィールド保持）
    - **Property 2: フィード解析の主要フィールド保持（セマンティック等価）**
    - **Validates: Requirements 2.1, 2.2, 2.3**

  - [x]* 1.3 news-feed-parser.js のプロパティテスト（Property 3: Atomフィードのlink優先選択）
    - **Property 3: Atomフィードのlink優先選択**
    - **Validates: Requirements 2.4**

  - [x]* 1.4 news-feed-parser.js のプロパティテスト（Property 4: 無効XMLの安全なエラーハンドリング）
    - **Property 4: 無効XMLの安全なエラーハンドリング**
    - **Validates: Requirements 2.5**

  - [x]* 1.5 news-feed-parser.js のプロパティテスト（Property 5: HTMLサニタイズによるタグ完全除去）
    - **Property 5: HTMLサニタイズによるタグ完全除去**
    - **Validates: Requirements 3.1, 3.3**

  - [x] 1.6 news-article-store.js を実装する
    - `loadCache()`: localStorageから記事キャッシュ読み込み（最大200件、保存済みidをそのまま利用・再生成しない）
    - `saveToCache(articles)`: 既存キャッシュとマージ・重複排除・容量管理付き保存（load → merge → deduplicate → prune → save）
    - `pruneExpired()`: 30日経過記事の自動削除
    - `deduplicateArticles(newArticles, existing)`: Article.idで重複判定（idは生成済み前提）
    - localStorage 4MB超過時はキャッシュ記事を古い順に50件削除
    - 表示件数制限: 1フィード最大20件取得、画面表示最大100件
    - _Requirements: 10.1, 12.1, 12.2, 12.3_

  - [x]* 1.7 news-article-store.js のプロパティテスト（Property 15: URL正規化の等価性）
    - **Property 15: URL正規化の等価性**
    - **Validates: Requirements 12.1**

  - [x]* 1.8 news-article-store.js のプロパティテスト（Property 16: 重複排除後のID一意性）
    - **Property 16: 重複排除後のID一意性**
    - **Validates: Requirements 12.2, 12.3**

  - [x] 1.9 news-feed-service.js を実装する
    - `fetchAllFeeds(sources, proxies, onPartialResult)`: 全有効フィード並列取得
    - `fetchFeed(source, proxies)`: 単一フィード取得、プロキシフォールバック付き
    - タイムアウト10秒、プロキシ候補を順番に試行
    - 部分結果コールバックで取得完了分から順次返却
    - enabled: falseのソースは取得対象外
    - 1フィードあたり最大20件取得
    - エラー情報を記録: errorCount++、lastError（種別）、lastErrorAt（日時）
    - 成功時: errorCount=0、lastSuccessAt更新、lastError/lastErrorAtクリア
    - _Requirements: 7.1, 7.2, 7.4, 7.5, 7.7, 11.2_

  - [x]* 1.10 news-feed-service.js のプロパティテスト（Property 8: 有効フィードのみ取得対象）
    - **Property 8: 有効フィードのみ取得対象**
    - **Validates: Requirements 4.4**

  - [x]* 1.11 news-feed-service.js のプロパティテスト（Property 13: プロキシフォールバックとエラー分離）
    - **Property 13: プロキシフォールバックとエラー分離**
    - **Validates: Requirements 7.2, 7.4, 7.5**

  - [x]* 1.12 news-feed-service.js のプロパティテスト（Property 14: フィードステータスの正確な更新）
    - **Property 14: フィードステータスの正確な更新**
    - **Validates: Requirements 7.7**

- [-] 2. Phase 1 続き: UI実装（ページ・スタイル・メインアプリ）
  - [x] 2.1 pages/news.html と css/news.css を作成する
    - ヘッダー（←ボタン、🏠ボタン、タイトル）
    - タブ切替UI（「最新」「お気に入り」「設定」）にrole/aria属性付与
    - カテゴリフィルターボタン（「すべて」「💻テック」「🎮ゲーム」「🏞️おでかけ」）
    - 記事カードテンプレート（カテゴリアイコン+aria-label、タイトル、ソース名、日時、概要）
    - ローディングインジケーター、オフラインバナー、エラーバナー
    - レスポンシブ（幅320px以上対応）、ダークモード（prefers-color-scheme）
    - _Requirements: 1.2, 1.4, 1.5, 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7_

  - [x] 2.2 news-setting-store.js を実装する
    - CORSプロキシ候補リスト管理（追加・削除・並べ替え）
    - デバッグログON/OFF設定
    - デフォルト設定の初期化
    - _Requirements: 7.3, 15.3_

  - [x] 2.3 news-app.js を実装する（Phase 1機能）
    - 初期化: キャッシュ読み込み → 即時表示 → バックグラウンド取得（stale-while-revalidate）
    - 記事一覧の公開日時降順ソート・再ソート
    - 表示件数制限: 最大100件（articles.slice(0, 100)）
    - カテゴリフィルタリング（sourceCategoryで直接フィルタ）
    - 記事タイトルタップで新しいタブに元URL表示
    - 更新ボタンで全フィード再取得
    - ローディング表示・エラーバナー「一部フィードの取得に失敗しました（N件）」
    - デバッグログ出力（成功: console.log、失敗: console.warn）
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.6, 1.7, 6.1, 6.2, 6.3, 7.6, 11.1, 11.2, 11.3, 15.1, 15.2_

  - [ ]* 2.4 news-app.js のプロパティテスト（Property 1: 記事の公開日時降順ソート）
    - **Property 1: 記事の公開日時降順ソート**
    - **Validates: Requirements 1.1, 1.3**

  - [ ]* 2.5 news-app.js のプロパティテスト（Property 12: カテゴリフィルタリングの正確性）
    - **Property 12: カテゴリフィルタリングの正確性**
    - **Validates: Requirements 6.2, 6.3**

- [ ] 3. チェックポイント - Phase 1完了確認
  - 全テストがパスすることを確認し、ユーザーに質問があれば確認する。
  - RSS取得・表示・キャッシュ・エラーハンドリング・カテゴリフィルタが正常動作すること。

- [-] 4. Phase 2: フィードソース管理UI
  - [x] 4.1 news-app.js に設定タブ・フィードソース管理UIを実装する
    - デフォルトFeed_Source一覧の初回登録（テック5件、ゲーム3件、おでかけ2件）
    - フィード追加フォーム（URL・名前・カテゴリ入力、URL検証）
    - フィード削除（確認ダイアログ付き、キャッシュ・お気に入りは保持）
    - フィード有効/無効トグル
    - 各フィードのステータス表示（🟢active / 🟡warning / 🔴error）
    - CORSプロキシ候補の追加・削除・並べ替えUI
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 7.3, 7.7_

  - [x]* 4.2 フィードソース管理のプロパティテスト（Property 6: FeedSourceのlocalStorage永続化ラウンドトリップ）
    - **Property 6: フィードソースのlocalStorage永続化ラウンドトリップ**
    - **Validates: Requirements 4.2, 4.6**

  - [x]* 4.3 フィードソース管理のプロパティテスト（Property 7: フィードソース削除時のキャッシュ・お気に入り保持）
    - **Property 7: フィードソース削除時のキャッシュ・お気に入り保持**
    - **Validates: Requirements 4.3, 4.7**

  - [x]* 4.4 フィードソース管理のプロパティテスト（Property 9: 無効URL形式のバリデーション拒否）
    - **Property 9: 無効URL形式のバリデーション拒否**
    - **Validates: Requirements 4.5**

- [-] 5. Phase 3: お気に入り機能
  - [x] 5.1 news-favorite-store.js を実装する
    - `loadFavorites()`: localStorage読み込み（保存日時降順）
    - `addFavorite(article)`: 軽量データのみ保存（description除外）、上限100件管理
    - `removeFavorite(articleId)`: 削除
    - `isFavorite(articleId)`: お気に入り判定
    - 100件超過時はsavedAt最古のものを自動削除（事前通知表示）
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

  - [x] 5.2 news-app.js にお気に入りUI統合を実装する
    - 記事カードの☆/★アイコン切替
    - 「お気に入り」タブでの保存日時降順表示
    - _Requirements: 5.1, 5.2, 5.3_

  - [x]* 5.3 news-favorite-store.js のプロパティテスト（Property 10: お気に入り追加のラウンドトリップ）
    - **Property 10: お気に入り追加のラウンドトリップ（description除外）**
    - **Validates: Requirements 5.1, 5.4, 5.5, 5.6**

  - [x]* 5.4 news-favorite-store.js のプロパティテスト（Property 11: お気に入り削除後の非存在）
    - **Property 11: お気に入り削除後の非存在**
    - **Validates: Requirements 5.2**

- [ ] 6. チェックポイント - Phase 2・3完了確認
  - 全テストがパスすることを確認し、ユーザーに質問があれば確認する。
  - フィードソース管理・お気に入り機能が正常動作すること。

- [-] 7. Phase 4: オフライン対応
  - [x] 7.1 既存sw.jsのASSETSリストにニュースアプリファイルを追加する
    - pages/news.html, css/news.css, js/news-app.js, js/news-feed-parser.js, js/news-feed-service.js, js/news-article-store.js, js/news-favorite-store.js, js/news-setting-store.js
    - _Requirements: 10.4_

  - [x] 7.2 news-app.js にオフライン検出・バナー表示・自動復帰を実装する
    - navigator.onLine / online/offlineイベント監視
    - オフライン時「オフラインモード：キャッシュを表示中」バナー表示
    - オンライン復帰時に自動的に最新記事を再取得
    - _Requirements: 10.2, 10.3_

- [ ] 8. Phase 5: 重複排除・パフォーマンス最適化
  - [ ] 8.1 news-article-store.js の重複排除ロジックをnews-app.jsと統合する
    - キャッシュ保存時にdeduplicateArticlesを適用
    - 同一IDの記事は最初に取得されたもののみ保持
    - _Requirements: 12.1, 12.2, 12.3_

  - [ ] 8.2 news-app.js のパフォーマンスを最適化する
    - stale-while-revalidate: キャッシュ表示 → バックグラウンド取得 → 差分更新
    - 並列取得 + 部分結果コールバックで段階的表示
    - 50フィード以内で初期表示10秒以内を達成
    - _Requirements: 11.1, 11.2, 11.3_

- [-] 9. Phase 6: プッシュ通知
  - [x] 9.1 scripts/news-notify.js を実装する（GitHub Actions用）
    - デフォルトFeed_SourceのRSS直接取得（CORSプロキシ不要）
    - Supabase news_last_checkテーブルから前回チェック状態を取得
    - 新着記事の差分判定
    - 新着ありの場合: push_messagesテーブルに通知レコード挿入（news_notification_enabled=trueのSubscription宛）
    - 通知本文フォーマット: 「📰 昨日の新着N件 {カテゴリアイコン} {トップ記事タイトル}」
    - news_last_checkテーブルを更新
    - _Requirements: 13.1, 13.2, 13.3, 13.7_

  - [x]* 9.2 news-notify.js のプロパティテスト（Property 17: プッシュ通知本文のフォーマット正確性）
    - **Property 17: プッシュ通知本文のフォーマット正確性**
    - **Validates: Requirements 13.7**

  - [x] 9.3 .github/workflows/news-notify.yml を作成する
    - 毎朝07:00 JST（cron: '0 22 * * *' UTC）
    - Node.jsセットアップ、Supabase環境変数、scripts/news-notify.js実行
    - _Requirements: 13.2_

  - [x] 9.4 news-app.js に通知設定UIを実装する
    - 設定タブに「朝のニュース通知」ON/OFFトグル
    - push_subscriptionsテーブルのnews_notification_enabledカラム更新
    - ブラウザ通知拒否時の案内メッセージ表示
    - _Requirements: 13.4, 13.5, 13.6_

- [ ] 10. TOPページ連携・最終統合
  - [x] 10.1 index.htmlにニュースアプリへのアイコンリンクを追加する
    - タイトル右側に📰アイコン、タップでpages/news.htmlに遷移
    - _Requirements: 8.1, 8.2_

  - [x] 10.2 既存sw.jsのnotificationclickハンドラにニュースアプリ対応を追加する
    - プッシュ通知タップでpages/news.htmlを開く
    - _Requirements: 13.8_

- [ ] 11. 最終チェックポイント
  - 全テストがパスすることを確認し、ユーザーに質問があれば確認する。
  - 全Phase（1〜6）の機能が統合され正常動作すること。
  - モジュール分離（要件14）が維持されていることを確認。

## 備考

- `*` マークのタスクはオプション（プロパティベーステスト）であり、スキップ可能
- 各タスクは対応する要件番号を明記し、トレーサビリティを確保
- チェックポイントで段階的に動作確認を実施
- プロパティテストはfast-check + vitestで実装
- 各モジュールはES Modules形式で実装し、テストからimport可能な構造とする
