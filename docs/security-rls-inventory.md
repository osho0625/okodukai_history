# 🔒 RLS棚卸し + 機微データ隔離方針

作成: 2026/09/03

このアプリはSupabase Authを使わず anon key のみで動く。そのため大半のテーブルはRLS無効 or 全許可（`USING (true)`）。
anon key は公開前提（コードに埋め込み）なので、「URL + anon key を知れば誰でも全データにアクセス可能」な構造。

家庭内利用でURL非公開なら現実的リスクは低いが、**本当に秘密の情報だけは anon key の届かない場所に隔離する**方針（(A)）を取る。

---

## 1. RLS棚卸し表

RLS状態は各 `sql/*.sql` から確認。「要確認」= SQLに明記がなくSupabaseダッシュボードで実状を見る必要あり。

| テーブル | 内容 | 機微度 | RLS状態(判明分) | 備考 |
|----------|------|--------|-----------------|------|
| **game_settings** | 合言葉・夜間PW・TURN認証・各種設定 | 🔴最高 | 要確認 | 秘密情報を含む。(A)で隔離対象 |
| children | 子供名・残高 | 🟠高（個人情報+金銭） | 要確認 | |
| transactions | 入出金履歴 | 🟠高（金銭） | 要確認 | |
| temperature_logs | 体温（健康情報） | 🟠高 | 無効 | |
| reminders | メモ・予定 | 🟡中（個人情報） | 無効 | TODO記載あり |
| family_notes | 家族メモ | 🟡中 | 無効 | contacts.md等の個人情報を含む |
| push_subscriptions | Push購読・device_id | 🟡中 | 無効 | エンドポイント漏れは迷惑通知リスク |
| device_settings | 端末ロック状態 | 🟡中 | 要確認 | |
| tickets / reward_tickets | あそびチケット | 🟢低 | 無効 | |
| poker_chips(_history/_exchanges) | チップ残高 | 🟢低 | 要確認 | |
| settlement系(expense_master他) | 家計精算 | 🟡中（金銭） | 無効 | |
| hair_removal_records/settings | 脱毛記録 | 🟡中（健康情報） | 無効 | |
| laq_works/photos/family_albums | 作品・写真 | 🟢低 | 要確認 | |
| recipes ほかrecipe_* | レシピ | 🟢低 | 無効 | |
| math_battle_* / puyo_battles | 対戦ゲーム | 🟢低 | 有効+全許可 | リアルタイム対戦用 |
| *_rankings (blokus/memory等) | ランキング | 🟢低 | 有効+全許可 | |
| math_olympiad_answers | 回答 | 🟢低 | 有効+全許可 | |
| chore_tasks | お手伝いタスク | 🟢低 | 無効 | |
| alexa_messages | Alexa連携 | 🟢低 | 無効 | |
| settlement_audit_log | 精算監査ログ | 🟢低 | 有効+全許可 | |

### 評価まとめ
- 🔴 `game_settings` が最優先。合言葉・パスワード・TURN認証が平文で誰でもSELECT可能なのは、カメラ対策の効果を弱める。→ (A)で隔離
- 🟠 children/transactions/temperature_logs は個人情報・金銭・健康情報。認証導入なしでRLSを厳格化するとアプリが動かなくなるため、現状は「家庭内利用の割り切り」。将来Auth導入時に再設計
- 🟢 ゲーム/ランキング/レシピ等は漏れても実害小。現状維持でよい

---

## 2. (A) game_settings の機微カラム隔離方針

### 問題
`game_settings`(id=1) に以下の秘密が入っており、anon keyで誰でもSELECTできる:
- `broadcast_call_secret`（ビデオ通話の合言葉）
- `night_password`（夜間ゲーム解除PW）
- `broadcast_ice_servers` / `nurse_call_ice_servers`（TURN認証情報）

### 対策の考え方
「照合・利用はするが、値そのものはクライアントに返さない」ようにする。
Supabase Auth未導入のため、RPC（DB関数, SECURITY DEFINER）または Edge Function で **サーバー側照合**にするのが現実的。

- **合言葉/夜間PW**: 値を返さず「一致/不一致」だけ返すRPCに置き換える
- **TURN認証**: Edge Functionが動的に発行 or 返却（クライアントには通話時だけ渡す）

詳細な実装手順は本ドキュメントの改訂で追記する。まずは合言葉・夜間PWの照合RPC化から着手する。
