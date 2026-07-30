# 要件定義書: ファミリーニュース

## はじめに

技術ニュースだけでなく、子供向けのゲーム情報やおでかけスポット情報も含むファミリー向けニュースアグリゲーター。既存のお小遣い手帳アプリ集に追加する形で、GitHub Pages上で無料でホスティングする。

通常利用時はバックエンド不要（GitHub Pages + localStorage）。ただしプッシュ通知機能のみ既存Supabase基盤（push_messages + reminder-notify.js）を利用する。

子供向けカテゴリとして「ゲーム」（マインクラフト、カービィのエアライダー等）や「おでかけ」（アスレチック、公園、施設等）を含み、家族全員が楽しめるニュースアプリとする。

RSSフィードは外部要因（プロキシ停止、サイト側制限等）で不安定になりうるため、個別フィード単位のエラー耐性とキャッシュ戦略を重視する。

## 用語集

- **News_App**: ファミリーニュースアプリ本体（RSSフィード取得・表示・管理を行うフロントエンドアプリケーション）
- **Feed_Parser**: RSSフィードのXMLを解析し、Articleオブジェクトに変換するモジュール
- **Feed_Source**: ユーザーが登録したRSSフィードの情報:
  ```
  FeedSource {
    id: string;            // 一意識別子（例: "minecraft-news"）
    name: string;          // 表示名
    url: string;           // RSSフィードURL
    category: string;      // カテゴリ名
    enabled: boolean;      // 有効/無効フラグ
    lastSuccessAt: string; // 最終成功日時（ISO8601、null可）
    errorCount: number;    // 連続失敗回数
    lastError: string;     // 直近のエラー種別（"proxy_timeout"等）
    lastErrorAt: string;   // 直近のエラー発生日時（ISO8601）
  }
  ```
- **Article**: フィードから取得した個別のニュース記事:
  ```
  Article {
    id: string;            // 一意識別子（URLのSHA-256ハッシュ）
    title: string;         // 記事タイトル
    url: string;           // 記事の元URL
    publishedAt: string;   // 公開日時（ISO8601）
    description: string;   // 概要（先頭200文字まで、HTMLサニタイズ済み）
    sourceName: string;    // フィードソース表示名
    sourceId: string;      // Feed_SourceのID
    sourceCategory: string; // カテゴリ（フィルタ用）
    fetchedAt: string;     // 取得日時（ISO8601）
  }
  ```
  ID生成: `crypto.subtle.digest('SHA-256', normalizedURL)` を使用。同じ記事判定・お気に入り判定・キャッシュ更新に利用。
  実装注意: crypto.subtle.digest()は非同期のため、複数記事のID生成はPromise.allで並列実行すること。
- **Favorites_Store**: お気に入りに保存した記事をlocalStorageで管理するストア。容量節約のためdescriptionは保存しない:
  ```
  FavoriteArticle {
    id: string;            // Article.idと同一（紐付け用）
    title: string;
    url: string;
    sourceName: string;
    sourceCategory: string;
    publishedAt: string;
    savedAt: string;
  }
  ```
- **CORS_Proxy**: ブラウザのCORS制約を回避するために利用する無料プロキシサービス:
  ```
  ProxyConfig {
    name: string;     // プロキシ名
    urlPrefix: string; // プロキシURL（フィードURLを末尾に付加）
    type: "raw"|"query"; // レスポンス形式（raw=生テキスト、query=JSON包装）
  }
  ```
  デフォルト候補:
  1. `{ name:"allorigins", urlPrefix:"https://api.allorigins.win/raw?url=", type:"raw" }`
  2. `{ name:"corsproxy", urlPrefix:"https://corsproxy.io/?", type:"raw" }`
  3. `{ name:"codetabs", urlPrefix:"https://api.codetabs.com/v1/proxy?quest=", type:"raw" }`

  注意: プロキシ毎にレスポンス形式が異なるため、typeフィールドで処理を分岐する。
- **Category**: フィードソースを分類するためのラベル（デフォルト: 「テック」「ゲーム」「おでかけ」）

## データ管理

localStorageキー定義:
- `family-news-feeds` — Feed_Source一覧
- `family-news-favorites` — お気に入り記事（上限100件、超過時は古い順に自動削除）
- `family-news-cache` — 記事キャッシュ（上限200件、30日経過で自動削除）
- `family-news-settings` — 設定（CORSプロキシ候補リスト、通知設定等）

