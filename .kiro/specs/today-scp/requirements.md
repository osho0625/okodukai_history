# Requirements Document: 今日のSCP

## Introduction

「今日のSCP」は、SCP Foundation の記事を毎日1つ紹介する日替わりコンテンツ機能である。既存の「今日のサイエンス」と同じ仕組みを踏襲し、TOP画面からのタイトル表示、外部SCPページへのリンク、アーカイブ管理を提供する。SCPの詳細内容はアプリ内に組み込まず、SCP財団の外部ページへ直接リンクする形式とする。

## Glossary

- **SCP_System**: 今日のSCP機能全体を指すシステム
- **SCP_Selector**: 当日表示するSCPを選択するロジック
- **SCP_Archive_Page**: 全SCPを一覧するアーカイブページ（scp-archive.html）
- **SCP_Data**: SCPの一覧データ定義（scp-list.js）。各エントリは id, number, title, url を持つ
- **SCP_External_Page**: SCP財団の該当記事ページ（例: https://scp-jp.wikidot.com/scp-173）
- **TOP_Page**: アプリのトップ画面（index.html）
- **Admin_Page**: 管理者ページ（admin.html）
- **localStorage**: ブラウザのクライアント側ストレージ

## Requirements

### Requirement 1: TOP画面でのSCPタイトル表示と外部リンク

**User Story:** As a ユーザー, I want TOP画面で今日のSCPのタイトルが見える, so that 毎日新しいSCPの存在に気づける

#### Acceptance Criteria

1. WHEN TOP_Page が読み込まれる, THE SCP_System SHALL 当日のSCPの番号とタイトルをカード形式で表示する
2. WHEN ユーザーがSCPカードをタップする, THE SCP_System SHALL SCP_External_Page を新規タブで開く
3. WHEN ユーザーがSCPカードをタップする, THE SCP_System SHALL 当該SCPのIDを localStorage キー `scp_viewed` に追加する（既読登録）
4. IF SCP_Data が空である, THEN THE SCP_System SHALL SCPセクションを非表示にする

### Requirement 2: 日替わり選択ロジック

**User Story:** As a ユーザー, I want 毎日異なるSCPが表示される, so that 継続的に新しいSCPを知ることができる

#### Acceptance Criteria

1. THE SCP_Selector SHALL 以下の優先順位で当日のSCPを選択する: (1) `scp_override` が当日日付で存在すればそのIDを使用、(2) 未閲覧SCPが存在する場合その集合から当日日付文字列をシードとした決定的ハッシュアルゴリズム（hash(todayStr) % unviewedCount）で1件選択、(3) すべて閲覧済みの場合も同様に当日日付文字列をシードとした決定的ハッシュアルゴリズム（hash(todayStr) % totalCount）で全体から選択
2. THE SCP_Selector SHALL 同一日付（ISO形式 "YYYY-MM-DD"）内では同じSCPを表示し続ける
3. WHEN 日付が変わる, THE SCP_Selector SHALL 新しいSCPを選択する
4. IF `scp_today` のIDが SCP_Data に存在しない, THEN THE SCP_Selector SHALL 新規選択を行い `scp_today` を更新する

### Requirement 3: 1日固定の仕組み（localStorage管理）

**User Story:** As a ユーザー, I want 同じ日に何度アクセスしても同じSCPが表示される, so that 途中で内容が変わらず安心して読める

#### Acceptance Criteria

1. WHEN 当日のSCPが選択される, THE SCP_System SHALL 選択結果を localStorage キー `scp_today` に `{date: "YYYY-MM-DD", id: string}` 形式で保存する
2. WHEN TOP_Page が読み込まれる, THE SCP_System SHALL `scp_today` の日付（ISO形式 "YYYY-MM-DD"）が当日と一致する場合に保存済みIDを使用する
3. WHEN `scp_today` の日付が当日と異なる, THE SCP_System SHALL 新しいSCPを選択し `scp_today` を更新する
4. WHEN `scp_override` が適用される, THE SCP_System SHALL `scp_today` も同じIDで更新する（override クリア後も同日中は `scp_today` が残り、そのIDが表示され続ける。これは正常動作である）
5. IF `scp_override` のIDが SCP_Data に存在しない, THEN THE SCP_Selector SHALL `scp_override` を無視し通常の選択ロジックで新規選択を行う

