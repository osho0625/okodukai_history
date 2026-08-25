---
inclusion: fileMatch
fileMatchPattern: "*laundry*"
---

# 洗濯通知アプリ (Laundry Notification)

最終更新: 2026/08/25

## 概要

洗濯完了時刻をセットすると、即時・1時間前・完了時の3回Push通知を送信するPWAアプリ。
お小遣い手帳と同じSupabaseプロジェクトを使用。

## ファイル構成

| ファイル | 役割 |
|----------|------|
| `laundry_notification/index.html` | メインUI |
| `laundry_notification/js/app.js` | ロジック全体（Push登録・通知スケジュール・キャンセル） |
| `laundry_notification/sw.js` | Service Worker（キャッシュ・Push受信・通知表示） |
| `laundry_notification/manifest.json` | PWAマニフェスト |
| `laundry_notification/images/` | アイコン |

## 技術構成

- Vanilla JS（フレームワークなし）
- Supabase REST API直接呼び出し（supabase-jsライブラリ不使用）
- Web Push API + Service Worker
- PWA対応（ホーム画面追加可能）

## Supabase連携

- API Key: `sb_publishable_seKZakec1yB046vlgPDAKQ_zd4CKIg4`（common.jsと同じ）
- テーブル: `push_messages`（deliver_atカラムで配信時刻指定）
- テーブル: `push_subscriptions`（Push通知の購読情報）

## 通知フロー

1. ユーザーが完了時刻を選択して「洗濯通知をセット」をタップ
2. `push_messages`に3行insert:
   - 即時: 「HH時MM分に洗濯が完了予定です」
   - 1時間前: 「1時間後に洗濯が完了予定です」
   - 完了時刻: 「洗濯が完了しました」
3. GitHub Actions（5分間隔Cron）が`deliver_at`を過ぎた未送信メッセージを配信

## 機能

- 通知セット（重複セット防止: セット済みならボタン無効化）
- セット済み通知の表示（完了予定時刻を表示）
- 通知キャンセル（DBから該当行を削除）
- Push通知の購読登録

## Service Worker キャッシュ戦略

- ネットワーク優先 → 失敗時キャッシュフォールバック
- `CACHE_NAME`のバージョンを上げることでPWA更新を強制
- `skipWaiting()` + `clients.claim()` で即時アクティベート

## 注意事項

- iOS SafariではPWAとしてホーム画面に追加しないとPush通知を受信できない
- SWのキャッシュバージョン更新時は`CACHE_NAME`の数値を上げること
- API keyを変更した場合はこのファイルとapp.jsの両方を更新すること
- `push_messages`テーブルのRLSが有効だとanon keyでのINSERTがブロックされる（DISABLE ROW LEVEL SECURITY必須）
- エラー発生時は具体的なHTTPステータスとレスポンスBodyをUI上に表示（デバッグ容易化）
