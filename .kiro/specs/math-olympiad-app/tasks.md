# Implementation Plan: 算数オリンピック

## Overview

既存のお小遣い管理PWAのゲームセンターに追加する思考力育成アプリ。単一HTMLページ（pages/math-olympiad.html）内でビュー切り替えによるSPA風の画面遷移を実現する。問題データは外部JSONファイルから読み込み、回答・採点データはSupabaseで管理する。バニラJavaScriptで実装。

## Tasks

- [ ] 1. Supabaseテーブル作成
  - [x] 1.1 math_olympiad_answers テーブルのmigration SQLを作成する
    - CREATE TABLE文（id, user_id, user_name, problem_id, answer_text, thinking_note, elapsed_seconds, hints_used, status, score, admin_comment, submitted_at, reviewed_at）
    - UNIQUE(user_id, problem_id) 制約
    - CHECK (status IN ('pending', 'reviewed')) 制約
    - インデックス作成（idx_math_answers_user_id, idx_math_answers_status）
    - RLSポリシー設定（allow_all_select, allow_all_insert, update_only_pending）
    - _Requirements: 7.1, 10.1, 10.2_

- [ ] 2. 問題データJSON作成
  - [x] 2.1 data/math-olympiad-problems.json を作成する（MVP: 15問、各ジャンル3問）
    - 5ジャンル（number_pattern, geometry, logic, combinatorics, word_problem）×3問
    - 3段階の難易度（1, 2, 3）を各ジャンル内で分散
    - 各問題にid, genre, difficulty, title, question, answer, explanation, hints, alternativeSolutions
    - questionフィールドにrubyタグ（ふりがな）を含む
    - hints配列は1〜3要素
    - lesson/フォルダの既存問題JSONを参考にしてよい
    - v1.1で50問へ拡張予定
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.6_

  - [x] 2.2 問題JSONスキーマバリデーションテストを作成する
    - tests/math-olympiad/schema.test.js
    - 全問題が必須フィールドを持つことを検証
    - genreフィールドが有効な英語キーであることを検証
    - GENRE_LABELマッピングの網羅性を検証
    - difficulty が 1〜3 の範囲であることを検証
    - hints配列が1〜3要素であることを検証
    - _Requirements: 1.1, 1.3_

- [ ] 3. メインHTML作成（pages/math-olympiad.html）
  - [x] 3.1 HTMLファイルの基本構造を作成する
    - Supabase CDN読み込み
    - DOMPurify CDN読み込み（バージョン固定: https://cdn.jsdelivr.net/npm/dompurify@3.2.6/dist/purify.min.js）
    - common.js読み込み（../js/common.js）
    - ダークテーマ、レスポンシブCSS（16px以上の文字サイズ）
    - 6つのビューセクション（view-registration, view-problem-list, view-problem-solve, view-submit-confirm, view-result, view-admin-review）
    - hiddenクラスによるビュー切り替え構造
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

  - [x] 3.2 ユーザー名登録ビュー（view-registration）のHTMLを作成する
    - 名前入力フィールド、登録ボタン、エラー表示領域
    - _Requirements: 4.1, 4.2_

  - [x] 3.3 問題一覧ビュー（view-problem-list）のHTMLを作成する
    - ジャンルフィルター、難易度フィルター
    - 問題カード一覧表示領域
    - ステータスバッジ（未挑戦・提出済み・採点済み）
    - 管理者採点ボタン（localStorage.deviceRole === 'admin' のときのみ表示）
    - _Requirements: 2.1, 2.4, 2.5_

  - [x] 3.4 回答画面ビュー（view-problem-solve）のHTMLを作成する
    - 問題タイトル・ジャンル・難易度表示
    - 問題文表示領域（innerHTML用）
    - 答え入力フィールド、考え方メモ入力フィールド
    - ヒントボタン、ヒント表示領域、ヒントカウンター
    - 提出ボタン、エラー表示領域
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 5.1, 5.2, 6.1, 6.6_

  - [x] 3.5 提出完了ビュー（view-submit-confirm）のHTMLを作成する
    - 経過時間表示、完了メッセージ
    - 「次の問題へ」ボタン、「一覧に戻る」ボタン
    - _Requirements: 7.3, 7.4_

  - [x] 3.6 採点結果ビュー（view-result）のHTMLを作成する
    - 点数、管理者コメント、模範解答、解説、別解表示領域
    - 別解セクションは alternativeSolutions.length > 0 の場合のみ表示
    - 「次の問題へ」ボタン
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

  - [x] 3.7 管理者採点ビュー（view-admin-review）のHTMLを作成する
    - レビュー待ち一覧表示領域
    - 回答詳細表示（回答テキスト、考え方メモ、経過時間、ヒント数）
    - 点数入力、コメント入力、テンプレートボタン5種
    - 採点ボタン
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_