容量管理ポリシー:
- localStorageの使用上限目安: 4MB（ブラウザ上限5MBに対し余裕を持たせる）
- キャッシュ保持: 最大200件、または取得から30日経過で自動削除
- お気に入り保持: 最大100件、超過時は保存日時が最も古いものから自動削除（削除前に通知表示）
- 1記事あたりサイズ制限: description最大500byte、Article全体最大10KB（超過分は切り捨て）

## 要件

### 要件1: フィード取得と表示

**ユーザーストーリー:** 家族として、技術ニュースだけでなく子供が好きなゲームやおでかけの情報もまとめて読みたい。手軽に情報収集できるようにしたい。

#### 受け入れ基準

1. WHEN ユーザーがNews_Appページを開いた時、THE News_App SHALL 登録済みの全有効Feed_Sourceから最新記事を取得し、公開日時の降順で一覧表示する
2. WHEN 記事の取得中、THE News_App SHALL ローディングインジケーターを表示し、取得完了分のフィードから順次記事を表示する
3. WHEN 全フィードの取得が完了した時、THE News_App SHALL 全記事を公開日時降順で再ソートして表示を更新する
4. WHEN 記事一覧が表示された時、THE News_App SHALL 各Articleのカテゴリアイコン、タイトル、ソース名、公開日時、概要（先頭100文字）を表示する
5. THE News_App SHALL カテゴリに応じたアイコンを記事カードに表示する（例: 🎮ゲーム、💻テック、🏞️おでかけ）
6. WHEN ユーザーが記事タイトルをタップした時、THE News_App SHALL 該当記事の元URLを新しいタブで開く
7. WHEN ユーザーが更新ボタンをタップした時、THE News_App SHALL 全Feed_Sourceから記事を再取得し、一覧を更新する

### 要件2: RSSフィードの解析

**ユーザーストーリー:** 開発者として、RSS 2.0およびAtomフォーマットのフィードを正しく読み取りたい。多様なニュースソースに対応するために必要。

#### 受け入れ基準

1. WHEN RSS 2.0形式のXMLが提供された時、THE Feed_Parser SHALL XMLをパースし、title、link、pubDate、descriptionフィールドをArticleオブジェクトに変換する
2. WHEN Atom形式のXMLが提供された時、THE Feed_Parser SHALL XMLをパースし、title、link（href属性）、updated、summaryフィールドをArticleオブジェクトに変換する
3. FOR ALL 有効なRSS/Atom XML、パースした結果の主要フィールド（title、link、date、summary）が元の情報と一致すること（主要フィールド保持特性）
4. IF Atomフィードで`<link>`要素が複数存在する場合、THEN THE Feed_Parser SHALL `rel="alternate"`を持つlinkを優先して採用する
5. IF 無効なXMLまたは解析不能なフィードが提供された時、THEN THE Feed_Parser SHALL エラーメッセージ「フィードを読み込めませんでした」を返し、他のフィードの処理を継続する

### 要件3: セキュリティ（HTMLサニタイズ）

**ユーザーストーリー:** ユーザーとして、安全にニュースを閲覧したい。外部RSSに含まれる悪意あるスクリプトから保護されたい。

#### 受け入れ基準

1. THE Feed_Parser SHALL 取得したdescription/summaryフィールドからHTMLタグを除去し、プレーンテキストとして保存する
2. THE News_App SHALL 記事の表示にinnerHTMLを使用せず、textContentまたはDOM APIで安全にレンダリングする
3. IF descriptionに`<script>`、`<iframe>`、`onerror`等の危険なコンテンツが含まれていた場合、THEN THE Feed_Parser SHALL それらを完全に除去する

### 要件4: フィードソース管理

**ユーザーストーリー:** ユーザーとして、自分の興味のあるニュースソースを自由に追加・削除したい。情報源をカスタマイズするために必要。

#### 受け入れ基準

