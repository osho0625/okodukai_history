# 算数オリンピックアプリ — 引き継ぎドキュメント

最終更新: 2026/05/20

## 現在の状態

**実装完了・運用中**。v1.76.0。

## 実装済み機能

### コア機能
- 単一HTML（pages/math-olympiad.html）内6ビュー + 管理者詳細ビュー
- 学年選択（小1/小3/小5）→ 問題一覧 → 回答 → 提出 → 採点結果
- ユーザー名登録（localStorage）、user_id(UUID)ベース
- 段階ヒント（最大3段階、sessionStorage永続化）
- タイマー（バックグラウンド計測、6時間期限）
- ドラフト自動保存（sessionStorage）
- オフライン対応（sw.jsキャッシュ）

### 問題データ
- 小5: 120問（data/math-olympiad-problems.json）ID 1-120
- 小3: 20問（data/math-olympiad-grade3.json）ID 3001-3020
- 小1: 20問（data/math-olympiad-grade1.json）ID 1001-1020
- 難易度: 1〜4（★☆☆☆〜★★★★）
- ジャンル: number_pattern, geometry, logic, combinatorics, word_problem 他

### 採点機能
- 10点満点
- AI自動採点（Gemini 2.0 Flash → 2.5 Flash Lite → Groq Llama 3.3 フォールバック）
- AI採点後チャット（反論・質問→点数/コメント自動修正）
- テンプレートコメント5種
- 採点待ち一覧 + 採点済み管理タブ
- 管理者操作: 回答者変更、採点取消、回答削除

### UI機能
- ステータスフィルター（未挑戦/提出済み/採点済み）
- ジャンル・難易度フィルター
- ヒント使用永続記録 + 確認ダイアログ + カード色分け
- 問題カードにスコア表示（金色）
- 問題カードにランキング表示（🥇🥈🥉）
- 学年カード2カラムレイアウト（左:タイトル、右:ランキング+進捗）
- TOP画面に人別合計得点ランキング
- 管理者用回答者切り替え
- 採点待ち通知（アプリTOP + ゲームTOP）
- 戻るボタン（アプリ内ナビゲーション）

### 統合
- arcade.html にゲームカード追加
- admin.html の GAME_LIST に追加
- index.html に採点待ち通知（管理者のみ）
- game_settings.game_publish.game_math_olympiad で公開制御

## DB

### math_olympiad_answers テーブル
- RLS: SELECT/INSERT/UPDATE/DELETE 全許可（管理者操作対応）
- UNIQUE(user_id, problem_id)

### app_config テーブル（既存）
- gemini_api_key, groq_api_key（AI採点用）

## 実行が必要なSQL
- sql/math_olympiad_answers.sql（テーブル作成）
- sql/alter_math_olympiad_admin.sql（RLS変更 + つじ→いろは変更）

## 注意点
- √（ルート）を使う問題は除外済み
- 模範解答はAI採点プロンプトに渡さない（AI自身で解く）
- AI APIキーは app_config テーブルから読み込み
- ヒント使用はlocalStorage(math_hint_history)に永続保存
- ステータスフィルター状態はlocalStorage(math_status_filters)に保存