- [ ] 4. アプリロジック実装（初期化・問題読み込み・ビュー切り替え・フィルター）
  - [x] 4.1 showView()関数とアプリ初期化（initApp）を実装する
    - showView(): hiddenクラス切り替え + window.scrollTo(0, 0)
    - initApp(): isNightTime()チェック → showNightMessage() → 問題読み込み → ユーザー回答読み込み → bindDraftEvents → restoreTimerIfNeeded → ビュー表示判定
    - isNightTime() / showNightMessage() は common.js の既存関数を使用（呼び出し確認すること）
    - _Requirements: 12.1, 12.2, 12.3, 1.2_

  - [x] 4.2 問題データ読み込み（loadProblems）とユーザー回答読み込み（loadUserAnswers）を実装する
    - fetch('../data/math-olympiad-problems.json')
    - Supabaseからuser_idベースで回答取得
    - エラーハンドリング（JSON読み込み失敗、Supabase接続失敗）
    - _Requirements: 1.2, 10.1, 10.3_

  - [x] 4.3 問題一覧レンダリング（renderProblemList）とフィルター機能を実装する
    - ジャンルフィルター、難易度フィルター
    - getProblemStatus()によるステータスバッジ表示
    - GENRE_LABELによる日本語ラベル変換
    - 難易度ごとの目安時間表示
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [ ]* 4.4 フィルター関数のプロパティテストを作成する
    - tests/math-olympiad/filter.property.test.js
    - **Property 1: フィルター正確性**
    - **Validates: Requirements 2.2, 2.3**

  - [ ]* 4.5 問題ステータス判定のプロパティテストを作成する
    - tests/math-olympiad/filter.property.test.js に追加
    - **Property 2: 問題ステータス表示の正確性**
    - **Validates: Requirements 2.4**

- [ ] 5. ユーザー名登録機能を実装する
  - [x] 5.1 registerUser()関数を実装する
    - 空名前バリデーション（trim後に空ならエラー）
    - crypto.randomUUID()でuser_id生成
    - localStorage保存（math_olympiad_user, math_olympiad_user_id）
    - 登録後に問題一覧ビューへ遷移
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

  - [ ]* 5.2 ユーザー名バリデーションのプロパティテストを作成する
    - tests/math-olympiad/validation.property.test.js
    - **Property 3: 空名前の拒否**
    - **Validates: Requirements 4.3**

  - [ ]* 5.3 ユーザー名永続化のプロパティテストを作成する
    - tests/math-olympiad/validation.property.test.js に追加
    - **Property 4: ユーザー名永続化ラウンドトリップ**
    - **Validates: Requirements 4.4**

  - [ ]* 5.4 user_id永続化のプロパティテストを作成する
    - tests/math-olympiad/validation.property.test.js に追加
    - **Property 11: user_id永続化ラウンドトリップ**
    - **Validates: Requirements 4.4**

- [ ] 6. 回答画面を実装する（タイマー、ヒント、ドラフト保存）
  - [x] 6.1 startProblem()とrenderProblemView()を実装する
    - 問題表示（DOMPurify.sanitize + innerHTML、ALLOWED_TAGS: ['ruby', 'rt', 'br']）
    - タイマー開始（sessionStorage永続化）
    - clearProblemSession()ヘルパー
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 14.1_

  - [x] 6.2 ヒントシステム（revealHint, renderHints）を実装する
    - 段階ヒント表示（最大3段階）
    - ヒントカウンター表示（「ヒント K/N」形式）
    - 全ヒント表示後のボタン非活性化
    - sessionStorageへのヒント状態永続化
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

  - [x] 6.3 ドラフト保存（bindDraftEvents, restoreDrafts）とタイマー復元（restoreTimerIfNeeded）を実装する
    - bindDraftEvents(): answer-input / thinking-input の input イベントを登録し sessionStorage に保存
    - initApp() 内でDOM生成後に一度だけ呼ぶ（getElementById が null にならないタイミング）
    - restoreDrafts(): sessionStorage から入力欄に値を復元
    - restoreTimerIfNeeded(): TIMER_EXPIRE_MS（6時間）超過時のクリア、問題が見つからない場合のフォールバック
    - _Requirements: 14.1, 14.2_

  - [ ]* 6.4 ヒント状態のプロパティテストを作成する
    - tests/math-olympiad/hints.property.test.js
    - **Property 6: ヒント状態の一貫性**
    - **Validates: Requirements 6.2, 6.4, 6.5, 6.6**

  - [ ]* 6.5 タイマー永続化のプロパティテストを作成する
    - tests/math-olympiad/timer.property.test.js
    - **Property 10: タイマー永続化ラウンドトリップ**
    - **Validates: Requirements 14.1**

- [x] 7. Checkpoint A - Task 1〜6 の動作確認
  - テストがある場合は全テスト実行（npx vitest --run tests/math-olympiad/）
  - ブラウザでの手動確認ポイント: 問題一覧表示、フィルター、ヒント、ドラフト復元

