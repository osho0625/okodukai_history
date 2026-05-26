# 要件定義書: 算数オリンピック

## はじめに

「算数オリンピック」は、既存のお小遣い管理PWAのゲームセンター（arcade.html）に追加する思考力育成アプリである。算数オリンピック風の思考問題を1問ずつ提示し、考え方メモと管理者による採点・コメントを通じて「考え続ける力」「複数の視点から考える力」「問題を分解する力」「わからないを楽しむ力」を育てることを目的とする。速解きではなく思考プロセスを重視し、管理者が採点・フィードバックを行い、保護者が見守れる設計とする。

対象ユーザー: 小学5年生（算数得意、テスト100点レベル）

## 用語集

- **Math_Olympiad_App**: 算数オリンピック風思考問題アプリ本体（pages/math-olympiad.html）
- **Problem_List**: 問題一覧画面（トップ画面、問題選択用）
- **Problem_Display**: 問題表示コンポーネント（回答画面、常に1問のみ表示）
- **Answer_Input**: 回答入力コンポーネント（答え＋考え方メモ）
- **Answer_Submission**: 回答提出モジュール（生徒の回答をSupabaseに保存し管理者レビュー待ちにする）
- **Hint_System**: 段階ヒント機能（最大3段階のヒントを順次表示する）
- **Admin_Review**: 管理者採点コンポーネント（生徒の回答を閲覧し、点数とコメントを付与する）
- **User_Registration**: ユーザー名登録モジュール（初回起動時に名前を入力しlocalStorageに保存）
- **History_Manager**: 学習履歴管理モジュール（Supabaseに保存、ユーザー別）
- **Problem_Data**: 問題データ（JSONファイルから読み込み）
- **Genre**: 問題ジャンル（数の規則、図形、論理、場合の数、文章題）
- **Difficulty_Level**: 難易度（Lv1: 10分目安、Lv2: 20分目安、Lv3: 30分以上目安）
- **Night_Limit**: 夜間制限（common.js の isNightTime() による制御）
- **Game_Publish**: ゲーム公開フラグ（game_settings.game_publish による制御）
- **Supabase**: 共有データベース（回答・採点・履歴の保存先、管理者と生徒間のデータ共有）

## 要件

### 要件1: 問題データ構造と読み込み

**ユーザーストーリー:** 開発者として、問題をJSONファイルで管理したい。問題の追加・編集を容易にするためである。

#### 受け入れ基準

1. THE Problem_Data SHALL 以下のフィールドを持つJSONオブジェクトとして定義される: id（一意識別子）, genre（ジャンル）, difficulty（1〜3）, title（問題タイトル）, question（問題文）, answer（模範解答）, explanation（解説）, hints（ヒント配列、最大3要素の文字列配列）, alternativeSolutions（別解配列、任意）
2. WHEN Math_Olympiad_App が起動した時、THE Problem_Data SHALL 外部JSONファイル（data/math-olympiad-problems.json）から問題一覧を読み込む
3. THE Problem_Data SHALL 5つのジャンル（数の規則、図形、論理、場合の数、文章題）に分類される
4. THE Problem_Data SHALL 3段階の難易度（Lv1, Lv2, Lv3）を持つ
5. THE Problem_Data SHALL 初期状態で50問以上の問題を含む
6. THE Problem_Data SHALL 各問題に1〜3個のヒント文字列を hints 配列として含む

> **将来の拡張（Phase 2以降）:** 問題JSONファイルはジャンル別に分割する可能性がある（例: data/math/logic.json, data/math/geometry.json, data/math/number.json 等）。MVPでは data/math-olympiad-problems.json の単一ファイルで管理する。

### 要件2: 問題選択（問題一覧）

**ユーザーストーリー:** 小学生として、ジャンルや難易度を選んで問題に取り組みたい。自分のレベルに合った問題を選べるようにするためである。

#### 受け入れ基準

1. WHEN Math_Olympiad_App のトップ画面が表示された時、THE Problem_List SHALL ジャンル別・難易度別の問題選択UIを表示する
2. WHEN ジャンルフィルターが選択された時、THE Problem_List SHALL 該当ジャンルの問題のみを一覧に表示する
3. WHEN 難易度フィルターが選択された時、THE Problem_List SHALL 該当難易度の問題のみを一覧に表示する
4. THE Problem_List SHALL 各問題に対して未挑戦・提出済み（レビュー待ち）・採点済みのステータスを表示する
5. THE Problem_List SHALL 難易度ごとの目安時間を表示する（Lv1: 10分、Lv2: 20分、Lv3: 30分以上）
6. THE Problem_List SHALL 問題選択用の一覧画面であり、問題を選択すると回答画面（1問表示）に遷移する

