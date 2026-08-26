---
inclusion: fileMatch
fileMatchPattern: "*ticket*"
---

# あそびチケット

## ファイル構成

- `pages/ticket.html` — あそびチケット（一覧・使用・履歴）
- `pages/demo-animation.html` — 枚コンプリート＆チケット付与演出デモ
- `js/common.js` — issuePageCompleteTickets()（枚コンプリート時のチケット自動発行）
- `sql/create_tickets_table.sql` — ticketsテーブルマイグレーション
- `sql/alter_tickets_reservation.sql` — 予約機能ALTER
- `scripts/auto-chore-points.js` — チケット発行リコンシリエーション（不足分自動補填）

## 概要

紙の「あそびチケット」をデジタル化。管理者（つじ）が発行、子供が使用。

- child.htmlの🎫アイコンからアクセス（?owner=名前）
- admin/user両方閲覧・予約可能（ownerパラメータで表示対象を決定）
- りょうすけの個人ページ（?owner=りょうすけ）にはチケット発行UIを表示
- ポイント表1枚（400pt）コンプリート時に60分チケット×2枚を自動発行

## 機能詳細

- 未使用タブ: チケットカード一覧（紙デザインCSS再現）、Admin=Owner別グループ表示
- 予約中タブ: pending/approvedチケット一覧
- 履歴タブ: 使用済みチケット（used_at降順）
- 予約フロー: 「予約する」→日付選択→時間帯選択（朝/昼/夜ごはんのあと or 時間指定）→pending状態に
- 時間帯選択: 曜日制限なし（朝/昼/夜すべて選択可能）
- 発行: admin.htmlの「🎫 チケット発行」セクション（Owner選択、時間5-480分、枚数1-100）
- 発行（りょうすけ）: ticket.html?owner=りょうすけ内の発行UI（Owner選択、30分単位で30-240分、枚数1-100）
- 承認/却下/取消: admin権限のみ
- オフライン: localStorageキャッシュ表示、操作ボタン無効化
- Discord通知: 予約時・承認時（3秒タイムアウト、失敗してもUX止めない）
- XSSエスケープ: esc()関数で全DB値をサニタイズ
- URL改ざん対策: VALID_OWNERSチェック

## DBテーブル

### tickets（あそびチケット）
- id: UUID (PK), ticket_no: BIGINT UNIQUE (sequence), owner: TEXT CHECK IN ('かいせい','はるちか','いろは')
- duration_minutes: INT CHECK 5-480, status: TEXT DEFAULT 'unused' CHECK IN ('unused','pending','approved','used')
- created_at: TIMESTAMPTZ, used_at: TIMESTAMPTZ, reserved_at: TIMESTAMPTZ
- CONSTRAINT chk_ticket_status_consistency (status/used_at/reserved_at整合性)
- INDEX: idx_tickets_owner_status, idx_tickets_used_at, idx_tickets_status_ticket_no, idx_tickets_status_reserved
- RLS無効（deviceRole制御のみ）
- 予約フロー: unused→pending(予約申請)→approved(承認)→used(予約日時到来で自動消化)
- 却下/取消: pending→unused / approved→unused（予約日時前のみ）

## 自動発行（枚コンプリート）

ポイント表が400pt到達（1枚コンプリート）するたびに、その子に60分あそびチケット×2枚を自動発行。

- 対象: かいせい、はるちか、いろは（TICKET_OWNERS）
- 発行タイミング: addChorePoints(admin即承認時)、approvePoint(承認フロー)、approveFromTop(トップ画面承認)
- 共通関数: `issuePageCompleteTickets(ownerName, totalBefore, totalAfter)` in js/common.js
- 演出: 枚コンプリート演出（showSheetCompleteAnimation）→ チケットGETカード表示 → 次の枚遷移演出（showSheetTransition）
- リコンシリエーション: scripts/auto-chore-points.jsのcronで期待枚数と実際の60分チケット数を比較、不足分を補填
- Discord通知 + Push通知（全端末）

## localStorage キー

| キー | 用途 | 永続性 |
|------|------|--------|
| ticketCache_unused | オフライン表示用キャッシュ（未使用チケット） | 永続 |
| ticketCache_used | オフライン表示用キャッシュ（使用済みチケット） | 永続 |
| ticketCache_reserved | オフライン表示用キャッシュ（予約中チケット） | 永続 |