- [ ] 8. 回答提出機能を実装する（Supabase保存、オフラインチェック）
  - [x] 8.1 submitAnswer()関数を実装する
    - navigator.onLineチェック
    - 回答テキスト空チェック
    - 提出ボタン連打防止（disabled制御: 処理開始時にdisabled=true、完了/エラー時にdisabled=false）
    - 経過時間計算
    - 既存レコード確認（select → insert/update分離、upsertは使わない）
    - reviewed状態の再提出阻止（アプリ側チェック）
    - insert時の unique_violation（23505）は「別タブで先に提出された」とみなし、loadUserAnswers()を再実行して「すでに提出済みです」を表示
    - clearProblemSession()呼び出し
    - showSubmitConfirm() + loadUserAnswers()再取得
    - _Requirements: 5.3, 5.4, 5.5, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 14.3, 14.4_

  - [x] 8.2 goNextProblem()関数を実装する
    - findIndex + slice方式で次の未挑戦（status='new'）問題を検索
    - pending（提出済み未採点）は飛ばす
    - 未挑戦問題がない場合は一覧に戻る
    - _Requirements: 9.6_

  - [ ]* 8.3 回答バリデーションのプロパティテストを作成する
    - tests/math-olympiad/submission.property.test.js
    - **Property 5: 回答バリデーション**
    - **Validates: Requirements 5.3, 5.5**

  - [ ]* 8.4 ステータスによる再提出制御のプロパティテストを作成する
    - tests/math-olympiad/submission.property.test.js に追加
    - **Property 7: ステータスによる再提出制御**
    - **Validates: Requirements 7.5, 7.6**

- [ ] 9. 管理者採点機能を実装する
  - [x] 9.1 loadPendingReviews()とrenderReviewList()を実装する
    - 非adminアクセス時は view-problem-list に戻す（deviceRole !== 'admin' ガード）
    - Supabaseからpending回答一覧取得
    - ユーザー名、問題タイトル、提出日時の表示
    - 回答詳細表示（回答テキスト、考え方メモ、経過時間、ヒント数）
    - _Requirements: 8.1, 8.2, 8.3_

  - [x] 9.2 submitReview()とテンプレートボタン機能を実装する
    - 点数・コメント入力
    - COMMENT_TEMPLATES 5種のテンプレート挿入
    - Supabase更新（score, admin_comment, status='reviewed', reviewed_at）
    - 採点成功後に loadPendingReviews() を再実行して一覧を更新
    - _Requirements: 8.4, 8.5, 8.6, 8.7, 8.8, 8.9_

- [ ] 10. 採点結果閲覧機能を実装する
  - [x] 10.1 showResult()とrenderResultView()を実装する
    - 点数、管理者コメント表示
    - 模範解答、解説表示（DOMPurify + innerHTML）
    - 別解表示（alternativeSolutions.length > 0 の場合のみセクション表示）
    - 「次の問題へ」ボタン → goNextProblem()
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

  - [ ]* 10.2 採点済み回答の模範解答アクセスのプロパティテストを作成する
    - tests/math-olympiad/submission.property.test.js に追加
    - **Property 8: 採点済み回答の模範解答アクセス**
    - **Validates: Requirements 8.9**

  - [ ]* 10.3 ユーザー別データ分離のプロパティテストを作成する
    - tests/math-olympiad/submission.property.test.js に追加
    - **Property 9: ユーザー別データ分離**
    - **Validates: Requirements 10.3**

- [ ] 11. ゲームセンター統合
  - [x] 11.1 arcade.html に算数オリンピックのゲームカードを追加する
    - game_settings.game_publish の「game_math_olympiad」フラグで公開制御
    - 非管理者ユーザーに対してフラグfalse時は非表示
    - _Requirements: 11.1, 11.2, 11.3_

  - [x] 11.2 game_settingsにgame_math_olympiadキーを追加する
    - _Requirements: 11.2_

- [ ] 12. リリース準備
  - [x] 12.1 sw.js の ASSETS配列に追加し、CACHE_NAMEバージョンを+1する
    - './pages/math-olympiad.html'
    - './data/math-olympiad-problems.json'
    - common.js は既存キャッシュ対象であることを確認する
    - _Requirements: 13.6_

  - [x] 12.2 pages/release-notes.html に算数オリンピック機能のリリースノートを追加する
    - 新機能の概要説明
    - _Requirements: 開発ルール_

  - [x] 12.3 index.html のバージョン表示を更新する
    - _Requirements: 開発ルール_

- [x] 13. Checkpoint B - 最終確認
  - 全テスト実行（npx vitest --run tests/math-olympiad/）
  - ブラウザでの手動確認: 全フロー（登録→問題選択→回答→提出→管理者採点→結果閲覧）

## Notes

- Tasks marked with `*` are optional property-based tests (can be skipped for faster MVP, but recommended)
- Task 2.2（スキーマテスト）は必須: JSON破損するとアプリが死ぬため
- MVP問題数は15問（各ジャンル3問）。v1.1で50問へ拡張予定
- 提出ボタン連打防止（disabled制御）は必須
- select → insert/update分離パターン（upsertは使わない）
- 23505エラーは「別タブで先に提出された」ケースとして処理
- 採点後は loadPendingReviews() 再実行で一覧更新
- DOMPurify CDNはバージョン固定（3.2.6）
- テストファイルは tests/math-olympiad/ ディレクトリに配置