> **補足:** 問題一覧は選択用であり、回答画面は常に1問のみ表示する。

### 要件3: 問題表示（回答画面）

**ユーザーストーリー:** 小学生として、1問ずつ問題を見たい。集中して考えられるようにするためである。

#### 受け入れ基準

1. WHEN 問題一覧から問題が選択された時、THE Problem_Display SHALL 回答画面に遷移し問題文のみを表示する
2. THE Problem_Display SHALL 回答画面に常に1問のみ表示する（複数問題の同時表示は行わない）
3. THE Problem_Display SHALL 問題タイトル、ジャンル、難易度レベルを問題文の上部に表示する
4. THE Problem_Display SHALL 漢字にふりがな（rubyタグ）を付与して表示する
5. THE Problem_Display SHALL タブレット・スマートフォンで読みやすい文字サイズ（16px以上）で表示する
6. WHILE 問題が表示されている間、THE Problem_Display SHALL 回答・解説を非表示にする

> **補足:** 問題一覧は選択用、回答画面は常に1問のみ表示する。

### 要件4: ユーザー名登録

**ユーザーストーリー:** 小学生として、初回起動時に自分の名前を登録したい。自分の回答履歴を管理し、管理者が誰の回答か識別できるようにするためである。

#### 受け入れ基準

1. WHEN Math_Olympiad_App が初回起動された時（localStorageにユーザー名が未保存の場合）、THE User_Registration SHALL 名前入力画面を表示する
2. THE User_Registration SHALL 名前入力フィールド（テキスト入力）を表示する
3. IF 名前が空の状態で登録ボタンが押された場合、THEN THE User_Registration SHALL エラーメッセージを表示し登録を阻止する
4. WHEN 名前が入力され登録ボタンが押された時、THE User_Registration SHALL 入力された名前をlocalStorageキー「math_olympiad_user」に保存する
5. THE User_Registration SHALL 登録済みの名前を以降のすべてのセッションでユーザー識別子として使用する
6. WHILE ユーザー名が登録済みである間、THE Math_Olympiad_App SHALL 名前入力画面をスキップしトップ画面を表示する

### 要件5: 回答入力

**ユーザーストーリー:** 小学生として、答えと考え方を入力したい。自分の思考プロセスを記録するためである。

#### 受け入れ基準

1. WHILE 問題が表示されている間、THE Answer_Input SHALL 「答え」入力フィールド（自由テキスト、数字・文章対応）を表示する
2. WHILE 問題が表示されている間、THE Answer_Input SHALL 「考え方メモ」入力フィールド（自由テキスト）を表示する
3. WHEN 「提出する」ボタンが押された時、THE Answer_Input SHALL 「答え」フィールドが空でないことを検証する
4. IF 「答え」フィールドが空の状態で「提出する」ボタンが押された場合、THEN THE Answer_Input SHALL エラーメッセージを表示し送信を阻止する
5. THE Answer_Input SHALL 「考え方メモ」フィールドを任意入力（空でも送信可能）とする

### 要件6: 段階ヒント

**ユーザーストーリー:** 小学生として、行き詰まった時にヒントを見たい。完全に答えを見るのではなく、少しずつ手がかりを得て自力で考え続けるためである。

#### 受け入れ基準

1. WHILE 問題に取り組んでいる間、THE Hint_System SHALL 「ヒントを見る」ボタンを回答画面に表示する
2. WHEN 「ヒントを見る」ボタンが押された時、THE Hint_System SHALL 未表示のヒントのうち最初の1つを表示する
3. THE Hint_System SHALL 1問あたり最大3段階のヒントを順次表示する（1回押すごとに1つ）
4. WHILE すべてのヒントが表示済みである間、THE Hint_System SHALL 「ヒントを見る」ボタンを非活性にする
5. WHEN 回答が提出された時、THE Hint_System SHALL 使用したヒント数（0〜3）を回答データに含めて保存する
6. THE Hint_System SHALL 表示済みヒント数を画面上に「ヒント 1/3」のような形式で表示する

### 要件7: 回答提出

**ユーザーストーリー:** 小学生として、回答を提出して管理者に見てもらいたい。自分の考えに対するフィードバックを得るためである。

#### 受け入れ基準