1. THE News_App SHALL 初回起動時にデフォルトのFeed_Source一覧を以下のカテゴリで登録する:
   - テック:
     - Hacker News: `https://hnrss.org/frontpage`
     - Publickey: `https://www.publickey1.jp/atom.xml`
     - Zenn Trending: `https://zenn.dev/feed`
     - Qiita Trending: `https://qiita.com/popular-items/feed`
     - はてなブックマーク テクノロジー: `https://b.hatena.ne.jp/hotentry/it.rss`
   - ゲーム:
     - Minecraft公式ニュース: `https://www.minecraft.net/en-us/feeds/community-content/rss`
     - 任天堂ニュース: `https://www.nintendo.co.jp/rss/news.xml`
     - ファミ通: `https://www.famitsu.com/feed/`
   - おでかけ:
     - Googleニュース（アスレチック 公園）: `https://news.google.com/rss/search?q=アスレチック+公園&hl=ja&gl=JP&ceid=JP:ja`
     - はてなブックマーク検索（アスレチック）: `https://b.hatena.ne.jp/search/tag?q=アスレチック&mode=rss`
   ※ 実装時にRSS提供状況を確認し、終了しているものは代替URLに差し替えること
2. WHEN ユーザーがフィードURL・名前・カテゴリを入力して追加ボタンを押した時、THE News_App SHALL 一意のIDを自動生成し、新しいFeed_SourceをlocalStorageに保存する
3. WHEN ユーザーがFeed_Sourceの削除ボタンを押した時、THE News_App SHALL 確認ダイアログを表示し、承認された場合にそのFeed_SourceをlocalStorageから削除する。ただし既存の記事キャッシュとお気に入りは保持する（フィードを再追加すれば閲覧可能）
4. WHEN ユーザーがFeed_Sourceの有効/無効を切り替えた時、THE News_App SHALL enabled状態を更新し、無効なフィードは取得対象から除外する
5. IF ユーザーが無効なURL形式を入力した時、THEN THE News_App SHALL 「有効なURLを入力してください」とエラーを表示し、保存を実行しない
6. THE News_App SHALL Feed_Source一覧をlocalStorageに永続化し、ページリロード後も維持する
7. THE News_App SHALL Feed_SourceをID（名前ではなく）で管理し、名前変更時もお気に入り等の紐付けが維持されること

### 要件5: お気に入り機能

**ユーザーストーリー:** ユーザーとして、後で読みたい記事をお気に入りに保存したい。重要な記事を見失わないようにしたい。

#### 受け入れ基準

1. WHEN ユーザーが記事の☆アイコンをタップした時、THE Favorites_Store SHALL 該当記事の軽量データ（id、title、url、sourceName、sourceCategory、publishedAt、savedAt）のみをlocalStorageに保存し、☆を★に変更する
2. WHEN ユーザーが★アイコンをタップした時、THE Favorites_Store SHALL 該当記事をlocalStorageから削除し、★を☆に変更する
3. WHEN ユーザーが「お気に入り」タブを選択した時、THE News_App SHALL Favorites_Storeに保存された全記事を保存日時の降順で表示する
4. THE Favorites_Store SHALL お気に入り記事をlocalStorageに永続化し、ページリロード後も維持する
5. THE Favorites_Store SHALL description（概要文）を保存しない（localStorage容量節約のため）
6. THE Favorites_Store SHALL Article.idを保持し、記事一覧でのお気に入り状態表示に利用する

### 要件6: カテゴリフィルタリング

**ユーザーストーリー:** 家族として、特定カテゴリの記事だけを絞り込みたい。子供はゲーム情報だけ、大人はテック情報だけ見たい時に便利。

#### 受け入れ基準

1. THE News_App SHALL 記事一覧の上部にCategory別フィルターボタン（「すべて」「💻テック」「🎮ゲーム」「🏞️おでかけ」+ユーザー追加カテゴリ）を表示する
2. WHEN ユーザーがカテゴリボタンをタップした時、THE News_App SHALL ArticleのsourceCategoryフィールドで直接フィルタリングし、該当記事のみを表示する
3. WHEN 「すべて」ボタンがタップされた時、THE News_App SHALL 全Feed_Sourceの記事を表示する

### 要件7: CORS制約への対応とエラー耐性

**ユーザーストーリー:** 開発者として、GitHub Pages（静的サイト）からRSSフィードを取得したい。一部フィードが失敗しても残りは表示したい。

#### 受け入れ基準

