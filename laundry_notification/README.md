# 洗濯通知アプリ

洗濯完了予定時刻を設定してPush通知を受け取るシンプルなPWA。

## 機能

- 時刻選択（デフォルト: 19:00）
- ボタン押下で3つの通知をスケジュール:
  1. 即時: 「〇〇時〇〇分に洗濯が完了予定です」
  2. 完了1時間前: 「1時間後に洗濯が完了予定です」
  3. 完了時刻: 「洗濯が完了しました」

## セットアップ

1. `sql/add_deliver_at.sql` を Supabase で実行
2. GitHub Pages にデプロイ（または任意のホスティング）
3. ブラウザでアクセスして「Push通知を有効にする」を押す

## 技術構成

- PWA（Service Worker + Web Push API）
- Supabase `push_messages` テーブル（`deliver_at` カラムで時刻指定配信）
- 既存の push-notify Edge Function / GitHub Actions cron で配信