1. WHEN 「提出する」ボタンが押された時、THE Answer_Submission SHALL 以下のデータをSupabaseに保存する: ユーザー名、問題ID、回答テキスト、考え方メモ、経過時間、使用ヒント数、提出日時
2. WHEN 回答が提出された時、THE Answer_Submission SHALL ステータスを「レビュー待ち」（pending）として保存する
3. WHEN 回答が提出された時、THE Answer_Submission SHALL 経過時間（バックグラウンドで計測していた時間）を画面に表示する
4. WHEN 回答が提出された時、THE Answer_Submission SHALL 「提出しました。先生のコメントを待ってね」というメッセージを表示する
5. WHILE ステータスが「レビュー待ち」（pending）である間、THE Answer_Submission SHALL 同一ユーザーが同一問題に対して回答を上書き再提出することを許可する
6. WHILE ステータスが「採点済み」（reviewed）である間、THE Answer_Submission SHALL 同一ユーザーが同一問題に対して再提出することを禁止する

### 要件8: 管理者採点・コメント

**ユーザーストーリー:** 管理者として、生徒の回答を確認し採点・コメントしたい。思考プロセスを評価し励ましのフィードバックを与えるためである。

#### 受け入れ基準

1. WHILE 管理者権限（deviceRole=admin）である間、THE Admin_Review SHALL 管理者採点画面へのアクセスを許可する
2. WHEN 管理者採点画面が開かれた時、THE Admin_Review SHALL レビュー待ちの回答一覧を表示する（ユーザー名、問題タイトル、提出日時）
3. WHEN 管理者が回答を選択した時、THE Admin_Review SHALL 生徒の回答テキスト、考え方メモ、経過時間、使用ヒント数を表示する
4. THE Admin_Review SHALL 点数入力フィールド（数値）を表示する
5. THE Admin_Review SHALL コメント入力フィールド（自由テキスト）を表示する
6. THE Admin_Review SHALL コメントテンプレートボタンを表示する:「良い視点です」「途中まで良いです」「別の方法も考えてみよう」「図を書いてみよう」
7. WHEN テンプレートボタンが押された時、THE Admin_Review SHALL 該当テンプレート文をコメント入力フィールドに挿入する（管理者は自由に編集・追記可能）
8. WHEN 管理者が点数とコメントを入力し「採点する」ボタンを押した時、THE Admin_Review SHALL 点数とコメントをSupabaseに保存しステータスを「採点済み」（reviewed）に更新する
9. WHEN 採点が完了した時、THE Admin_Review SHALL 模範解答と解説を生徒が閲覧可能にする

### 要件9: 採点結果閲覧

**ユーザーストーリー:** 小学生として、管理者からの採点結果とコメントを見たい。自分の考え方へのフィードバックを得て成長するためである。

#### 受け入れ基準

1. WHEN 採点済みの問題が選択された時、THE Math_Olympiad_App SHALL 管理者の点数を表示する
2. WHEN 採点済みの問題が選択された時、THE Math_Olympiad_App SHALL 管理者のコメントを表示する
3. WHEN 採点済みの問題が選択された時、THE Math_Olympiad_App SHALL 模範解答を表示する
4. WHEN 採点済みの問題が選択された時、THE Math_Olympiad_App SHALL 解説（どう考えるとよかったか）を表示する
5. WHERE 別解が存在する問題の場合、THE Math_Olympiad_App SHALL 別解も表示する
6. WHEN 採点結果画面が表示された時、THE Math_Olympiad_App SHALL 「次の問題へ」ボタンを表示する

### 要件10: 学習履歴保存（ユーザー別）

**ユーザーストーリー:** 小学生として、自分の学習記録を残したい。成長を実感するためである。

#### 受け入れ基準

1. WHEN 回答が提出された時、THE History_Manager SHALL 以下のデータをSupabaseにユーザー別で保存する: ユーザー名、日付、問題ID、回答テキスト、考え方メモ、経過時間、使用ヒント数
2. WHEN 管理者が採点した時、THE History_Manager SHALL 該当レコードに点数と管理者コメントを追加保存する
3. THE History_Manager SHALL ユーザー名をキーとしてユーザー別の履歴を管理する
4. THE History_Manager SHALL 連続学習日数を算出可能な形式でデータを保存する
5. THE History_Manager SHALL ジャンル別平均点数を算出可能な形式でデータを保存する

### 要件11: ゲームセンター統合

**ユーザーストーリー:** 小学生として、ゲームセンターから算数オリンピックにアクセスしたい。他のゲームと同じ場所から始められるようにするためである。

#### 受け入れ基準

1. THE Math_Olympiad_App SHALL arcade.html のゲームカード一覧に「算数オリンピック」カードとして追加される
2. THE Math_Olympiad_App SHALL game_settings.game_publish の「game_math_olympiad」フラグで公開・非公開を制御される
3. WHEN game_math_olympiad フラグが false の時、THE Math_Olympiad_App SHALL 非管理者ユーザーに対してゲームカードを非表示にする
4. THE Math_Olympiad_App SHALL 独立したHTMLページ（pages/math-olympiad.html）として実装される
5. THE Math_Olympiad_App SHALL js/common.js を読み込み、共通ユーティリティを使用する

