---
inclusion: fileMatch
fileMatchPattern: "*kanji*"
---

# 漢字50問テスト

## ファイル構成

- `pages/kanji-test.html` — 漢字50問テスト（テスト/練習モード、手書き入力、管理者採点）
- `js/kanji-storage.js` — localStorage容量超過対策ラッパー
- `js/kanji-registry.js` — 漢字データCRUD管理（範囲・エントリ・一括登録・エクスポート/インポート）
- `js/kanji-quiz-engine.js` — 出題・回答・採点ロジック（純粋関数）
- `js/kanji-session-manager.js` — セッション自動保存・復元
- `js/kanji-admin-grading.js` — 管理者採点ロジック（PendingGradingTest→TestResult変換）
- `js/kanji-notification.js` — テスト完了時Push+Discord通知
- `js/kanji-handwriting-canvas.js` — Canvas手書き入力コンポーネント
- `js/kanji-test.js` — 漢字テストメインコントローラ（SPA画面遷移・イベント・統合）
- `css/kanji-test.css` — 漢字50問テストCSS（モバイルファースト）

## 概要

漢字50問テスト。テスト/練習モード、手書き入力、管理者採点に対応。

## localStorage キー

| キー | 用途 | 永続性 |
|------|------|--------|
| kanji_ranges | 漢字テスト範囲一覧 | 永続 |
| kanji_entries_{rangeId} | 範囲ごとの漢字エントリ | 永続 |
| kanji_test_session | 漢字テスト進行中セッション | テスト完了で削除 |
| kanji_pending_tests | 未採点テスト一覧（PendingGradingTest[]） | 採点完了で削除 |
| kanji_pending_strokes_{id} | 未採点手書きストローク | 採点完了で削除 |
| kanji_test_results | 採点済みテスト結果履歴 | 永続 |
| kanji_last_mode | 前回選択モード（test/practice） | 永続 |
| kanji_input_mode | 回答入力モード（text/handwriting） | 永続 |
