# ADR-001: Push通知スケジューリングの技術選定

- **ステータス**: 承認済み
- **日付**: 2026-06-10
- **決定者**: osho

## コンテキスト

Web Push通知の配信にGitHub Actions cron（`*/5 * * * *`）を使用しているが、以下の問題が発生している：

1. **遅延**: 5分毎のはずが20〜30分遅れて実行されることがある
2. **バースト配信**: 遅延分がまとめて実行され、通知が一気に届く
3. **ウィンドウ逃し**: リマインダーの5分ウィンドウ判定を逃し、通知されないケースがある

### 原因

GitHub Actionsの`schedule`トリガーは実行タイミングを保証しない。公式ドキュメントにも「高負荷時は30分以上の遅延が発生しうる」と明記されている。Free tierのリポジトリでは特に顕著。

## 検討した選択肢

### A) Supabase Edge Functions + pg_cron（採用）

pg_cron（Postgres内蔵のcronスケジューラ）からpg_net経由でEdge Functionを呼び出す。

**メリット:**
- pg_cronはDB内部で動作するため、外部キューイング遅延が発生しない
- 5分毎の実行が実際に5分毎に行われる
- Supabase Free planで月50万invocations（5分毎で月約8,640回、余裕）
- Edge Functionは25個まで無料
- 既存のSupabaseインフラ内で完結（新規サービス追加なし）
- ダッシュボードからデプロイ・監視可能

**デメリット:**
- Edge FunctionはDeno/TypeScript（既存のNode.jsスクリプトから書き換え必要）
- web-pushライブラリのDeno互換対応が必要
- Secrets管理がSupabase側に分散する
- コールドスタート（初回呼び出し時の遅延）が数百ms〜数秒ある

### B) GitHub Actions のウィンドウ拡大（応急処置）

`isInWindow`の判定幅を5分→15〜30分に広げる。

**メリット:**
- 変更1行で即対応可能
- 既存インフラのまま

**デメリット:**
- 根本解決ではない（遅延自体は改善しない）
- ウィンドウが広いと重複送信リスクが上がる
- push_messagesキューの即時性は改善しない（操作後30分待ちは変わらない）

### C) 外部cronサービス（cron-job.org等）

外部サービスからGitHub Actions workflow_dispatch or Edge FunctionをHTTPで叩く。

**メリット:**
- 無料枠で1分毎まで設定可能
- 高い実行精度

**デメリット:**
- 外部サービスへの依存が増える
- サービス停止・仕様変更リスク
- 認証トークン管理が複雑化（GitHub PAT or Supabase API key）
- 監視ポイントが増える

### D) 現状維持（許容）

**メリット:**
- 工数ゼロ

**デメリット:**
- 通知が届かない・遅延する問題が継続
- ユーザー体験の低下

## 決定

**A) Supabase Edge Functions + pg_cron を採用**する。

段階的に移行する：

1. **Phase 1（即時）**: リマインダーのウィンドウ判定を5分→15分に緩和（応急処置）
2. **Phase 2**: Edge Function作成・デプロイ、push_messagesキュー処理を移行
3. **Phase 3**: リマインダー通知もEdge Functionに移行、GitHub Actions workflowを廃止

## 補足

- GitHub Actions の `reminder-notify.yml` はPhase 3完了後に削除
- Edge FunctionのコードはDeno TypeScriptで `supabase/functions/push-notify/index.ts` に配置予定
- pg_cronジョブの設定SQLは `sql/` ディレクトリに記録する