### 要件12: 夜間制限

**ユーザーストーリー:** 保護者として、夜間の使用を制限したい。生活リズムを守るためである。

#### 受け入れ基準

1. WHEN Math_Olympiad_App が起動した時、THE Math_Olympiad_App SHALL isNightTime() を呼び出して夜間制限を確認する
2. WHILE 夜間制限時間帯である間、THE Math_Olympiad_App SHALL ゲームの利用を制限し、制限メッセージを表示する
3. WHILE 管理者権限（deviceRole=admin）である間、THE Math_Olympiad_App SHALL 夜間制限を適用しない

### 要件13: PWA対応とUI

**ユーザーストーリー:** 小学生として、タブレットで快適に使いたい。読みやすく操作しやすいアプリにするためである。

#### 受け入れ基準

1. THE Math_Olympiad_App SHALL タブレット・スマートフォンでの操作に最適化されたレスポンシブUIを提供する
2. THE Math_Olympiad_App SHALL 漢字にふりがな（rubyタグ）を付与する
3. THE Math_Olympiad_App SHALL 不必要な装飾を排除し、シンプルで読みやすいデザインとする
4. THE Math_Olympiad_App SHALL Supabase CDN（scriptタグ）を使用してSupabaseクライアントを読み込む
5. THE Math_Olympiad_App SHALL バニラJavaScript（フレームワーク不使用）で実装される
6. THE Math_Olympiad_App SHALL sw.js のキャッシュ対象に含まれる

### 要件14: 経過時間計測

**ユーザーストーリー:** 小学生として、問題にどれくらい時間をかけたか記録したい。じっくり考えた証を残すためである。

#### 受け入れ基準

1. WHEN 問題が表示された時、THE Math_Olympiad_App SHALL 経過時間の計測をバックグラウンドで開始する
2. WHILE 問題に取り組んでいる間、THE Math_Olympiad_App SHALL 経過時間を画面に表示しない（非表示で計測を継続する）
3. WHEN 回答が提出された時、THE Math_Olympiad_App SHALL 経過時間の計測を停止する
4. WHEN 回答が提出された時、THE Math_Olympiad_App SHALL 経過時間を画面に表示する
5. THE Math_Olympiad_App SHALL 経過時間を学習履歴に記録する
6. THE Math_Olympiad_App SHALL 経過時間を「速さ」の評価に使用せず、「じっくり考えた証」として肯定的に表示する

## Supabaseテーブル設計

### math_olympiad_answers

| カラム名 | 型 | 説明 |
|---------|------|------|
| id | UUID (PK) | 一意識別子 |
| user_name | TEXT | ユーザー名 |
| problem_id | INT | 問題ID |
| answer_text | TEXT | 回答テキスト |
| thinking_note | TEXT | 考え方メモ |
| elapsed_seconds | INT | 経過時間（秒） |
| hints_used | INT | 使用ヒント数（0〜3） |
| status | TEXT | ステータス（'pending' / 'reviewed'） |
| score | INT (nullable) | 管理者が付けた点数 |
| admin_comment | TEXT (nullable) | 管理者コメント |
| submitted_at | TIMESTAMPTZ | 提出日時 |
| reviewed_at | TIMESTAMPTZ (nullable) | 採点日時 |

## 将来追加（Phase 2）

### 保護者ビュー（Parent_View）

> 現在のMVPでは管理者＝保護者であるため、管理者採点画面で学習状況を確認可能。独立した保護者ビューはPhase 2で追加予定。

**ユーザーストーリー:** 保護者として、子供の学習状況を確認したい。「教える」のではなく「見守る」ための材料を得るためである。

#### 想定機能（Phase 2）

- 今日取り組んだ問題の一覧
- 各問題にかかった時間
- 管理者が付けた点数・コメント
- ジャンル別の得意・苦手（平均点数）
- 連続学習日数
- Supabaseの学習履歴データを元に表示を構成

## MVP実装推奨順序

1. 問題表示（Problem_Data + Problem_Display）
2. 回答入力（Answer_Input）
3. Supabase保存（Answer_Submission + テーブル作成）
4. 管理者採点（Admin_Review）
5. 結果閲覧（採点結果表示）
6. 履歴（History_Manager）
7. ヒント（Hint_System）
8. 親画面（Phase 2 — Parent_View）