### Requirement 4: 閲覧実績管理

**User Story:** As a ユーザー, I want どのSCPを読んだか記録してほしい, so that 未読と既読を区別できる

#### Acceptance Criteria

1. THE SCP_System SHALL 閲覧済みSCPのIDリストを localStorage キー `scp_viewed` にJSON配列として保存する
2. WHEN SCPのIDが `scp_viewed` に未登録である, THE SCP_System SHALL そのIDを追加する（重複登録しない）
3. THE SCP_System SHALL `scp_viewed` を永続的に保持する（日付変更で消去しない）
4. THE SCP_System SHALL 閲覧済み数が全SCP数を超えないことを保証する
5. IF localStorage の `scp_viewed` が破損（パース不可）である, THEN THE SCP_System SHALL 空配列として扱い動作を継続する

### Requirement 5: アーカイブページ

**User Story:** As a ユーザー, I want 過去に読んだSCPを振り返りたい, so that 気に入ったSCPを再度読める

#### Acceptance Criteria

1. THE SCP_Archive_Page SHALL 全SCPを番号・タイトル付きで一覧表示し、閲覧済み（✅）と未閲覧（🔒）を区別する
2. WHEN ユーザーが閲覧済みSCPをタップする, THE SCP_Archive_Page SHALL SCP_External_Page を新規タブで開く
3. THE SCP_Archive_Page SHALL 未閲覧のSCPをタップ不可のロック表示にする
4. THE SCP_Archive_Page SHALL 読了率を「SCP_Data に存在するIDのうち `scp_viewed` に含まれる件数 / SCP_Data の全件数」として 0.0〜1.0 の数値で計算し、表示時に `Math.round(rate * 100)` でパーセント表示する
5. WHEN `scp_viewed` に存在するIDが SCP_Data に存在しない場合, THE SCP_Archive_Page SHALL そのIDを読了率計算から除外し無視する（アーカイブ生成時に `viewed.filter(id => scpData.some(s => s.id === id))` で正規化する）

### Requirement 6: 管理者によるSCP指定

**User Story:** As a 管理者, I want 特定のSCPを当日表示に指定したい, so that おすすめのSCPを子供に見せられる

#### Acceptance Criteria

1. THE Admin_Page SHALL SCP一覧から手動で当日のSCPを選択するUIを表示する
2. WHEN 管理者がSCPを指定する, THE Admin_Page SHALL localStorage キー `scp_override` に `{date: "YYYY-MM-DD", id: string}` 形式で保存する
3. WHEN `scp_override` の日付が当日と一致する, THE SCP_Selector SHALL 管理者指定のSCPを最優先で表示する（未閲覧優先やランダムより上位）
4. THE Admin_Page SHALL 管理者指定をクリアする機能を提供する

### Requirement 7: SCPデータ定義

**User Story:** As a 開発者, I want SCPデータを一元管理したい, so that コンテンツの追加・編集が容易にできる

#### Acceptance Criteria

1. THE SCP_Data SHALL 各SCPエントリに id, number, title, url フィールドを持つ
2. THE SCP_Data SHALL `window.SCP_DATA` グローバル変数として scp-list.js から提供される
3. THE SCP_Data SHALL 配列形式で全SCPを格納する
4. THE SCP_Data SHALL url フィールドにSCP財団の該当記事への完全なURLを格納する
5. THE SCP_Data SHALL url フィールドを `https://` で始まる完全なURLとする

### Requirement 8: プロパティテスト向け正確性保証

**User Story:** As a 開発者, I want SCP選択ロジックの正確性を検証可能にしたい, so that ロジックのバグを早期に発見できる

#### Acceptance Criteria

1. FOR ALL 同一日付, THE SCP_Selector SHALL 常に同じSCPを返す（決定性）
2. WHEN 未閲覧SCPが存在する, THE SCP_Selector SHALL 選択結果が未閲覧集合に含まれることを保証する（override未設定時）
3. THE SCP_System SHALL `scp_viewed` への追加で重複が発生しないことを保証する（冪等性）
4. THE SCP_System SHALL 閲覧済み数が全SCP数以下であることを保証する（上界不変条件）
5. WHEN `scp_override` が当日日付で存在する, THE SCP_Selector SHALL 常にoverride指定のSCPを返す
