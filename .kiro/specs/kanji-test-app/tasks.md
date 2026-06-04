# Implementation Plan: 漢字50問テスト学習アプリ

## Overview

ロジック層（テスト可能な純粋関数）→ UI層（ビュー・Canvas）→ 統合（通知・セッション管理）の順で段階的に実装する。各ロジックモジュールはDOM非依存で、vitest + fast-check によるテストを可能にする。

## Tasks

- [-] 1. KanjiRegistry ロジック層の実装
  - [x] 1.1 `js/kanji-registry.js` を作成し、TestRange / KanjiEntry のCRUD関数を実装する
    - createRange(name), updateRange(id, name), deleteRange(id)
    - addEntry(rangeId, reading, answer), deleteEntry(rangeId, entryId)
    - getAllRanges(), getEntriesByRange(rangeId)
    - localStorage キー: `kanji_ranges`, `kanji_entries_{rangeId}`（設計書準拠: 範囲ごとに分離保存）
    - 空文字・空白のみのバリデーション（範囲名、読み仮名、正解漢字）
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5, 10.1, 10.2_

  - [ ]* 1.2 Property test: Data persistence round-trip
    - **Property 1: Data persistence round-trip**
    - **Validates: Requirements 1.1, 1.5, 10.1, 10.2**

  - [ ]* 1.3 Property test: Entry management invariant
    - **Property 2: Entry management invariant**
    - **Validates: Requirements 2.2, 2.3, 2.4**

  - [ ]* 1.4 Property test: Empty input rejection
    - **Property 3: Empty input rejection**
    - **Validates: Requirements 1.4, 2.5**

  - [x] 1.5 一括登録・エクスポート・インポート機能を実装する
    - parseBulkInput(text): "読み仮名,漢字" 形式の改行区切りテキストをパース
    - exportAllData(): 全データをJSON文字列で返す
    - importData(json, conflictStrategy): JSONインポート（"overwrite" | "rename"）
    - 同名範囲コンフリクト時の処理（上書き / 別名保存）
    - _Requirements: 2.6, 10.3, 10.4, 10.5, 10.6_

  - [ ]* 1.6 Property test: Serialization round-trip
    - **Property 4: Serialization round-trip (bulk parse and export/import)**
    - **Validates: Requirements 2.6, 10.3, 10.4**

- [x] 2. QuizEngine ロジック層の実装
  - [x] 2.1 `js/kanji-quiz-engine.js` を作成し、出題・回答・採点ロジックを実装する（純粋関数。localStorage非依存）
    - startQuiz(entries, mode): ランダム選出（max 50問、全問シャッフル→先頭50切り取り方式）してセッション生成
    - submitAnswer(session, index, answer): テキスト回答を記録
    - submitHandwritingAnswer(session, index): 手書き回答を記録
    - skipQuestion(session, index): スキップ記録
    - showAnswer(session, index): 「答えを見る」で不正解記録
    - selfCheck(session, index, isCorrect): Self_Check結果記録
    - gradeTextAnswer(answer, correctAnswer): 文字列一致判定
    - 全関数が純粋関数（DOM非依存・localStorage非依存）
    - _Requirements: 4.1, 4.2, 4.3, 4.6, 4.7, 6.1, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8_

  - [ ]* 2.2 Property test: Quiz selection size and uniqueness
    - **Property 5: Quiz selection size and uniqueness**
    - **Validates: Requirements 4.1, 4.2, 4.3, 7.1, 7.2**

  - [ ]* 2.3 Property test: Text grading correctness
    - **Property 6: Text grading correctness**
    - **Validates: Requirements 6.1, 7.4**

  - [ ]* 2.4 Property test: Answer recording integrity
    - **Property 7: Answer recording integrity**
    - **Validates: Requirements 4.6, 4.7, 7.6, 7.7, 7.8**

  - [x] 2.5 結果計算・Review Phase・リトライ・PendingGradingTest生成ロジックを実装する（純粋関数。localStorage非依存）
    - calculateResult(session): correctCount, incorrectCount, skippedCount, score 算出（純粋関数）
    - finishTestMode(session): テストモード完了処理。戻り値のみ返す（保存は呼び出し側が行う）
      - 戻り値: { pendingTest: PendingGradingTest | null, strokesStore: StrokesStore | null, testResult: TestResult | null }
      - 手書き回答がある場合: pendingTest + strokesStore を返す
      - テキストのみの場合: testResult を返す
    - getReviewList(session): ReviewItem[]生成（index, reading, userAnswer, hasStrokes, status）
    - updateAnswer(session, index, answer): Review Phaseでの回答修正（submitAnswerを再利用）
    - updateHandwritingAnswer(session, index): Review Phaseでの手書き回答書き直し
    - getRetryEntries(result): 不正解＋スキップ問題の entryId リスト抽出（純粋関数）
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 6.2, 6.3, 6.4, 6.5, 7.10, 12.1, 12.2_

  - [ ]* 2.6 Property test: Result calculation invariant
    - **Property 8: Result calculation invariant**
    - **Validates: Requirements 6.3, 6.4, 6.5, 7.10**

  - [ ]* 2.7 Property test: Retry test from wrong and skipped answers
    - **Property 10: Retry test from wrong and skipped answers**
    - **Validates: Requirements 12.1**