1. THE News_App SHALL RSSフィードの取得にCORS_Proxy（ProxyConfig候補リストの先頭）を利用し、ProxyConfig.typeに応じたレスポンス処理を行う
2. IF CORS_Proxyが応答しない場合（タイムアウト10秒）、THEN THE News_App SHALL 同一Feed_Sourceに対してProxyConfig候補リストの次のプロキシで再試行する。全候補が失敗した場合、該当Feed_Source単位でエラーを記録し（errorCount++）、他のフィードの取得を継続する
3. THE News_App SHALL CORS_Proxyの候補リスト（ProxyConfig配列）を設定画面で編集可能（追加・削除・並べ替え）とする
4. THE News_App SHALL Feed取得失敗を個別Feed_Source単位で管理し、成功したフィードの記事は正常に表示する
5. THE News_App SHALL 前回成功時の記事キャッシュを保持し、一部Feed取得失敗時でもキャッシュから該当フィードの記事を表示可能とする
6. WHEN 一部フィードが失敗した時、THE News_App SHALL 画面上部に「一部フィードの取得に失敗しました（N件）」と通知を表示する
7. THE News_App SHALL Feed_SourceのlastSuccessAtとerrorCountを更新し、設定画面で各フィードのステータスを確認可能とする

### 要件8: TOPページへのアイコン追加

**ユーザーストーリー:** ユーザーとして、TOPページからニュースアプリにすぐアクセスしたい。

#### 受け入れ基準

1. THE News_App SHALL TOPページ（index.html）のタイトル右側に📰アイコン（またはニュースを連想させる絵文字）リンクを配置する
2. WHEN ユーザーがアイコンをタップした時、THE News_App SHALL ニュースアプリページ（pages/news.html）に遷移する

### 要件9: UI/UX

**ユーザーストーリー:** 家族として、スマートフォンでも見やすいデザインでニュースを読みたい。子供も大人も使いやすいUIにしたい。

#### 受け入れ基準

1. THE News_App SHALL レスポンシブデザインを採用し、幅320px以上のデバイスで正常に表示する
2. THE News_App SHALL 既存アプリ集と同様の←ボタン（history.back()）と🏠ボタン（index.htmlへ遷移）をヘッダーに配置する
3. THE News_App SHALL タブ切替UI（「最新」「お気に入り」「設定」）を画面上部に配置する
4. THE News_App SHALL ダークモードに対応し、OSのカラースキーム設定に追従する
5. THE News_App SHALL 各記事カードにカテゴリアイコンを表示し、視覚的にカテゴリを判別できるようにする
6. THE News_App SHALL カテゴリアイコン（絵文字）にaria-label属性を付与し、スクリーンリーダーで「ゲーム」「テック」「おでかけ」等のカテゴリ名を読み上げ可能とする
7. THE News_App SHALL フィルターボタン・タブ等のインタラクティブ要素にrole属性およびaria-selected/aria-current属性を付与し、キーボード操作およびスクリーンリーダーに対応する

### 要件10: オフライン対応

**ユーザーストーリー:** ユーザーとして、一度読み込んだ記事をオフラインでも確認したい。電波が不安定な場所でも使いたい。

#### 受け入れ基準

1. WHEN 記事の取得に成功した時、THE News_App SHALL 取得した記事一覧をlocalStorageにキャッシュする（family-news-cacheキー）
2. IF ネットワーク接続がない場合、THEN THE News_App SHALL キャッシュ済みの記事一覧を表示し、「オフラインモード：キャッシュを表示中」とバナーを表示する
3. WHEN ネットワーク接続が回復した時、THE News_App SHALL 自動的に最新記事を再取得する
4. THE News_App SHALL 既存のService Worker（sw.js）のASSETSリストにニュースアプリのファイルを追加し、オフラインでもページを開けるようにする

### 要件11: パフォーマンス

**ユーザーストーリー:** ユーザーとして、ページを開いたらすぐにニュースを読み始めたい。待ち時間は最小限にしたい。

#### 受け入れ基準

1. THE News_App SHALL 50フィード以内の構成で初期表示を10秒以内に完了する
2. THE News_App SHALL フィード取得を並列実行し、取得完了分から順次表示する（取得中は部分表示、完了後に全体を再ソート）
3. THE News_App SHALL キャッシュがある場合、まずキャッシュを表示してからバックグラウンドで最新を取得する（stale-while-revalidate戦略）

### 要件12: 記事の重複排除

**ユーザーストーリー:** ユーザーとして、複数のソースから同じ記事が重複表示されるのを避けたい。

