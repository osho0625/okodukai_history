---
inclusion: fileMatch
fileMatchPattern: "*science*"
---

# 今日のサイエンス

## ファイル構成

- `pages/today-science.html` — 今日のサイエンス専用表示ページ
- `pages/science-archive.html` — サイエンスアーカイブページ
- `.kiro/specs/today-science/science-list.js` — サイエンスデータ定義（タイトル・画像パス、自動生成）
- `.kiro/specs/today-science/images/` — サイエンス画像（ファイル名=タイトル）
- `scripts/generate-science-list.js` — science-list.js自動生成スクリプト

## 概要

TOP画面（index.html）に表示される日替わり科学tips「🔬 今日のサイエンス」。

## 機能詳細

- 未閲覧を優先して表示、全部見たらランダム表示
- 1日1枚固定（日付が変わるまで同じ画像、localStorageで管理）
- 管理者指定: admin.htmlから当日の画像を手動選択可能（Supabase game_settings.science_override に保存、全端末反映）
- 翌日になると管理者指定は自動失効（日付チェック）、ランダムに戻る
- タイトルのみTOP表示、タップで専用ページ(today-science.html)に遷移して画像表示
- 画像タップでフルスクリーン表示（黒背景オーバーレイ、タップで閉じる）
- 閲覧実績はlocalStorage管理（science_viewed）
- アーカイブページ(science-archive.html): 閲覧済み=✅再閲覧可、未閲覧=🔒非表示、読了数カウント
- データ定義: .kiro/specs/today-science/science-list.js（自動生成: node scripts/generate-science-list.js）
- 画像配置: .kiro/specs/today-science/images/（ファイル名=タイトル）

## Supabase

- `game_settings.science_override` (JSONB, nullable): 管理者指定データ `{date:"YYYY-MM-DD", id:"..."}`
- ALTER文: `sql/alter_game_settings_science.sql`

## localStorage キー

| キー | 用途 | 永続性 |
|------|------|--------|
| science_viewed | 今日のサイエンス閲覧済みIDリスト（JSON配列） | 永続 |
| science_today | 今日のサイエンス当日固定ID（{date,id}） | 日替わり |
