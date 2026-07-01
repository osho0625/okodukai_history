---
inclusion: fileMatch
fileMatchPattern: "*trpg*"
---

# クトゥルフTRPG シナリオリーダー

## ファイル構成

- `pages/trpg-cthulhu.html` — クトゥルフTRPGシナリオリーダー（KP用・admin限定）
- `js/trpg-poisoned-soup-scenario.js` — クトゥルフTRPG「毒入りスープ」シナリオデータ（10ノード）

## 概要

KP（管理者）向けTRPGシナリオ進行ツール。admin限定アクセス。
ゲームブック方式ではなく、KPが自由にシーン間を移動する設計。

## 機能詳細

- SPA風ビュー切り替え: シナリオ選択 → シーン表示 + オーバーレイ（目次/マップ/NPC）
- シナリオ選択画面: SCENARIO_REGISTRY配列からカード描画、続きから/クリア済み表示
- Dynamic script load: window.TRPG_SCENARIOS[id]方式、5000msタイムアウト、連打防止
- シーン自由遷移: TOC/マップ/関連シーンから任意のシーンへ移動可能
- KPメモ: 折りたたみ表示、判定値・NPC指針・演出ヒント
- マップ: SVG描画、場所ノード＋接続線、現在地ハイライト、タップで遷移
- NPC一覧: 折りたたみ式詳細（秘密表示）
- フェーズ別目次: キーワードフィルタ付き
- 進行状態: localStorage保存（シナリオごと独立）、Back/Reset対応
- フォントサイズ: CSS custom property方式（小/中/大）
- セッション終了: endingフェーズでボタン表示、Completion_State保存
- ダークテーマ（クトゥルフ風: deep green/purple系）
- game_settings.game_publish.game_trpg_cthulhu で公開制御
- 初回シナリオ「毒入りスープ」: 10ノード、1NPC（下僕の少女）、5ロケーション、4フェーズ

## localStorage キー

| キー | 用途 | 永続性 |
|------|------|--------|
| trpg_cthulhu_progress_{scenarioId} | TRPGシナリオ進行状態（JSON） | 永続 |
| trpg_cthulhu_completed_{scenarioId} | TRPGシナリオ完了状態（JSON） | 永続 |
| trpg_cthulhu_font_size | TRPGフォントサイズ設定（small/medium/large） | 永続 |
