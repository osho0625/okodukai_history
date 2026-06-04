---
inclusion: fileMatch
fileMatchPattern: "*scp*"
---

# 今日のSCP

## ファイル構成

- `pages/scp-archive.html` — SCP閲覧記録ページ
- `data/scp-list.js` — SCPデータ定義（window.SCP_DATA配列）
- `js/scp-selector.js` — SCP選択ロジック

## 概要

TOP画面（index.html）に表示される日替わりSCP紹介「👁️ 今日のSCP」。SCP Foundationの記事を子供向けタイトル付きで紹介。

## 機能詳細

- 未閲覧を優先して表示、全部見たらランダム表示
- 1日1件固定（日付が変わるまで同じSCP、localStorageで管理）
- 管理者指定: admin.htmlから当日のSCPを手動選択可能（Supabase game_settings.scp_override に保存、全端末反映）
- 翌日になると管理者指定は自動失効（日付チェック）、ランダムに戻る
- タイトルタップで外部SCP-JP Wikiページに遷移
- 閲覧実績はlocalStorage管理（scp_viewed）
- アーカイブページ(scp-archive.html): 閲覧済み=✅（👁️アイコン）、未閲覧=🔒非表示、読了率表示
- admin権限で全件閲覧可能

## データ形式（data/scp-list.js）

```javascript
window.SCP_DATA = [
  { "id": "scp-173", "number": "SCP-173", "title": "見ていないと動く彫刻", "url": "https://scp-jp.wikidot.com/scp-173" },
  ...
];
```

## Supabase

- `game_settings.scp_override` (JSONB, nullable): 管理者指定データ `{date:"YYYY-MM-DD", id:"..."}`
- ALTER文: `sql/alter_game_settings_scp.sql`

## localStorage キー

| キー | 用途 | 永続性 |
|------|------|--------|
| scp_viewed | SCP閲覧済みIDリスト（JSON配列） | 永続 |
| scp_today | 今日のSCP当日固定ID（{date,id}） | 日替わり |