- [x] 3. SessionManager ロジック層の実装
  - [x] 3.1 `js/kanji-session-manager.js` を作成し、セッション永続化ロジックを実装する
    - saveSession(session): localStorageに現在のセッション状態を保存
    - loadSession(): 保存済みセッションを復元（破損時はnull返却＋削除）
    - clearSession(): セッション削除
    - localStorage キー: `kanji_test_session`（設計書準拠）
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6_

  - [ ]* 3.2 Property test: Session persistence round-trip
    - **Property 9: Session persistence round-trip**
    - **Validates: Requirements 14.1, 14.3, 14.5, 14.6**

- [x] 4. AdminGrading ロジック層の実装
  - [x] 4.1 `js/kanji-admin-grading.js` を作成し、管理者採点ロジックを実装する
    - getPendingTests(): 未採点テスト一覧取得
    - gradeQuestion(pendingTestId, questionIndex, isCorrect): 個別問題採点（PendingQuestion.resultを 'correct' / 'incorrect' に書き換え）
    - isAllGraded(pendingTestId): 全pending_grading問題が採点済みか判定
    - finishGrading(pendingTestId): 全問採点完了→TestResult生成、PendingGradingTest削除、StrokesStore削除
      - 前提条件: isAllGraded(pendingTestId) === true
      - 未採点問題が残っている場合はエラーをthrowする
    - getTestResults(): 採点済みテスト結果一覧取得
    - localStorage キー: `kanji_pending_tests`, `kanji_pending_strokes_{id}`, `kanji_test_results`
    - _Requirements: 6.2, 6.6, 11.1, 11.2, 11.3, 11.4, 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7, 13.8_

  - [ ]* 4.2 Property test: Admin grading state transition
    - **Property 11: Admin grading state transition**
    - **Validates: Requirements 6.6, 13.5**

  - [ ]* 4.3 Property test: Graded strokes cleanup
    - **Property 12: Graded strokes cleanup**
    - **Validates: Requirements 11.3, 11.4**

  - [x] 4.4 localStorage容量超過対策を実装する
    - saveToLocalStorage(key, data)ラッパーでtry-catchし、QuotaExceededError時にエラーメッセージ表示
    - 未採点データ（PendingGradingTest, StrokesStore）は自動削除しない
    - _Requirements: Error Handling_

- [x] 5. NotificationService ロジック層の実装
  - [x] 5.1 `js/kanji-notification.js` を作成し、通知送信ロジックを実装する
    - notifyTestCompleted(pendingTestId, rangeName, handwritingCount): Supabase INSERT + Discord Webhook
    - 呼び出し条件: handwritingCount > 0 の場合のみ通知送信（テキストのみ回答テストは通知不要）
    - 通知内容: 「未採点テストがあります 範囲: {rangeName} 手書き回答: {handwritingCount}件」
    - getPendingCount(): 未採点テスト件数取得（PendingGradingTest[]の配列長。テスト単位、問題単位ではない）
    - 通知失敗時はcatchしてスキップ（テスト結果保存に影響しない）
    - 既存 `js/common.js` の Supabase client / DISCORD_WEBHOOK を活用
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_

  - [ ]* 5.2 Property test: Notification failure does not affect local persistence
    - **Property 13: Notification failure does not affect local persistence**
    - **Validates: Requirements 15.1, 15.2, 15.5**

  - [ ]* 5.3 Unit test: 通知送信の呼び出し確認
    - Supabase push_messages INSERT が正しいパラメータで呼ばれること
    - Discord Webhook が呼ばれること
    - _Requirements: 15.1, 15.2_

- [x] 6. Checkpoint - ロジック層テスト確認
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. HandwritingCanvas UI コンポーネントの実装
  - [x] 7.1 `js/kanji-handwriting-canvas.js` を作成し、Canvas手書き入力を実装する
    - initCanvas(canvasElement): Canvas初期化、タッチイベント設定
    - タッチ/マウスイベントによるリアルタイム描画（線幅3px以上）
    - clearCanvas(): 描画内容クリア
    - getStrokes(): Point[][] 形式でストロークデータ取得
    - renderStrokes(strokes): Point[][]からCanvasへ再描画（管理者採点画面で直接Canvas描画して表示）
    - hasContent(): 描画済みか判定
    - Canvas未対応時のフォールバック（テキスト入力のみ表示）
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 8. HTMLページ・ビューの実装
  - [x] 8.1 `pages/kanji-test.html` を作成し、全ビューのHTML構造を定義する
    - top-view: テスト範囲一覧、未採点バッジ
    - range-edit-view: 範囲作成・編集フォーム
    - kanji-list-view: 漢字エントリ一覧
    - kanji-register-view: 漢字登録フォーム（単体・一括）
    - mode-select-view: テストモード/練習モード選択
    - quiz-view: 出題画面（テキスト入力 / Canvas手書き切替）
    - review-view: 見直し一覧（テストモード用）
    - result-view: 結果表示
    - grading-view: 管理者採点画面
    - _Requirements: 1.5, 2.1, 2.3, 3.1, 4.4, 4.5, 5.1, 5.2, 6.3, 6.4, 6.5, 7.3, 7.11, 8.1, 9.1, 13.1, 13.2_

  - [x] 8.2 `css/kanji-test.css` を作成し、モバイルファーストのスタイルを定義する
    - スマホ画面に最適化されたレイアウト
    - Canvas描画エリアのサイズ設定
    - ビュー切替のdisplay制御
    - _Requirements: NFR 1（iOS Safari / Android Chrome対応）_