#### 受け入れ基準

1. THE News_App SHALL 記事のURLを正規化（トレイリングスラッシュ除去、クエリパラメータのソート、プロトコル統一）した上でSHA-256ハッシュを生成し、Article.idとして重複判定を行う
2. IF 同一IDの記事が複数フィードから取得された場合、THEN THE News_App SHALL 最初に取得されたもののみを表示し、重複分は破棄する
3. THE News_App SHALL 重複判定をキャッシュ保存時にも適用し、キャッシュ内の重複を防止する

### 要件13: プッシュ通知（既存インフラ活用）

**ユーザーストーリー:** ユーザーとして、毎朝ニュースの更新を通知で知りたい。ただし通知が不要な場合はオフにできるようにしたい。

#### 受け入れ基準

1. THE News_App SHALL 既存のpush_messagesキュー（Supabase）とreminder-notify.jsのpush配信インフラを利用してプッシュ通知を送信する
2. THE News_App SHALL 毎朝（デフォルト07:00 JST）にGitHub Actions Cronで実行されるワークフローを新設し、以下の処理を実行する:
   - 登録済み全Feed_SourceのRSSを取得
   - 前回実行時との差分（新着記事）を判定
   - 新着があればpush_messagesテーブルに通知レコードを挿入（news_notification_enabled=trueのSubscription宛）
3. WHEN 通知レコードが挿入された時、既存のreminder-notify.jsのpush_messages処理ロジックにより自動的にWeb Push通知が配信される
4. THE News_App SHALL 設定タブに「朝のニュース通知」ON/OFFトグルを配置する
5. THE News_App SHALL 通知ON/OFF設定をpush_subscriptions単位で管理する（news_notification_enabledカラム追加）。各端末のPush Subscriptionごとに通知可否を独立制御し、家族の端末ごとに異なる設定を保持可能とする
6. IF ユーザーがブラウザレベルでPush通知を拒否している場合、THEN THE News_App SHALL 「ブラウザの設定で通知が無効になっています」と案内を表示する
7. THE News_App SHALL 通知時に前日の新着記事数とトップ記事タイトルを通知本文に含める（例: 「📰 昨日の新着15件 🎮 Minecraft大型アップデート発表」）
8. WHEN ユーザーが通知をタップした時、既存のService Worker notificationclickハンドラによりニュースアプリページ（pages/news.html）が開かれる

### 要件14: 保守性（モジュール分離）

**ユーザーストーリー:** 開発者として、各機能を独立したモジュールで管理し、変更時の影響範囲を限定したい。

#### 受け入れ基準

1. THE News_App SHALL 各機能を以下のモジュール単位で分離して実装する:
   - `js/news-feed-parser.js` — RSS/Atom XMLの解析・サニタイズ
   - `js/news-feed-service.js` — CORS Proxy経由のフィード取得・エラー耐性
   - `js/news-article-store.js` — 記事キャッシュ・重複排除・容量管理
   - `js/news-favorite-store.js` — お気に入り管理
   - `js/news-app.js` — UI制御・タブ切替・イベントハンドリング
2. THE News_App SHALL 各モジュール間の依存関係を最小化し、単体テスト可能な設計とする

### 要件15: ログ（開発者向けデバッグ）

**ユーザーストーリー:** 開発者として、フィード取得の成功・失敗状況を確認し、問題を素早く特定したい。

#### 受け入れ基準

1. THE News_App SHALL Feed取得失敗時にconsole.warnで原因を出力する（例: `[News] Minecraft RSS: Proxy allorigins timeout → corsproxy success`）
2. THE News_App SHALL Feed取得成功時にconsole.logでフィード名と取得件数を出力する（例: `[News] Hacker News: 30件取得`）
3. THE News_App SHALL 設定画面に「デバッグログ」ON/OFFを用意し、OFFの場合はconsole出力を抑制する

## 実装フェーズ（参考）

- Phase 1: RSS取得・表示・キャッシュ・エラーハンドリング・カテゴリフィルタ
- Phase 2: フィードソース管理UI
- Phase 3: お気に入り・localStorage永続化
- Phase 4: オフライン対応（既存sw.js統合）
- Phase 5: 記事重複排除・パフォーマンス最適化
- Phase 6: プッシュ通知（GitHub Actions + Supabase）
