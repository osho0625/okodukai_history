# 🔔 Discord通知（Edge Function経由）セットアップ

フロントエンドから直接Discord Webhookを叩くと、Webhook URLがGitHub Pagesで公開され誰でもチャンネルに投稿できてしまう。
これを防ぐため、通知は Edge Function `discord-notify` を経由し、Webhook URLはサーバー側の環境変数に隠蔽する。

```
[フロント] --POST { content } --> [Edge Function discord-notify] --Webhook--> [Discord]
                                    DISCORD_WEBHOOK は env に隠蔽
```

## 1. 旧Webhookを無効化（最優先・必須）

旧URLは既にGitHub Pagesで公開済みなので、**必ず作り直して無効化**する。

1. Discordサーバー設定 → 連携サービス → ウェブフック
2. 既存のWebhookを削除、または「URLを再生成」
3. 新しいWebhook URLをメモ（次のステップで使う）

## 2. Edge Function に環境変数を設定

Supabase Dashboard → Edge Functions → `discord-notify` → Secrets（または Project Settings → Edge Functions → Secrets）:

```
DISCORD_WEBHOOK = <新しいWebhook URL>
```

CLIで設定する場合:

```bash
supabase secrets set DISCORD_WEBHOOK="https://discord.com/api/webhooks/XXXX/YYYY"
```

## 3. Edge Function をデプロイ

```bash
supabase functions deploy discord-notify --no-verify-jwt
```

- `--no-verify-jwt`: フロントは匿名(apikey)で叩くためJWT必須にしない（家庭内利用前提、既存関数と同方針）

## 4. 動作確認

```bash
curl -X POST "https://ynecezxnltigplrfzzoh.supabase.co/functions/v1/discord-notify" \
  -H "Content-Type: application/json" \
  -H "apikey: <SUPABASE anon key>" \
  -d '{"content":"テスト通知です"}'
```

Discordにメッセージが届けば成功。

## 補足

- フロントは `js/common.js` の `notifyDiscord(content)` を呼ぶだけ（内部でこのEdge Functionを叩く）
- `pages/game.html` は common.js非依存のため、同等の `notifyDiscordGame(content)` を内蔵
- サーバー側（GitHub Actions / Alexa Lambda / push-notify）は従来どおり各自の環境変数 `DISCORD_WEBHOOK` を使用（フロントとは別管理）
- Edge Function側は content を最大2000文字にトリムし、空文字や非文字列は拒否する