- [x] 9. メインコントローラ `js/kanji-test.js` の実装
  - [x] 9.1 ビュー遷移・イベントバインディングを実装する
    - SPAビュールーティング（showView関数）
    - 各ビューのイベントリスナー設定
    - テスト範囲CRUD のUI連携（KanjiRegistryとのバインド）
    - 漢字登録（単体・一括）のUI連携
    - エクスポート/インポートのUI連携
    - _Requirements: 1.1, 1.2, 1.3, 1.5, 2.1, 2.2, 2.3, 2.4, 2.6, 10.3, 10.4, 10.5_

  - [x] 9.2 モード選択・テスト進行のUI連携を実装する
    - モード選択UI（前回選択の復元含む）
    - テストモード進行（出題→回答→次の問題）
    - 練習モード進行（出題→回答→正誤表示→次の問題）
    - テキスト/手書き切替UI
    - テスト進行中の問題番号表示
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 4.4, 4.5, 4.6, 4.7, 4.8, 7.3, 7.4, 7.5, 7.9, 7.11, 9.1, 9.2, 9.3_

  - [x] 9.3 Review Phase・結果画面・リトライのUI連携を実装する
    - Review Phase一覧表示と問題選択・修正
    - 採点実行ボタン連携
    - 結果画面表示（正答数、誤答数、スキップ数、スコア、管理者採点待ち数）
    - 間違い問題一覧・スキップ問題一覧表示
    - 「間違いだけ再テスト」ボタン
    - 全問正解時「満点！」メッセージ
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 6.3, 6.4, 6.5, 7.10, 12.1, 12.2_

  - [x] 9.4 管理者採点画面のUI連携を実装する
    - 未採点テスト一覧表示
    - 手書き回答をrenderStrokes()でCanvasに再描画して正解漢字と並列表示
    - 「正解」「不正解」ボタンによる採点操作
    - 採点完了処理の連携（TestResult保存、ストローク削除）
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7, 13.8_

  - [x] 9.5 QuizEngine結果のlocalStorage保存処理を実装する（Main Controllerの責務）
    - finishTestMode()の戻り値に基づき保存を実行:
      - pendingTestがある場合: kanji_pending_tests に追加、strokesStoreを kanji_pending_strokes_{id} に保存
      - testResultがある場合: kanji_test_results に追加
    - saveToLocalStorage()ラッパー経由で容量超過時のエラーハンドリング
    - QuizEngine自体はlocalStorageに一切アクセスしない
    - _Requirements: 6.2, 11.1, 11.2_

- [x] 10. セッション自動保存・復元の統合
  - [x] 10.1 テスト進行中の自動保存と起動時復元を統合する
    - 回答時・スキップ時にSessionManager.saveSession()呼び出し
    - アプリ起動時にloadSession()で未完了セッション検出
    - 再開確認ダイアログ表示→再開/破棄の処理
    - テスト完了時のclearSession()呼び出し
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6_

- [x] 11. 通知送信の統合
  - [x] 11.1 テスト完了時の通知送信を統合する
    - テストモード採点実行時、handwritingCount > 0 の場合のみNotificationService呼び出し
    - テキストのみ回答のテストは即座にTestResult化されるため通知不要
    - 管理者TOP画面での未採点バッジ表示
    - 全採点完了時のバッジ消去
    - 通知失敗時もテスト結果保存は正常完了する制御
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_

- [x] 12. index.html へのリンク追加とナビゲーション
  - TOP画面（index.html）に漢字テストページへのリンクを追加する
    - _Requirements: 全体統合_

- [x] 13. Final checkpoint - 全体テスト確認
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- タスク `*` 付きはオプション（プロパティテスト・ユニットテスト）でスキップ可能
- テストファイル: `tests/kanji-test.property.test.js`, `tests/kanji-test.unit.test.js`
- 各ロジックモジュールはDOM非依存で実装し、テスト容易性を確保
- 既存の `js/common.js` の Supabase client / Discord Webhook / queuePushNotification を再利用
